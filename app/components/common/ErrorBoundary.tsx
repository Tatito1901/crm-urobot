/**
 * ============================================================
 * ERROR BOUNDARY - Captura errores de React
 * ============================================================
 * QUICK WIN #7: Error boundary mejorado con reset state
 * Captura errores de rendering de React y muestra UI de fallback
 */


import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Permite resetear el error sin recargar la página */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="text-red-400 text-2xl font-bold mb-4">Error</div>

          <h2 className="text-xl font-semibold text-red-100 mb-2">
            Algo salió mal
          </h2>

          <p className="text-red-200/80 text-sm mb-6 max-w-md text-center">
            {this.state.error?.message || 'Error desconocido'}
          </p>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={this.resetError}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-200 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
            >
              Recargar página
            </button>
          </div>

          {/* Detalles técnicos en desarrollo */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 max-w-lg w-full">
              <summary className="cursor-pointer text-xs text-red-300/60 hover:text-red-300">
                Detalles técnicos (solo en desarrollo)
              </summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-red-950/50 p-4 text-xs text-red-200 max-h-[300px]">
                {this.state.error.stack || this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para envolver componentes fácilmente
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
