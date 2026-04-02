import React, { useState, useRef } from 'react';

interface Props {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'bottom' }: Props) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<number>();

  const handleEnter = () => {
    timeoutRef.current = window.setTimeout(() => setShow(true), 500);
  };

  const handleLeave = () => {
    clearTimeout(timeoutRef.current);
    setShow(false);
  };

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show && (
        <div className={`absolute z-40 px-2 py-1 text-[11px] bg-crucible-panel border border-crucible-border rounded shadow-lg whitespace-nowrap text-crucible-text ${positionClasses[position]}`}>
          {content}
        </div>
      )}
    </div>
  );
}
