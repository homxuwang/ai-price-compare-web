// OpenPriceHub · 加载 (浅色)

import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

function Loading({ size = 'md', text }: LoadingProps) {
  const dim = { sm: 'h-4 w-4', md: 'h-7 w-7', lg: 'h-10 w-10' }[size];
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className={`${dim} animate-spin rounded-full border-2 border-line border-t-primary`} />
      {text && <p className="mt-3 text-sm text-ink-2">{text}</p>}
    </div>
  );
}

export default Loading;
