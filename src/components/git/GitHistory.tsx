import React, { useEffect } from 'react';
import { useGitStore } from '../../stores/useGitStore';
import { useFileTreeStore } from '../../stores/useFileTreeStore';
import { GitLogEntry } from '../../../shared/types';

function CommitRow({ entry }: { entry: GitLogEntry }) {
  return (
    <div className="flex items-start gap-3 px-3 py-2 hover:bg-crucible-hover cursor-pointer border-b border-crucible-border/30">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs text-crucible-text truncate">{entry.message}</span>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-crucible-text-secondary">
          <span>{entry.abbreviated_hash}</span>
          <span>{entry.author_name}</span>
          <span>{new Date(entry.date).toLocaleDateString()}</span>
        </div>
      </div>
      {entry.refs && (
        <div className="flex gap-1 shrink-0">
          {entry.refs.split(',').map((ref, i) => (
            <span key={i} className="px-1.5 py-0.5 text-[10px] bg-crucible-accent/20 text-crucible-accent rounded">
              {ref.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function GitHistory() {
  const rootPath = useFileTreeStore(s => s.rootPath);
  const { log, refreshLog } = useGitStore();

  useEffect(() => {
    if (rootPath) refreshLog(rootPath);
  }, [rootPath, refreshLog]);

  if (log.length === 0) {
    return <div className="p-4 text-xs text-crucible-text-secondary text-center">No commits yet</div>;
  }

  return (
    <div className="flex flex-col overflow-auto">
      <div className="px-3 py-2 text-[11px] font-semibold text-crucible-text-secondary uppercase tracking-wider border-b border-crucible-border">
        Commit History
      </div>
      {log.map(entry => (
        <CommitRow key={entry.hash} entry={entry} />
      ))}
    </div>
  );
}
