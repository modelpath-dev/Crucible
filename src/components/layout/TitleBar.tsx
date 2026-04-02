import React, { useEffect, useState } from 'react';
import { useFileTreeStore } from '../../stores/useFileTreeStore';

export function TitleBar() {
  const rootPath = useFileTreeStore(s => s.rootPath);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    window.crucible.window.isMaximized().then(setIsMaximized);
    const unsub = window.crucible.window.onMaximizeChange(setIsMaximized);
    return () => { unsub(); };
  }, []);

  const folderName = rootPath?.split(/[/\\]/).pop() || 'Crucible IDE';

  return (
    <div
      className="flex items-center h-9 bg-crucible-sidebar border-b border-crucible-border px-3 select-none"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex items-center gap-2 text-xs text-crucible-text-secondary flex-1">
        <span className="font-bold text-crucible-accent">Crucible</span>
        <span className="opacity-50">|</span>
        <span>{folderName}</span>
      </div>
      <div className="flex gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button
          onClick={() => window.crucible.window.minimize()}
          className="w-7 h-6 flex items-center justify-center rounded hover:bg-crucible-hover text-crucible-text-secondary"
        >
          <svg width="10" height="1"><rect width="10" height="1" fill="currentColor" /></svg>
        </button>
        <button
          onClick={() => window.crucible.window.maximize()}
          className="w-7 h-6 flex items-center justify-center rounded hover:bg-crucible-hover text-crucible-text-secondary"
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="0" width="8" height="8" rx="1" />
              <rect x="0" y="2" width="8" height="8" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="0.5" y="0.5" width="9" height="9" rx="1" />
            </svg>
          )}
        </button>
        <button
          onClick={() => window.crucible.window.close()}
          className="w-7 h-6 flex items-center justify-center rounded hover:bg-red-500/80 text-crucible-text-secondary hover:text-white"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2">
            <line x1="1" y1="1" x2="9" y2="9" />
            <line x1="9" y1="1" x2="1" y2="9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
