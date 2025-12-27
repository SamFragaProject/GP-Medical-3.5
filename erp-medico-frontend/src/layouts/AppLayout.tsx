import React from 'react'
import { Outlet } from 'react-router-dom'
import { SpectacularSidebar } from '@/components/navigation/SpectacularSidebar'
import { Toaster } from 'react-hot-toast'

/**
 * AppLayout: Layout principal para la aplicación Tenant (Médicos, Clínicas)
 * Utiliza el Sidebar estándar pero se asegura de que el contexto sea 'App'.
 */
export function AppLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Sidebar estándar - Maneja roles de clínica */}
            <SpectacularSidebar />

            <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out relative z-0">
                <div className="container mx-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
