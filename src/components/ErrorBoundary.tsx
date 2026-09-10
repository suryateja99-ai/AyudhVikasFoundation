// @ts-nocheck
import React from 'react';

type BoundaryProps = { children?: React.ReactNode };
type BoundaryState = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state as BoundaryState;
    if (hasError) {
      return (
        <div className="p-6 text-center min-h-screen flex flex-col items-center justify-center bg-slate-50">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Something went wrong</h2>
          <p className="text-gray-600 mb-4 max-w-lg">{error?.message}</p>
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold cursor-pointer"
          >
            Go Home
          </button>
        </div>
      );
    }

    return (this as unknown as { props: BoundaryProps }).props.children;
  }
}
