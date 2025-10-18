"use client";
import * as React from 'react';
import Link from 'next/link';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  children?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'default',
  size = 'md',
  asChild = false,
  children,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center rounded-md transition-colors font-medium';
  const variants: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border-2 border-slate-600 text-slate-200 hover:bg-slate-800 hover:border-slate-500',
    ghost: 'text-slate-300 hover:bg-slate-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes: Record<string, string> = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (asChild && React.isValidElement(children)) {
    // Render child (e.g., Link) with button styles
    return React.cloneElement(children as any, {
      className: `${(children as any).props.className || ''} ${classes}`.trim(),
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
