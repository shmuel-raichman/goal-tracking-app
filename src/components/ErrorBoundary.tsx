import React, { Component } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  props: ErrorBoundaryProps;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
          <pre className="bg-[var(--bg-card)] p-4 rounded-lg text-xs overflow-auto max-w-full text-left whitespace-pre-wrap">
            {this.state.error?.message}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 bg-blue-500 px-6 py-2 rounded-full font-bold">
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
