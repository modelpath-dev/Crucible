import React, { useEffect, useRef, useState } from 'react';

export interface ContextMenuItem {
  label: string;
  action: () => void;
  icon?: string;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
}

interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

let globalSetMenu: ((state: ContextMenuState | null) => void) | null = null;

export function showContextMenu(x: number, y: number, items: ContextMenuItem[]) {
  globalSetMenu?.({ x, y, items });
}

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    globalSetMenu = setMenu;
    return () => { globalSetMenu = null; };
  }, []);

  useEffect(() => {
    const handleClick = () => setMenu(null);
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <>
      {children}
      {menu && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[180px] bg-crucible-sidebar border border-crucible-border rounded-md shadow-xl py-1"
          style={{ left: menu.x, top: menu.y }}
        >
          {menu.items.map((item, i) =>
            item.divider ? (
              <div key={i} className="border-t border-crucible-border my-1" />
            ) : (
              <button
                key={i}
                onClick={() => { item.action(); setMenu(null); }}
                disabled={item.disabled}
                className="w-full text-left px-3 py-1.5 text-xs text-crucible-text hover:bg-crucible-hover disabled:opacity-40 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </span>
                {item.shortcut && (
                  <span className="text-crucible-text-secondary text-[10px] ml-4">{item.shortcut}</span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </>
  );
}
