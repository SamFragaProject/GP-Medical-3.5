// ROI Analytics
import React from 'react'
import { motion } from 'framer-motion'
import { Award, TrendingUp, DollarSign } from 'lucide-react'

export function ROIAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Award className="h-6 w-6 text-amber-600 mr-2" />
            ROI Analytics
          </h2>
          <p className="text-gray-600">Análisis de retorno de inversión en salud</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI Actual</p>
              <p className="text-3xl font-bold text-amber-600">3.8x</p>
              <p className="text-sm text-gray-600">Retorno por peso invertido</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Award className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ahorro Anual</p>
              <p className="text-3xl font-bold text-green-600">$2.4M</p>
              <p className="text-sm text-gray-600">En costos médicos</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tendencia</p>
              <p className="text-3xl font-bold text-blue-600">+12%</p>
              <p className="text-sm text-gray-600">Mejora vs año anterior</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose de Beneficios</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Reducción de Incapacidades</span>
              <span className="text-green-600 font-semibold">$890,000</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">15% menos días perdidos por enfermedad</p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Menor Rotación de Personal</span>
              <span className="text-blue-600 font-semibold">$650,000</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Reducción del 8% en rotación laboral</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Prevención de Accidentes</span>
              <span className="text-purple-600 font-semibold">$520,000</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">23% menos incidentes laborales</p>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Optimización de Costos</span>
              <span className="text-amber-600 font-semibold">$340,000</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Mejores tarifas en seguros médicos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
