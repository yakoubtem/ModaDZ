import { contextBridge, ipcRenderer } from "electron";

// Type-safe IPC API exposed to the renderer via window.api
const api = {
  invoke: (channel: string, ...args: unknown[]) =>
    ipcRenderer.invoke(channel, ...args),
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback as never);
  },
};

contextBridge.exposeInMainWorld("api", api);
