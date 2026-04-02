import { ipcMain } from 'electron';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { SEARCH_CHANNELS } from '../../shared/ipcChannels';
import { SearchResult, FileSearchResult } from '../../shared/types';
import { ProjectIndex } from '../services/ProjectIndex';

const execFileAsync = promisify(execFile);
const projectIndex = new ProjectIndex();

function getRipgrepBinary(): string {
  // Try system ripgrep first, then bundled
  return 'rg';
}

export function registerSearchHandlers() {
  ipcMain.handle(SEARCH_CHANNELS.CONTENT_SEARCH, async (
    _event,
    cwd: string,
    query: string,
    options?: { regex?: boolean; caseSensitive?: boolean; glob?: string; maxResults?: number }
  ): Promise<SearchResult[]> => {
    const args = ['--json', '--max-count', String(options?.maxResults || 200)];

    if (!options?.caseSensitive) args.push('-i');
    if (!options?.regex) args.push('--fixed-strings');
    if (options?.glob) args.push('--glob', options.glob);

    args.push('--', query, cwd);

    try {
      const { stdout } = await execFileAsync(getRipgrepBinary(), args, { maxBuffer: 10 * 1024 * 1024 });
      const results: SearchResult[] = [];

      for (const line of stdout.split('\n')) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === 'match') {
            const data = parsed.data;
            results.push({
              file: data.path.text,
              line: data.line_number,
              column: data.submatches[0]?.start || 0,
              content: data.lines.text.trimEnd(),
              matchLength: data.submatches[0] ? data.submatches[0].end - data.submatches[0].start : 0,
            });
          }
        } catch {
          // Skip malformed JSON lines
        }
      }

      return results;
    } catch (err: any) {
      if (err.code === 1) return []; // No matches
      throw err;
    }
  });

  ipcMain.handle(SEARCH_CHANNELS.FILE_SEARCH, async (_event, cwd: string, query: string): Promise<FileSearchResult[]> => {
    return projectIndex.search(cwd, query);
  });
}
