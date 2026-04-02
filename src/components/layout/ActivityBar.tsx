import React from 'react';
import { SidebarView } from './AppShell';

interface Props {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onTogglePanel: () => void;
}

const ITEMS: { view: SidebarView; icon: string; title: string }[] = [
  { view: 'explorer', icon: '\u{1F4C1}', title: 'Explorer' },
  { view: 'search', icon: '\u{1F50D}', title: 'Search' },
  { view: 'git', icon: '\u2442', title: 'Source Control' },
  { view: 'ai', icon: '\u2726', title: 'AI Assistant' },
  { view: 'settings', icon: '\u2699', title: 'Settings' },
];

export function ActivityBar({ activeView, onViewChange, onTogglePanel }: Props) {
  return (
    <div className="flex flex-col items-center w-12 bg-crucible-sidebar border-r border-crucible-border py-2 gap-1">
      {ITEMS.map(({ view, icon, title }) => (
        <button
          key={view}
          title={title}
          onClick={() => onViewChange(view)}
          className={`w-10 h-10 flex items-center justify-center rounded text-lg transition-colors ${
            activeView === view
              ? 'text-crucible-accent bg-crucible-hover'
              : 'text-crucible-text-secondary hover:text-crucible-text hover:bg-crucible-hover'
          }`}
        >
          {icon}
        </button>
      ))}
      <div className="flex-1" />
      <button
        title="Toggle Terminal"
        onClick={onTogglePanel}
        className="w-10 h-10 flex items-center justify-center rounded text-lg text-crucible-text-secondary hover:text-crucible-text hover:bg-crucible-hover"
      >
        {'>'}_
      </button>
    </div>
  );
}
