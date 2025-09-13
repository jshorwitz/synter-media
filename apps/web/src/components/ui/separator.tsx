import * as React from 'react';

export const Separator: React.FC<React.HTMLAttributes<HTMLHRElement>> = ({ className = '', ...props }) => (
  <hr className={`border-slate-200 ${className}`} {...props} />
);
