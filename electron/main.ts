import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  protocol,
  net,
  session,
  Menu,
} from "electron";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

// Initialize DATABASE_URL for Prisma to use a persistent writeable path in both dev and production
const isDev = process.env.NODE_ENV === "development";
const dbDir = isDev
  ? path.join(app.getAppPath(), "prisma", "prisma")
  : path.join(app.getPath("userData"), "prisma");
const dbPath = path.join(dbDir, "store.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

if (!isDev && !fs.existsSync(dbPath)) {
  const seedDbPath = path.join(app.getAppPath(), "prisma", "prisma", "store.db");
  if (fs.existsSync(seedDbPath)) {
    fs.copyFileSync(seedDbPath, dbPath);
  }
}

process.env.DATABASE_URL = `file:${dbPath}`;

import { registerProductHandlers } from "./handlers/products";
import { registerCategoryHandlers } from "./handlers/categories";
import { registerSaleHandlers } from "./handlers/sales";
import { registerCustomerHandlers } from "./handlers/customers";
import { registerInventoryHandlers } from "./handlers/inventory";
import { registerUserHandlers } from "./handlers/users";
import { registerDashboardHandlers } from "./handlers/dashboard";
import { registerSettingsHandlers } from "./handlers/settings";
import { registerBackupHandlers } from "./handlers/backups";
import { registerDebtHandlers } from "./handlers/debts";
import { registerExpenseHandlers } from "./handlers/expenses";
import { registerSupplierHandlers } from "./handlers/suppliers";
import { registerPurchaseHandlers } from "./handlers/purchases";
import { registerActivityLogHandlers } from "./handlers/activityLogs";
import { registerSupplierDebtHandlers } from "./handlers/supplierDebts";
import { registerCashRegisterHandlers } from "./handlers/cashRegister";
import { registerLabelHandlers } from "./handlers/labels";
import { registerLicenseHandlers } from "./handlers/license";


// MUST be called before app.whenReady()
// Registers media:// as a privileged scheme so the renderer can use it
protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: { secure: true, standard: true, bypassCSP: true, stream: true },
  },
]);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const iconPath = isDev
    ? path.join(__dirname, "../modapos-dz/public/icon.ico")
    : path.join(__dirname, "../modapos-dz/dist/icon.ico");

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#0c0e14",
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "../modapos-dz/dist/index.html")
    );
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function buildMenu() {
  const isMac = process.platform === "darwin";
  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac ? [{ role: "appMenu" as const }] : []),
    { role: "fileMenu" as const },
    { role: "editMenu" as const },
    {
      label: "View",
      submenu: [
        { role: "reload" as const },
        { role: "forceReload" as const },
        { type: "separator" as const },
        { role: "resetZoom" as const },
        { role: "zoomIn" as const },
        { role: "zoomOut" as const },
        { type: "separator" as const },
        { role: "togglefullscreen" as const },
      ],
    },
    { role: "windowMenu" as const },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function registerHandlers() {
  registerProductHandlers(ipcMain);
  registerCategoryHandlers(ipcMain);
  registerSaleHandlers(ipcMain);
  registerCustomerHandlers(ipcMain);
  registerInventoryHandlers(ipcMain);
  registerUserHandlers(ipcMain);
  registerDashboardHandlers(ipcMain);
  registerSettingsHandlers(ipcMain);
  registerBackupHandlers(ipcMain);
  registerDebtHandlers(ipcMain);
  registerExpenseHandlers(ipcMain);
  registerSupplierHandlers(ipcMain);
  registerPurchaseHandlers(ipcMain);
  registerActivityLogHandlers(ipcMain);
  registerSupplierDebtHandlers(ipcMain);
  registerCashRegisterHandlers(ipcMain);
  registerLabelHandlers(ipcMain);
  registerLicenseHandlers(ipcMain);
}

app.whenReady().then(() => {
  // Set App User Model ID for Windows taskbar grouping and icons
  if (process.platform === "win32") {
    app.setAppUserModelId("com.modadz.pos");
  }

  // ── Content-Security-Policy ──────────────────────────────────────
  // Prevents the "Insecure Content-Security-Policy" Electron warning.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = isDev
      ? [
        // Development: allow localhost vite dev server + HMR websocket
        "default-src 'self' http://localhost:5173 ws://localhost:5173;",
        "script-src 'self' 'unsafe-inline' http://localhost:5173;",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com http://localhost:5173;",
        "font-src 'self' https://fonts.gstatic.com data:;",
        "img-src 'self' data: media: blob: http://localhost:5173;",
        "connect-src 'self' http://localhost:5173 ws://localhost:5173;",
        "media-src 'self' media: blob:;",
      ].join(" ")
      : [
        // Production: only allow local files and the media:// custom protocol
        "default-src 'self' media:;",
        "script-src 'self';",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
        "font-src 'self' https://fonts.gstatic.com data:;",
        "img-src 'self' data: media: blob:;",
        "connect-src 'self';",
        "media-src 'self' media: blob:;",
      ].join(" ");

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [csp],
      },
    });
  });

  // Serve files from app.getPath('userData') via media:// protocol
  // e.g. media://images/photo.jpg → {userData}/images/photo.jpg
  protocol.handle("media", (request) => {
    try {
      const rawPath = request.url.slice("media://".length);
      const filePath = path.join(
        app.getPath("userData"),
        decodeURIComponent(rawPath)
      );
      if (!fs.existsSync(filePath)) {
        return new Response("Not Found", { status: 404 });
      }
      return net.fetch(pathToFileURL(filePath).href);
    } catch (err) {
      console.error("Error serving media:", err);
      return new Response("Internal Error", { status: 500 });
    }
  });

  buildMenu();
  createWindow();
  registerHandlers();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
