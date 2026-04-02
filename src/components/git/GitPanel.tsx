import React, { useEffect, useCallback } from 'react';
import { useGitStore } from '../../stores/useGitStore';
import { useFileTreeStore } from '../../stores/useFileTreeStore';

export function GitPanel() {
  const rootPath = useFileTreeStore(s => s.rootPath);
  const {
    status, branches, loading, commitMessage,
    refreshAll, stageFiles, commit, push, pull, smartSync, setCommitMessage,
  } = useGitStore();

  useEffect(() => {
    if (rootPath) refreshAll(rootPath);
  }, [rootPath, refreshAll]);

  const handleStageAll = useCallback(() => {
    if (!rootPath || !status) return;
    const files = status.files.map(f => f.path);
    stageFiles(rootPath, files);
  }, [rootPath, status, stageFiles]);

  const handleCommit = useCallback(() => {
    if (!rootPath || !commitMessage.trim()) return;
    commit(rootPath, commitMessage);
  }, [rootPath, commitMessage, commit]);

  const handlePush = useCallback(() => {
    if (rootPath) push(rootPath);
  }, [rootPath, push]);

  const handlePull = useCallback(() => {
    if (rootPath) pull(rootPath);
  }, [rootPath, pull]);

  const handleSmartSync = useCallback(async () => {
    if (!rootPath) return;
    const result = await smartSync(rootPath);
    // Could show a toast here
    console.log('Smart sync:', result.message);
  }, [rootPath, smartSync]);

  if (!rootPath) {
    return <div className="p-4 text-sm text-crucible-text-secondary">Open a folder first</div>;
  }

  if (!status?.isRepo) {
    return (
      <div className="p-4 text-sm text-crucible-text-secondary">
        <p>Not a git repository</p>
        <button
          onClick={() => window.crucible.git.init(rootPath).then(() => refreshAll(rootPath))}
          className="mt-2 px-3 py-1 bg-crucible-accent text-white rounded text-xs"
        >
          Initialize Repository
        </button>
      </div>
    );
  }

  const changedFiles = status.files || [];
  const stagedFiles = changedFiles.filter(f => f.index !== ' ' && f.index !== '?');
  const unstagedFiles = changedFiles.filter(f => f.working_dir !== ' ' || f.index === '?');

  return (
    <div className="flex flex-col h-full text-sm">
      {/* Branch & sync buttons */}
      <div className="p-2 border-b border-crucible-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-crucible-text-secondary">
            Branch: <span className="text-crucible-text">{status.current}</span>
          </span>
          <div className="flex gap-1">
            <button onClick={handlePull} className="px-2 py-0.5 text-xs bg-crucible-hover rounded hover:bg-crucible-active" title="Pull">↓</button>
            <button onClick={handlePush} className="px-2 py-0.5 text-xs bg-crucible-hover rounded hover:bg-crucible-active" title="Push">↑</button>
            <button onClick={handleSmartSync} className="px-2 py-0.5 text-xs bg-crucible-accent/20 text-crucible-accent rounded hover:bg-crucible-accent/30" title="Smart Sync">⟳</button>
          </div>
        </div>
        {(status.ahead > 0 || status.behind > 0) && (
          <div className="text-[11px] text-crucible-text-secondary">
            {status.ahead > 0 && <span className="text-green-400">↑{status.ahead} ahead</span>}
            {status.ahead > 0 && status.behind > 0 && ' · '}
            {status.behind > 0 && <span className="text-yellow-400">↓{status.behind} behind</span>}
          </div>
        )}
      </div>

      {/* Commit box */}
      <div className="p-2 border-b border-crucible-border">
        <textarea
          value={commitMessage}
          onChange={e => setCommitMessage(e.target.value)}
          placeholder="Commit message..."
          rows={2}
          className="w-full px-2 py-1 bg-crucible-editor border border-crucible-border rounded text-xs text-crucible-text placeholder-crucible-text-secondary/50 focus:outline-none focus:border-crucible-accent resize-none"
        />
        <div className="flex gap-1 mt-1">
          <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || stagedFiles.length === 0}
            className="flex-1 px-2 py-1 bg-crucible-accent text-white rounded text-xs disabled:opacity-50"
          >
            Commit ({stagedFiles.length})
          </button>
          <button
            onClick={handleStageAll}
            disabled={unstagedFiles.length === 0}
            className="px-2 py-1 bg-crucible-hover text-crucible-text rounded text-xs disabled:opacity-50"
          >
            Stage All
          </button>
        </div>
      </div>

      {/* File changes */}
      <div className="flex-1 overflow-auto">
        {stagedFiles.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-crucible-text-secondary uppercase tracking-wider">
              Staged ({stagedFiles.length})
            </div>
            {stagedFiles.map(f => (
              <div key={f.path} className="px-2 py-0.5 flex items-center gap-2 text-xs hover:bg-crucible-hover cursor-pointer">
                <span className="text-green-400 w-3">{f.index}</span>
                <span className="truncate text-crucible-text">{f.path}</span>
              </div>
            ))}
          </div>
        )}
        {unstagedFiles.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-crucible-text-secondary uppercase tracking-wider">
              Changes ({unstagedFiles.length})
            </div>
            {unstagedFiles.map(f => (
              <div
                key={f.path}
                className="px-2 py-0.5 flex items-center gap-2 text-xs hover:bg-crucible-hover cursor-pointer"
                onClick={() => rootPath && stageFiles(rootPath, [f.path])}
              >
                <span className="text-yellow-400 w-3">{f.working_dir === '?' ? 'U' : f.working_dir}</span>
                <span className="truncate text-crucible-text">{f.path}</span>
                <span className="ml-auto text-[10px] text-crucible-text-secondary opacity-0 hover:opacity-100">+stage</span>
              </div>
            ))}
          </div>
        )}
        {changedFiles.length === 0 && (
          <div className="p-4 text-xs text-crucible-text-secondary text-center">
            No changes
          </div>
        )}
      </div>
    </div>
  );
}
