import React from 'react';
import { DiffEditor as MonacoDiffEditor } from '@monaco-editor/react';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface Props {
  original: string;
  modified: string;
  language: string;
  onAccept?: () => void;
  onReject?: () => void;
}

export function DiffEditor({ original, modified, language, onAccept, onReject }: Props) {
  const settings = useSettingsStore(s => s.settings);

  return (
    <div className="flex flex-col h-full">
      {(onAccept || onReject) && (
        <div className="flex items-center gap-2 px-3 py-2 bg-crucible-sidebar border-b border-crucible-border">
          <span className="text-xs text-crucible-text-secondary flex-1">Review changes</span>
          {onReject && (
            <button onClick={onReject} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">
              Reject
            </button>
          )}
          {onAccept && (
            <button onClick={onAccept} className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30">
              Accept
            </button>
          )}
        </div>
      )}
      <div className="flex-1">
        <MonacoDiffEditor
          height="100%"
          language={language}
          original={original}
          modified={modified}
          theme={settings.theme === 'dark' ? 'vs-dark' : 'vs'}
          options={{
            fontSize: settings.fontSize,
            fontFamily: settings.fontFamily,
            readOnly: true,
            renderSideBySide: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
