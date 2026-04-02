import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchStore } from '../../stores/useSearchStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { useFileTreeStore } from '../../stores/useFileTreeStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickOpen({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { fileResults, searchFiles } = useSearchStore();
  const openFile = useEditorStore(s => s.openFile);
  const rootPath = useFileTreeStore(s => s.rootPath);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (rootPath && query) {
      searchFiles(rootPath, query);
    }
  }, [query, rootPath, searchFiles]);

  const handleSelect = useCallback((path: string) => {
    openFile(path);
    onClose();
  }, [openFile, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, fileResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && fileResults[selectedIndex]) {
      handleSelect(fileResults[selectedIndex].path);
    }
  }, [fileResults, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center pt-[15%]" onClick={onClose}>
      <div
        className="bg-crucible-sidebar border border-crucible-border rounded-lg shadow-2xl w-[500px] max-h-[400px] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-2 border-b border-crucible-border">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search files by name..."
            className="w-full px-3 py-2 bg-crucible-editor border border-crucible-border rounded text-sm text-crucible-text placeholder-crucible-text-secondary/50 focus:outline-none focus:border-crucible-accent"
          />
        </div>
        <div className="flex-1 overflow-auto">
          {fileResults.map((result, i) => {
            const relativePath = rootPath ? result.path.replace(rootPath + '/', '') : result.path;
            return (
              <div
                key={result.path}
                onClick={() => handleSelect(result.path)}
                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm ${
                  i === selectedIndex ? 'bg-crucible-accent/20 text-crucible-text' : 'text-crucible-text-secondary hover:bg-crucible-hover'
                }`}
              >
                <span className="text-crucible-text">{result.name}</span>
                <span className="text-[10px] text-crucible-text-secondary truncate">{relativePath}</span>
              </div>
            );
          })}
          {query && fileResults.length === 0 && (
            <div className="p-4 text-xs text-crucible-text-secondary text-center">No files found</div>
          )}
        </div>
      </div>
    </div>
  );
}
