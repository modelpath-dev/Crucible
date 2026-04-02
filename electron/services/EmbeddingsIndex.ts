import * as path from 'path';
import { app } from 'electron';

// Placeholder for the embeddings/RAG system
// Will use better-sqlite3 + sqlite-vec when fully implemented

interface CodeChunk {
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  embedding?: number[];
}

interface SearchResult {
  filePath: string;
  content: string;
  score: number;
  startLine: number;
  endLine: number;
}

export class EmbeddingsIndex {
  private dbPath: string;
  private chunks: CodeChunk[] = [];
  private isIndexing = false;

  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'embeddings.db');
  }

  async indexProject(rootPath: string): Promise<void> {
    if (this.isIndexing) return;
    this.isIndexing = true;

    try {
      // For now, use a simple text-based chunking approach
      // Full implementation would generate embeddings via AI provider
      const fs = await import('fs/promises');
      const files = await this.walkFiles(rootPath);
      this.chunks = [];

      for (const filePath of files) {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const chunks = this.chunkFile(filePath, content);
          this.chunks.push(...chunks);
        } catch {
          // Skip unreadable files
        }
      }
    } finally {
      this.isIndexing = false;
    }
  }

  private chunkFile(filePath: string, content: string): CodeChunk[] {
    const lines = content.split('\n');
    const chunks: CodeChunk[] = [];
    const chunkSize = 50; // lines per chunk
    const overlap = 10;

    for (let i = 0; i < lines.length; i += chunkSize - overlap) {
      const end = Math.min(i + chunkSize, lines.length);
      chunks.push({
        filePath,
        startLine: i + 1,
        endLine: end,
        content: lines.slice(i, end).join('\n'),
      });
    }

    return chunks;
  }

  search(query: string, topK = 10): SearchResult[] {
    // Simple text similarity search (TF-IDF-like)
    // Full implementation would use vector similarity
    const queryTerms = query.toLowerCase().split(/\s+/);
    const scored: SearchResult[] = [];

    for (const chunk of this.chunks) {
      const contentLower = chunk.content.toLowerCase();
      let score = 0;

      for (const term of queryTerms) {
        const matches = contentLower.split(term).length - 1;
        score += matches;
      }

      if (score > 0) {
        scored.push({
          filePath: chunk.filePath,
          content: chunk.content,
          score,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  updateFile(filePath: string, content: string): void {
    // Remove old chunks for this file
    this.chunks = this.chunks.filter(c => c.filePath !== filePath);
    // Add new chunks
    const newChunks = this.chunkFile(filePath, content);
    this.chunks.push(...newChunks);
  }

  removeFile(filePath: string): void {
    this.chunks = this.chunks.filter(c => c.filePath !== filePath);
  }

  private async walkFiles(dir: string): Promise<string[]> {
    const fs = await import('fs/promises');
    const IGNORED = new Set([
      'node_modules', '.git', 'dist', 'build', '.next', '__pycache__',
      '.cache', 'coverage', '.vscode', '.idea',
    ]);
    const CODE_EXTS = new Set([
      '.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go', '.java', '.c', '.cpp',
      '.h', '.hpp', '.rb', '.php', '.swift', '.kt', '.dart', '.lua', '.r',
      '.css', '.scss', '.html', '.vue', '.svelte', '.json', '.yaml', '.yml',
      '.toml', '.md', '.sql', '.sh', '.bash',
    ]);

    const files: string[] = [];

    async function walk(currentDir: string) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (IGNORED.has(entry.name) || entry.name.startsWith('.')) continue;
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (CODE_EXTS.has(ext)) {
            files.push(fullPath);
          }
        }
      }
    }

    await walk(dir);
    return files;
  }
}
