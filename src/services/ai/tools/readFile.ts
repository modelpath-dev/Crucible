import { registerTool } from './ToolRegistry';

registerTool({
  name: 'read_file',
  description: 'Read the contents of a file',
  parameters: {
    path: {
      type: 'string',
      description: 'The file path to read',
      required: true,
    },
  },
  execute: async (args) => {
    const filePath = args.path as string;
    try {
      const content = await window.crucible.fs.readFile(filePath);
      return content;
    } catch (err: any) {
      return `Error reading file: ${err.message}`;
    }
  },
});
