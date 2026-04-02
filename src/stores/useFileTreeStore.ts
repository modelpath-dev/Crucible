import { create } from 'zustand';
import { FileEntry } from '../../shared/types';

interface FileTreeState {
  rootPath: string | null;
  entries: FileEntry[];
  expandedDirs: Set<string>;
  selectedPath: string | null;
  loading: boolean;
  error: string | null;

  setRootPath: (path: string) => void;
  openFolder: () => Promise<void>;
  loadDirectory: (path: string) => Promise<FileEntry[]>;
  toggleDir: (path: string) => void;
  setSelectedPath: (path: string | null) => void;
  refresh: () => Promise<void>;
}

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  rootPath: null,
  entries: [],
  expandedDirs: new Set(),
  selectedPath: null,
  loading: false,
  error: null,

  setRootPath: (path: string) => set({ rootPath: path }),

  openFolder: async () => {
    const path = await window.crucible.fs.selectFolder();
    if (!path) return;

    set({ rootPath: path, loading: true, error: null, expandedDirs: new Set(), entries: [] });
    try {
      const entries = await window.crucible.fs.readDir(path);
      set({ entries, loading: false });
      // Start file watching
      await window.crucible.fs.watchStart(path);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  loadDirectory: async (path: string) => {
    try {
      return await window.crucible.fs.readDir(path);
    } catch {
      return [];
    }
  },

  toggleDir: (path: string) => {
    set(state => {
      const expanded = new Set(state.expandedDirs);
      if (expanded.has(path)) {
        expanded.delete(path);
      } else {
        expanded.add(path);
      }
      return { expandedDirs: expanded };
    });
  },

  setSelectedPath: (path) => set({ selectedPath: path }),

  refresh: async () => {
    const { rootPath } = get();
    if (!rootPath) return;
    set({ loading: true });
    try {
      const entries = await window.crucible.fs.readDir(rootPath);
      set({ entries, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
