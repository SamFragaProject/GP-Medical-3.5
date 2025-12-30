// Análisis de Tendencias para medicina del trabajo
import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react'

export function AnalisisTendencias() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="h-6 w-6 text-indigo-600 mr-2" />
            Análisis de Tendencias
          </h2>
          <p className="text-gray-600">Identificación de patrones en salud ocupacional</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias Identificadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Reducción de Incapacidades</span>
            </div>
            <p className="text-sm text-gray-600">Tendencia decreciente del 15% en incapacidades laborales</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Mejora en Cumplimiento</span>
            </div>
            <p className="text-sm text-gray-600">Incremento del 8% en cumplimiento normativo</p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Estacionalidad</span>
            </div>
            <p className="text-sm text-gray-600">Picos de ausentismo en enero y septiembre</p>
          </div>
        </div>
      </div>
    </div>
  )
}