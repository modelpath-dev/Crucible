// Thin wrapper around IPC for git operations
export const GitService = {
  status: (cwd: string) => window.crucible.git.status(cwd),
  log: (cwd: string, maxCount?: number) => window.crucible.git.log(cwd, maxCount),
  diff: (cwd: string, file?: string) => window.crucible.git.diff(cwd, file),
  add: (cwd: string, files: string[]) => window.crucible.git.add(cwd, files),
  commit: (cwd: string, message: string) => window.crucible.git.commit(cwd, message),
  push: (cwd: string) => window.crucible.git.push(cwd),
  pull: (cwd: string) => window.crucible.git.pull(cwd),
  branchList: (cwd: string) => window.crucible.git.branchList(cwd),
  branchCreate: (cwd: string, name: string) => window.crucible.git.branchCreate(cwd, name),
  branchCheckout: (cwd: string, name: string) => window.crucible.git.branchCheckout(cwd, name),
  smartSync: (cwd: string) => window.crucible.git.smartSync(cwd),
};
