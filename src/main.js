const { app, BrowserWindow, ipcMain, Menu, dialog, Tray } = require('electron');
const path = require('node:path');
const fs = require('fs');
const { saveSession, loadSessions, deleteSession, deleteAllSessions, saveSettings, loadSettings } = require('./database');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let splashWindow;
let mainWindow;

const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 600,
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
  mainWindow = new BrowserWindow({
    width: 950,
    height: 550,
    minWidth: 950,
    minHeight: 550,
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
  ipcMain.on('close-window', () => mainWindow.close());
  
  // fix tray
  let tray = new Tray('./src/images/icon_no_bg.png');

  const contextMenu = Menu.buildFromTemplate([
    // check for updates
    // end session
    { label: 'Quit', type: 'normal', click: () => app.quit() },
  ]);
  
  tray.setContextMenu(contextMenu)
  tray.setTitle('Session Tracker')
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
//     owner: 'YOUR_GITHUB_USERNAME',
//     repo: 'YOUR_REPOSITORY_NAME',
//   });

//   return new Promise((resolve, reject) => {
//     autoUpdater.on('checking-for-update', () => {
//       splashWindow.webContents.send('update-status', 'Checking for updates');
//     });
//     autoUpdater.on('update-available', () => {
//       splashWindow.webContents.send('update-status', 'Updating');
//     });
//     autoUpdater.on('update-downloaded', () => {
//       splashWindow.webContents.send('update-status', 'Starting Session Tracker');
//       autoUpdater.quitAndInstall();
//       resolve();
//     });
//     autoUpdater.on('update-not-available', () => {
//       splashWindow.webContents.send('update-status', 'Starting Session Tracker');
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
    // await checkForUpdatesGitHub();

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