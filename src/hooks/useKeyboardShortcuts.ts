import { useEffect } from 'react';
import { useEditorStore } from '../stores/useEditorStore';

export function useKeyboardShortcuts() {
  const saveActiveFile = useEditorStore(s => s.saveActiveFile);
  const closeTab = useEditorStore(s => s.closeTab);
  const activeTabId = useEditorStore(s => s.activeTabId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 's') {
        e.preventDefault();
        saveActiveFile();
      }

      if (mod && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveActiveFile, closeTab, activeTabId]);
}
