// AI Price Compare Web - 加载组件

import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

function Loading({ size = 'md', text }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className={`${sizeClasses[size]} border-4 border-warm-200 border-t-primary-500 rounded-full animate-spin`}
      />
      {text && <p className="mt-4 text-warm-500">{text}</p>}
    </div>
  );
}

export default Loading;
