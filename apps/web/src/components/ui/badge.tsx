import * as React from 'react';

type SpanProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children?: React.ReactNode;
};

export const Badge: React.FC<SpanProps> = ({ variant = 'default', className = '', children, ...props }) => {
  const variants: Record<string, string> = {
    default: 'bg-slate-800 text-white',
    secondary: 'bg-slate-200 text-slate-800',
    destructive: 'bg-red-600 text-white',
    outline: 'border border-slate-300 text-slate-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
