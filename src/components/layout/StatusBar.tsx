import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useGitStore } from '../../stores/useGitStore';
import { useAIStore } from '../../stores/useAIStore';

interface Props {
  onTogglePanel: () => void;
}

export function StatusBar({ onTogglePanel }: Props) {
  const activeTab = useEditorStore(s => s.tabs.find(t => t.id === s.activeTabId));
  const gitStatus = useGitStore(s => s.status);
  const { selectedProvider, isStreaming } = useAIStore();

  return (
    <div className="flex items-center h-6 bg-crucible-accent/10 border-t border-crucible-border px-3 text-[11px] text-crucible-text-secondary gap-4">
      {/* Git branch */}
      {gitStatus?.isRepo && (
        <span className="flex items-center gap-1">
          ⑂ {gitStatus.current}
          {(gitStatus.ahead > 0 || gitStatus.behind > 0) && (
            <span className="opacity-70">
              {gitStatus.ahead > 0 && `↑${gitStatus.ahead}`}
              {gitStatus.behind > 0 && `↓${gitStatus.behind}`}
            </span>
          )}
        </span>
      )}

      <div className="flex-1" />

      {/* AI status */}
      {isStreaming && (
        <span className="text-crucible-accent animate-pulse">AI generating...</span>
      )}
      <span className="capitalize">{selectedProvider}</span>

      {/* Editor info */}
      {activeTab && (
        <>
          <span>Ln {activeTab.content.split('\n').length}</span>
          <span>{activeTab.language}</span>
          <span>UTF-8</span>
        </>
      )}

      <button onClick={onTogglePanel} className="hover:text-crucible-text">
        Terminal
      </button>
    </div>
  );
}
