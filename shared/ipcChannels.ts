// Typed IPC channel names for main ↔ renderer communication

export const FS_CHANNELS = {
  READ_DIR: 'fs:readDir',
  READ_FILE: 'fs:readFile',
  WRITE_FILE: 'fs:writeFile',
  STAT: 'fs:stat',
  MKDIR: 'fs:mkdir',
  RENAME: 'fs:rename',
  DELETE: 'fs:delete',
  SELECT_FOLDER: 'fs:selectFolder',
  WATCH_START: 'fs:watchStart',
  WATCH_STOP: 'fs:watchStop',
  WATCH_EVENT: 'fs:watchEvent', // push from main
} as const;

export const GIT_CHANNELS = {
  STATUS: 'git:status',
  LOG: 'git:log',
  DIFF: 'git:diff',
  ADD: 'git:add',
  COMMIT: 'git:commit',
  PUSH: 'git:push',
  PULL: 'git:pull',
  BRANCH_LIST: 'git:branchList',
  BRANCH_CREATE: 'git:branchCreate',
  BRANCH_CHECKOUT: 'git:branchCheckout',
  BRANCH_DELETE: 'git:branchDelete',
  STASH: 'git:stash',
  STASH_LIST: 'git:stashList',
  STASH_POP: 'git:stashPop',
  STASH_DROP: 'git:stashDrop',
  MERGE: 'git:merge',
  SMART_SYNC: 'git:smartSync',
  INIT: 'git:init',
} as const;

export const TERMINAL_CHANNELS = {
  CREATE: 'terminal:create',
  DATA: 'terminal:data', // bidirectional
  RESIZE: 'terminal:resize',
  CLOSE: 'terminal:close',
  OUTPUT: 'terminal:output', // push from main
  EXIT: 'terminal:exit', // push from main
} as const;

export const AI_CHANNELS = {
  CHAT: 'ai:chat',
  CHAT_STREAM: 'ai:chatStream', // push from main
  CHAT_DONE: 'ai:chatDone', // push from main
  CHAT_ERROR: 'ai:chatError', // push from main
  CANCEL: 'ai:cancel',
  LIST_PROVIDERS: 'ai:listProviders',
  TOOL_CALL: 'ai:toolCall', // push from main
  TOOL_APPROVE: 'ai:toolApprove',
  TOOL_REJECT: 'ai:toolReject',
} as const;

export const KEYSTORE_CHANNELS = {
  SET_KEY: 'keystore:setKey',
  DELETE_KEY: 'keystore:deleteKey',
  HAS_KEY: 'keystore:hasKey',
} as const;

export const SETTINGS_CHANNELS = {
  GET: 'settings:get',
  SET: 'settings:set',
  GET_ALL: 'settings:getAll',
} as const;

export const SEARCH_CHANNELS = {
  FILE_SEARCH: 'search:fileSearch',
  CONTENT_SEARCH: 'search:contentSearch',
} as const;

export const LSP_CHANNELS = {
  START: 'lsp:start',
  STOP: 'lsp:stop',
  SEND: 'lsp:send',
  RECEIVE: 'lsp:receive', // push from main
} as const;

export const APP_CHANNELS = {
  GET_VERSION: 'app:getVersion',
  OPEN_EXTERNAL: 'app:openExternal',
} as const;
