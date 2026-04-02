import { create } from 'zustand';
import { CrucibleSettings, DEFAULT_SETTINGS } from '../../shared/types';

interface SettingsState {
  settings: CrucibleSettings;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof CrucibleSettings>(key: K, value: CrucibleSettings[K]) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: { ...DEFAULT_SETTINGS },

  loadSettings: async () => {
    try {
      const settings = await window.crucible.settings.getAll();
      set({ settings: { ...DEFAULT_SETTINGS, ...settings } });
    } catch {
      // Use defaults
    }
  },

  updateSetting: async (key, value) => {
    set(state => ({ settings: { ...state.settings, [key]: value } }));
    await window.crucible.settings.set(key, value);
  },
}));
