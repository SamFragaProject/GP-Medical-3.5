// Reportes Programados
import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, RefreshCw } from 'lucide-react'

export function ReportesProgramados() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Clock className="h-6 w-6 text-gray-600 mr-2" />
            Reportes Programados
          </h2>
          <p className="text-gray-600">Generación automática periódica</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Programaciones Activas</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Reporte Semanal Ejecutivo</h4>
                <p className="text-sm text-gray-600">Cada lunes a las 8:00 AM</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Análisis Mensual Compliance</h4>
                <p className="text-sm text-gray-600">Primer día del mes a las 9:00 AM</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Dashboard Diario</h4>
                <p className="text-sm text-gray-600">Todos los días a las 7:00 AM</p>
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Pausado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
