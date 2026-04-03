// Serializable types shared between main and renderer processes

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isSymlink: boolean;
  size: number;
  modified: number;
  children?: FileEntry[];
}

export interface FileStat {
  size: number;
  modified: number;
  created: number;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
}

export interface FileWatchEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
}

export interface GitStatus {
  current: string | null;
  tracking: string | null;
  ahead: number;
  behind: number;
  files: GitFileStatus[];
  staged: string[];
  modified: string[];
  not_added: string[];
  deleted: string[];
  conflicted: string[];
  isRepo: boolean;
}

export interface GitFileStatus {
  path: string;
  index: string;
  working_dir: string;
}

export interface GitLogEntry {
  hash: string;
  abbreviated_hash: string;
  author_name: string;
  author_email: string;
  date: string;
  message: string;
  refs: string;
  parents: string[];
}

export interface GitBranch {
  name: string;
  current: boolean;
  commit: string;
  label: string;
  linkedWorkTree?: string;
}

export interface GitDiff {
  files: GitDiffFile[];
}

export interface GitDiffFile {
  file: string;
  changes: number;
  insertions: number;
  deletions: number;
  binary: boolean;
  hunks: string;
}

export interface GitStashEntry {
  index: number;
  message: string;
  date: string;
}

// AI Types
export type AIProviderType = 'openai' | 'claude' | 'gemini';

export interface AIProvider {
  id: AIProviderType;
  name: string;
  models: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  maxTokens: number;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  provider?: AIProviderType;
  model?: string;
  toolCalls?: AIToolCall[];
  toolCallId?: string;
}

export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'error';
  result?: string;
}

export interface AIChatRequest {
  provider: AIProviderType;
  model: string;
  messages: AIChatMessage[];
  context?: AIContext;
  tools?: boolean;
}

export interface AIContext {
  currentFile?: { path: string; content: string; language: string };
  selectedText?: string;
  openFiles?: { path: string; content: string }[];
  relevantFiles?: { path: string; content: string; score: number }[];
  projectRoot?: string;
}

export interface AIError {
  message: string;
  code?: string;
  status?: number;
  retryable?: boolean;
}

export interface AIStreamChunk {
  type: 'text' | 'tool_call' | 'done' | 'error';
  content?: string;
  toolCall?: AIToolCall;
  error?: string;
  errorDetail?: AIError;
  usage?: { promptTokens: number; completionTokens: number };
}

// Search Types
export interface SearchResult {
  file: string;
  line: number;
  column: number;
  content: string;
  matchLength: number;
}

export interface FileSearchResult {
  path: string;
  name: string;
  score: number;
}

// Settings
export interface CrucibleSettings {
  theme: 'dark' | 'light';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  aiProvider: AIProviderType;
  aiModel: string;
  terminalFontSize: number;
  autoSave: boolean;
  autoSaveDelay: number;
}

export const DEFAULT_SETTINGS: CrucibleSettings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  lineNumbers: true,
  aiProvider: 'claude',
  aiModel: 'claude-sonnet-4-20250514',
  terminalFontSize: 13,
  autoSave: false,
  autoSaveDelay: 1000,
};

// Terminal
export interface TerminalSession {
  id: string;
  title: string;
  cwd: string;
}

// Editor
export interface EditorTab {
  id: string;
  path: string;
  name: string;
  language: string;
  isDirty: boolean;
  content: string;
}

// Local History
export interface LocalHistoryEntry {
  id: string;
  filePath: string;
  timestamp: number;
  content: string;
  source: 'save' | 'ai-edit' | 'external';
  label?: string;
}
