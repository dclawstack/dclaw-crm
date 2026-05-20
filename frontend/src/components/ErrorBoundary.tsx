"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[#F5C6C4] bg-[#FBE9E7] p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-[#B3261E]">Something went wrong</p>
          <p className="mt-1 text-xs text-[#7A7A85]">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 rounded-full border border-[#F5C6C4] px-4 py-1.5 text-xs text-[#B3261E] hover:bg-[#F5C6C4] transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
