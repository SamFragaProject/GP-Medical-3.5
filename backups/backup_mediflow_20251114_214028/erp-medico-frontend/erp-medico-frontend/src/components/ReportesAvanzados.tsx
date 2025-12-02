// Componente de Reportes Avanzados para Exámenes Ocupacionales
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Building2,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  Target,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ReporteData {
  id: string
  titulo: string
  tipo: 'individual' | 'empresarial' | 'normativo' | 'predictivo'
  fechaGeneracion: string
  generadoPor: string
  datos: any
}

export function ReportesAvanzados() {
  const [tipoReporte, setTipoReporte] = useState<'individual' | 'empresarial' | 'normativo' | 'predictivo'>('individual')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('')
  const [mostrandoReporte, setMostrandoReporte] = useState(false)

  const empresas = [
    'Todas las empresas',
    'Constructora SA',
    'Oficinas Corporativas',
    'Fábrica Industrial',
    'Laboratorio Farmacéutico',
    'Transportes Unidos'
  ]

  const tiposReporte = [
    {
      id: 'individual',
      titulo: 'Reporte Individual',
      descripcion: 'Reporte detallado de un empleado específico',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'empresarial',
      titulo: 'Reporte Empresarial',
      descripcion: 'Resumen de salud ocupacional por empresa',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'normativo',
      titulo: 'Cumplimiento Normativo',
      descripcion: 'Estado de cumplimiento con normativas mexicanas',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'predictivo',
      titulo: 'Analytics Predictivos',
      descripcion: 'Análisis predictivo de tendencias y riesgos',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const reportesSimulados: ReporteData[] = [
    {
      id: 'REP001',
      titulo: 'Reporte Individual - Juan Pérez García',
      tipo: 'individual',
      fechaGeneracion: '2025-11-01',
      generadoPor: 'Sistema Automático',
      datos: {
        empleado: 'Juan Pérez García',
        empresa: 'Constructora SA',
        examenesTotales: 5,
        ultimoExamen: '2025-10-28',
        aptoParaTrabajar: true,
        proximoVencimiento: '2026-10-28'
      }
    },
    {
      id: 'REP002',
      titulo: 'Reporte Empresarial - Constructora SA',
      tipo: 'empresarial',
      fechaGeneracion: '2025-11-01',
      generadoPor: 'Sistema Automático',
      datos: {
        empresa: 'Constructora SA',
        empleadosTotales: 45,
        examenesRealizados: 38,
        tasaAptitud: 92,
        examenesPendientes: 7,
        cumplimientoNormativo: 89
      }
    }
  ]

  const handleGenerarReporte = () => {
    if (tipoReporte === 'individual' && !empresaSeleccionada) {
      toast.error('Seleccione un empleado para el reporte individual')
      return
    }
    
    toast.success(`Generando reporte ${tipoReporte}...`)
    setMostrandoReporte(true)
    
    setTimeout(() => {
      toast.success('Reporte generado exitosamente')
      setMostrandoReporte(false)
    }, 2000)
  }

  const handleDescargarReporte = (reporte: ReporteData) => {
    toast.success(`Descargando ${reporte.titulo}...`)
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'individual': return 'text-blue-600 bg-blue-100'
      case 'empresarial': return 'text-green-600 bg-green-100'
      case 'normativo': return 'text-purple-600 bg-purple-100'
      case 'predictivo': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const renderFormularioReporte = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Nuevo Reporte</h3>
      
      <div className="space-y-6">
        {/* Selección de tipo de reporte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Reporte
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tiposReporte.map((tipo) => (
              <motion.button
                key={tipo.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTipoReporte(tipo.id as any)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  tipoReporte === tipo.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${tipo.bgColor}`}>
                    <tipo.icon className={`h-6 w-6 ${tipo.color}`} />
                  </div>
                  <h4 className="font-semibold text-gray-900">{tipo.titulo}</h4>
                </div>
                <p className="text-sm text-gray-600">{tipo.descripcion}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <select
              value={empresaSeleccionada}
              onChange={(e) => setEmpresaSeleccionada(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar empresa</option>
              {empresas.slice(1).map((empresa) => (
                <option key={empresa} value={empresa}>{empresa}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Opciones adicionales */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Opciones de Reporte</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-200 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-700">Incluir gráficos y visualizaciones</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-200 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-700">Enviar por email después de generar</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-200 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-700">Programar generación automática</span>
            </label>
          </div>
        </div>

        {/* Botón generar */}
        <div className="pt-4">
          <button
            onClick={handleGenerarReporte}
            disabled={mostrandoReporte}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {mostrandoReporte ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generando Reporte...</span>
              </>
            ) : (
              <>
                <FileText size={20} />
                <span>Generar Reporte</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  const renderReportesGuardados = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Reportes Recientes</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {reportesSimulados.map((reporte) => (
            <motion.div
              key={reporte.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${tiposReporte.find(t => t.id === reporte.tipo)?.bgColor}`}>
                    <FileText className={`h-6 w-6 ${tiposReporte.find(t => t.id === reporte.tipo)?.color}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{reporte.titulo}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTipoColor(reporte.tipo)}`}>
                        {reporte.tipo}
                      </span>
                      <span className="text-xs text-gray-500">
                        {reporte.fechaGeneracion}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDescargarReporte(reporte)}
                  className="flex items-center space-x-2 text-primary hover:text-primary/80 font-medium text-sm"
                >
                  <Download size={16} />
                  <span>Descargar</span>
                </button>
              </div>

              {/* Contenido del reporte */}
              <div className="bg-gray-50 rounded-lg p-4">
                {reporte.tipo === 'individual' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Empleado:</span>
                      <p className="text-gray-900">{reporte.datos.empleado}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Empresa:</span>
                      <p className="text-gray-900">{reporte.datos.empresa}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Exámenes Totales:</span>
                      <p className="text-gray-900">{reporte.datos.examenesTotales}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Último Examen:</span>
                      <p className="text-gray-900">{reporte.datos.ultimoExamen}</p>
                    </div>
                  </div>
                )}
                
                {reporte.tipo === 'empresarial' && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Empleados:</span>
                      <p className="text-gray-900">{reporte.datos.empleadosTotales}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Exámenes:</span>
                      <p className="text-gray-900">{reporte.datos.examenesRealizados}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Tasa de Aptitud:</span>
                      <p className="text-green-600 font-semibold">{reporte.datos.tasaAptitud}%</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )

  const renderAnalyticsPredictivos = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Analytics Predictivos</h3>
      
      {/* Métricas predictivas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Riesgo de Incapacidad</h4>
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Nivel de Riesgo</span>
                <span className="font-medium text-red-600">Alto</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              3 empleados en riesgo alto por exposición a agentes químicos
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Tendencia de Ausentismo</h4>
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tendencia</span>
                <span className="font-medium text-green-600">Decreciente</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Reducción del 15% en ausentismo por causas médicas
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Cumplimiento Futuro</h4>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Proyección</span>
                <span className="font-medium text-blue-600">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Meta de cumplimiento para el próximo trimestre
            </p>
          </div>
        </div>
      </div>

      {/* Alertas predictivas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Alertas Predictivas</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">Pico de Exámenes</p>
                <p className="text-sm text-gray-600">Se esperan 25 exámenes en las próximas 2 semanas</p>
              </div>
            </div>
            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
              Próxima semana
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">Riesgo de Sanciones</p>
                <p className="text-sm text-gray-600">2 empresas con riesgo de incumplimiento normativo</p>
              </div>
            </div>
            <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full">
              Crítico
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes & Analytics</h2>
          <p className="text-gray-600">Análisis detallado y reportes de salud ocupacional</p>
        </div>
      </div>

      {/* Navegación por tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {[
          { id: 'generar', name: 'Generar Reporte', icon: FileText },
          { id: 'guardados', name: 'Reportes Guardados', icon: Calendar },
          { id: 'predictivos', name: 'Analytics Predictivos', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              const tabElement = document.querySelector(`[data-tab="${tab.id}"]`) as HTMLElement
              if (tabElement) tabElement.click()
            }}
            className="flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700"
          >
            <tab.icon size={18} />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      <div className="space-y-6">
        {renderFormularioReporte()}
        {renderReportesGuardados()}
        {renderAnalyticsPredictivos()}
      </div>
    </div>
  )
}