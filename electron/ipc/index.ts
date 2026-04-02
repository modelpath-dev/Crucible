import { BrowserWindow, ipcMain } from 'electron';
import { registerFsHandlers } from './fs.ipc';
import { registerGitHandlers } from './git.ipc';
import { registerTerminalHandlers } from './terminal.ipc';
import { registerAiHandlers } from './ai.ipc';
import { registerKeystoreHandlers } from './keystore.ipc';
import { registerSettingsHandlers } from './settings.ipc';
import { registerSearchHandlers } from './search.ipc';
import { registerWindowHandlers } from './window.ipc';
import { registerLspHandlers } from './lsp.ipc';
import { FileWatcher } from '../services/FileWatcher';

export function registerAllHandlers(window: BrowserWindow, fileWatcher: FileWatcher) {
  registerFsHandlers(window, fileWatcher);
  registerGitHandlers();
  registerTerminalHandlers(window);
  registerAiHandlers(window);
  registerKeystoreHandlers();
  registerSettingsHandlers();
  registerSearchHandlers();
  registerWindowHandlers(window);
  registerLspHandlers(window);
}
