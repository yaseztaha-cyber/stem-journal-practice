const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sjpDesktop', {
  apiBase: 'http://localhost:4000',
  platform: process.platform,
  getAppVersion: () => ipcRenderer.invoke('sjp:get-version'),
  checkForUpdates: () => ipcRenderer.invoke('sjp:check-updates'),
  getAiProviders: () => ipcRenderer.invoke('sjp:get-ai-providers'),
  saveAiKeys: (keys) => ipcRenderer.invoke('sjp:save-ai-keys', keys),
  restartApp: () => ipcRenderer.invoke('sjp:restart-app'),
  onUpdateStatus: (cb) => {
    const listener = (_event, status) => cb(status);
    ipcRenderer.on('sjp:update-status', listener);
    return () => ipcRenderer.removeListener('sjp:update-status', listener);
  },
});