export interface ParsedEdit {
  filePath: string;
  content: string;
  type: 'create' | 'replace' | 'diff';
  originalContent?: string;
}

const FENCE_REGEX = /```(?:\w+)?\s*\n([\s\S]*?)```/g;
const DIFF_HEADER_REGEX = /^(?:---|\+\+\+|diff --git)/m;

export function parseEditsFromResponse(response: string): ParsedEdit[] {
  const edits: ParsedEdit[] = [];

  // Try to extract fenced code blocks with file paths
  const fileBlockRegex = /(?:^|\n)(?:File:\s*|### )?([\w/.\\-]+\.\w+)\s*\n```(?:\w+)?\s*\n([\s\S]*?)```/g;
  let match;

  while ((match = fileBlockRegex.exec(response)) !== null) {
    edits.push({
      filePath: match[1],
      content: match[2].trimEnd(),
      type: 'replace',
    });
  }

  if (edits.length > 0) return edits;

  // Fallback: try unified diff format
  if (DIFF_HEADER_REGEX.test(response)) {
    const diffBlocks = response.split(/^diff --git/m).filter(Boolean);
    for (const block of diffBlocks) {
      const fileMatch = block.match(/^.*?a\/(.*?)\s+b\/(.*?)$/m);
      if (fileMatch) {
        edits.push({
          filePath: fileMatch[2],
          content: block,
          type: 'diff',
        });
      }
    }
  }

  // Fallback: single code block
  if (edits.length === 0) {
    const singleBlock = FENCE_REGEX.exec(response);
    if (singleBlock) {
      edits.push({
        filePath: '',
        content: singleBlock[1].trimEnd(),
        type: 'replace',
      });
    }
  }

  return edits;
}
