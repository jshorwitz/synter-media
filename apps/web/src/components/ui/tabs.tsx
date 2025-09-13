"use client";
import * as React from 'react';

type TabsProps = {
  defaultValue: string;
  children?: React.ReactNode;
  className?: string;
};

const TabsContext = React.createContext<{ value: string; setValue: (v: string) => void } | null>(null);

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`inline-flex rounded-md border bg-white p-1 ${className}`} {...props} />
);

export const TabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }> = ({ value, className = '', children, ...props }) => {
  const ctx = React.useContext(TabsContext)!;
  const active = ctx.value === value;
  return (
    <button
      className={`px-3 py-1 text-sm rounded ${active ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'} ${className}`}
      onClick={() => ctx.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({ value, className = '', children, ...props }) => {
  const ctx = React.useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};
