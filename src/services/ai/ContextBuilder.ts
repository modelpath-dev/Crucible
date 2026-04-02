import { AIContext } from '../../../shared/types';
import { useEditorStore } from '../../stores/useEditorStore';
import { useFileTreeStore } from '../../stores/useFileTreeStore';

const MAX_CONTEXT_CHARS = 100_000; // Rough char limit

export function buildContext(selectedText?: string): AIContext {
  const editorState = useEditorStore.getState();
  const fileTreeState = useFileTreeStore.getState();

  const context: AIContext = {
    projectRoot: fileTreeState.rootPath || undefined,
  };

  // Current file
  const activeTab = editorState.tabs.find(t => t.id === editorState.activeTabId);
  if (activeTab) {
    context.currentFile = {
      path: activeTab.path,
      content: activeTab.content,
      language: activeTab.language,
    };
  }

  // Selected text
  if (selectedText) {
    context.selectedText = selectedText;
  }

  // Open files (up to limit)
  let charCount = (context.currentFile?.content.length || 0) + (selectedText?.length || 0);
  const openFiles: { path: string; content: string }[] = [];

  for (const tab of editorState.tabs) {
    if (tab.id === editorState.activeTabId) continue;
    if (charCount + tab.content.length > MAX_CONTEXT_CHARS) break;
    openFiles.push({ path: tab.path, content: tab.content });
    charCount += tab.content.length;
  }

  if (openFiles.length > 0) {
    context.openFiles = openFiles;
  }

  return context;
}
