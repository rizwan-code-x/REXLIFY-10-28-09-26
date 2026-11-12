/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900/90 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold font-mono text-white">System Auto-Recovery Active</h1>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {this.state.error?.message || 'A transient operation or layout issue was safely isolated. Your saved state and credentials remain intact.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-xs transition-all cursor-pointer shadow-lg shadow-purple-500/20"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = '#home';
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold font-mono text-xs transition-all cursor-pointer"
              >
                <Home size={14} />
                <span>Return to Hub</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
