import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm m-2">
          <h2 className="font-bold flex items-center gap-2 mb-2">
            ⚠️ Falha ao renderizar: {this.props.title || 'Componente'}
          </h2>
          <p className="text-sm font-medium">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
