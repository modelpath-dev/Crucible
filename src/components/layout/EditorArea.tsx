import React from 'react';
import { EditorTabs } from '../editor/EditorTabs';
import { MonacoEditor } from '../editor/MonacoEditor';
import { useEditorStore } from '../../stores/useEditorStore';
import { useFileTreeStore } from '../../stores/useFileTreeStore';

export function EditorArea() {
  const { tabs, activeTabId } = useEditorStore();
  const { openFolder, rootPath } = useFileTreeStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-crucible-text-secondary gap-4">
        <div className="text-6xl opacity-20 font-bold">Crucible</div>
        {!rootPath && (
          <button
            onClick={openFolder}
            className="px-4 py-2 bg-crucible-accent text-white rounded hover:opacity-90 transition-opacity text-sm"
          >
            Open Folder
          </button>
        )}
        <div className="text-xs mt-4 opacity-50">
          <p>Ctrl+P  Quick Open</p>
          <p>Ctrl+Shift+P  Command Palette</p>
          <p>Ctrl+`  Toggle Terminal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <EditorTabs />
      {activeTab && (
        <MonacoEditor
          key={activeTab.id}
          tab={activeTab}
        />
      )}
    </div>
  );
}
