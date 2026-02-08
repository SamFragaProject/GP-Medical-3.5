import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-xl font-bold text-red-500 mb-4">Sistema Interrumpido</h1>
            <p className="text-slate-400 mb-6 text-sm">
              Se ha detectado una inconsistencia crítica en la sesión. Por favor, reinicie el protocolo de acceso.
            </p>
            <div className="bg-slate-950 p-4 rounded-lg mb-6 overflow-auto max-h-40 border border-slate-800">
              <code className="text-xs text-red-400 font-mono">
                {this.state.error?.toString()}
              </code>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
            >
              Reiniciar Sesión (Clear Cache)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
