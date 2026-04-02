import { BrowserWindow, ipcMain } from 'electron';

export function registerWindowHandlers(window: BrowserWindow) {
  ipcMain.on('window:minimize', () => {
    window.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    window.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return window.isMaximized();
  });

  window.on('maximize', () => {
    window.webContents.send('window:maximizeChange', true);
  });

  window.on('unmaximize', () => {
    window.webContents.send('window:maximizeChange', false);
  });
}
