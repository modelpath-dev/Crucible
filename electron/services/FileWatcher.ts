import chokidar, { FSWatcher } from 'chokidar';
import { FileWatchEvent } from '../../shared/types';

export class FileWatcher {
  private watchers = new Map<string, FSWatcher>();

  watch(dirPath: string, callback: (event: FileWatchEvent) => void): void {
    if (this.watchers.has(dirPath)) {
      this.unwatch(dirPath);
    }

    const watcher = chokidar.watch(dirPath, {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/__pycache__/**',
        '**/.next/**',
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    const handler = (type: FileWatchEvent['type']) => (path: string) => {
      callback({ type, path });
    };

    watcher.on('add', handler('add'));
    watcher.on('change', handler('change'));
    watcher.on('unlink', handler('unlink'));
    watcher.on('addDir', handler('addDir'));
    watcher.on('unlinkDir', handler('unlinkDir'));

    this.watchers.set(dirPath, watcher);
  }

  unwatch(dirPath: string): void {
    const watcher = this.watchers.get(dirPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(dirPath);
    }
  }

  stopAll(): void {
    for (const [, watcher] of this.watchers) {
      watcher.close();
    }
    this.watchers.clear();
  }
}
