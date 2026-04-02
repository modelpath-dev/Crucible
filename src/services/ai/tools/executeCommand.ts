import { registerTool } from './ToolRegistry';

registerTool({
  name: 'execute_command',
  description: 'Execute a terminal command and return the output. Use for running tests, installing packages, etc.',
  parameters: {
    command: {
      type: 'string',
      description: 'The command to execute',
      required: true,
    },
  },
  execute: async (args) => {
    const command = args.command as string;
    // This is a placeholder - actual execution goes through terminal IPC
    // In the real agent loop, this would need user approval
    return `[Command queued for user approval: ${command}]`;
  },
});
