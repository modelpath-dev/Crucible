import { ipcMain } from 'electron';
import simpleGit, { SimpleGit } from 'simple-git';
import { GIT_CHANNELS } from '../../shared/ipcChannels';
import { GitStatus, GitFileStatus, GitLogEntry, GitBranch, GitStashEntry } from '../../shared/types';

function getGit(cwd: string): SimpleGit {
  return simpleGit({ baseDir: cwd, binary: 'git', maxConcurrentProcesses: 6 });
}

export function registerGitHandlers() {
  ipcMain.handle(GIT_CHANNELS.STATUS, async (_event, cwd: string): Promise<GitStatus> => {
    const git = getGit(cwd);
    try {
      const status = await git.status();
      return {
        current: status.current,
        tracking: status.tracking,
        ahead: status.ahead,
        behind: status.behind,
        files: status.files.map(f => ({
          path: f.path,
          index: f.index,
          working_dir: f.working_dir,
        })),
        staged: status.staged,
        modified: status.modified,
        not_added: status.not_added,
        deleted: status.deleted,
        conflicted: status.conflicted,
        isRepo: true,
      };
    } catch {
      return {
        current: null, tracking: null, ahead: 0, behind: 0,
        files: [], staged: [], modified: [], not_added: [], deleted: [], conflicted: [],
        isRepo: false,
      };
    }
  });

  ipcMain.handle(GIT_CHANNELS.LOG, async (_event, cwd: string, maxCount = 50): Promise<GitLogEntry[]> => {
    const git = getGit(cwd);
    const log = await git.log({ maxCount, '--format': '%H|%h|%an|%ae|%aI|%s|%D|%P' });
    return log.all.map(entry => ({
      hash: entry.hash,
      abbreviated_hash: entry.hash.substring(0, 7),
      author_name: entry.author_name,
      author_email: entry.author_email,
      date: entry.date,
      message: entry.message,
      refs: entry.refs,
      parents: (entry as any).body?.split(' ') || [],
    }));
  });

  ipcMain.handle(GIT_CHANNELS.DIFF, async (_event, cwd: string, filePath?: string): Promise<string> => {
    const git = getGit(cwd);
    if (filePath) {
      return git.diff([filePath]);
    }
    return git.diff();
  });

  ipcMain.handle(GIT_CHANNELS.ADD, async (_event, cwd: string, files: string[]): Promise<void> => {
    const git = getGit(cwd);
    await git.add(files);
  });

  ipcMain.handle(GIT_CHANNELS.COMMIT, async (_event, cwd: string, message: string): Promise<void> => {
    const git = getGit(cwd);
    await git.commit(message);
  });

  ipcMain.handle(GIT_CHANNELS.PUSH, async (_event, cwd: string): Promise<void> => {
    const git = getGit(cwd);
    await git.push();
  });

  ipcMain.handle(GIT_CHANNELS.PULL, async (_event, cwd: string): Promise<void> => {
    const git = getGit(cwd);
    await git.pull();
  });

  ipcMain.handle(GIT_CHANNELS.BRANCH_LIST, async (_event, cwd: string): Promise<GitBranch[]> => {
    const git = getGit(cwd);
    const branches = await git.branchLocal();
    return Object.values(branches.branches).map(b => ({
      name: b.name,
      current: b.current,
      commit: b.commit,
      label: b.label,
    }));
  });

  ipcMain.handle(GIT_CHANNELS.BRANCH_CREATE, async (_event, cwd: string, name: string): Promise<void> => {
    const git = getGit(cwd);
    await git.checkoutLocalBranch(name);
  });

  ipcMain.handle(GIT_CHANNELS.BRANCH_CHECKOUT, async (_event, cwd: string, name: string): Promise<void> => {
    const git = getGit(cwd);
    await git.checkout(name);
  });

  ipcMain.handle(GIT_CHANNELS.BRANCH_DELETE, async (_event, cwd: string, name: string): Promise<void> => {
    const git = getGit(cwd);
    await git.deleteLocalBranch(name);
  });

  ipcMain.handle(GIT_CHANNELS.STASH, async (_event, cwd: string, message?: string): Promise<void> => {
    const git = getGit(cwd);
    if (message) {
      await git.stash(['push', '-m', message]);
    } else {
      await git.stash();
    }
  });

  ipcMain.handle(GIT_CHANNELS.STASH_LIST, async (_event, cwd: string): Promise<GitStashEntry[]> => {
    const git = getGit(cwd);
    const result = await git.stashList();
    return result.all.map((s, i) => ({
      index: i,
      message: s.message,
      date: s.date,
    }));
  });

  ipcMain.handle(GIT_CHANNELS.STASH_POP, async (_event, cwd: string, index?: number): Promise<void> => {
    const git = getGit(cwd);
    if (index !== undefined) {
      await git.stash(['pop', `stash@{${index}}`]);
    } else {
      await git.stash(['pop']);
    }
  });

  ipcMain.handle(GIT_CHANNELS.STASH_DROP, async (_event, cwd: string, index: number): Promise<void> => {
    const git = getGit(cwd);
    await git.stash(['drop', `stash@{${index}}`]);
  });

  ipcMain.handle(GIT_CHANNELS.MERGE, async (_event, cwd: string, branch: string): Promise<void> => {
    const git = getGit(cwd);
    await git.merge([branch]);
  });

  ipcMain.handle(GIT_CHANNELS.SMART_SYNC, async (_event, cwd: string): Promise<{ success: boolean; message: string }> => {
    const git = getGit(cwd);
    try {
      const status = await git.status();
      const hadChanges = status.files.length > 0;

      if (hadChanges) {
        await git.stash(['push', '-m', 'crucible-smart-sync']);
      }

      await git.pull(['--rebase']);

      if (hadChanges) {
        try {
          await git.stash(['pop']);
        } catch {
          return { success: false, message: 'Pull succeeded but stash pop had conflicts. Please resolve manually.' };
        }
      }

      return { success: true, message: 'Synced successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Sync failed' };
    }
  });

  ipcMain.handle(GIT_CHANNELS.INIT, async (_event, cwd: string): Promise<void> => {
    const git = getGit(cwd);
    await git.init();
  });
}
