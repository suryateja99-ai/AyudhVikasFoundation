import React from 'react';

interface ErrorMessageProps {
  error?: string | Error | null;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  const message = typeof error === 'string' ? error : error?.message || 'Something went wrong. Please try again.';
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-center">
      <p className="text-sm font-bold">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 bg-rose-600 text-white text-xs font-black px-4 py-2 rounded-lg cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
};
