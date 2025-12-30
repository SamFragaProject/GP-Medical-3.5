import React from 'react'
import { Outlet } from 'react-router-dom'
import { SpectacularSidebar } from '@/components/navigation/SpectacularSidebar'
import { Toaster } from 'react-hot-toast'

/**
 * PlatformLayout: Layout para la administración SaaS (Super Admin, Soporte)
 * Estilo visual distinto para diferenciarlo de la app clínica.
 */
export function PlatformLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-100">
            {/* 
              TODO: En el futuro, podríamos pasar un prop 'variant="platform"' 
              a SpectacularSidebar para cambiar su color (ej. Púrpura SaaS).
              Por ahora, reutilizamos el sidebar que ya filtra por roles (Super Admin).
            */}
            <SpectacularSidebar />

            <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out relative z-0">
                {/* Banner distintivo de entorno Plataforma */}
                <div className="bg-slate-900 text-xs text-slate-400 py-1 px-4 text-center border-b border-slate-800">
                    🔧 PLATFORM ADMIN CONSOLE - ACCESS LEVEL: SUPER_ADMIN
                </div>

                <div className="container mx-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
