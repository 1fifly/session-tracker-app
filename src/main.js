const { app, BrowserWindow, ipcMain, Menu, dialog, Tray, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('fs');
const { saveSession, loadSessions, deleteSession, deleteAllSessions, saveSettings, loadSettings } = require('./database');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let splashWindow;
let mainWindow;
let tray;

const windowStatePath = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  try {
    if (fs.existsSync(windowStatePath)) {
      const data = fs.readFileSync(windowStatePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load window state:', err);
  }
  return { width: 950, height: 600 };
}

function saveWindowState(window) {
  if (!window) return;
  try {
    const bounds = window.getBounds();
    fs.writeFileSync(windowStatePath, JSON.stringify(bounds));
  } catch (err) {
    console.error('Failed to save window state:', err);
  }
}

const setupTray = () => {
  const originalIcon = nativeImage.createFromPath(path.join(__dirname, 'images', 'icon_no_bg.png'));
  tray = new Tray(originalIcon);

  const resizedIcon = nativeImage.createFromPath(path.join(__dirname, 'images', 'icon_no_bg.png')).resize({ width: 16, height: 16 });
  const contextMenu = Menu.buildFromTemplate([
    { icon: resizedIcon, label: app.name, enabled: false },
    { type: 'separator' },
    { label: 'GitHub', click: async () => { const { shell } = require('electron'); await shell.openExternal('https://github.com/1fifly/session-tracker-app')} },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); saveWindowState(mainWindow); } },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setTitle(app.name);
  tray.setToolTip(app.name);

  tray.on('click', () => {
    mainWindow.show();
  });
};

const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 267,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: './src/images/icon.png',
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
};

const createMainWindow = () => {
  const windowState = loadWindowState();

  mainWindow = new BrowserWindow({
    ...windowState,
    minWidth: 950,
    minHeight: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    frame: false,
    autoHideMenuBar: true,
    icon: './src/images/icon.png',
    show: false,
  });

  Menu.setApplicationMenu(null);

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide(); 
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
    }
    mainWindow.show();
  });

  ipcMain.on('minimize-window', () => mainWindow.minimize());
  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('close-window', () => mainWindow.hide());
  
  setupTray();
};

const checkForUpdatesFake = () => {
  return new Promise((resolve) => {
    splashWindow.webContents.send('update-status', 'Checking for updates');
    setTimeout(() => {
      const needsUpdate = Math.random() > 0.5;
      if (needsUpdate) {
        splashWindow.webContents.send('update-status', 'Updating');
        setTimeout(() => {
          splashWindow.webContents.send('update-status', 'Starting');
          resolve();
        }, 2000);
      } else {
        splashWindow.webContents.send('update-status', 'Starting');
        setTimeout(resolve, 1000);
      }
    }, 1500);
  });
};

// // GitHub-based update check (commented out for now)
// const checkForUpdatesGitHub = () => {
//   const { autoUpdater } = require('electron-updater');
//   autoUpdater.setFeedURL({
//     provider: 'github',
//     owner: 'fifly1',
//     repo: 'session-tracker-app',
//   });

//   return new Promise((resolve, reject) => {
//     autoUpdater.on('checking-for-update', () => {
//       splashWindow.webContents.send('update-status', 'Checking for updates');
//     });
//     autoUpdater.on('update-available', () => {
//       splashWindow.webContents.send('update-status', 'Updating');
//     });
//     autoUpdater.on('update-downloaded', () => {
//       splashWindow.webContents.send('update-status', 'Starting');
//       autoUpdater.quitAndInstall();
//       resolve();
//     });
//     autoUpdater.on('update-not-available', () => {
//       splashWindow.webContents.send('update-status', 'Starting');
//       setTimeout(resolve, 1000);
//     });
//     autoUpdater.on('error', (err) => {
//       splashWindow.webContents.send('update-status', `Error: ${err.message}`);
//       setTimeout(reject, 2000);
//     });
//     autoUpdater.checkForUpdates();
//   });
// };

app.whenReady().then(async () => {
  createSplashWindow();

  try {
    await checkForUpdatesFake();
    createMainWindow();
  } catch (error) {
    console.error('Update check failed:', error);
    if (splashWindow) {
      splashWindow.close();
    }
    createMainWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

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
    if (canceled || !filePaths.length) return { success: false, error: 'No file selected' };
    
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePaths[0], 'utf-8'));
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return { success: false, error: 'Invalid JSON file' };
    }

    if (!Array.isArray(data)) {
      console.error('Imported data is not an array:', data);
      return { success: false, error: 'File must contain an array of sessions' };
    }

    for (const session of data) {
      if (typeof session !== 'object' || session === null) {
        console.error('Invalid session object:', session);
        return { success: false, error: 'Invalid session data' };
      }
      if (!session.title) {
        console.warn('Session missing title, setting default:', session);
        session.title = session.title || 'Untitled';
      }
      if (session.todos && !Array.isArray(session.todos)) {
        console.warn('Invalid todos format, resetting:', session.todos);
        session.todos = [];
      }
      if (session.timestamp && !session.timestamp.match(/^\d{4}-\d{2}-\d{2}/)) {
        console.warn('Invalid timestamp, resetting:', session.timestamp);
        session.timestamp = new Date().toISOString().split('T')[0];
      }
    }

    console.log('Importing sessions:', data);
    data.forEach(session => saveSession(session));
    
    const sessions = loadSessions();
    console.log('Sessions after import:', sessions);
    return { success: true, sessions };
  } catch (error) {
    console.error('Error importing sessions:', error);
    return { success: false, error: error.message };
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