const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('formatChange', {
  getPathForFile: (file) => webUtils.getPathForFile(file),
  selectFiles: () => ipcRenderer.invoke('files:select'),
  filesFromDrop: (paths) => ipcRenderer.invoke('files:from-drop', paths),
  selectFolder: () => ipcRenderer.invoke('folder:select'),
  startConversion: (payload) => ipcRenderer.invoke('convert:start', payload),
  exportZip: (payload) => ipcRenderer.invoke('export:zip', payload),
  saveFile: (file) => ipcRenderer.invoke('save:file', file),
  saveAll: (files) => ipcRenderer.invoke('save:all', files),
  openPath: (path) => ipcRenderer.invoke('open:path', path),
  openFolder: (path) => ipcRenderer.invoke('open:folder', path),
  openExternal: (url) => ipcRenderer.invoke('open:external', url),
  getAppData: () => ipcRenderer.invoke('app:data'),
  clearHistory: () => ipcRenderer.invoke('history:clear'),
  saveFavorite: (favorite) => ipcRenderer.invoke('favorites:save', favorite),
  deleteFavorite: (id) => ipcRenderer.invoke('favorites:delete', id),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),
  checkForUpdates: () => ipcRenderer.invoke('updates:check'),
  onFileUpdate: (callback) => ipcRenderer.on('convert:file-update', (_event, data) => callback(data)),
  onBatchUpdate: (callback) => ipcRenderer.on('convert:batch-update', (_event, data) => callback(data)),
  onDone: (callback) => ipcRenderer.on('convert:done', (_event, data) => callback(data)),
  onUpdateStatus: (callback) => ipcRenderer.on('updates:status', (_event, data) => callback(data))
});
