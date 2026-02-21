/**
 * HealthOverviewChart — Gráfica de resumen de salud
 * Muestra estado vacío cuando no hay datos poblacionales.
 * Listo para conectarse a la data de signos vitales real.
 */
import React from 'react'
import { BarChart3 } from 'lucide-react'

export function HealthOverviewChart() {
    return (
        <div className="h-72 w-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
                <BarChart3 className="w-8 h-8 text-emerald-300" />
            </div>
            <h4 className="text-sm font-bold text-slate-500 mb-1">Sin datos poblacionales</h4>
            <p className="text-xs text-slate-400 text-center max-w-[280px]">
                Las tendencias de salud de los trabajadores (ritmo cardíaco, presión, glucosa) se mostrarán aquí cuando haya registros suficientes.
            </p>
        </div>
    )
}
