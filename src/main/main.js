const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { pathToFileURL } = require('url');
const { BrowserWindow, Menu, Notification, app, dialog, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const { OUTPUT_FORMATS, getFileType, isSupported } = require('./formats');
const { convertBatch, createZip } = require('./converter');
const {
  clearHistory,
  deleteFavorite,
  getFavorites,
  getHistory,
  getSettings,
  saveFavorite,
  setSettings
} = require('./historyStore');

app.setName('Morpho');

let mainWindow;

function sendUpdateStatus(payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('updates:status', payload);
}

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus({ state: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus({ state: 'available', version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    sendUpdateStatus({ state: 'none' });
  });

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus({ state: 'downloading', percent: progress.percent });
  });

  autoUpdater.on('error', (error) => {
    console.error('Auto update error:', error);
    sendUpdateStatus({ state: 'error' });
  });

  autoUpdater.on('update-downloaded', () => {
    sendUpdateStatus({ state: 'downloaded' });
    if (Notification.isSupported()) {
      new Notification({
        title: 'Actualizacion lista',
        body: 'Morpho se reiniciara para aplicar la nueva version.'
      }).show();
    }

    setTimeout(() => {
      autoUpdater.quitAndInstall(true, true);
    }, 1500);
  });

  autoUpdater.checkForUpdatesAndNotify().catch((error) => {
    console.error('Auto update check failed:', error);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#101214',
    title: 'Morpho',
    icon: path.join(__dirname, '../renderer/assets/logo.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  setupAutoUpdater();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function fileToPayload(filePath) {
  const extension = path.extname(filePath).replace('.', '').toLowerCase();
  const type = getFileType(extension);
  const stat = fs.statSync(filePath);

  return {
    id: randomUUID(),
    path: filePath,
    previewUrl: pathToFileURL(filePath).href,
    name: path.basename(filePath),
    extension,
    type,
    size: stat.size,
    status: 'pending',
    progress: 0,
    outputFormat: OUTPUT_FORMATS[type]?.[0] || ''
  };
}

ipcMain.handle('files:select', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecciona archivos multimedia',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Multimedia', extensions: [...OUTPUT_FORMATS.video, ...OUTPUT_FORMATS.image, ...OUTPUT_FORMATS.audio, 'jpeg'] }
    ]
  });

  if (result.canceled) return [];
  return result.filePaths.filter((filePath) => isSupported(path.extname(filePath))).map(fileToPayload);
});

ipcMain.handle('files:from-drop', async (_event, filePaths) => {
  return filePaths.filter((filePath) => fs.existsSync(filePath) && isSupported(path.extname(filePath))).map(fileToPayload);
});

ipcMain.handle('folder:select', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecciona carpeta de exportacion',
    properties: ['openDirectory', 'createDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('convert:start', async (event, payload) => {
  const batch = await convertBatch({
    ...payload,
    onFileUpdate: (update) => event.sender.send('convert:file-update', update),
    onBatchUpdate: (update) => event.sender.send('convert:batch-update', update)
  });

  if (Notification.isSupported()) {
    new Notification({
      title: 'Conversion finalizada',
      body: `${batch.results.filter((item) => item.status === 'completed').length} archivo(s) convertidos.`
    }).show();
  }

  event.sender.send('convert:done', batch);
  return batch;
});

ipcMain.handle('export:zip', async (_event, { files, outputDirectory }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Exportar conversiones como ZIP',
    defaultPath: path.join(outputDirectory || app.getPath('downloads'), `Morpho-${Date.now()}.zip`),
    filters: [{ name: 'ZIP', extensions: ['zip'] }]
  });
  if (result.canceled || !result.filePath) return null;
  return createZip(files, result.filePath);
});

function uniqueCopyPath(directory, filename) {
  const parsed = path.parse(filename);
  let candidate = path.join(directory, filename);
  let index = 1;

  while (fs.existsSync(candidate)) {
    candidate = path.join(directory, `${parsed.name}-${index}${parsed.ext}`);
    index += 1;
  }

  return candidate;
}

ipcMain.handle('save:file', async (_event, file) => {
  if (!file?.outputPath || !fs.existsSync(file.outputPath)) return null;
  const extension = path.extname(file.outputPath).replace('.', '');
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Guardar archivo convertido',
    defaultPath: path.basename(file.outputPath),
    filters: extension ? [{ name: extension.toUpperCase(), extensions: [extension] }] : undefined
  });

  if (result.canceled || !result.filePath) return null;
  if (path.resolve(result.filePath) !== path.resolve(file.outputPath)) {
    fs.copyFileSync(file.outputPath, result.filePath);
  }
  return result.filePath;
});

ipcMain.handle('save:all', async (_event, files = []) => {
  const completed = files.filter((file) => file.outputPath && fs.existsSync(file.outputPath));
  if (!completed.length) return [];

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecciona carpeta para guardar conversiones',
    properties: ['openDirectory', 'createDirectory']
  });

  if (result.canceled || !result.filePaths[0]) return [];
  return completed.map((file) => {
    const targetPath = uniqueCopyPath(result.filePaths[0], path.basename(file.outputPath));
    fs.copyFileSync(file.outputPath, targetPath);
    return targetPath;
  });
});

ipcMain.handle('open:path', async (_event, filePath) => {
  if (!filePath) return;
  await shell.openPath(filePath);
});

ipcMain.handle('open:folder', async (_event, folderPath) => {
  if (!folderPath) return;
  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isFile()) {
    shell.showItemInFolder(folderPath);
    return;
  }
  await shell.openPath(folderPath);
});

ipcMain.handle('open:external', async (_event, url) => {
  if (!url) return;
  await shell.openExternal(url);
});

ipcMain.handle('app:data', () => ({
  formats: OUTPUT_FORMATS,
  history: getHistory(),
  favorites: getFavorites(),
  settings: getSettings(),
  version: app.getVersion()
}));

ipcMain.handle('history:clear', () => {
  clearHistory();
  return getHistory();
});

ipcMain.handle('favorites:save', (_event, favorite) => saveFavorite(favorite));
ipcMain.handle('favorites:delete', (_event, id) => {
  deleteFavorite(id);
  return getFavorites();
});
ipcMain.handle('settings:set', (_event, settings) => setSettings(settings));
ipcMain.handle('updates:check', async () => {
  if (!app.isPackaged) {
    const payload = { state: 'unavailable' };
    sendUpdateStatus(payload);
    return payload;
  }

  sendUpdateStatus({ state: 'checking' });
  try {
    const result = await autoUpdater.checkForUpdates();
    if (!result) {
      const payload = { state: 'none' };
      sendUpdateStatus(payload);
      return payload;
    }
    const payload = { state: 'available', version: result?.updateInfo?.version };
    sendUpdateStatus(payload);
    return payload;
  } catch (error) {
    console.error('Manual update check failed:', error);
    const payload = { state: 'error' };
    sendUpdateStatus(payload);
    return payload;
  }
});
