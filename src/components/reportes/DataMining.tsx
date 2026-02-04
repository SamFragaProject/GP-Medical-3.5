// Data Mining
import React from 'react'
import { motion } from 'framer-motion'
import { Database, Search, Brain } from 'lucide-react'

export function DataMining() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Database className="h-6 w-6 text-cyan-600 mr-2" />
            Data Mining
          </h2>
          <p className="text-gray-600">Análisis profundo de patrones de datos</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patrones Descubiertos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Search className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Correlaciones Encontradas</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Edad y riesgo cardiovascular: 0.73</li>
              <li>• Antigüedad y ausentismo: -0.45</li>
              <li>• Exposición química y síntomas: 0.89</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Clusters Identificados</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Grupo A: Alto riesgo, nueva contratación</li>
              <li>• Grupo B: Riesgo medio, experiencia media</li>
              <li>• Grupo C: Bajo riesgo, veterano</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
