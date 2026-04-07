import { create } from 'zustand';
import { CrucibleSettings, DEFAULT_SETTINGS } from '../../shared/types';

const SETTING_BOUNDS: Partial<Record<keyof CrucibleSettings, { min: number; max: number }>> = {
  fontSize: { min: 8, max: 32 },
  terminalFontSize: { min: 8, max: 32 },
  tabSize: { min: 1, max: 8 },
  autoSaveDelay: { min: 200, max: 10000 },
  lineHeight: { min: 12, max: 48 },
};

function clampSetting<K extends keyof CrucibleSettings>(key: K, value: CrucibleSettings[K]): CrucibleSettings[K] {
  const bounds = SETTING_BOUNDS[key];
  if (bounds && typeof value === 'number') {
    return Math.max(bounds.min, Math.min(bounds.max, value)) as CrucibleSettings[K];
  }
  return value;
}

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
    const clamped = clampSetting(key, value);
    set(state => ({ settings: { ...state.settings, [key]: clamped } }));
    await window.crucible.settings.set(key, clamped);
  },
}));
