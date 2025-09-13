"use client";
import * as React from 'react';

type SelectRootProps = {
  value?: string;
  onValueChange?: (v: string) => void;
  children?: React.ReactNode;
};

export const Select: React.FC<SelectRootProps> = ({ value, onValueChange, children }) => {
  return <div data-select-root>{children}</div>;
};

export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`inline-flex h-9 items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-sm ${className}`} {...props} />
);

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
  <span className="text-slate-500">{placeholder}</span>
);

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`mt-1 rounded-md border bg-white shadow ${className}`} {...props} />
);

export const SelectItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({ className = '', children, ...props }) => (
  <div className={`cursor-pointer px-3 py-2 text-sm hover:bg-slate-50 ${className}`} {...props}>
    {children}
  </div>
);
