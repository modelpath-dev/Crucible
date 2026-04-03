import { create } from 'zustand';
import { GitStatus, GitLogEntry, GitBranch, GitStashEntry } from '../../shared/types';

interface GitState {
  status: GitStatus | null;
  log: GitLogEntry[];
  branches: GitBranch[];
  stashes: GitStashEntry[];
  loading: boolean;
  commitMessage: string;

  refreshStatus: (cwd: string) => Promise<void>;
  refreshLog: (cwd: string) => Promise<void>;
  refreshBranches: (cwd: string) => Promise<void>;
  refreshStashes: (cwd: string) => Promise<void>;
  refreshAll: (cwd: string) => Promise<void>;
  stageFiles: (cwd: string, files: string[]) => Promise<void>;
  unstageFiles: (cwd: string, files: string[]) => Promise<void>;
  commit: (cwd: string, message: string) => Promise<void>;
  push: (cwd: string) => Promise<void>;
  pull: (cwd: string) => Promise<void>;
  checkoutBranch: (cwd: string, name: string) => Promise<void>;
  createBranch: (cwd: string, name: string) => Promise<void>;
  smartSync: (cwd: string) => Promise<{ success: boolean; message: string }>;
  setCommitMessage: (msg: string) => void;
}

export const useGitStore = create<GitState>((set, get) => ({
  status: null,
  log: [],
  branches: [],
  stashes: [],
  loading: false,
  commitMessage: '',

  refreshStatus: async (cwd) => {
    const status = await window.crucible.git.status(cwd);
    set({ status });
  },

  refreshLog: async (cwd) => {
    const log = await window.crucible.git.log(cwd);
    set({ log });
  },

  refreshBranches: async (cwd) => {
    const branches = await window.crucible.git.branchList(cwd);
    set({ branches });
  },

  refreshStashes: async (cwd) => {
    const stashes = await window.crucible.git.stashList(cwd);
    set({ stashes });
  },

  refreshAll: async (cwd) => {
    set({ loading: true });
    await Promise.all([
      get().refreshStatus(cwd),
      get().refreshLog(cwd),
      get().refreshBranches(cwd),
      get().refreshStashes(cwd),
    ]);
    set({ loading: false });
  },

  stageFiles: async (cwd, files) => {
    await window.crucible.git.add(cwd, files);
    await get().refreshStatus(cwd);
  },

  unstageFiles: async (cwd, files) => {
    await window.crucible.git.raw(cwd, ['reset', 'HEAD', '--', ...files]);
    await get().refreshStatus(cwd);
  },

  commit: async (cwd, message) => {
    await window.crucible.git.commit(cwd, message);
    set({ commitMessage: '' });
    await get().refreshAll(cwd);
  },

  push: async (cwd) => {
    await window.crucible.git.push(cwd);
    await get().refreshStatus(cwd);
  },

  pull: async (cwd) => {
    await window.crucible.git.pull(cwd);
    await get().refreshAll(cwd);
  },

  checkoutBranch: async (cwd, name) => {
    await window.crucible.git.branchCheckout(cwd, name);
    await get().refreshAll(cwd);
  },

  createBranch: async (cwd, name) => {
    await window.crucible.git.branchCreate(cwd, name);
    await get().refreshAll(cwd);
  },

  smartSync: async (cwd) => {
    const result = await window.crucible.git.smartSync(cwd);
    await get().refreshAll(cwd);
    return result;
  },

  setCommitMessage: (msg) => set({ commitMessage: msg }),
}));
