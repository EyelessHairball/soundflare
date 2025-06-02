const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { updatePresence } = require("./rpc");

let mainWindow;
let splash;

function createWindows() {
  splash = new BrowserWindow({
    icon: './SoundFlareLogo.png',
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    show: true,
    skipTaskbar: true,
    fullscreenable: false,
  });

  splash.loadFile('splash.html');

  mainWindow = new BrowserWindow({
    icon: './SoundFlareLogo.png',
    width: 1500,
    height: 1000,
    minWidth: 777, //my lucky number :3
    minHeight: 700,
    autoHideMenuBar: false,
    transparent: false,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: true
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
  setTimeout(() => {
    splash.close();
    mainWindow.show();
    setThumbarButtons(false); 
  }, 2500);
});
}

function setThumbarButtons(isPlaying = false) {
  if (!mainWindow) return;
  mainWindow.setThumbarButtons([
    {
      tooltip: 'Previous',
      icon: path.join(__dirname, 'assets', 'prev.png'), 
      click: () => {
        mainWindow.webContents.send('taskbar-previous');
      }
    },
    {
      tooltip: isPlaying ? 'Pause' : 'Play',
      icon: path.join(__dirname, 'assets', isPlaying ? 'pause.png' : 'play.png'),
      click: () => {
        mainWindow.webContents.send('taskbar-playpause');
      }
    },
    {
      tooltip: 'Next',
      icon: path.join(__dirname, 'assets', 'next.png'),
      click: () => {
        mainWindow.webContents.send('taskbar-next');
      }
    }
  ]);
}

ipcMain.on('window-minimize', (event) => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.on('window-maximize', (event) => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
ipcMain.on('window-close', (event) => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on("update-rpc", (event, { title, artist, playing, position }) => {
  updatePresence(title, artist, playing, position);
});

ipcMain.on('playback-state', (event, isPlaying) => {
  setThumbarButtons(isPlaying);
});

app.setAppUserModelId('com.hairlesseyeball.soundflare');

app.whenReady().then(() => {
  createWindows();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
