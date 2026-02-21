/**
 * RecentTests — Resultados recientes de estudios
 * Estado vacío cuando no hay estudios programados.
 * Listo para conectarse a los módulos de diagnóstico real.
 */
import React from 'react'
import { FileText } from 'lucide-react'

export function RecentTests() {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mb-3 border border-blue-100">
                <FileText className="w-7 h-7 text-blue-300" />
            </div>
            <h4 className="text-sm font-bold text-slate-500 mb-1">Sin estudios recientes</h4>
            <p className="text-xs text-slate-400 text-center max-w-[240px]">
                Los resultados de laboratorio, audiometría y otros estudios aparecerán aquí cuando estén disponibles.
            </p>
        </div>
    )
}
