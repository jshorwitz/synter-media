interface StatusPillProps {
  status: 'success' | 'warning' | 'error' | 'idle';
  children: React.ReactNode;
  className?: string;
}

export function StatusPill({ status, children, className = '' }: StatusPillProps) {
  return (
    <span className={`status-pill ${status} ${className}`}>
      {children}
    </span>
  );
}
