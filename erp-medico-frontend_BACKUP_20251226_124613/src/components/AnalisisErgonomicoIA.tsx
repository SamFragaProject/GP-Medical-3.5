// Componente de Análisis Ergonómico con IA para medicina del trabajo
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Activity,
  Eye,
  Heart,
  Clock,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  Settings,
  Download,
  Play,
  Pause,
  RotateCcw,
  Monitor,
  ArrowUpDown,
  ArrowRight,
  Lightbulb
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import toast from 'react-hot-toast'

// Interfaces para datos de gráficos
interface DistribucionRiesgosData {
  riesgo: string
  cantidad: number
  color: string
}

interface ZonaRiesgoData {
  zona: string
  cantidad: number
}

interface RadarDataPoint {
  subject: string
  A: number
  fullMark: number
}

interface TooltipFormatterProps {
  value: any
  name: string
}

interface EvaluacionErgonomica {
  id: string
  empleado_id: string
  nombre_empleado: string
  puesto: string
  fecha_evaluacion: string
  puntuacion_total: number
  riesgo_ergonomico: 'bajo' | 'medio' | 'alto' | 'critico'
  zonas_riesgo: string[]
  recomendaciones: string[]
  tiempo_exposicion: number
  frecuencia_movimientos: number
  fuerza_requerida: number
  postura_trabajo: string
  iluminacion: number
  ruido: number
  temperatura: number
  factore_diseno: {
    altura_mesa: number
    silla_ajustable: boolean
    monitor_distancia: number
    teclado_posicion: number
    raton_accesible: boolean
  }
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'revision'
}

interface RecomendacionErgonomica {
  id: string
  tipo: 'postura' | 'equipo' | 'ambiente' | 'capacitacion' | 'rutina'
  prioridad: 'inmediata' | 'corta' | 'media' | 'larga'
  titulo: string
  descripcion: string
  beneficios: string[]
  costo_estimado: number
  tiempo_implementacion: number
  impacto_esperado: number
  normativo_relacionado: string[]
}

export function AnalisisErgonomicoIA() {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionErgonomica[]>([])
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionErgonomica[]>([])
  const [loading, setLoading] = useState(false)
  const [analisisActivo, setAnalisisActivo] = useState<string | null>(null)
  const [modoAnalisis, setModoAnalisis] = useState<'rapido' | 'completo' | 'predictivo'>('completo')

  useEffect(() => {
    cargarDatosErgo()
  }, [])

  const cargarDatosErgo = () => {
    // Datos simulados de evaluaciones ergonómicas con IA
    const evaluacionesSimuladas: EvaluacionErgonomica[] = [
      {
        id: 'ERG001',
        empleado_id: 'EMP001',
        nombre_empleado: 'Ana García López',
        puesto: 'Operaria de Línea de Ensamblaje',
        fecha_evaluacion: '2025-11-01',
        puntuacion_total: 72,
        riesgo_ergonomico: 'alto',
        zonas_riesgo: ['Columna lumbar', 'Hombros', 'Muñecas'],
        recomendaciones: [
          'Ajustar altura de estación de trabajo',
          'Implementar pausas activas cada 30 min',
          'Capacitación en técnicas correctas',
          'Evaluar necesidad de herramientas auxiliares'
        ],
        tiempo_exposicion: 480, // minutos por turno
        frecuencia_movimientos: 180, // por hora
        fuerza_requerida: 65, // % de capacidad
        postura_trabajo: 'de pie inclinada',
        iluminacion: 75,
        ruido: 68,
        temperatura: 22,
        factore_diseno: {
          altura_mesa: 85,
          silla_ajustable: false,
          monitor_distancia: 60,
          teclado_posicion: 72,
          raton_accesible: true
        },
        estado: 'completada'
      },
      {
        id: 'ERG002',
        empleado_id: 'EMP002',
        nombre_empleado: 'Carlos Mendoza',
        puesto: 'Supervisor de Turno',
        fecha_evaluacion: '2025-11-01',
        puntuacion_total: 45,
        riesgo_ergonomico: 'medio',
        zonas_riesgo: ['Cuello', 'Codos'],
        recomendaciones: [
          'Verificar altura de monitor',
          'Configurar iluminación adecuada',
          'Ejercicios de estiramiento'
        ],
        tiempo_exposicion: 240,
        frecuencia_movimientos: 45,
        fuerza_requerida: 25,
        postura_trabajo: 'sentado',
        iluminacion: 85,
        ruido: 55,
        temperatura: 24,
        factore_diseno: {
          altura_mesa: 75,
          silla_ajustable: true,
          monitor_distancia: 45,
          teclado_posicion: 78,
          raton_accesible: true
        },
        estado: 'completada'
      },
      {
        id: 'ERG003',
        empleado_id: 'EMP003',
        nombre_empleado: 'María Rodríguez',
        puesto: 'Analista de Calidad',
        fecha_evaluacion: '2025-11-01',
        puntuacion_total: 28,
        riesgo_ergonomico: 'bajo',
        zonas_riesgo: ['Ojos'],
        recomendaciones: [
          'Ajustar brillo de monitor',
          'Pausas visuales cada 20 min',
          'Optimizar iluminación ambiental'
        ],
        tiempo_exposicion: 360,
        frecuencia_movimientos: 20,
        fuerza_requerida: 15,
        postura_trabajo: 'sentado erguido',
        iluminacion: 90,
        ruido: 45,
        temperatura: 23,
        factore_diseno: {
          altura_mesa: 72,
          silla_ajustable: true,
          monitor_distancia: 50,
          teclado_posicion: 85,
          raton_accesible: true
        },
        estado: 'completada'
      }
    ]

    const recomendacionesSimuladas: RecomendacionErgonomica[] = [
      {
        id: 'REC001',
        tipo: 'equipo',
        prioridad: 'inmediata',
        titulo: 'Estaciones de Trabajo Ajustables',
        descripcion: 'Implementar estaciones de trabajo con altura ajustable para permitir alternancia entre trabajo sentado y de pie',
        beneficios: [
          'Reducción 40% molestias musculoesqueléticas',
          'Mejora 25% en productividad',
          'Reducción 30% ausentismo',
          'Cumplimiento normativo NOM-025'
        ],
        costo_estimado: 45000,
        tiempo_implementacion: 14,
        impacto_esperado: 85,
        normativo_relacionado: ['NOM-025-SSA3-2012', 'ISO 45001:2018']
      },
      {
        id: 'REC002',
        tipo: 'rutina',
        prioridad: 'corta',
        titulo: 'Programa de Pausas Activas',
        descripcion: 'Implementar pausas activas de 5 minutos cada 50 minutos de trabajo',
        beneficios: [
          'Mejora circulación sanguínea',
          'Reduce fatiga muscular',
          'Aumenta concentración',
          'Previene lesiones acumulativas'
        ],
        costo_estimado: 8000,
        tiempo_implementacion: 7,
        impacto_esperado: 70,
        normativo_relacionado: ['NOM-025-SSA3-2012']
      },
      {
        id: 'REC003',
        tipo: 'capacitacion',
        prioridad: 'media',
        titulo: 'Capacitación Ergonómica Especializada',
        descripcion: 'Programa de capacitación en técnicas ergonómicas y manejo de riesgos musculoesqueléticos',
        beneficios: [
          'Conciencia ergonómica del 90%',
          'Reducción 60% comportamientos de riesgo',
          'Mejor auto-evaluación postural',
          'Cultura de prevención fortalecida'
        ],
        costo_estimado: 15000,
        tiempo_implementacion: 21,
        impacto_esperado: 75,
        normativo_relacionado: ['NOM-025-SSA3-2012', 'Art. 153 LFT']
      }
    ]

    setEvaluaciones(evaluacionesSimuladas)
    setRecomendaciones(recomendacionesSimuladas)
  }

  const iniciarAnalisis = async (empleadoId: string) => {
    setLoading(true)
    setAnalisisActivo(empleadoId)
    
    toast.loading('Iniciando análisis ergonómico con IA...', { id: 'analisis-ergo' })
    
    setTimeout(() => {
      setLoading(false)
      setAnalisisActivo(null)
      toast.success('Análisis ergonómico completado', { id: 'analisis-ergo' })
    }, 3000)
  }

  const getRiesgoColor = (riesgo: string) => {
    switch (riesgo) {
      case 'critico': return 'text-red-600 bg-red-100'
      case 'alto': return 'text-orange-600 bg-orange-100'
      case 'medio': return 'text-yellow-600 bg-yellow-100'
      case 'bajo': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'inmediata': return 'bg-red-500'
      case 'corta': return 'bg-orange-500'
      case 'media': return 'bg-yellow-500'
      case 'larga': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  // Datos para gráficos
  const riesgoPorZona = evaluaciones.reduce((acc, evaluacion) => {
    evaluacion.zonas_riesgo.forEach(zona => {
      acc[zona] = (acc[zona] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const distribucionRiesgos: DistribucionRiesgosData[] = [
    { riesgo: 'Bajo', cantidad: evaluaciones.filter(e => e.riesgo_ergonomico === 'bajo').length, color: '#10B981' },
    { riesgo: 'Medio', cantidad: evaluaciones.filter(e => e.riesgo_ergonomico === 'medio').length, color: '#F59E0B' },
    { riesgo: 'Alto', cantidad: evaluaciones.filter(e => e.riesgo_ergonomico === 'alto').length, color: '#EF4444' },
    { riesgo: 'Crítico', cantidad: evaluaciones.filter(e => e.riesgo_ergonomico === 'critico').length, color: '#DC2626' }
  ]

  const radarData: RadarDataPoint[] = evaluaciones[0] ? [
    { subject: 'Postura', A: 75, fullMark: 100 },
    { subject: 'Movimientos', A: 65, fullMark: 100 },
    { subject: 'Fuerza', A: 80, fullMark: 100 },
    { subject: 'Iluminación', A: 85, fullMark: 100 },
    { subject: 'Ambiente', A: 70, fullMark: 100 },
    { subject: 'Equipos', A: 60, fullMark: 100 }
  ] : []

  const riesgoPorZonaData: ZonaRiesgoData[] = Object.entries(riesgoPorZona).map(([zona, cantidad]) => ({ zona, cantidad }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Análisis Ergonómico IA</h2>
            <p className="text-blue-100">
              Evaluación automatizada de riesgos ergonómicos con inteligencia artificial
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-200">Precisión del Modelo</p>
              <p className="text-2xl font-bold">94.7%</p>
            </div>
            <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Reporte</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Evaluaciones Totales</p>
              <p className="text-2xl font-bold text-gray-900">{evaluaciones.length}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Riesgo Alto/Crítico</p>
              <p className="text-2xl font-bold text-red-600">
                {evaluaciones.filter(e => e.riesgo_ergonomico === 'alto' || e.riesgo_ergonomico === 'critico').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Puntuación Promedio</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(evaluaciones.reduce((acc, e) => acc + e.puntuacion_total, 0) / evaluaciones.length)}
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recomendaciones Activas</p>
              <p className="text-2xl font-bold text-green-600">{recomendaciones.length}</p>
            </div>
            <Lightbulb className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráficos de Análisis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Riesgos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribucionRiesgos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="riesgo" 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value: any, name: string) => [value, 'Cantidad']}
                />
                <Bar 
                  dataKey="cantidad" 
                  fill="#00BFA6"
                  cornerRadius={[4, 4, 0, 0]}
                  name="Evaluaciones"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Zonas de Riesgo Identificadas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riesgoPorZonaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="zona" 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  formatter={(value: any, name: string) => [value, 'Incidencias']}
                />
                <Bar 
                  dataKey="cantidad" 
                  fill="#EF4444"
                  cornerRadius={[4, 4, 0, 0]}
                  name="Incidencias"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evaluaciones por Empleado */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluaciones Activas</h3>
            <div className="space-y-4">
              {evaluaciones.map((evaluacion) => (
                <motion.div
                  key={evaluacion.id}
                  whileHover={{ scale: 1.02 }}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer"
                  onClick={() => iniciarAnalisis(evaluacion.empleado_id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-900">{evaluacion.nombre_empleado}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiesgoColor(evaluacion.riesgo_ergonomico)}`}>
                      {evaluacion.riesgo_ergonomico}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3">{evaluacion.puesto}</p>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Puntuación</span>
                      <span className="text-xs font-medium">{evaluacion.puntuacion_total}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          evaluacion.puntuacion_total >= 70 ? 'bg-red-500' :
                          evaluacion.puntuacion_total >= 50 ? 'bg-orange-500' :
                          evaluacion.puntuacion_total >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${evaluacion.puntuacion_total}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    Zonas de riesgo: {evaluacion.zonas_riesgo.join(', ')}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {evaluacion.fecha_evaluacion}
                    </span>
                    {analisisActivo === evaluacion.empleado_id ? (
                      <div className="flex items-center space-x-1">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-xs text-primary">Analizando...</span>
                      </div>
                    ) : (
                      <button className="text-primary text-xs hover:text-primary/80">
                        Ver Detalles
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones de IA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones de IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recomendaciones.map((recomendacion) => (
            <motion.div
              key={recomendacion.id}
              whileHover={{ scale: 1.02 }}
              className="border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{recomendacion.titulo}</h4>
                <div className={`w-3 h-3 rounded-full ${getPrioridadColor(recomendacion.prioridad)}`}></div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{recomendacion.descripcion}</p>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Impacto Esperado</span>
                    <span className="text-xs font-medium">{recomendacion.impacto_esperado}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${recomendacion.impacto_esperado}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Costo: ${recomendacion.costo_estimado.toLocaleString()}</span>
                  <span>{recomendacion.tiempo_implementacion} días</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {recomendacion.normativo_relacionado.map((normativo, index) => (
                    <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                      {normativo}
                    </span>
                  ))}
                </div>
              </div>
              
              <button className="w-full mt-4 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                Implementar Recomendación
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}