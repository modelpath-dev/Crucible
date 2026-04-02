import React, { useEffect, useState, useCallback } from 'react';
import { useFileTreeStore } from '../../stores/useFileTreeStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { FileEntry } from '../../../shared/types';

function FileIcon({ name, isDirectory }: { name: string; isDirectory: boolean }) {
  if (isDirectory) return <span className="text-crucible-accent opacity-70">▸</span>;
  const ext = name.split('.').pop()?.toLowerCase();
  const colors: Record<string, string> = {
    ts: 'text-blue-400', tsx: 'text-blue-400', js: 'text-yellow-400', jsx: 'text-yellow-400',
    py: 'text-green-400', rs: 'text-orange-400', go: 'text-cyan-400', json: 'text-yellow-300',
    css: 'text-purple-400', html: 'text-orange-300', md: 'text-gray-400', svg: 'text-pink-400',
  };
  return <span className={`text-xs ${colors[ext || ''] || 'text-crucible-text-secondary'}`}>●</span>;
}

function FileTreeItem({ entry, depth }: { entry: FileEntry; depth: number }) {
  const { expandedDirs, toggleDir, selectedPath, setSelectedPath, loadDirectory } = useFileTreeStore();
  const openFile = useEditorStore(s => s.openFile);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const isExpanded = expandedDirs.has(entry.path);
  const isSelected = selectedPath === entry.path;

  const handleClick = useCallback(async () => {
    setSelectedPath(entry.path);
    if (entry.isDirectory) {
      toggleDir(entry.path);
      if (!loaded) {
        const kids = await loadDirectory(entry.path);
        setChildren(kids);
        setLoaded(true);
      }
    } else {
      openFile(entry.path);
    }
  }, [entry, loaded, toggleDir, loadDirectory, setSelectedPath, openFile]);

  return (
    <>
      <div
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2 py-0.5 cursor-pointer text-[13px] hover:bg-crucible-hover ${
          isSelected ? 'bg-crucible-active text-crucible-text' : 'text-crucible-text-secondary'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {entry.isDirectory && (
          <span className={`text-[10px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
        )}
        <FileIcon name={entry.name} isDirectory={entry.isDirectory} />
        <span className="truncate">{entry.name}</span>
      </div>
      {entry.isDirectory && isExpanded && children.map(child => (
        <FileTreeItem key={child.path} entry={child} depth={depth + 1} />
      ))}
    </>
  );
}

export function FileTree() {
  const { entries, rootPath, openFolder, loading, refresh } = useFileTreeStore();

  useEffect(() => {
    if (rootPath) {
      const unsub = window.crucible.fs.onWatchEvent(() => {
        refresh();
      });
      return () => { unsub(); };
    }
  }, [rootPath, refresh]);

  if (!rootPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 gap-3">
        <p className="text-sm text-crucible-text-secondary text-center">No folder opened</p>
        <button
          onClick={openFolder}
          className="px-3 py-1.5 bg-crucible-accent text-white rounded text-sm hover:opacity-90"
        >
          Open Folder
        </button>
      </div>
    );
  }

  if (loading && entries.length === 0) {
    return <div className="p-4 text-sm text-crucible-text-secondary">Loading...</div>;
  }

  return (
    <div className="py-1">
      {entries.map(entry => (
        <FileTreeItem key={entry.path} entry={entry} depth={0} />
      ))}
    </div>
  );
}
