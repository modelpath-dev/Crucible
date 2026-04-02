import { BrowserWindow, ipcMain } from 'electron';
import { TERMINAL_CHANNELS } from '../../shared/ipcChannels';

// node-pty is optional - gracefully handle if not available
let pty: any;
try {
  pty = require('node-pty');
} catch {
  console.warn('node-pty not available. Terminal functionality disabled.');
}

const terminals = new Map<string, any>();

export function registerTerminalHandlers(window: BrowserWindow) {
  ipcMain.handle(TERMINAL_CHANNELS.CREATE, async (_event, id: string, cwd: string): Promise<boolean> => {
    if (!pty) return false;

    const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash';
    const term = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd,
      env: { ...process.env, TERM: 'xterm-256color' },
    });

    term.onData((data: string) => {
      window.webContents.send(TERMINAL_CHANNELS.OUTPUT, id, data);
    });

    term.onExit(({ exitCode }: { exitCode: number }) => {
      terminals.delete(id);
      window.webContents.send(TERMINAL_CHANNELS.EXIT, id, exitCode);
    });

    terminals.set(id, term);
    return true;
  });

  ipcMain.on(TERMINAL_CHANNELS.DATA, (_event, id: string, data: string) => {
    const term = terminals.get(id);
    if (term) term.write(data);
  });

  ipcMain.on(TERMINAL_CHANNELS.RESIZE, (_event, id: string, cols: number, rows: number) => {
    const term = terminals.get(id);
    if (term) term.resize(cols, rows);
  });

  ipcMain.on(TERMINAL_CHANNELS.CLOSE, (_event, id: string) => {
    const term = terminals.get(id);
    if (term) {
      term.kill();
      terminals.delete(id);
    }
  });
}
