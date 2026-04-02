import React, { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { useSettingsStore } from './stores/useSettingsStore';
import { ToastContainer } from './components/shared/Toast';
import { ContextMenuProvider } from './components/shared/ContextMenu';

export default function App() {
  const { settings, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  return (
    <ContextMenuProvider>
      <AppShell />
      <ToastContainer />
    </ContextMenuProvider>
  );
}
