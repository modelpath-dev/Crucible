import { app, BrowserWindow, shell } from 'electron';
import * as path from 'path';
import { registerAllHandlers } from './ipc';
import { FileWatcher } from './services/FileWatcher';

let mainWindow: BrowserWindow | null = null;
let fileWatcher: FileWatcher | null = null;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Crucible IDE',
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: process.platform === 'darwin' ? {
      color: '#1e1e2e',
      symbolColor: '#cdd6f4',
      height: 38,
    } : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // needed for node-pty access via preload
    },
    backgroundColor: '#1e1e2e',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Register IPC handlers
  fileWatcher = new FileWatcher();
  registerAllHandlers(mainWindow, fileWatcher);

  // Load app
  if (isDev) {
    const devPort = process.env.VITE_PORT || '5173';
    mainWindow.loadURL(`http://localhost:${devPort}`);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    fileWatcher?.stopAll();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
