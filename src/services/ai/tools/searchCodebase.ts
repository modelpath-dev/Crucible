import { registerTool } from './ToolRegistry';

registerTool({
  name: 'search_codebase',
  description: 'Search the codebase for text or patterns using ripgrep. Returns matching lines with file paths and line numbers.',
  parameters: {
    query: {
      type: 'string',
      description: 'The search query (text or regex)',
      required: true,
    },
    glob: {
      type: 'string',
      description: 'Optional glob pattern to filter files (e.g. "*.ts", "src/**/*.tsx")',
    },
  },
  execute: async (args) => {
    const query = args.query as string;
    const glob = args.glob as string | undefined;
    try {
      const results = await window.crucible.search.contentSearch(
        '', // cwd from context
        query,
        { glob, maxResults: 30 }
      );
      if (results.length === 0) return 'No results found.';
      return results
        .map((r: any) => `${r.file}:${r.line}: ${r.content}`)
        .join('\n');
    } catch (err: any) {
      return `Search error: ${err.message}`;
    }
  },
});
