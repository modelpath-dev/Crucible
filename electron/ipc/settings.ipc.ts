import { ipcMain } from 'electron';
import { SETTINGS_CHANNELS } from '../../shared/ipcChannels';
import { CrucibleSettings, DEFAULT_SETTINGS } from '../../shared/types';

// electron-store is ESM, handle import
let store: any = null;

async function getStore() {
  if (!store) {
    // Use a simple JSON file for settings
    const fs = await import('fs');
    const path = await import('path');
    const { app } = await import('electron');
    const settingsPath = path.join(app.getPath('userData'), 'settings.json');

    store = {
      path: settingsPath,
      get(key?: string) {
        try {
          const data = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
          if (key) return data[key];
          return data;
        } catch {
          return key ? DEFAULT_SETTINGS[key as keyof CrucibleSettings] : { ...DEFAULT_SETTINGS };
        }
      },
      set(key: string, value: any) {
        let data: any;
        try {
          data = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
        } catch {
          data = { ...DEFAULT_SETTINGS };
        }
        data[key] = value;
        fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
      }
    };
  }
  return store;
}

export function registerSettingsHandlers() {
  ipcMain.handle(SETTINGS_CHANNELS.GET, async (_event, key: string): Promise<any> => {
    const s = await getStore();
    return s.get(key);
  });

  ipcMain.handle(SETTINGS_CHANNELS.SET, async (_event, key: string, value: any): Promise<void> => {
    const s = await getStore();
    s.set(key, value);
  });

  ipcMain.handle(SETTINGS_CHANNELS.GET_ALL, async (): Promise<CrucibleSettings> => {
    const s = await getStore();
    return { ...DEFAULT_SETTINGS, ...s.get() };
  });
}
