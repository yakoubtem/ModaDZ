import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  protocol,
  net,
} from "electron";
import path from "path";
import { pathToFileURL } from "url";
import { registerProductHandlers } from "./handlers/products";
import { registerCategoryHandlers } from "./handlers/categories";
import { registerSaleHandlers } from "./handlers/sales";
import { registerCustomerHandlers } from "./handlers/customers";
import { registerInventoryHandlers } from "./handlers/inventory";
import { registerUserHandlers } from "./handlers/users";
import { registerDashboardHandlers } from "./handlers/dashboard";

const isDev = process.env.NODE_ENV === "development";

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
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#0c0e14",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#0c0e14",
      symbolColor: "#94a3b8",
      height: 40,
    },
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
    mainWindow.webContents.openDevTools();
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

function registerHandlers() {
  registerProductHandlers(ipcMain);
  registerCategoryHandlers(ipcMain);
  registerSaleHandlers(ipcMain);
  registerCustomerHandlers(ipcMain);
  registerInventoryHandlers(ipcMain);
  registerUserHandlers(ipcMain);
  registerDashboardHandlers(ipcMain);
}

app.whenReady().then(() => {
  // Serve files from app.getPath('userData') via media:// protocol
  // e.g. media://images/photo.jpg → {userData}/images/photo.jpg
  protocol.handle("media", (request) => {
    const rawPath = request.url.slice("media://".length);
    const filePath = path.join(
      app.getPath("userData"),
      decodeURIComponent(rawPath)
    );
    return net.fetch(pathToFileURL(filePath).href);
  });

  createWindow();
  registerHandlers();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
