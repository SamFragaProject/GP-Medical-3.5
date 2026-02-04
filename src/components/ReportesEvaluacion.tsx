// Componente de Reportes de Evaluación
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Eye,
  Share2,
  Calendar,
  Building,
  User,
  MapPin,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Printer,
  Mail,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import toast from 'react-hot-toast'

// Interfaces para datos de gráficos
interface RiesgoPorCategoriaData {
  categoria: string
  valor: number
  color: string
}

interface EvolucionRiesgoData {
  mes: string
  riesgo: number
}

interface CumplimientoNormativoData {
  norma: string
  actual: number
  objetivo: number
}

interface TooltipFormatterProps {
  value: any
  name: string
}

interface ReporteEvaluacion {
  id: string
  evaluacion_id: string
  titulo: string
  tipo_reporte: 'completo' | 'ejecutivo' | 'tecnico' | 'comparativo' | 'seguimiento'
  empresa: string
  sede: string
  empleado: string
  puesto: string
  fecha_evaluacion: string
  fecha_generacion: string
  estado: 'borrador' | 'generado' | 'enviado' | 'aprobado'
  secciones: SeccionReporte[]
  metricas_principales: MetricaPrincipal[]
  archivos_adjuntos: string[]
  configuracion: ConfiguracionReporte
}

interface SeccionReporte {
  id: string
  titulo: string
  contenido: string
  tipo: 'resumen' | 'analisis' | 'recomendaciones' | 'cumplimiento' | 'anexos'
  orden: number
  incluir: boolean
  graficos?: any[]
}

interface MetricaPrincipal {
  nombre: string
  valor: number
  unidad: string
  tendencia: 'subiendo' | 'bajando' | 'estable'
  valor_anterior?: number
  objetivo?: number
  estado: 'optimo' | 'aceptable' | 'critico'
}

interface ConfiguracionReporte {
  incluir_graficos: boolean
  incluir_fotos: boolean
  nivel_detalle: 'basico' | 'detallado' | 'completo'
  incluir_recomendaciones_ia: boolean
  incluir_cumplimiento_normativo: boolean
  formato_preferido: 'pdf' | 'html' | 'docx'
  idioma: 'es' | 'en'
}

interface ReportesEvaluacionProps {
  evaluacionId: string
  datosEvaluacion?: any
  onReporteGenerated?: (reporte: ReporteEvaluacion) => void
}

export function ReportesEvaluacion({ evaluacionId, datosEvaluacion, onReporteGenerated }: ReportesEvaluacionProps) {
  const [reportes, setReportes] = useState<ReporteEvaluacion[]>([])
  const [vistaPrevia, setVistaPrevia] = useState<ReporteEvaluacion | null>(null)
  const [generando, setGenerando] = useState(false)
  const [configuracion, setConfiguracion] = useState<ConfiguracionReporte>({
    incluir_graficos: true,
    incluir_fotos: true,
    nivel_detalle: 'completo',
    incluir_recomendaciones_ia: true,
    incluir_cumplimiento_normativo: true,
    formato_preferido: 'pdf',
    idioma: 'es'
  })
  const [nuevoReporte, setNuevoReporte] = useState({
    titulo: '',
    tipo_reporte: 'completo' as ReporteEvaluacion['tipo_reporte'],
    empresa: '',
    sede: '',
    empleado: '',
    puesto: ''
  })

  const tiposReporte = [
    {
      tipo: 'completo' as const,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
      label: 'Reporte Completo',
      descripcion: 'Análisis integral con todos los detalles técnicos'
    },
    {
      tipo: 'ejecutivo' as const,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      label: 'Reporte Ejecutivo',
      descripcion: 'Resumen para directivos con métricas clave'
    },
    {
      tipo: 'tecnico' as const,
      icon: BarChart3,
      color: 'bg-purple-100 text-purple-600',
      label: 'Reporte Técnico',
      descripcion: 'Análisis detallado para especialistas'
    },
    {
      tipo: 'comparativo' as const,
      icon: PieChart,
      color: 'bg-orange-100 text-orange-600',
      label: 'Análisis Comparativo',
      descripcion: 'Comparación entre evaluaciones y benchmark'
    },
    {
      tipo: 'seguimiento' as const,
      icon: Target,
      color: 'bg-cyan-100 text-cyan-600',
      label: 'Reporte de Seguimiento',
      descripcion: 'Evolución de implementación de mejoras'
    }
  ]

  const generarReporte = async () => {
    try {
      setGenerando(true)
      toast.loading('Generando reporte técnico...', { id: 'generar-reporte' })

      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 3000))

      const nuevoReporteCompleto: ReporteEvaluacion = {
        id: Date.now().toString(),
        evaluacion_id: evaluacionId,
        titulo: nuevoReporte.titulo || `Reporte de Evaluación - ${new Date().toLocaleDateString('es-ES')}`,
        tipo_reporte: nuevoReporte.tipo_reporte,
        empresa: nuevoReporte.empresa || 'Empresa Ejemplo SA',
        sede: nuevoReporte.sede || 'Sede Principal',
        empleado: nuevoReporte.empleado || 'Empleado Evaluado',
        puesto: nuevoReporte.puesto || 'Puesto de Trabajo',
        fecha_evaluacion: new Date().toISOString(),
        fecha_generacion: new Date().toISOString(),
        estado: 'generado',
        secciones: generarSeccionesReporte(configuracion),
        metricas_principales: generarMetricasPrincipales(),
        archivos_adjuntos: ['mapa-calor.png', 'mediciones-ambientales.pdf', 'fotos-puesto.jpg'],
        configuracion: { ...configuracion }
      }

      setReportes([...reportes, nuevoReporteCompleto])
      onReporteGenerated?.(nuevoReporteCompleto)
      
      toast.success('Reporte generado exitosamente', { id: 'generar-reporte' })
      
      // Simular descarga automática
      setTimeout(() => {
        descargarReporte(nuevoReporteCompleto)
      }, 1000)

    } catch (error) {
      console.error('Error generando reporte:', error)
      toast.error('Error al generar el reporte', { id: 'generar-reporte' })
    } finally {
      setGenerando(false)
    }
  }

  const generarSeccionesReporte = (config: ConfiguracionReporte): SeccionReporte[] => {
    const secciones: SeccionReporte[] = [
      {
        id: '1',
        titulo: 'Resumen Ejecutivo',
        contenido: 'Evaluación ergonómica integral del puesto de trabajo...',
        tipo: 'resumen',
        orden: 1,
        incluir: true
      },
      {
        id: '2',
        titulo: 'Análisis de Riesgos Identificados',
        contenido: 'Se identificaron riesgos de tipo musculoesquelético...',
        tipo: 'analisis',
        orden: 2,
        incluir: config.nivel_detalle !== 'basico'
      }
    ]

    if (config.incluir_recomendaciones_ia) {
      secciones.push({
        id: '3',
        titulo: 'Recomendaciones Automáticas IA',
        contenido: 'Basado en algoritmos de inteligencia artificial...',
        tipo: 'recomendaciones',
        orden: 3,
        incluir: true,
        graficos: []
      })
    }

    if (config.incluir_cumplimiento_normativo) {
      secciones.push({
        id: '4',
        titulo: 'Cumplimiento Normativo',
        contenido: 'Análisis de cumplimiento con NOM-006-STPS...',
        tipo: 'cumplimiento',
        orden: 4,
        incluir: true
      })
    }

    return secciones
  }

  const generarMetricasPrincipales = (): MetricaPrincipal[] => {
    return [
      {
        nombre: 'Score de Riesgo General',
        valor: 68,
        unidad: '%',
        tendencia: 'bajando',
        valor_anterior: 75,
        objetivo: 50,
        estado: 'aceptable'
      },
      {
        nombre: 'Cumplimiento Normativo',
        valor: 87,
        unidad: '%',
        tendencia: 'subiendo',
        valor_anterior: 82,
        objetivo: 95,
        estado: 'aceptable'
      },
      {
        nombre: 'Implementación de Recomendaciones',
        valor: 65,
        unidad: '%',
        tendencia: 'subiendo',
        valor_anterior: 45,
        objetivo: 90,
        estado: 'aceptable'
      }
    ]
  }

  const descargarReporte = (reporte: ReporteEvaluacion) => {
    // Simular descarga de archivo
    const element = document.createElement('a')
    const file = new Blob(['Contenido del reporte PDF'], { type: 'application/pdf' })
    element.href = URL.createObjectURL(file)
    element.download = `${reporte.titulo.replace(/\s+/g, '-')}.pdf`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    
    toast.success('Reporte descargado exitosamente')
  }

  const compartirReporte = (reporte: ReporteEvaluacion) => {
    const urlReporte = `${window.location.origin}/reportes/${reporte.id}`
    navigator.clipboard.writeText(urlReporte)
    toast.success('Enlace del reporte copiado al portapapeles')
  }

  const getTipoColor = (tipo: string) => {
    const tipoInfo = tiposReporte.find(t => t.tipo === tipo)
    return tipoInfo?.color || 'bg-gray-100 text-gray-600'
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return 'bg-green-100 text-green-800'
      case 'enviado': return 'bg-blue-100 text-blue-800'
      case 'generado': return 'bg-purple-100 text-purple-800'
      case 'borrador': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subiendo': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'bajando': return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
    }
  }

  // Datos para gráficos de ejemplo
  const datosRiesgosPorCategoria: RiesgoPorCategoriaData[] = [
    { categoria: 'Musculoesquelético', valor: 35, color: '#EF4444' },
    { categoria: 'Postural', valor: 25, color: '#F59E0B' },
    { categoria: 'Visual', valor: 20, color: '#3B82F6' },
    { categoria: 'Ambiental', valor: 15, color: '#10B981' },
    { categoria: 'Otros', valor: 5, color: '#8B5CF6' }
  ]

  const datosEvolucionRiesgo: EvolucionRiesgoData[] = [
    { mes: 'Ene', riesgo: 85 },
    { mes: 'Feb', riesgo: 78 },
    { mes: 'Mar', riesgo: 82 },
    { mes: 'Abr', riesgo: 75 },
    { mes: 'May', riesgo: 68 },
    { mes: 'Jun', riesgo: 65 }
  ]

  const datosCumplimientoNormativo: CumplimientoNormativoData[] = [
    { norma: 'NOM-006-STPS', actual: 85, objetivo: 95 },
    { norma: 'OSHA-29CFR', actual: 78, objetivo: 90 },
    { norma: 'ISO-45001', actual: 88, objetivo: 95 },
    { norma: 'NOM-011-STPS', actual: 92, objetivo: 95 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary" />
              <span>Reportes de Evaluación</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Generación de reportes técnicos detallados y análisis de cumplimiento
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Settings size={16} />
              <span>Configurar</span>
            </button>
            <button
              onClick={generarReporte}
              disabled={generando}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {generando ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Plus size={16} />
              )}
              <span>{generando ? 'Generando...' : 'Nuevo Reporte'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Formulario de nuevo reporte */}
      {generando && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Nuevo Reporte</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Reporte
                </label>
                <input
                  type="text"
                  value={nuevoReporte.titulo}
                  onChange={(e) => setNuevoReporte({ ...nuevoReporte, titulo: e.target.value })}
                  placeholder="Ej: Evaluación Ergonómica - Q4 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  value={nuevoReporte.empresa}
                  onChange={(e) => setNuevoReporte({ ...nuevoReporte, empresa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empleado Evaluado
                </label>
                <input
                  type="text"
                  value={nuevoReporte.empleado}
                  onChange={(e) => setNuevoReporte({ ...nuevoReporte, empleado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reporte
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {tiposReporte.map((tipo) => (
                    <label key={tipo.tipo} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="tipo_reporte"
                        value={tipo.tipo}
                        checked={nuevoReporte.tipo_reporte === tipo.tipo}
                        onChange={(e) => setNuevoReporte({ ...nuevoReporte, tipo_reporte: e.target.value as any })}
                        className="text-primary"
                      />
                      <tipo.icon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tipo.label}</p>
                        <p className="text-xs text-gray-500">{tipo.descripcion}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Estadísticas de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reportes</p>
              <p className="text-2xl font-bold text-gray-900">{reportes.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Este Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportes.filter(r => new Date(r.fecha_generacion).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprobados</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportes.filter(r => r.estado === 'aprobado').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportes.filter(r => r.estado === 'generado').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Lista de reportes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Reportes Generados</h3>
        </div>
        
        {reportes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay reportes generados aún</p>
            <p className="text-sm text-gray-500 mt-1">Crea tu primer reporte técnico</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa/Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportes.map((reporte) => (
                  <tr key={reporte.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{reporte.titulo}</p>
                        <p className="text-sm text-gray-500">#{reporte.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const tipoInfo = tiposReporte.find(t => t.tipo === reporte.tipo_reporte)
                          return tipoInfo ? (
                            <div className={`p-1 rounded ${tipoInfo.color}`}>
                              <tipoInfo.icon size={14} />
                            </div>
                          ) : null
                        })()}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(reporte.tipo_reporte)}`}>
                          {reporte.tipo_reporte.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{reporte.empresa}</p>
                        <p className="text-sm text-gray-500">{reporte.empleado}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(reporte.estado)}`}>
                        {reporte.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(reporte.fecha_generacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setVistaPrevia(reporte)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Vista previa"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => descargarReporte(reporte)}
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title="Descargar"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => compartirReporte(reporte)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="Compartir"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Vista previa del reporte */}
      {vistaPrevia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Vista Previa: {vistaPrevia.titulo}
                </h3>
                <button
                  onClick={() => setVistaPrevia(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <div className="w-6 h-6 flex items-center justify-center">×</div>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header del reporte */}
              <div className="text-center border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Reporte de Evaluación de Riesgo Ergonómico
                </h1>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Building size={16} />
                    <span>{vistaPrevia.empresa}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span>{vistaPrevia.empleado}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>{vistaPrevia.sede}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>{new Date(vistaPrevia.fecha_evaluacion).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>

              {/* Métricas principales */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Métricas Principales</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {vistaPrevia.metricas_principales.map((metrica, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">{metrica.nombre}</p>
                        {getTendenciaIcon(metrica.tendencia)}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {metrica.valor}{metrica.unidad}
                      </p>
                      {metrica.valor_anterior && (
                        <p className="text-xs text-gray-500">
                          Anterior: {metrica.valor_anterior}{metrica.unidad}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráficos de ejemplo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Riesgos por Categoría</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={datosRiesgosPorCategoria}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="valor"
                          nameKey="categoria"
                          label={({ categoria, valor }: any) => `${categoria}: ${valor}%`}
                        >
                          {datosRiesgosPorCategoria.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                          formatter={(value: any, name: string) => [`${value}%`, 'Porcentaje']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Evolución del Riesgo</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={datosEvolucionRiesgo}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="mes" 
                          stroke="#666"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#666"
                          tick={{ fontSize: 12 }}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                          formatter={(value: any, name: string) => [`${value}%`, 'Score de Riesgo']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="riesgo" 
                          stroke="#EF4444" 
                          strokeWidth={3}
                          dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Cumplimiento normativo */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Cumplimiento Normativo</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosCumplimientoNormativo}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="norma" 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                        formatter={(value: any, name: string) => [`${value}%`, name]}
                      />
                      <Bar 
                        dataKey="actual" 
                        fill="#00BFA6" 
                        name="Actual"
                        cornerRadius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="objetivo" 
                        fill="#94A3B8" 
                        name="Objetivo"
                        cornerRadius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Secciones */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contenido del Reporte</h2>
                <div className="space-y-4">
                  {vistaPrevia.secciones.filter(s => s.incluir).map((seccion) => (
                    <div key={seccion.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{seccion.titulo}</h3>
                      <p className="text-gray-700 text-sm">{seccion.contenido}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setVistaPrevia(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => descargarReporte(vistaPrevia)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Descargar PDF</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
