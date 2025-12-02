// Componente de Recomendaciones Automáticas con IA
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Star,
  Sparkles,
  Award,
  ArrowRight,
  Filter,
  RefreshCw,
  Download,
  Send,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'

interface RecomendacionIA {
  id: string
  tipo: 'equipamiento' | 'procedimiento' | 'capacitacion' | 'rediseño' | 'politica' | 'tecnologia'
  categoria: 'inmediato' | 'corto_plazo' | 'mediano_plazo' | 'largo_plazo'
  titulo: string
  descripcion: string
  impacto_esperado: 'bajo' | 'medio' | 'alto' | 'critico'
  prioridad: 1 | 2 | 3 | 4 | 5
  costo_estimado: number
  tiempo_implementacion: number // en días
  beneficios: string[]
  riesgos: string[]
  normativos_relacionados: string[]
  porcentaje_confianza: number
  evidencia_soporte: string[]
  estado: 'propuesta' | 'aprobada' | 'en_implementacion' | 'completada' | 'rechazada'
  fecha_creacion: string
  evaluaciones_relacionadas: string[]
}

interface RecomendacionesIAProps {
  evaluacionId: string
  datosEvaluacion?: any
  onRecomendacionUpdate?: (recomendaciones: RecomendacionIA[]) => void
}

export function RecomendacionesIA({ evaluacionId, datosEvaluacion, onRecomendacionUpdate }: RecomendacionesIAProps) {
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionIA[]>([])
  const [cargandoIA, setCargandoIA] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [vistaDetallada, setVistaDetallada] = useState<string | null>(null)
  const [generandoNuevo, setGenerandoNuevo] = useState(false)

  const tiposRecomendacion = [
    {
      tipo: 'equipamiento',
      icon: Zap,
      color: 'bg-blue-100 text-blue-600',
      label: 'Equipamiento',
      descripcion: 'Herramientas, mobiliario y equipos'
    },
    {
      tipo: 'procedimiento',
      icon: Target,
      color: 'bg-green-100 text-green-600',
      label: 'Procedimientos',
      descripcion: 'Procesos y métodos de trabajo'
    },
    {
      tipo: 'capacitacion',
      icon: Award,
      color: 'bg-purple-100 text-purple-600',
      label: 'Capacitación',
      descripcion: 'Formación y entrenamiento'
    },
    {
      tipo: 'rediseño',
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600',
      label: 'Rediseño',
      descripcion: 'Cambios en el puesto o layout'
    },
    {
      tipo: 'politica',
      icon: CheckCircle,
      color: 'bg-cyan-100 text-cyan-600',
      label: 'Políticas',
      descripcion: 'Normas y políticas organizacionales'
    },
    {
      tipo: 'tecnologia',
      icon: Sparkles,
      color: 'bg-pink-100 text-pink-600',
      label: 'Tecnología',
      descripcion: 'Soluciones tecnológicas'
    }
  ]

  useEffect(() => {
    cargarRecomendaciones()
  }, [evaluacionId])

  const cargarRecomendaciones = async () => {
    try {
      setCargandoIA(true)
      
      // Simular carga de recomendaciones desde IA
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const recomendacionesSimuladas: RecomendacionIA[] = [
        {
          id: '1',
          tipo: 'equipamiento',
          categoria: 'inmediato',
          titulo: 'Silla Ergonómica con Soporte Lumbar',
          descripcion: 'Reemplazar la silla actual por una silla ergonómica con soporte lumbar ajustable que permita mantener la columna en posición neutral.',
          impacto_esperado: 'alto',
          prioridad: 5,
          costo_estimado: 2500,
          tiempo_implementacion: 7,
          beneficios: [
            'Reducción del 70% en dolor lumbar',
            'Mejora en la postura de trabajo',
            'Incremento del 15% en productividad',
            'Reducción de ausentismo por dolor'
          ],
          riesgos: [
            'Período de adaptación inicial',
            'Resistencia del empleado al cambio'
          ],
          normativos_relacionados: ['NOM-006-STPS', 'ISO-45001'],
          porcentaje_confianza: 94,
          evidencia_soporte: [
            'Estudios de Harvard Medical School',
            'Datos de evaluaciones ergonómicas similares',
            'Análisis de biomecánica postural'
          ],
          estado: 'propuesta',
          fecha_creacion: new Date().toISOString(),
          evaluaciones_relacionadas: [evaluacionId]
        },
        {
          id: '2',
          tipo: 'procedimiento',
          categoria: 'corto_plazo',
          titulo: 'Programa de Pausas Activas',
          descripcion: 'Implementar pausas activas cada 45 minutos de trabajo continuo, con ejercicios específicos de estiramiento y movilidad.',
          impacto_esperado: 'medio',
          prioridad: 4,
          costo_estimado: 0,
          tiempo_implementacion: 3,
          beneficios: [
            'Reducción de tensión muscular',
            'Mejora en circulación sanguínea',
            'Prevención de trastornos musculoesqueléticos',
            'Aumento del bienestar general'
          ],
          riesgos: [
            'Reducción mínima del tiempo productivo',
            'Necesidad de supervisión inicial'
          ],
          normativos_relacionados: ['NOM-006-STPS', 'Manual de Seguridad STPS'],
          porcentaje_confianza: 88,
          evidencia_soporte: [
            'Guías de la OMS sobre salud ocupacional',
            'Investigaciones en medicina del trabajo',
            'Best practices internacionales'
          ],
          estado: 'aprobada',
          fecha_creacion: new Date().toISOString(),
          evaluaciones_relacionadas: [evaluacionId]
        },
        {
          id: '3',
          tipo: 'capacitacion',
          categoria: 'mediano_plazo',
          titulo: 'Curso de Ergonomía y Postura Correcta',
          descripcion: 'Capacitación especializada en principios de ergonomía, identificación de riesgos posturales y técnicas de trabajo seguro.',
          impacto_esperado: 'alto',
          prioridad: 3,
          costo_estimado: 15000,
          tiempo_implementacion: 30,
          beneficios: [
            'Conciencia postural mejorada',
            'Capacidad de autoregulación',
            'Prevención a largo plazo',
            'Mejora en la cultura de seguridad'
          ],
          riesgos: [
            'Tiempo invertido en capacitación',
            'Necesidad de refresher periódicas'
          ],
          normativos_relacionados: ['NOM-006-STPS', 'ISO-45001', 'Reglamento Federal de Seguridad'],
          porcentaje_confianza: 91,
          evidencia_soporte: [
            'Programas exitosos en otras empresas',
            'Investigaciones en efectividad de capacitación',
            'Estadísticas de reducción de lesiones'
          ],
          estado: 'propuesta',
          fecha_creacion: new Date().toISOString(),
          evaluaciones_relacionadas: [evaluacionId]
        },
        {
          id: '4',
          tipo: 'rediseño',
          categoria: 'largo_plazo',
          titulo: 'Rediseño del Área de Trabajo',
          descripcion: 'Reorganización completa del área de trabajo optimizando la distribución de elementos, alturas de superficies y rutas de movimiento.',
          impacto_esperado: 'critico',
          prioridad: 2,
          costo_estimado: 50000,
          tiempo_implementacion: 90,
          beneficios: [
            'Optimización de flujos de trabajo',
            'Eliminación de movimientos innecesarios',
            'Mejora significativa en eficiencia',
            'Ambiente de trabajo más seguro'
          ],
          riesgos: [
            'Interrupción temporal de operaciones',
            'Costo significativo de implementación',
            'Necesidad de coordinación con mantenimiento'
          ],
          normativos_relacionados: ['NOM-006-STPS', 'Código Civil Federal', 'Reglamento de Seguridad e Higiene'],
          porcentaje_confianza: 96,
          evidencia_soporte: [
            'Análisis de flujos de trabajo actuales',
            'Simulaciones de rediseño',
            'Estándares internacionales de layout'
          ],
          estado: 'propuesta',
          fecha_creacion: new Date().toISOString(),
          evaluaciones_relacionadas: [evaluacionId]
        }
      ]
      
      setRecomendaciones(recomendacionesSimuladas)
      onRecomendacionUpdate?.(recomendacionesSimuladas)
      
    } catch (error) {
      console.error('Error cargando recomendaciones:', error)
      toast.error('Error al cargar recomendaciones de IA')
    } finally {
      setCargandoIA(false)
    }
  }

  const generarNuevasRecomendaciones = async () => {
    try {
      setGenerandoNuevo(true)
      setCargandoIA(true)
      
      toast.loading('IA analizando nuevos datos...', { id: 'ia-analysis' })
      
      // Simular análisis de IA
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success('Nuevas recomendaciones generadas', { id: 'ia-analysis' })
      toast.success('Se han generado 3 nuevas recomendaciones basadas en los últimos datos')
      
      // Recargar recomendaciones
      await cargarRecomendaciones()
      
    } catch (error) {
      toast.error('Error al generar nuevas recomendaciones', { id: 'ia-analysis' })
    } finally {
      setGenerandoNuevo(false)
      setCargandoIA(false)
    }
  }

  const actualizarEstadoRecomendacion = (id: string, nuevoEstado: RecomendacionIA['estado']) => {
    const recomendacionesActualizadas = recomendaciones.map(rec =>
      rec.id === id ? { ...rec, estado: nuevoEstado } : rec
    )
    setRecomendaciones(recomendacionesActualizadas)
    onRecomendacionUpdate?.(recomendacionesActualizadas)
    
    const estados = {
      propuesta: 'propuesta como',
      aprobada: 'aprobada',
      en_implementacion: 'puesta en implementación',
      completada: 'marcada como completada',
      rechazada: 'rechazada'
    }
    toast.success(`Recomendación ${estados[nuevoEstado]}`)
  }

  const getPrioridadColor = (prioridad: number) => {
    if (prioridad >= 5) return 'bg-red-100 text-red-800 border-red-200'
    if (prioridad >= 4) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (prioridad >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case 'critico': return 'bg-red-100 text-red-800'
      case 'alto': return 'bg-orange-100 text-orange-800'
      case 'medio': return 'bg-yellow-100 text-yellow-800'
      case 'bajo': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 text-green-800'
      case 'en_implementacion': return 'bg-blue-100 text-blue-800'
      case 'aprobada': return 'bg-cyan-100 text-cyan-800'
      case 'propuesta': return 'bg-gray-100 text-gray-800'
      case 'rechazada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'inmediato': return 'bg-red-100 text-red-700'
      case 'corto_plazo': return 'bg-orange-100 text-orange-700'
      case 'mediano_plazo': return 'bg-yellow-100 text-yellow-700'
      case 'largo_plazo': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const recomendacionesFiltradas = recomendaciones.filter(rec => {
    const cumpleFiltroTipo = filtroTipo === 'todos' || rec.tipo === filtroTipo
    const cumpleFiltroPrioridad = filtroPrioridad === 'todas' || rec.prioridad.toString() === filtroPrioridad
    const cumpleFiltroCategoria = filtroCategoria === 'todas' || rec.categoria === filtroCategoria
    return cumpleFiltroTipo && cumpleFiltroPrioridad && cumpleFiltroCategoria
  })

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
              <Brain className="h-6 w-6 text-primary" />
              <span>Recomendaciones Automáticas IA</span>
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </h2>
            <p className="text-gray-600 mt-1">
              Sugerencias inteligentes basadas en IA y mejores prácticas en medicina del trabajo
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generarNuevasRecomendaciones}
              disabled={generandoNuevo || cargandoIA}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {generandoNuevo ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <RefreshCw size={16} />
              )}
              <span>{generandoNuevo ? 'Generando...' : 'Nueva IA'}</span>
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Download size={16} />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={18} className="text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todos">Todos los tipos</option>
              {tiposRecomendacion.map(tipo => (
                <option key={tipo.tipo} value={tipo.tipo}>{tipo.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todas">Todas las prioridades</option>
              <option value="5">Crítica (5)</option>
              <option value="4">Alta (4)</option>
              <option value="3">Media (3)</option>
              <option value="2">Baja (2)</option>
              <option value="1">Mínima (1)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todas">Todas las categorías</option>
              <option value="inmediato">Inmediato</option>
              <option value="corto_plazo">Corto Plazo</option>
              <option value="mediano_plazo">Mediano Plazo</option>
              <option value="largo_plazo">Largo Plazo</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tiposRecomendacion.slice(0, 4).map((tipo, index) => {
          const cantidad = recomendaciones.filter(r => r.tipo === tipo.tipo).length
          return (
            <motion.div
              key={tipo.tipo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{tipo.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{cantidad}</p>
                </div>
                <div className={`p-2 rounded-lg ${tipo.color}`}>
                  <tipo.icon size={20} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Lista de recomendaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {cargandoIA ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">IA analizando datos y generando recomendaciones...</p>
          </div>
        ) : recomendacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron recomendaciones con los filtros aplicados</p>
            <button
              onClick={() => {
                setFiltroTipo('todos')
                setFiltroPrioridad('todas')
                setFiltroCategoria('todas')
              }}
              className="mt-4 text-primary hover:text-primary/80 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          recomendacionesFiltradas.map((recomendacion, index) => {
            const tipoInfo = tiposRecomendacion.find(t => t.tipo === recomendacion.tipo)
            return (
              <motion.div
                key={recomendacion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {tipoInfo && (
                          <div className={`p-2 rounded-lg ${tipoInfo.color}`}>
                            <tipoInfo.icon size={18} />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {recomendacion.titulo}
                          </h3>
                          <p className="text-sm text-gray-600">{recomendacion.descripcion}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadColor(recomendacion.prioridad)}`}>
                          Prioridad {recomendacion.prioridad}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getImpactoColor(recomendacion.impacto_esperado)}`}>
                          Impacto {recomendacion.impacto_esperado}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoriaColor(recomendacion.categoria)}`}>
                          {recomendacion.categoria.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(recomendacion.estado)}`}>
                          {recomendacion.estado.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          IA: {recomendacion.porcentaje_confianza}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Costo: ${recomendacion.costo_estimado.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {recomendacion.tiempo_implementacion} días
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Confianza IA: {recomendacion.porcentaje_confianza}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setVistaDetallada(vistaDetallada === recomendacion.id ? null : recomendacion.id)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Ver detalles"
                      >
                        <MessageSquare size={18} />
                      </button>
                      {recomendacion.estado === 'propuesta' && (
                        <>
                          <button
                            onClick={() => actualizarEstadoRecomendacion(recomendacion.id, 'aprobada')}
                            className="text-green-600 hover:text-green-700 transition-colors"
                            title="Aprobar"
                          >
                            <ThumbsUp size={18} />
                          </button>
                          <button
                            onClick={() => actualizarEstadoRecomendacion(recomendacion.id, 'rechazada')}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Rechazar"
                          >
                            <ThumbsDown size={18} />
                          </button>
                        </>
                      )}
                      {recomendacion.estado === 'aprobada' && (
                        <button
                          onClick={() => actualizarEstadoRecomendacion(recomendacion.id, 'en_implementacion')}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="Iniciar implementación"
                        >
                          <ArrowRight size={18} />
                        </button>
                      )}
                      {recomendacion.estado === 'en_implementacion' && (
                        <button
                          onClick={() => actualizarEstadoRecomendacion(recomendacion.id, 'completada')}
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title="Marcar como completada"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {vistaDetallada === recomendacion.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 bg-gray-50 p-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span>Beneficios Esperados</span>
                          </h4>
                          <ul className="space-y-2">
                            {recomendacion.beneficios.map((beneficio, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{beneficio}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span>Riesgos y Consideraciones</span>
                          </h4>
                          <ul className="space-y-2">
                            {recomendacion.riesgos.map((riesgo, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <AlertTriangle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{riesgo}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span>Marco Normativo Relacionado</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recomendacion.normativos_relacionados.map((norma, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {norma}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Target className="h-4 w-4 text-purple-500" />
                          <span>Evidencia de Soporte</span>
                        </h4>
                        <ul className="space-y-1">
                          {recomendacion.evidencia_soporte.map((evidencia, i) => (
                            <li key={i} className="text-sm text-gray-600">• {evidencia}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </motion.div>
    </div>
  )
}