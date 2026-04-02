import { ipcMain } from 'electron';
import { KEYSTORE_CHANNELS } from '../../shared/ipcChannels';
import { SecureStore } from '../services/SecureStore';

const secureStore = new SecureStore();

export function registerKeystoreHandlers() {
  ipcMain.handle(KEYSTORE_CHANNELS.SET_KEY, async (_event, key: string, value: string): Promise<void> => {
    secureStore.set(key, value);
  });

  ipcMain.handle(KEYSTORE_CHANNELS.DELETE_KEY, async (_event, key: string): Promise<void> => {
    secureStore.delete(key);
  });

  ipcMain.handle(KEYSTORE_CHANNELS.HAS_KEY, async (_event, key: string): Promise<boolean> => {
    return secureStore.has(key);
  });
}
