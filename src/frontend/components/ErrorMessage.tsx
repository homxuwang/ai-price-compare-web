// AI Price Compare Web - 错误提示组件

import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="card bg-red-50 border-red-200 text-center py-8">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <p className="text-red-700 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          重试
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
