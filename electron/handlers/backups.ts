import { IpcMain, dialog, app } from "electron";
import { prisma } from "../db/client";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

async function requireAdmin(userId?: number) {
  if (!userId) throw new Error("Accès refusé: non authentifié");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "admin") {
    throw new Error("Accès refusé: privilèges administrateur requis");
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

  ipcMain.handle("backups:restore", async (_e, params: { currentUserId?: number; id: number }) => {
    await requireAdmin(params.currentUserId);
    const backup = await prisma.backup.findUnique({ where: { id: params.id } });
    if (!backup) throw new Error("Sauvegarde introuvable");

    const source = path.join(backupDir, backup.filename);
    if (!fs.existsSync(source)) throw new Error("Fichier de sauvegarde manquant");

    // Copy to DB path
    // NOTE: Disconnect prisma first to release SQLite file lock before overwriting
    await prisma.$disconnect();
    fs.copyFileSync(source, dbPath);
    return true; // The UI should probably trigger a reload
  });

  ipcMain.handle("backups:exportZip", async (_e, params: { currentUserId?: number; id: number }) => {
    await requireAdmin(params.currentUserId);
    const backup = await prisma.backup.findUnique({ where: { id: params.id } });
    if (!backup) throw new Error("Sauvegarde introuvable");

    const source = path.join(backupDir, backup.filename);
    if (!fs.existsSync(source)) throw new Error("Fichier de sauvegarde manquant");

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Exporter la sauvegarde",
      defaultPath: `ModaDZ_Backup_${backup.filename.replace(".db", "")}.zip`,
      filters: [{ name: "Fichiers ZIP", extensions: ["zip"] }],
    });

    if (canceled || !filePath) return false;

    const zip = new AdmZip();
    zip.addLocalFile(source, "", "store.db");
    zip.writeZip(filePath);

    return true;
  });
}