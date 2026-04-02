import { BrowserWindow, ipcMain } from 'electron';
import { LSP_CHANNELS } from '../../shared/ipcChannels';
import { LSPManager } from '../services/LSPManager';

const lspManager = new LSPManager();

export function registerLspHandlers(window: BrowserWindow) {
  ipcMain.handle(LSP_CHANNELS.START, async (_event, language: string, workspaceRoot: string): Promise<boolean> => {
    const success = await lspManager.startServer(language, workspaceRoot);
    if (success) {
      lspManager.onResponse(language, (data) => {
        window.webContents.send(LSP_CHANNELS.RECEIVE, language, data);
      });
    }
    return success;
  });

  ipcMain.handle(LSP_CHANNELS.STOP, async (_event, language: string): Promise<void> => {
    lspManager.stopServer(language);
  });

  ipcMain.on(LSP_CHANNELS.SEND, (_event, language: string, message: string) => {
    lspManager.sendRequest(language, message);
  });
}

export function cleanupLsp() {
  lspManager.stopAll();
}
