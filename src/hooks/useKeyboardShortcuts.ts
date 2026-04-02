import { useEffect } from 'react';
import { useEditorStore } from '../stores/useEditorStore';

export function useKeyboardShortcuts() {
  const saveActiveFile = useEditorStore(s => s.saveActiveFile);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 's') {
        e.preventDefault();
        saveActiveFile();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveActiveFile]);
}
