// Reportes de Cumplimiento Normativo para medicina del trabajo
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText,
  Calendar,
  Users,
  Building2,
  Target,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react'

interface ReportesComplianceProps {
  filtros: any
}

export function ReportesCompliance({ filtros }: ReportesComplianceProps) {
  const normasMexicanas = [
    {
      id: 'NOM-017-STPS-1993',
      nombre: 'Identificación y clasificación de sustancias químicas',
      categoria: 'Químicos',
      cumplimiento: 98,
      empleadosAfectados: 145,
      estado: 'compliant',
      ultimaAuditoria: '2025-09-15',
      proximaRevision: '2026-03-15'
    },
    {
      id: 'NOM-006-STPS-2014',
      nombre: 'Manejo y almacenamiento de materiales',
      categoria: 'Físicos',
      cumplimiento: 94,
      empleadosAfectados: 89,
      estado: 'warning',
      ultimaAuditoria: '2025-08-20',
      proximaRevision: '2026-02-20'
    },
    {
      id: 'NOM-015-STPS-2001',
      nombre: 'Condiciones térmicas ambientales',
      categoria: 'Físicos',
      cumplimiento: 91,
      empleadosAfectados: 67,
      estado: 'warning',
      ultimaAuditoria: '2025-07-10',
      proximaRevision: '2026-01-10'
    },
    {
      id: 'NOM-010-STPS-1999',
      nombre: 'Contaminación por ruidos',
      categoria: 'Físicos',
      cumplimiento: 96,
      empleadosAfectados: 112,
      estado: 'compliant',
      ultimaAuditoria: '2025-10-05',
      proximaRevision: '2026-04-05'
    },
    {
      id: 'NOM-020-STPS-2002',
      nombre: 'Contenedores y recipientes',
      categoria: 'Seguridad',
      cumplimiento: 87,
      empleadosAfectados: 156,
      estado: 'critical',
      ultimaAuditoria: '2025-06-30',
      proximaRevision: '2025-12-30'
    },
    {
      id: 'NOM-009-STPS-2011',
      nombre: 'Construcción',
      categoria: 'Seguridad',
      cumplimiento: 99,
      empleadosAfectados: 78,
      estado: 'compliant',
      ultimaAuditoria: '2025-10-20',
      proximaRevision: '2026-04-20'
    }
  ]

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'compliant': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle }
      case 'warning': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: AlertTriangle }
      case 'critical': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: XCircle }
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: AlertTriangle }
    }
  }

  const getCumplimientoColor = (porcentaje: number) => {
    if (porcentaje >= 95) return 'text-green-600'
    if (porcentaje >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 text-red-600 mr-2" />
            Reportes de Cumplimiento
          </h2>
          <p className="text-gray-600">Estado de cumplimiento con normativas mexicanas</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Cumplimiento General</p>
          <p className="text-3xl font-bold text-primary">
            {Math.round(normasMexicanas.reduce((acc, n) => acc + n.cumplimiento, 0) / normasMexicanas.length)}%
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Normativas</p>
              <p className="text-3xl font-bold text-gray-900">{normasMexicanas.length}</p>
              <p className="text-sm text-gray-600">Total evaluadas</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cumplimiento</p>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(normasMexicanas.filter(n => n.cumplimiento >= 95).length)}
              </p>
              <p className="text-sm text-gray-600">Normas al 100%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertas</p>
              <p className="text-3xl font-bold text-red-600">
                {normasMexicanas.filter(n => n.cumplimiento < 90).length}
              </p>
              <p className="text-sm text-gray-600">Requieren atención</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empleados</p>
              <p className="text-3xl font-bold text-purple-600">
                {normasMexicanas.reduce((acc, n) => acc + n.empleadosAfectados, 0)}
              </p>
              <p className="text-sm text-gray-600">Afectados total</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lista de normativas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Estado por Normativa</h3>
        <div className="space-y-4">
          {normasMexicanas.map((norma, index) => {
            const estado = getEstadoColor(norma.estado)
            const Icon = estado.icon
            
            return (
              <motion.div
                key={norma.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-lg border-2 ${estado.border} ${estado.bg}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-6 w-6 ${estado.text}`} />
                    <div>
                      <h4 className="font-semibold text-gray-900">{norma.id}</h4>
                      <p className="text-sm text-gray-600">{norma.nombre}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getCumplimientoColor(norma.cumplimiento)}`}>
                      {norma.cumplimiento}%
                    </p>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${estado.bg} ${estado.text}`}>
                      {norma.estado === 'compliant' ? 'Cumpliendo' : 
                       norma.estado === 'warning' ? 'Atención' : 'Crítico'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Categoría:</span>
                    <p className="font-medium text-gray-900">{norma.categoria}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Empleados:</span>
                    <p className="font-medium text-gray-900">{norma.empleadosAfectados}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Última Auditoría:</span>
                    <p className="font-medium text-gray-900">{norma.ultimaAuditoria}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Próxima Revisión:</span>
                    <p className="font-medium text-gray-900">{norma.proximaRevision}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progreso de Cumplimiento</span>
                    <span className="font-medium">{norma.cumplimiento}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        norma.cumplimiento >= 95 ? 'bg-green-600' :
                        norma.cumplimiento >= 85 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${norma.cumplimiento}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Alertas de cumplimiento */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas de Cumplimiento</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">Riesgo de Infracción</p>
                <p className="text-sm text-gray-600">NOM-020-STPS-2002 por debajo del 90% de cumplimiento</p>
              </div>
            </div>
            <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full">
              Crítico
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">Revisiones Próximas</p>
                <p className="text-sm text-gray-600">3 normativas requieren auditoría en los próximos 30 días</p>
              </div>
            </div>
            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
              Importante
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Excelente Cumplimiento</p>
                <p className="text-sm text-gray-600">4 normativas al 95% o más de cumplimiento</p>
              </div>
            </div>
            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
              Óptimo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}