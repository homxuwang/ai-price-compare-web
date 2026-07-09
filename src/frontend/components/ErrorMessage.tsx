// OpenPriceHub · 错误提示 (浅色)

import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-card border border-danger/30 bg-danger-soft/60 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-danger">
        <span className="badge badge-dot bg-danger-soft text-danger">错误</span>
        <span>读取失败</span>
      </div>
      <p className="mt-2 text-sm text-ink">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4 !py-2 text-xs">
          重试
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
