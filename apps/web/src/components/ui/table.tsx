import * as React from 'react';

type TableElementProps = React.HTMLAttributes<HTMLTableElement> & { children?: React.ReactNode };

type GenericProps<T extends keyof JSX.IntrinsicElements> = React.ComponentProps<T> & { children?: React.ReactNode };

export const Table = ({ className = '', ...props }: TableElementProps) => (
  <table className={`w-full text-left text-sm ${className}`} {...props} />
);

export const TableHeader = ({ className = '', ...props }: GenericProps<'thead'>) => (
  <thead className={className} {...props} />
);

export const TableBody = ({ className = '', ...props }: GenericProps<'tbody'>) => (
  <tbody className={className} {...props} />
);

export const TableRow = ({ className = '', ...props }: GenericProps<'tr'>) => (
  <tr className={`border-b last:border-0 ${className}`} {...props} />
);

export const TableHead = ({ className = '', ...props }: GenericProps<'th'>) => (
  <th className={`py-2 px-3 font-medium text-slate-600 ${className}`} {...props} />
);

export const TableCell = ({ className = '', ...props }: GenericProps<'td'>) => (
  <td className={`py-2 px-3 ${className}`} {...props} />
);
