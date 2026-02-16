import React from 'react';

/**
 * ErrorBoundary con detección automática de chunk loading errors.
 * 
 * Cuando se hace un deploy nuevo en Vercel, los nombres de los chunks JS cambian.
 * Si el browser tiene cacheado el index.html anterior, intenta cargar chunks que ya no existen,
 * resultando en "Failed to fetch dynamically imported module" errors.
 * 
 * Solución: detectar este tipo de error y hacer un reload automático (max 1 vez)
 * para que el browser obtenga el nuevo index.html con los nuevos nombres de chunks.
 */
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

    // Detectar errores de chunk loading (deploy nuevo con chunks renombrados)
    const isChunkError = error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Loading CSS chunk') ||
      error.message?.includes('ChunkLoadError') ||
      error.name === 'ChunkLoadError';

    if (isChunkError) {
      // Verificar si ya intentamos reload para evitar loops infinitos
      const lastReload = sessionStorage.getItem('chunk_error_reload');
      const now = Date.now();

      if (!lastReload || (now - parseInt(lastReload)) > 10000) {
        // Marcar el inicio del reload
        sessionStorage.setItem('chunk_error_reload', now.toString());
        console.warn('🔄 Chunk load error detectado (deploy nuevo). Recargando página...');

        // Force reload bypassing cache
        window.location.reload();
        return;
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Verificar si es un chunk error - intentar reload automático
      const isChunkError = this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.message?.includes('ChunkLoadError');

      if (isChunkError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Actualizando Sistema</h1>
              <p className="text-slate-400 mb-6 text-sm">
                Se detectó una nueva versión. Recargando automáticamente...
              </p>
              <button
                onClick={() => {
                  sessionStorage.removeItem('chunk_error_reload');
                  window.location.reload();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
              >
                Recargar Ahora
              </button>
            </div>
          </div>
        );
      }

      // Error genérico (no chunk error)
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
                // Solo limpiar auth data, NO el usuario guardado
                const keysToRemove = Object.keys(localStorage).filter(k =>
                  k.includes('supabase') || k.includes('sb-')
                );
                keysToRemove.forEach(k => localStorage.removeItem(k));
                sessionStorage.removeItem('chunk_error_reload');
                window.location.href = '/login';
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
            >
              Reiniciar Sesión
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
