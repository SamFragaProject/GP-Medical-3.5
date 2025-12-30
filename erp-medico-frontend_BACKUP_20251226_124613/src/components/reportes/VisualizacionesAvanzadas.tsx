// Visualizaciones Avanzadas
import React from 'react'
import { motion } from 'framer-motion'
import { Activity, PieChart, BarChart3 } from 'lucide-react'

export function VisualizacionesAvanzadas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Activity className="h-6 w-6 text-violet-600 mr-2" />
            Visualizaciones Avanzadas
          </h2>
          <p className="text-gray-600">Gráficos 3D, mapas de calor, redes</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualizaciones Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="h-5 w-5 text-violet-600" />
              <span className="font-medium text-gray-900">Mapas de Calor</span>
            </div>
            <p className="text-sm text-gray-600">Distribución de riesgos por área</p>
            <div className="mt-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 h-4 rounded"></div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <PieChart className="h-5 w-5 text-violet-600" />
              <span className="font-medium text-gray-900">Gráficos 3D</span>
            </div>
            <p className="text-sm text-gray-600">Visualización tridimensional de datos</p>
            <div className="mt-3 bg-violet-100 h-4 rounded flex items-center justify-center">
              <span className="text-xs text-violet-700">3D View</span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="h-5 w-5 text-violet-600" />
              <span className="font-medium text-gray-900">Redes de Conexión</span>
            </div>
            <p className="text-sm text-gray-600">Relaciones entre empleados y riesgos</p>
            <div className="mt-3 bg-gray-100 h-4 rounded flex items-center justify-center">
              <span className="text-xs text-gray-600">Network View</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}