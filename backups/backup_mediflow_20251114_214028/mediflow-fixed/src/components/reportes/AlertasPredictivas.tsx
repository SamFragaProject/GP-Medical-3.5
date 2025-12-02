// Alertas Predictivas
import React from 'react'
import { motion } from 'framer-motion'
import { Zap, AlertTriangle, Target } from 'lucide-react'

export function AlertasPredictivas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Zap className="h-6 w-6 text-yellow-600 mr-2" />
            Alertas Predictivas
          </h2>
          <p className="text-gray-600">Notificaciones basadas en análisis de datos</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Activas</h3>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Riesgo Alto - Exposición Química</p>
                  <p className="text-sm text-gray-600">Probabilidad 78% de incremento en riesgos</p>
                </div>
              </div>
              <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full">Crítico</span>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Cumplimiento Próximo</p>
                  <p className="text-sm text-gray-600">2 empresas cerca del umbral mínimo</p>
                </div>
              </div>
              <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">Atención</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}