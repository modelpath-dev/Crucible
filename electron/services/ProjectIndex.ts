import * as fs from 'fs/promises';
import * as path from 'path';
import { FileSearchResult } from '../../shared/types';

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '__pycache__',
  '.cache', 'coverage', '.nyc_output', '.vscode', '.idea',
]);

export class ProjectIndex {
  private indices = new Map<string, string[]>();

  async buildIndex(root: string): Promise<void> {
    const files: string[] = [];
    await this.walk(root, root, files);
    this.indices.set(root, files);
  }

  private async walk(root: string, dir: string, files: string[]): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await this.walk(root, fullPath, files);
        } else {
          files.push(path.relative(root, fullPath));
        }
      }
    } catch {
      // Skip unreadable dirs
    }
  }

  async search(root: string, query: string): Promise<FileSearchResult[]> {
    if (!this.indices.has(root)) {
      await this.buildIndex(root);
    }

    const files = this.indices.get(root) || [];
    const queryLower = query.toLowerCase();
    const results: FileSearchResult[] = [];

    for (const filePath of files) {
      const name = path.basename(filePath);
      const score = this.fuzzyScore(name.toLowerCase(), filePath.toLowerCase(), queryLower);
      if (score > 0) {
        results.push({
          path: path.join(root, filePath),
          name,
          score,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 50);
  }

  private fuzzyScore(name: string, fullPath: string, query: string): number {
    // Exact match in name
    if (name === query) return 100;
    if (name.includes(query)) return 80;
    if (fullPath.includes(query)) return 60;

    // Fuzzy character matching
    let qi = 0;
    let score = 0;
    let consecutive = 0;
    const target = name.length < fullPath.length ? name : fullPath;

    for (let i = 0; i < target.length && qi < query.length; i++) {
      if (target[i] === query[qi]) {
        qi++;
        consecutive++;
        score += consecutive * 2;
      } else {
        consecutive = 0;
      }
    }

    return qi === query.length ? score : 0;
  }

  invalidate(root: string): void {
    this.indices.delete(root);
  }
}
