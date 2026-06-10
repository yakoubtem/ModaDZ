import { IpcMain, dialog, app } from "electron";
import { prisma } from "../db/client";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

import { getCurrentUserId } from "../helpers/rbac";

async function requireAdmin(userId?: number) {
  const finalUserId = userId !== undefined ? userId : getCurrentUserId();
  if (!finalUserId) throw new Error("Permission denied");
  const user = await prisma.user.findUnique({ where: { id: finalUserId } });
  if (!user || user.role !== "admin" || !user.isActive) {
    throw new Error("Permission denied");
  }
}

async function syncBackupsWithDatabase(backupDir: string) {
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      return;
    }
    const files = fs.readdirSync(backupDir);
    const dbBackups = await prisma.backup.findMany();
    const dbBackupNames = new Set(dbBackups.map((b) => b.filename));
    const diskBackupNames = new Set<string>();

    for (const file of files) {
      const match = file.match(/^backup_(\d+)\.db$/);
      if (match) {
        diskBackupNames.add(file);
        if (!dbBackupNames.has(file)) {
          const timestamp = parseInt(match[1]);
          const filePath = path.join(backupDir, file);
          const stat = fs.statSync(filePath);
          await prisma.backup.create({
            data: {
              filename: file,
              size: stat.size,
              type: "manual",
              createdAt: new Date(timestamp),
            },
          });
        }
      }
    }

    // Clean up records in DB that don't exist on disk anymore
    for (const dbBackup of dbBackups) {
      if (!diskBackupNames.has(dbBackup.filename)) {
        await prisma.backup.delete({ where: { id: dbBackup.id } });
      }
    }
  } catch (syncErr) {
    console.error("Failed to sync backups with database:", syncErr);
  }
}

export function registerBackupHandlers(ipcMain: IpcMain) {
  const isDev = process.env.NODE_ENV === "development";
  const dbPath = isDev
    ? path.join(app.getAppPath(), "prisma", "prisma", "store.db")
    : path.join(app.getPath("userData"), "prisma", "store.db");
  const backupDir = path.join(app.getPath("userData"), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  ipcMain.handle("backups:getAll", async (_e, params: { currentUserId?: number }) => {
    await requireAdmin(params.currentUserId);
    await syncBackupsWithDatabase(backupDir);
    return prisma.backup.findMany({ orderBy: { createdAt: "desc" } });
  });

  ipcMain.handle(
    "backups:create",
    async (_e, params: { currentUserId?: number; options?: { type?: string } }) => {
      await requireAdmin(params.currentUserId);
      const type = params.options?.type || "manual";
      const filename = `backup_${Date.now()}.db`;
      const dest = path.join(backupDir, filename);

      // Force a checkpoint usually done by closing or pragmas, but simple copy is OK for small SQLite
      fs.copyFileSync(dbPath, dest);
      const stat = fs.statSync(dest);

      return prisma.backup.create({
        data: {
          filename,
          size: stat.size,
          type,
        },
      });
    }
  );

  ipcMain.handle("backups:restore", async (_e, params: { currentUserId?: number; id: number; filename?: string }) => {
    await requireAdmin(params.currentUserId);
    let filename = params.filename;

    if (!filename) {
      const backup = await prisma.backup.findUnique({ where: { id: Number(params.id) } });
      if (backup) {
        filename = backup.filename;
      }
    }

    if (!filename) {
      await syncBackupsWithDatabase(backupDir);
      const backup = await prisma.backup.findUnique({ where: { id: Number(params.id) } });
      if (backup) {
        filename = backup.filename;
      }
    }

    if (!filename) throw new Error("Sauvegarde introuvable");

    const source = path.join(backupDir, filename);
    if (!fs.existsSync(source)) throw new Error("Fichier de sauvegarde manquant");

    // Copy to DB path
    // NOTE: Disconnect prisma first to release SQLite file lock before overwriting
    await prisma.$disconnect();
    fs.copyFileSync(source, dbPath);
    return true; // The UI should probably trigger a reload
  });

  ipcMain.handle("backups:exportZip", async (_e, params: { currentUserId?: number; id: number; filename?: string }) => {
    await requireAdmin(params.currentUserId);
    let filename = params.filename;

    if (!filename) {
      const backup = await prisma.backup.findUnique({ where: { id: Number(params.id) } });
      if (backup) {
        filename = backup.filename;
      }
    }

    if (!filename) {
      await syncBackupsWithDatabase(backupDir);
      const backup = await prisma.backup.findUnique({ where: { id: Number(params.id) } });
      if (backup) {
        filename = backup.filename;
      }
    }

    if (!filename) throw new Error("Sauvegarde introuvable");

    const source = path.join(backupDir, filename);
    if (!fs.existsSync(source)) throw new Error("Fichier de sauvegarde manquant");

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Exporter la sauvegarde",
      defaultPath: `ModaDZ_Backup_${filename.replace(".db", "")}.zip`,
      filters: [{ name: "Fichiers ZIP", extensions: ["zip"] }],
    });

    if (canceled || !filePath) return false;

    const zip = new AdmZip();
    zip.addLocalFile(source, "", "store.db");
    zip.writeZip(filePath);

    return true;
  });
}