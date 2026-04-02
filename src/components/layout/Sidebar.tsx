import React, { useCallback, useRef, useEffect } from 'react';
import { SidebarView } from './AppShell';
import { FileTree } from '../explorer/FileTree';
import { SearchPanel } from '../search/SearchPanel';
import { GitPanel } from '../git/GitPanel';
import { AIPanel } from '../ai/AIPanel';
import { SettingsPanel } from '../settings/SettingsPanel';

interface Props {
  view: SidebarView;
  width: number;
  onResize: (width: number) => void;
}

export function Sidebar({ view, width, onResize }: Props) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = Math.max(180, Math.min(600, startWidth.current + e.clientX - startX.current));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize]);

  const renderContent = () => {
    switch (view) {
      case 'explorer': return <FileTree />;
      case 'search': return <SearchPanel />;
      case 'git': return <GitPanel />;
      case 'ai': return <AIPanel />;
      case 'settings': return <SettingsPanel />;
    }
  };

  const titles: Record<SidebarView, string> = {
    explorer: 'Explorer',
    search: 'Search',
    git: 'Source Control',
    ai: 'AI Assistant',
    settings: 'Settings',
  };

  return (
    <div className="flex bg-crucible-sidebar" style={{ width }}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center h-9 px-4 text-[11px] font-semibold uppercase tracking-wider text-crucible-text-secondary border-b border-crucible-border">
          {titles[view]}
        </div>
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
      <div
        className="w-1 cursor-ew-resize hover:bg-crucible-accent/50 transition-colors"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
