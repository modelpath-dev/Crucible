import { create } from 'zustand';
import { EditorTab } from '../../shared/types';

const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescriptreact', '.js': 'javascript', '.jsx': 'javascriptreact',
  '.json': 'json', '.html': 'html', '.css': 'css', '.scss': 'scss', '.less': 'less',
  '.md': 'markdown', '.py': 'python', '.rs': 'rust', '.go': 'go', '.java': 'java',
  '.c': 'c', '.cpp': 'cpp', '.h': 'c', '.hpp': 'cpp', '.rb': 'ruby',
  '.php': 'php', '.sh': 'shell', '.bash': 'shell', '.zsh': 'shell',
  '.yml': 'yaml', '.yaml': 'yaml', '.xml': 'xml', '.sql': 'sql',
  '.toml': 'toml', '.ini': 'ini', '.env': 'plaintext', '.txt': 'plaintext',
  '.svelte': 'svelte', '.vue': 'vue', '.dart': 'dart', '.swift': 'swift',
  '.kt': 'kotlin', '.lua': 'lua', '.r': 'r', '.R': 'r',
  '.dockerfile': 'dockerfile', '.graphql': 'graphql', '.gql': 'graphql',
  '.proto': 'protobuf', '.tf': 'hcl', '.zig': 'zig', '.ex': 'elixir',
  '.exs': 'elixir', '.erl': 'erlang', '.clj': 'clojure', '.scala': 'scala',
  '.cs': 'csharp', '.fs': 'fsharp', '.ps1': 'powershell', '.bat': 'bat',
};

function getLanguage(filePath: string): string {
  const fileName = filePath.split(/[/\\]/).pop() || '';
  if (fileName === 'Dockerfile' || fileName.startsWith('Dockerfile.')) return 'dockerfile';
  if (fileName === 'Makefile' || fileName === 'GNUmakefile') return 'makefile';
  if (fileName === '.gitignore' || fileName === '.dockerignore') return 'ignore';
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  return LANGUAGE_MAP[ext] || 'plaintext';
}

function getFileName(filePath: string): string {
  return filePath.split(/[/\\]/).pop() || filePath;
}

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;

  openFile: (path: string) => Promise<void>;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  saveFile: (id: string) => Promise<void>;
  saveActiveFile: () => Promise<void>;
  markClean: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openFile: async (path: string) => {
    const { tabs } = get();
    const existing = tabs.find(t => t.path === path);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    try {
      const content = await window.crucible.fs.readFile(path);
      const tab: EditorTab = {
        id: path,
        path,
        name: getFileName(path),
        language: getLanguage(path),
        isDirty: false,
        content,
      };
      set(state => ({
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
      }));
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  },

  closeTab: (id: string) => {
    set(state => {
      const idx = state.tabs.findIndex(t => t.id === id);
      const newTabs = state.tabs.filter(t => t.id !== id);
      let newActive = state.activeTabId;
      if (state.activeTabId === id) {
        if (newTabs.length === 0) {
          newActive = null;
        } else {
          newActive = newTabs[Math.min(idx, newTabs.length - 1)].id;
        }
      }
      return { tabs: newTabs, activeTabId: newActive };
    });
  },

  setActiveTab: (id: string) => set({ activeTabId: id }),

  updateContent: (id: string, content: string) => {
    set(state => ({
      tabs: state.tabs.map(t => t.id === id ? { ...t, content, isDirty: true } : t),
    }));
  },

  saveFile: async (id: string) => {
    const tab = get().tabs.find(t => t.id === id);
    if (!tab || !tab.isDirty) return;
    await window.crucible.fs.writeFile(tab.path, tab.content);
    set(state => ({
      tabs: state.tabs.map(t => t.id === id ? { ...t, isDirty: false } : t),
    }));
  },

  saveActiveFile: async () => {
    const { activeTabId, saveFile } = get();
    if (activeTabId) await saveFile(activeTabId);
  },

  markClean: (id: string) => {
    set(state => ({
      tabs: state.tabs.map(t => t.id === id ? { ...t, isDirty: false } : t),
    }));
  },
}));
