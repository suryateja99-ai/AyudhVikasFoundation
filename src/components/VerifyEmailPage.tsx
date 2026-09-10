import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { HeartPulse } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    api
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Email verified! Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((err: Error) => {
        setStatus('error');
        setMessage(err.message || 'Verification failed');
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="text-center bg-white border border-slate-200 rounded-2xl p-8 max-w-md shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center text-emerald-700 mb-4">
          <HeartPulse className="w-6 h-6" />
        </div>
        {status === 'loading' && <p className="font-bold text-slate-700">Verifying your email...</p>}
        {status === 'success' && <p className="text-green-600 font-bold">{message}</p>}
        {status === 'error' && (
          <>
            <p className="text-red-600 font-bold">{message}</p>
            <Link to="/login" className="inline-block mt-4 text-sm font-black text-emerald-700 underline">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
