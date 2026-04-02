import { registerTool } from './ToolRegistry';

registerTool({
  name: 'write_to_file',
  description: 'Write content to a file. This will create or overwrite the file.',
  parameters: {
    path: {
      type: 'string',
      description: 'The file path to write to',
      required: true,
    },
    content: {
      type: 'string',
      description: 'The content to write',
      required: true,
    },
  },
  execute: async (args) => {
    const filePath = args.path as string;
    const content = args.content as string;
    try {
      await window.crucible.fs.writeFile(filePath, content);
      return `Successfully wrote to ${filePath}`;
    } catch (err: any) {
      return `Error writing file: ${err.message}`;
    }
  },
});
