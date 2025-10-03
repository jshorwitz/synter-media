import { ReactNode } from 'react';

interface LogEntry {
  timestamp: string;
  message: string | ReactNode;
  level?: 'info' | 'warning' | 'error';
}

interface CommandLogProps {
  entries: LogEntry[];
  maxHeight?: string;
  className?: string;
}

export function CommandLog({ entries, maxHeight = '400px', className = '' }: CommandLogProps) {
  return (
    <div className={`command-log ${className}`} style={{ maxHeight }}>
      {entries.map((entry, idx) => (
        <div
          key={idx}
          className={`command-log-entry ${entry.level ? `command-log-${entry.level}` : ''}`}
        >
          <span className="command-log-timestamp">[{entry.timestamp}]</span>
          {entry.message}
        </div>
      ))}
    </div>
  );
}
