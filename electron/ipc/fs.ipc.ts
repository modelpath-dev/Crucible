import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FS_CHANNELS } from '../../shared/ipcChannels';
import { FileEntry, FileStat } from '../../shared/types';
import { FileWatcher } from '../services/FileWatcher';

// Security: validate paths to prevent directory traversal
function validatePath(filePath: string, projectRoot?: string): boolean {
  const resolved = path.resolve(filePath);
  if (projectRoot) {
    return resolved.startsWith(path.resolve(projectRoot));
  }
  // Basic checks: no null bytes
  return !filePath.includes('\0');
}

export function registerFsHandlers(window: BrowserWindow, fileWatcher: FileWatcher) {
  ipcMain.handle(FS_CHANNELS.READ_DIR, async (_event, dirPath: string): Promise<FileEntry[]> => {
    if (!validatePath(dirPath)) throw new Error('Invalid path');
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const result: FileEntry[] = [];

    for (const entry of entries) {
      // Skip hidden files and common ignore patterns
      if (entry.name.startsWith('.') && entry.name !== '.gitignore') continue;
      if (['node_modules', 'dist', '.git', '__pycache__', '.next'].includes(entry.name)) continue;

      const fullPath = path.join(dirPath, entry.name);
      try {
        const stat = await fs.stat(fullPath);
        result.push({
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          isSymlink: entry.isSymbolicLink(),
          size: stat.size,
          modified: stat.mtimeMs,
        });
      } catch {
        // Skip files we can't stat
      }
    }

    // Sort: directories first, then alphabetical
    result.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    return result;
  });

  ipcMain.handle(FS_CHANNELS.READ_FILE, async (_event, filePath: string): Promise<string> => {
    if (!validatePath(filePath)) throw new Error('Invalid path');
    return fs.readFile(filePath, 'utf-8');
  });

  ipcMain.handle(FS_CHANNELS.WRITE_FILE, async (_event, filePath: string, content: string): Promise<void> => {
    if (!validatePath(filePath)) throw new Error('Invalid path');
    await fs.writeFile(filePath, content, 'utf-8');
  });

  ipcMain.handle(FS_CHANNELS.STAT, async (_event, filePath: string): Promise<FileStat> => {
    if (!validatePath(filePath)) throw new Error('Invalid path');
    const stat = await fs.stat(filePath);
    return {
      size: stat.size,
      modified: stat.mtimeMs,
      created: stat.birthtimeMs,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
      isSymlink: stat.isSymbolicLink(),
    };
  });

  ipcMain.handle(FS_CHANNELS.MKDIR, async (_event, dirPath: string): Promise<void> => {
    if (!validatePath(dirPath)) throw new Error('Invalid path');
    await fs.mkdir(dirPath, { recursive: true });
  });

  ipcMain.handle(FS_CHANNELS.RENAME, async (_event, oldPath: string, newPath: string): Promise<void> => {
    if (!validatePath(oldPath) || !validatePath(newPath)) throw new Error('Invalid path');
    await fs.rename(oldPath, newPath);
  });

  ipcMain.handle(FS_CHANNELS.DELETE, async (_event, filePath: string): Promise<void> => {
    if (!validatePath(filePath)) throw new Error('Invalid path');
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await fs.rm(filePath, { recursive: true });
    } else {
      await fs.unlink(filePath);
    }
  });

  ipcMain.handle(FS_CHANNELS.SELECT_FOLDER, async (): Promise<string | null> => {
    const result = await dialog.showOpenDialog(window, {
      properties: ['openDirectory'],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle(FS_CHANNELS.WATCH_START, async (_event, dirPath: string): Promise<void> => {
    fileWatcher.watch(dirPath, (event) => {
      window.webContents.send(FS_CHANNELS.WATCH_EVENT, event);
    });
  });

  ipcMain.handle(FS_CHANNELS.WATCH_STOP, async (_event, dirPath: string): Promise<void> => {
    fileWatcher.unwatch(dirPath);
  });
}
