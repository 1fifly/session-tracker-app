const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveSession: (session) => ipcRenderer.invoke('save-session', session),
  loadSessions: () => ipcRenderer.invoke('load-sessions'),
  deleteSession: (id) => ipcRenderer.invoke('delete-session', id),
  deleteAllSessions: () => ipcRenderer.invoke('delete-all-sessions'),
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  importSessions: () => ipcRenderer.invoke('import-sessions'),
  exportSessions: () => ipcRenderer.invoke('export-sessions'),
  playSessionEndSound: (sessionEndSound) => ipcRenderer.send('play-session-end-sound', sessionEndSound),
});

contextBridge.exposeInMainWorld('process', {
  platform: process.platform,
});