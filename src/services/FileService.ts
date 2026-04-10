
export const FileService = {
  async readDir(path: string) {
    return window.crucible.fs.readDir(path);
  },

  async readFile(path: string): Promise<string> {
    return window.crucible.fs.readFile(path);
  },

  async writeFile(path: string, content: string): Promise<void> {
    return window.crucible.fs.writeFile(path, content);
  },

  async stat(path: string) {
    return window.crucible.fs.stat(path);
  },

  async mkdir(path: string): Promise<void> {
    return window.crucible.fs.mkdir(path);
  },

  async rename(oldPath: string, newPath: string): Promise<void> {
    return window.crucible.fs.rename(oldPath, newPath);
  },

  async delete(path: string): Promise<void> {
    return window.crucible.fs.delete(path);
  },
};
