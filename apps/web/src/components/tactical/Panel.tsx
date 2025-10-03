import { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  title?: string;
  tactical?: boolean;
  className?: string;
}

export function Panel({ children, title, tactical, className = '' }: PanelProps) {
  return (
    <div className={`panel ${tactical ? 'panel-tactical relative' : ''} ${className}`}>
      {title && <div className="panel-title">{title}</div>}
      {children}
    </div>
  );
}
