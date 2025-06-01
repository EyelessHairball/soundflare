const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  onTaskbarPrevious: (callback) => ipcRenderer.on('taskbar-previous', callback),
  onTaskbarPlayPause: (callback) => ipcRenderer.on('taskbar-playpause', callback),
  onTaskbarNext: (callback) => ipcRenderer.on('taskbar-next', callback),
  sendPlaybackState: (isPlaying) => ipcRenderer.send('playback-state', isPlaying),
  send: (channel, data) => ipcRenderer.send(channel, data)
});