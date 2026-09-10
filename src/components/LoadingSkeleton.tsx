import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; type?: 'card' | 'table' | 'text' }> = ({
  count = 3,
  type = 'card',
}) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          {type === 'card' && <div className="bg-gray-200 h-40 rounded mb-4" />}
          {type === 'table' && <div className="bg-gray-200 h-12 rounded mb-2" />}
          {type === 'text' && <div className="bg-gray-200 h-4 rounded mb-2 w-3/4" />}
        </div>
      ))}
    </div>
  );
};
