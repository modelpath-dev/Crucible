import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFileTreeStore } from '../../stores/useFileTreeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

export function TerminalPanel() {
  const termRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const [termId] = useState(() => crypto.randomUUID());
  const rootPath = useFileTreeStore(s => s.rootPath);
  const terminalFontSize = useSettingsStore(s => s.settings.terminalFontSize);
  const [initialized, setInitialized] = useState(false);

  const initTerminal = useCallback(async () => {
    if (!termRef.current || initialized) return;

    try {
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');

      // Load xterm CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'node_modules/@xterm/xterm/css/xterm.css';
      document.head.appendChild(link);

      const fitAddon = new FitAddon();
      const term = new Terminal({
        cursorBlink: true,
        fontSize: terminalFontSize,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
        theme: {
          background: '#11111b',
          foreground: '#cdd6f4',
          cursor: '#f5e0dc',
          selectionBackground: '#45475a',
        },
      });

      term.loadAddon(fitAddon);
      term.open(termRef.current);
      fitAddon.fit();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Create PTY
      const cwd = rootPath || process.env.HOME || '/';
      const success = await window.crucible.terminal.create(termId, cwd);

      if (success) {
        // Terminal data flow
        term.onData(data => {
          window.crucible.terminal.sendData(termId, data);
        });

        window.crucible.terminal.onOutput((id: string, data: string) => {
          if (id === termId) term.write(data);
        });

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
          fitAddon.fit();
          window.crucible.terminal.resize(termId, term.cols, term.rows);
        });
        resizeObserver.observe(termRef.current);
      } else {
        term.write('Terminal not available (node-pty not installed)\r\n');
      }

      setInitialized(true);
    } catch (err) {
      console.error('Failed to initialize terminal:', err);
    }
  }, [termId, rootPath, initialized]);

  useEffect(() => {
    initTerminal();
    return () => {
      window.crucible.terminal.close(termId);
      xtermRef.current?.dispose();
    };
  }, [initTerminal, termId]);

  return (
    <div ref={termRef} className="h-full w-full bg-crucible-panel" />
  );
}
