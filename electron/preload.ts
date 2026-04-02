import { contextBridge, ipcRenderer } from 'electron';
import { FS_CHANNELS, GIT_CHANNELS, TERMINAL_CHANNELS, AI_CHANNELS, KEYSTORE_CHANNELS, SETTINGS_CHANNELS, SEARCH_CHANNELS, APP_CHANNELS } from '../shared/ipcChannels';

type IpcCallback = (...args: any[]) => void;

function createInvoker(channel: string) {
  return (...args: any[]) => ipcRenderer.invoke(channel, ...args);
}

function createListener(channel: string) {
  return (callback: IpcCallback) => {
    const handler = (_event: Electron.IpcRendererEvent, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, handler);
    return () => { ipcRenderer.removeListener(channel, handler); };
  };
}

function createSender(channel: string) {
  return (...args: any[]) => ipcRenderer.send(channel, ...args);
}

const api = {
  fs: {
    readDir: createInvoker(FS_CHANNELS.READ_DIR),
    readFile: createInvoker(FS_CHANNELS.READ_FILE),
    writeFile: createInvoker(FS_CHANNELS.WRITE_FILE),
    stat: createInvoker(FS_CHANNELS.STAT),
    mkdir: createInvoker(FS_CHANNELS.MKDIR),
    rename: createInvoker(FS_CHANNELS.RENAME),
    delete: createInvoker(FS_CHANNELS.DELETE),
    selectFolder: createInvoker(FS_CHANNELS.SELECT_FOLDER),
    watchStart: createInvoker(FS_CHANNELS.WATCH_START),
    watchStop: createInvoker(FS_CHANNELS.WATCH_STOP),
    onWatchEvent: createListener(FS_CHANNELS.WATCH_EVENT),
  },
  git: {
    status: createInvoker(GIT_CHANNELS.STATUS),
    log: createInvoker(GIT_CHANNELS.LOG),
    diff: createInvoker(GIT_CHANNELS.DIFF),
    add: createInvoker(GIT_CHANNELS.ADD),
    commit: createInvoker(GIT_CHANNELS.COMMIT),
    push: createInvoker(GIT_CHANNELS.PUSH),
    pull: createInvoker(GIT_CHANNELS.PULL),
    branchList: createInvoker(GIT_CHANNELS.BRANCH_LIST),
    branchCreate: createInvoker(GIT_CHANNELS.BRANCH_CREATE),
    branchCheckout: createInvoker(GIT_CHANNELS.BRANCH_CHECKOUT),
    branchDelete: createInvoker(GIT_CHANNELS.BRANCH_DELETE),
    stash: createInvoker(GIT_CHANNELS.STASH),
    stashList: createInvoker(GIT_CHANNELS.STASH_LIST),
    stashPop: createInvoker(GIT_CHANNELS.STASH_POP),
    stashDrop: createInvoker(GIT_CHANNELS.STASH_DROP),
    merge: createInvoker(GIT_CHANNELS.MERGE),
    smartSync: createInvoker(GIT_CHANNELS.SMART_SYNC),
    init: createInvoker(GIT_CHANNELS.INIT),
  },
  terminal: {
    create: createInvoker(TERMINAL_CHANNELS.CREATE),
    sendData: createSender(TERMINAL_CHANNELS.DATA),
    resize: createSender(TERMINAL_CHANNELS.RESIZE),
    close: createSender(TERMINAL_CHANNELS.CLOSE),
    onOutput: createListener(TERMINAL_CHANNELS.OUTPUT),
    onExit: createListener(TERMINAL_CHANNELS.EXIT),
  },
  ai: {
    chat: createInvoker(AI_CHANNELS.CHAT),
    cancel: createSender(AI_CHANNELS.CANCEL),
    listProviders: createInvoker(AI_CHANNELS.LIST_PROVIDERS),
    approveToolCall: createSender(AI_CHANNELS.TOOL_APPROVE),
    rejectToolCall: createSender(AI_CHANNELS.TOOL_REJECT),
    onStream: createListener(AI_CHANNELS.CHAT_STREAM),
    onDone: createListener(AI_CHANNELS.CHAT_DONE),
    onError: createListener(AI_CHANNELS.CHAT_ERROR),
    onToolCall: createListener(AI_CHANNELS.TOOL_CALL),
  },
  keystore: {
    setKey: createInvoker(KEYSTORE_CHANNELS.SET_KEY),
    deleteKey: createInvoker(KEYSTORE_CHANNELS.DELETE_KEY),
    hasKey: createInvoker(KEYSTORE_CHANNELS.HAS_KEY),
  },
  settings: {
    get: createInvoker(SETTINGS_CHANNELS.GET),
    set: createInvoker(SETTINGS_CHANNELS.SET),
    getAll: createInvoker(SETTINGS_CHANNELS.GET_ALL),
  },
  search: {
    fileSearch: createInvoker(SEARCH_CHANNELS.FILE_SEARCH),
    contentSearch: createInvoker(SEARCH_CHANNELS.CONTENT_SEARCH),
  },
  app: {
    getVersion: createInvoker(APP_CHANNELS.GET_VERSION),
    openExternal: createInvoker(APP_CHANNELS.OPEN_EXTERNAL),
  },
  // Window controls (frameless window)
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximizeChange: createListener('window:maximizeChange'),
  },
};

contextBridge.exposeInMainWorld('crucible', api);

export type CrucibleAPI = typeof api;
