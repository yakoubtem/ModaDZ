import { IpcMain, dialog } from "electron";
import { prisma } from "../db/client";
import fs from "fs";

interface ActivityLogParams {
  page?: number;
  pageSize?: number;
  search?: string;
  userId?: number;
  entityType?: string;
  from?: string;
  to?: string;
}

export async function logActivity(
  tx: any,
  userId: number | null | undefined,
  action: string,
  entityType: string,
  entityId: string | null | undefined,
  description: string
) {
  try {
    const client = tx || prisma;
    await client.activityLog.create({
      data: {
        userId: userId ?? null,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        description,
      },
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export function registerActivityLogHandlers(ipcMain: IpcMain) {
  ipcMain.handle("activityLogs:getAll", async (_e, params?: ActivityLogParams) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params?.search) {
      where.OR = [
        { action: { contains: params.search } },
        { description: { contains: params.search } },
        { entityType: { contains: params.search } },
      ];
    }

    if (params?.userId) {
      where.userId = params.userId;
    }

    if (params?.entityType && params.entityType !== "all") {
      where.entityType = params.entityType;
    }

    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) {
        where.createdAt.gte = new Date(params.from);
      }
      if (params.to) {
        const toDate = new Date(params.to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.activityLog.count({ where }),
    ]);

    // Fetch users to map names
    const userIds = Array.from(new Set(logs.map(l => l.userId).filter(Boolean))) as number[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const logsWithUsers = logs.map(log => ({
      ...log,
      user: log.userId ? userMap.get(log.userId) || { id: log.userId, name: `Utilisateur #${log.userId}` } : null,
    }));

    return { logs: logsWithUsers, total, page, pageSize };
  });

  // Export CSV
  ipcMain.handle("activityLogs:exportCSV", async (_e, csvContent: string, defaultFilename: string) => {
    try {
      const result = await dialog.showSaveDialog({
        title: "Exporter le journal d'activité",
        defaultPath: defaultFilename,
        filters: [{ name: "CSV Files", extensions: ["csv"] }],
      });

      if (result.canceled || !result.filePath) return false;

      const bom = "\uFEFF";
      fs.writeFileSync(result.filePath, bom + csvContent, "utf-8");
      return true;
    } catch (err) {
      console.error("Failed to export activity logs:", err);
      return false;
    }
  });
}
