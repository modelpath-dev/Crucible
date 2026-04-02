import { create } from 'zustand';
import { SearchResult, FileSearchResult } from '../../shared/types';

interface SearchState {
  query: string;
  results: SearchResult[];
  fileResults: FileSearchResult[];
  isSearching: boolean;
  options: {
    regex: boolean;
    caseSensitive: boolean;
    glob: string;
  };

  setQuery: (query: string) => void;
  setOption: (key: string, value: any) => void;
  searchContent: (cwd: string) => Promise<void>;
  searchFiles: (cwd: string, query: string) => Promise<void>;
  clear: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  fileResults: [],
  isSearching: false,
  options: { regex: false, caseSensitive: false, glob: '' },

  setQuery: (query) => set({ query }),
  setOption: (key, value) => set(state => ({
    options: { ...state.options, [key]: value },
  })),

  searchContent: async (cwd) => {
    const { query, options } = get();
    if (!query.trim()) return;
    set({ isSearching: true });
    try {
      const results = await window.crucible.search.contentSearch(cwd, query, options);
      set({ results, isSearching: false });
    } catch {
      set({ results: [], isSearching: false });
    }
  },

  searchFiles: async (cwd, query) => {
    if (!query.trim()) {
      set({ fileResults: [] });
      return;
    }
    try {
      const fileResults = await window.crucible.search.fileSearch(cwd, query);
      set({ fileResults });
    } catch {
      set({ fileResults: [] });
    }
  },

  clear: () => set({ query: '', results: [], fileResults: [], isSearching: false }),
}));
