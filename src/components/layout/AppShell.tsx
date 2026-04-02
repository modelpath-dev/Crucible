import React, { useState, useCallback, useEffect } from 'react';
import { TitleBar } from './TitleBar';
import { ActivityBar } from './ActivityBar';
import { Sidebar } from './Sidebar';
import { EditorArea } from './EditorArea';
import { PanelArea } from './PanelArea';
import { StatusBar } from './StatusBar';
import { QuickOpen } from '../search/QuickOpen';

export type SidebarView = 'explorer' | 'search' | 'git' | 'ai' | 'settings';

export function AppShell() {
  const [sidebarView, setSidebarView] = useState<SidebarView>('explorer');
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [panelHeight, setPanelHeight] = useState(200);
  const [showPanel, setShowPanel] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showQuickOpen, setShowQuickOpen] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        setShowQuickOpen(v => !v);
      }
      if (mod && e.key === 'b') {
        e.preventDefault();
        setShowSidebar(v => !v);
      }
      if (mod && e.key === '`') {
        e.preventDefault();
        setShowPanel(v => !v);
      }
      if (mod && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setSidebarView('search');
        setShowSidebar(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col h-screen select-none">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar
          activeView={sidebarView}
          onViewChange={(view) => {
            if (view === sidebarView && showSidebar) {
              setShowSidebar(false);
            } else {
              setSidebarView(view);
              setShowSidebar(true);
            }
          }}
          onTogglePanel={() => setShowPanel(!showPanel)}
        />
        {showSidebar && (
          <Sidebar
            view={sidebarView}
            width={sidebarWidth}
            onResize={setSidebarWidth}
          />
        )}
        <div className="flex flex-col flex-1 overflow-hidden">
          <EditorArea />
          {showPanel && (
            <PanelArea
              height={panelHeight}
              onResize={setPanelHeight}
              onClose={() => setShowPanel(false)}
            />
          )}
        </div>
      </div>
      <StatusBar onTogglePanel={() => setShowPanel(!showPanel)} />
      <QuickOpen isOpen={showQuickOpen} onClose={() => setShowQuickOpen(false)} />
    </div>
  );
}
