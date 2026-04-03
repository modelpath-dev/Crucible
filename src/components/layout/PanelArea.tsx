import React, { useCallback, useRef, useEffect, useState } from 'react';
import { TerminalPanel } from '../terminal/TerminalPanel';

interface Props {
  height: number;
  onResize: (height: number) => void;
  onClose: () => void;
}

export function PanelArea({ height, onResize, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'output' | 'problems'>('terminal');
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = height;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [height]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newHeight = Math.max(100, Math.min(500, startHeight.current - (e.clientY - startY.current)));
      onResize(newHeight);
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

  return (
    <div className="flex flex-col border-t border-crucible-border bg-crucible-panel" style={{ height }}>
      <div
        className="h-1 cursor-ns-resize hover:bg-crucible-accent/50 transition-colors"
        onMouseDown={handleMouseDown}
      />
      <div className="flex items-center h-8 px-2 border-b border-crucible-border gap-2">
        {(['terminal', 'output', 'problems'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-1 text-xs capitalize ${
              activeTab === tab
                ? 'text-crucible-text border-b border-crucible-accent'
                : 'text-crucible-text-secondary hover:text-crucible-text'
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="text-crucible-text-secondary hover:text-crucible-text px-1"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'terminal' && <TerminalPanel />}
        {activeTab === 'output' && (
          <div className="flex items-center justify-center h-full text-xs text-crucible-text-secondary">
            <span>Output from tasks and extensions will appear here</span>
          </div>
        )}
        {activeTab === 'problems' && (
          <div className="flex items-center justify-center h-full text-xs text-crucible-text-secondary">
            <span>No problems have been detected in the workspace</span>
          </div>
        )}
      </div>
    </div>
  );
}
