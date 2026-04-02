import React, { useMemo } from 'react';
import { useGitStore } from '../../stores/useGitStore';
import { GitLogEntry } from '../../../shared/types';

const COLORS = ['#89b4fa', '#a6e3a1', '#f9e2af', '#f38ba8', '#cba6f7', '#89dceb', '#fab387'];

interface GraphNode {
  entry: GitLogEntry;
  column: number;
  color: string;
  connections: { fromCol: number; toCol: number; toRow: number }[];
}

export function GitGraph() {
  const log = useGitStore(s => s.log);

  const nodes = useMemo(() => {
    if (log.length === 0) return [];

    const result: GraphNode[] = [];
    const activeColumns = new Map<string, number>(); // hash -> column
    let nextColumn = 0;

    for (let i = 0; i < log.length; i++) {
      const entry = log[i];
      let col = activeColumns.get(entry.hash) ?? nextColumn++;
      if (!activeColumns.has(entry.hash)) {
        activeColumns.set(entry.hash, col);
      }

      const color = COLORS[col % COLORS.length];
      const connections: GraphNode['connections'] = [];

      // Remove self from active
      activeColumns.delete(entry.hash);

      // Add parents
      if (entry.parents) {
        for (let p = 0; p < entry.parents.length; p++) {
          const parentHash = entry.parents[p];
          if (!parentHash) continue;

          let parentCol = activeColumns.get(parentHash);
          if (parentCol === undefined) {
            parentCol = p === 0 ? col : nextColumn++;
            activeColumns.set(parentHash, parentCol);
          }

          connections.push({ fromCol: col, toCol: parentCol, toRow: i + 1 });
        }
      }

      result.push({ entry, column: col, color, connections });
    }

    return result;
  }, [log]);

  if (nodes.length === 0) {
    return <div className="p-4 text-xs text-crucible-text-secondary text-center">No commits to display</div>;
  }

  const maxCol = Math.max(...nodes.map(n => n.column)) + 1;
  const graphWidth = maxCol * 20 + 10;
  const rowHeight = 32;

  return (
    <div className="flex flex-col overflow-auto">
      <div className="px-3 py-2 text-[11px] font-semibold text-crucible-text-secondary uppercase tracking-wider border-b border-crucible-border">
        Branch Graph
      </div>
      <div className="relative" style={{ minHeight: nodes.length * rowHeight }}>
        <svg
          className="absolute top-0 left-0"
          width={graphWidth}
          height={nodes.length * rowHeight}
          style={{ minWidth: graphWidth }}
        >
          {/* Connections */}
          {nodes.map((node, i) =>
            node.connections.map((conn, j) => (
              <path
                key={`${i}-${j}`}
                d={`M ${conn.fromCol * 20 + 10} ${i * rowHeight + 16} C ${conn.fromCol * 20 + 10} ${(i + 0.5) * rowHeight + 16}, ${conn.toCol * 20 + 10} ${(conn.toRow - 0.5) * rowHeight + 16}, ${conn.toCol * 20 + 10} ${conn.toRow * rowHeight + 16}`}
                stroke={node.color}
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
            ))
          )}
          {/* Nodes */}
          {nodes.map((node, i) => (
            <circle
              key={i}
              cx={node.column * 20 + 10}
              cy={i * rowHeight + 16}
              r="4"
              fill={node.color}
            />
          ))}
        </svg>

        {/* Commit labels */}
        {nodes.map((node, i) => (
          <div
            key={i}
            className="absolute flex items-center gap-2 text-xs"
            style={{
              left: graphWidth + 8,
              top: i * rowHeight + 4,
              height: rowHeight,
            }}
          >
            <span className="text-crucible-text-secondary font-mono text-[10px]">
              {node.entry.abbreviated_hash}
            </span>
            <span className="text-crucible-text truncate max-w-[300px]">
              {node.entry.message}
            </span>
            {node.entry.refs && (
              <span className="px-1 py-0.5 text-[9px] rounded" style={{ backgroundColor: node.color + '33', color: node.color }}>
                {node.entry.refs.split(',')[0]?.trim()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
