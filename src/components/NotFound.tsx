import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md shadow-sm">
        <p className="text-5xl font-black text-[#0f2e5a]">404</p>
        <h1 className="text-xl font-black text-slate-900 mt-2">Page not found</h1>
        <p className="text-sm text-slate-500 font-semibold mt-2">The page you requested is not available in the Ayudh Vikas network.</p>
        <Link
          to="/"
          className="inline-block mt-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-5 py-2.5 rounded-lg"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};
