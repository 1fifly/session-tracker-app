const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');
const { saveSession, loadSessions, deleteSession, deleteAllSessions, saveSettings, loadSettings } = require('./database');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 950,
    height: 550,
    minWidth: 950,
    minHeight: 550,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    frame: false,
    autoHideMenuBar: true,
    icon: './src/images/logo',
  });

  Menu.setApplicationMenu(null);
  
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  ipcMain.on('minimize-window', () => mainWindow.minimize());
  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('close-window', () => mainWindow.close());
};

ipcMain.handle('save-session', async (event, sessionData) => {
  try {
    saveSession(sessionData);
    return true;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
});

ipcMain.handle('load-sessions', async () => {
  try {
    return loadSessions();
  } catch (error) {
    console.error('Error loading sessions:', error);
    throw error;
  }
});

ipcMain.handle('delete-session', async (event, id) => {
  try {
    deleteSession(id);
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
});

ipcMain.handle('delete-all-sessions', async () => {
  try {
    deleteAllSessions();
    return true;
  } catch (error) {
    console.error('Error deleting all sessions:', error);
    throw error;
  }
});

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    saveSettings(settings);
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
});

ipcMain.handle('load-settings', async () => {
  try {
    return loadSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    throw error;
  }
});

ipcMain.handle('import-sessions', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (canceled || !filePaths.length) return { success: false };
    const data = JSON.parse(fs.readFileSync(filePaths[0], 'utf-8'));
    data.forEach(session => saveSession(session));
    return { success: true };
  } catch (error) {
    console.error('Error importing sessions:', error);
    return { success: false };
  }
});

ipcMain.handle('export-sessions', async () => {
  try {
    const sessions = loadSessions();
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: 'sessions.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (canceled || !filePath) return { success: false };
    fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error exporting sessions:', error);
    return { success: false };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});