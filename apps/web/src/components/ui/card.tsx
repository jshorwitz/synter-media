import * as React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };

export const Card = ({ className = '', ...props }: DivProps) => (
  <div className={`bg-white border rounded-lg ${className}`} {...props} />
);

export const CardHeader = ({ className = '', ...props }: DivProps) => (
  <div className={`p-4 ${className}`} {...props} />
);

export const CardTitle = ({ className = '', ...props }: DivProps) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props} />
);

export const CardDescription = ({ className = '', ...props }: DivProps) => (
  <p className={`text-sm text-slate-500 ${className}`} {...props} />
);

export const CardContent = ({ className = '', ...props }: DivProps) => (
  <div className={`p-4 ${className}`} {...props} />
);
