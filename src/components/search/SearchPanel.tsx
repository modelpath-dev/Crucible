import React, { useCallback } from 'react';
import { useSearchStore } from '../../stores/useSearchStore';
import { useFileTreeStore } from '../../stores/useFileTreeStore';
import { useEditorStore } from '../../stores/useEditorStore';

export function SearchPanel() {
  const { query, results, isSearching, options, setQuery, setOption, searchContent, clear } = useSearchStore();
  const rootPath = useFileTreeStore(s => s.rootPath);
  const openFile = useEditorStore(s => s.openFile);

  const handleSearch = useCallback(() => {
    if (rootPath) searchContent(rootPath);
  }, [rootPath, searchContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setQuery('');
      clear();
    }
  }, [handleSearch, setQuery, clear]);

  // Group results by file
  const grouped = results.reduce((acc, r) => {
    if (!acc[r.file]) acc[r.file] = [];
    acc[r.file].push(r);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 space-y-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="w-full px-2 py-1.5 bg-crucible-editor border border-crucible-border rounded text-sm text-crucible-text placeholder-crucible-text-secondary/50 focus:outline-none focus:border-crucible-accent"
        />
        <div className="flex gap-2 text-xs text-crucible-text-secondary">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={options.regex}
              onChange={e => setOption('regex', e.target.checked)}
              className="rounded"
            />
            Regex
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={options.caseSensitive}
              onChange={e => setOption('caseSensitive', e.target.checked)}
              className="rounded"
            />
            Case
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={options.wholeWord || false}
              onChange={e => setOption('wholeWord', e.target.checked)}
              className="rounded"
            />
            Word
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-auto text-sm">
        {isSearching && <div className="p-2 text-crucible-text-secondary text-xs">Searching...</div>}
        {!isSearching && results.length > 0 && (
          <div className="text-xs text-crucible-text-secondary px-2 pb-1">
            {results.length} results in {Object.keys(grouped).length} files
          </div>
        )}
        {Object.entries(grouped).map(([file, matches]) => (
          <div key={file}>
            <div className="px-2 py-1 text-xs font-medium text-crucible-text truncate bg-crucible-hover/50">
              {rootPath ? file.replace(rootPath + '/', '') : file}
            </div>
            {matches.map((m, i) => (
              <div
                key={i}
                onClick={() => openFile(m.file)}
                className="px-2 py-0.5 text-xs cursor-pointer hover:bg-crucible-hover flex gap-2"
              >
                <span className="text-crucible-text-secondary w-8 text-right shrink-0">{m.line}</span>
                <span className="truncate text-crucible-text">{m.content}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
