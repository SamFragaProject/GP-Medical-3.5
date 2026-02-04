// Benchmarking
import React from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Award } from 'lucide-react'

export function Benchmarking() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Target className="h-6 w-6 text-teal-600 mr-2" />
            Benchmarking
          </h2>
          <p className="text-gray-600">Comparación entre empresas y sectores</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparación Sectorial</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Award className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-gray-900">Nuestro Desempeño</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cumplimiento:</span>
                <span className="text-sm font-medium text-gray-900">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ausentismo:</span>
                <span className="text-sm font-medium text-gray-900">4.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ROI:</span>
                <span className="text-sm font-medium text-gray-900">3.8x</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">Promedio Sector</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cumplimiento:</span>
                <span className="text-sm font-medium text-gray-900">89.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ausentismo:</span>
                <span className="text-sm font-medium text-gray-900">5.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ROI:</span>
                <span className="text-sm font-medium text-gray-900">2.9x</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Mejor del Sector</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cumplimiento:</span>
                <span className="text-sm font-medium text-gray-900">97.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ausentismo:</span>
                <span className="text-sm font-medium text-gray-900">2.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ROI:</span>
                <span className="text-sm font-medium text-gray-900">5.2x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
