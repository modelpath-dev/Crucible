import React from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { CrucibleSettings } from '../../../shared/types';

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-crucible-text">{label}</span>
      {children}
    </div>
  );
}

export function SettingsPanel() {
  const { settings, updateSetting } = useSettingsStore();

  return (
    <div className="p-3 space-y-1">
      <h3 className="text-xs font-semibold text-crucible-text-secondary uppercase tracking-wider mb-3">Editor</h3>

      <SettingRow label="Theme">
        <select
          value={settings.theme}
          onChange={e => updateSetting('theme', e.target.value as 'dark' | 'light')}
          className="px-2 py-1 bg-crucible-editor border border-crucible-border rounded text-xs text-crucible-text"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </SettingRow>

      <SettingRow label="Font Size">
        <input
          type="number"
          value={settings.fontSize}
          onChange={e => updateSetting('fontSize', Number(e.target.value))}
          min={10} max={24}
          className="w-16 px-2 py-1 bg-crucible-editor border border-crucible-border rounded text-xs text-crucible-text"
        />
      </SettingRow>

      <SettingRow label="Tab Size">
        <select
          value={settings.tabSize}
          onChange={e => updateSetting('tabSize', Number(e.target.value))}
          className="px-2 py-1 bg-crucible-editor border border-crucible-border rounded text-xs text-crucible-text"
        >
          <option value={2}>2</option>
          <option value={4}>4</option>
        </select>
      </SettingRow>

      <SettingRow label="Word Wrap">
        <input
          type="checkbox"
          checked={settings.wordWrap}
          onChange={e => updateSetting('wordWrap', e.target.checked)}
        />
      </SettingRow>

      <SettingRow label="Minimap">
        <input
          type="checkbox"
          checked={settings.minimap}
          onChange={e => updateSetting('minimap', e.target.checked)}
        />
      </SettingRow>

      <SettingRow label="Line Numbers">
        <input
          type="checkbox"
          checked={settings.lineNumbers}
          onChange={e => updateSetting('lineNumbers', e.target.checked)}
        />
      </SettingRow>

      <SettingRow label="Auto Save">
        <input
          type="checkbox"
          checked={settings.autoSave}
          onChange={e => updateSetting('autoSave', e.target.checked)}
        />
      </SettingRow>
    </div>
  );
}
