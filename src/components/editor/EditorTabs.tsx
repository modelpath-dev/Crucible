import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';

export function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();

  return (
    <div className="flex bg-crucible-sidebar border-b border-crucible-border overflow-x-auto min-h-[35px]">
      {tabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-3 py-1.5 text-[13px] cursor-pointer border-r border-crucible-border min-w-0 ${
            tab.id === activeTabId
              ? 'bg-crucible-editor text-crucible-text border-t-2 border-t-crucible-accent'
              : 'bg-crucible-sidebar text-crucible-text-secondary hover:bg-crucible-hover border-t-2 border-t-transparent'
          }`}
        >
          <span className="truncate max-w-[150px]">{tab.name}</span>
          {tab.isDirty && <span className="text-crucible-accent text-lg leading-none">●</span>}
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            className="ml-1 text-crucible-text-secondary hover:text-crucible-text opacity-0 group-hover:opacity-100 hover:bg-crucible-hover rounded w-4 h-4 flex items-center justify-center text-xs"
            style={{ opacity: tab.id === activeTabId ? 1 : undefined }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
