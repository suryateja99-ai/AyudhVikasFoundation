import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
      {icon && <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">{icon}</div>}
      <h3 className="text-base font-black text-slate-900">{title}</h3>
      {message && <p className="text-xs text-slate-500 font-semibold mt-1 max-w-md mx-auto">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-lg cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
