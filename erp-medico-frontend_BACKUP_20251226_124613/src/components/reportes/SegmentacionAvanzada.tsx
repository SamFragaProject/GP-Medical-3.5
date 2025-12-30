// Segmentación Avanzada
import React from 'react'
import { motion } from 'framer-motion'
import { Layers, Users, Building2 } from 'lucide-react'

export function SegmentacionAvanzada() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Layers className="h-6 w-6 text-pink-600 mr-2" />
            Segmentación Avanzada
          </h2>
          <p className="text-gray-600">Filtros complejos por empresa, sede, empleado, departamento</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Segmentos de Datos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Building2 className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Por Empresa</span>
            </div>
            <p className="text-sm text-gray-600">6 empresas activas</p>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-gray-500">• Constructora SA (45 empleados)</div>
              <div className="text-xs text-gray-500">• Fábrica Industrial (123 empleados)</div>
              <div className="text-xs text-gray-500">• Laboratorio Farmacéutico (67 empleados)</div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Por Departamento</span>
            </div>
            <p className="text-sm text-gray-600">8 departamentos</p>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-gray-500">• Producción (456 empleados)</div>
              <div className="text-xs text-gray-500">• Administración (234 empleados)</div>
              <div className="text-xs text-gray-500">• Mantenimiento (89 empleados)</div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Layers className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Por Riesgo</span>
            </div>
            <p className="text-sm text-gray-600">3 niveles de riesgo</p>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-gray-500">• Alto riesgo (23 empleados)</div>
              <div className="text-xs text-gray-500">• Riesgo medio (89 empleados)</div>
              <div className="text-xs text-gray-500">• Bajo riesgo (1135 empleados)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}