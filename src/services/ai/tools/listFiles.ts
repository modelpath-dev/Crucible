import { registerTool } from './ToolRegistry';

registerTool({
  name: 'list_files',
  description: 'List files and directories at a given path in the project',
  parameters: {
    directory: {
      type: 'string',
      description: 'The directory path to list (relative to project root)',
      required: true,
    },
  },
  execute: async (args) => {
    const dir = args.directory as string;
    try {
      const entries = await window.crucible.fs.readDir(dir);
      return entries
        .map((e: any) => `${e.isDirectory ? '[DIR]' : '[FILE]'} ${e.name}`)
        .join('\n');
    } catch (err: any) {
      return `Error listing files: ${err.message}`;
    }
  },
});
