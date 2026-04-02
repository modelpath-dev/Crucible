import React, { useCallback, useEffect } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { EditorTab } from '../../../shared/types';

interface Props {
  tab: EditorTab;
}

export function MonacoEditor({ tab }: Props) {
  const { updateContent, saveActiveFile } = useEditorStore();
  const { settings } = useSettingsStore();

  const handleMount: OnMount = useCallback((editor, monaco) => {
    // Ctrl+S save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveActiveFile();
    });

    editor.focus();
  }, [saveActiveFile]);

  const handleChange: OnChange = useCallback((value) => {
    if (value !== undefined) {
      updateContent(tab.id, value);
    }
  }, [tab.id, updateContent]);

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        height="100%"
        language={tab.language}
        value={tab.content}
        onChange={handleChange}
        onMount={handleMount}
        theme={settings.theme === 'dark' ? 'vs-dark' : 'vs'}
        options={{
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap ? 'on' : 'off',
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers ? 'on' : 'off',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 8 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
        }}
      />
    </div>
  );
}
