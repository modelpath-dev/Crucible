import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';
import { app } from 'electron';

interface LSPServer {
  process: ChildProcess;
  language: string;
  capabilities: Record<string, boolean>;
}

const LANGUAGE_SERVER_MAP: Record<string, { command: string; args: string[] }> = {
  typescript: {
    command: 'npx',
    args: ['typescript-language-server', '--stdio'],
  },
  python: {
    command: 'pyright-langserver',
    args: ['--stdio'],
  },
  rust: {
    command: 'rust-analyzer',
    args: [],
  },
  go: {
    command: 'gopls',
    args: ['serve'],
  },
};

export class LSPManager {
  private servers = new Map<string, LSPServer>();

  async startServer(language: string, workspaceRoot: string): Promise<boolean> {
    if (this.servers.has(language)) return true;

    const config = LANGUAGE_SERVER_MAP[language];
    if (!config) return false;

    try {
      const proc = spawn(config.command, config.args, {
        cwd: workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env },
      });

      if (!proc.pid) return false;

      const server: LSPServer = {
        process: proc,
        language,
        capabilities: {},
      };

      proc.on('exit', () => {
        this.servers.delete(language);
      });

      proc.stderr?.on('data', (data: Buffer) => {
        console.error(`LSP ${language} stderr:`, data.toString());
      });

      this.servers.set(language, server);
      return true;
    } catch (err) {
      console.error(`Failed to start LSP for ${language}:`, err);
      return false;
    }
  }

  sendRequest(language: string, message: string): void {
    const server = this.servers.get(language);
    if (!server) return;

    const contentLength = Buffer.byteLength(message, 'utf-8');
    const header = `Content-Length: ${contentLength}\r\n\r\n`;
    server.process.stdin?.write(header + message);
  }

  onResponse(language: string, callback: (data: string) => void): void {
    const server = this.servers.get(language);
    if (!server) return;

    let buffer = '';
    server.process.stdout?.on('data', (chunk: Buffer) => {
      buffer += chunk.toString();

      while (true) {
        const headerEnd = buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) break;

        const header = buffer.slice(0, headerEnd);
        const match = header.match(/Content-Length:\s*(\d+)/i);
        if (!match) break;

        const contentLength = parseInt(match[1], 10);
        const contentStart = headerEnd + 4;
        if (buffer.length < contentStart + contentLength) break;

        const content = buffer.slice(contentStart, contentStart + contentLength);
        buffer = buffer.slice(contentStart + contentLength);
        callback(content);
      }
    });
  }

  stopServer(language: string): void {
    const server = this.servers.get(language);
    if (server) {
      server.process.kill();
      this.servers.delete(language);
    }
  }

  stopAll(): void {
    for (const [language] of this.servers) {
      this.stopServer(language);
    }
  }

  getRunningServers(): string[] {
    return Array.from(this.servers.keys());
  }
}
