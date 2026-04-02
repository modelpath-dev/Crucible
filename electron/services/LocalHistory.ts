import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

interface HistoryEntry {
  id: string;
  filePath: string;
  timestamp: number;
  source: 'save' | 'ai-edit' | 'external';
  label?: string;
}

export class LocalHistory {
  private historyDir: string;
  private index: HistoryEntry[] = [];
  private indexPath: string;
  private maxEntries = 100;

  constructor() {
    this.historyDir = path.join(app.getPath('userData'), 'local-history');
    this.indexPath = path.join(this.historyDir, 'index.json');
    this.ensureDir();
    this.loadIndex();
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.historyDir)) {
      fs.mkdirSync(this.historyDir, { recursive: true });
    }
  }

  private loadIndex(): void {
    try {
      this.index = JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
    } catch {
      this.index = [];
    }
  }

  private saveIndex(): void {
    fs.writeFileSync(this.indexPath, JSON.stringify(this.index, null, 2));
  }

  snapshot(filePath: string, content: string, source: 'save' | 'ai-edit' | 'external', label?: string): string {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const snapshotPath = path.join(this.historyDir, id);

    fs.writeFileSync(snapshotPath, content, 'utf-8');

    const entry: HistoryEntry = {
      id,
      filePath,
      timestamp: Date.now(),
      source,
      label,
    };

    this.index.unshift(entry);

    // Prune old entries per file
    const fileEntries = this.index.filter(e => e.filePath === filePath);
    if (fileEntries.length > this.maxEntries) {
      const toRemove = fileEntries.slice(this.maxEntries);
      for (const entry of toRemove) {
        try { fs.unlinkSync(path.join(this.historyDir, entry.id)); } catch {}
      }
      this.index = this.index.filter(e => !toRemove.includes(e));
    }

    this.saveIndex();
    return id;
  }

  getHistory(filePath: string): HistoryEntry[] {
    return this.index.filter(e => e.filePath === filePath);
  }

  getContent(id: string): string | null {
    try {
      return fs.readFileSync(path.join(this.historyDir, id), 'utf-8');
    } catch {
      return null;
    }
  }

  restore(id: string): { filePath: string; content: string } | null {
    const entry = this.index.find(e => e.id === id);
    if (!entry) return null;
    const content = this.getContent(id);
    if (!content) return null;
    return { filePath: entry.filePath, content };
  }
}
