// Analytics Predictivos con IA para medicina del trabajo
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Zap,
  Eye,
  Activity,
  Shield,
  Users,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles,
  Cpu,
  Database,
  Layers,
  CheckCircle
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar
} from 'recharts'
import toast from 'react-hot-toast'

// Interfaces para datos de gráficos
interface PrediccionesRiesgoData {
  mes: string
  riesgoAlto: number
  riesgoMedio: number
  riesgoBajo: number
  tendencia: number
}

interface AusentismoPrediccionData {
  mes: string
  actual: number
  prediccion: number
  intervalo: [number, number]
}

interface PatronesOcupacionalesData {
  factor: string
  riesgo: number
  tendencia: 'up' | 'down' | 'stable'
  empleados: number
}

interface FactoresInfluenciaData {
  factor: string
  importancia: number
  direccion: 'positive' | 'negative'
}

interface TooltipFormatterProps {
  value: any
  name: string
}

interface AnalyticsPredictivosProps {
  filtros: {
    empresa: string
    sede: string
    departamento: string
    fechaInicio: string
    fechaFin: string
  }
}

// Datos simulados para analytics predictivos
const generarDatosPredictivos = (): {
  prediccionesRiesgo: PrediccionesRiesgoData[]
  ausentismoPrediccion: AusentismoPrediccionData[]
  patronesOcupacionales: PatronesOcupacionalesData[]
  factoresInfluencia: FactoresInfluenciaData[]
  alertasPrediccion: Array<{
    tipo: string
    probabilidad: number
    impacto: string
    descripcion: string
    accion: string
    fecha: string
  }>
} => ({
  prediccionesRiesgo: [
    { mes: 'Nov 2025', riesgoAlto: 23, riesgoMedio: 89, riesgoBajo: 1135, tendencia: 1.2 },
    { mes: 'Dic 2025', riesgoAlto: 21, riesgoMedio: 95, riesgoBajo: 1131, tendencia: -0.8 },
    { mes: 'Ene 2026', riesgoAlto: 18, riesgoMedio: 102, riesgoBajo: 1127, tendencia: -2.1 },
    { mes: 'Feb 2026', riesgoAlto: 16, riesgoMedio: 98, riesgoBajo: 1133, tendencia: -1.5 },
    { mes: 'Mar 2026', riesgoAlto: 14, riesgoMedio: 105, riesgoBajo: 1128, tendencia: -3.2 },
    { mes: 'Abr 2026', riesgoAlto: 12, riesgoMedio: 110, riesgoBajo: 1125, tendencia: -4.1 }
  ],
  
  ausentismoPrediccion: [
    { mes: 'Nov', actual: 4.2, prediccion: 4.0, intervalo: [3.5, 4.5] },
    { mes: 'Dic', actual: 4.8, prediccion: 4.6, intervalo: [4.1, 5.1] },
    { mes: 'Ene', actual: 5.1, prediccion: 4.9, intervalo: [4.4, 5.4] },
    { mes: 'Feb', actual: 4.9, prediccion: 4.7, intervalo: [4.2, 5.2] },
    { mes: 'Mar', actual: 4.5, prediccion: 4.3, intervalo: [3.8, 4.8] },
    { mes: 'Abr', actual: 4.2, prediccion: 4.0, intervalo: [3.5, 4.5] }
  ],
  
  patronesOcupacionales: [
    { factor: 'Exposición Química', riesgo: 85, tendencia: 'up', empleados: 45 },
    { factor: 'Ergonomía', riesgo: 72, tendencia: 'down', empleados: 32 },
    { factor: 'Ruido Industrial', riesgo: 68, tendencia: 'stable', empleados: 28 },
    { factor: 'Temperaturas', riesgo: 45, tendencia: 'up', empleados: 18 },
    { factor: 'Tráfico/Vehículos', riesgo: 38, tendencia: 'down', empleados: 15 },
    { factor: 'Estrés Laboral', riesgo: 62, tendencia: 'up', empleados: 67 }
  ],
  
  alertasPrediccion: [
    {
      tipo: 'Pico de Incapacidades',
      probabilidad: 78,
      impacto: 'Alto',
      descripcion: 'Incremento del 23% en incapacidades previsto para marzo 2026',
      accion: 'Reforzar medidas preventivas en áreas de alto riesgo',
      fecha: '2026-03-15'
    },
    {
      tipo: 'Crisis de Cumplimiento',
      probabilidad: 45,
      impacto: 'Crítico',
      descripcion: 'Riesgo del 45% de incumplimiento normativo en Q2 2026',
      accion: 'Auditoría inmediata y actualización de protocolos',
      fecha: '2026-02-28'
    },
    {
      tipo: 'Incremento de Costos',
      probabilidad: 65,
      impacto: 'Medio',
      descripcion: 'Aumento del 18% en costos médicos proyectado',
      accion: 'Implementar programa de medicina preventiva',
      fecha: '2026-04-10'
    }
  ],
  
  factoresInfluencia: [
    { factor: 'Edad promedio empleados', importancia: 0.85, direccion: 'negative' },
    { factor: 'Años de antigüedad', importancia: 0.72, direccion: 'negative' },
    { factor: 'Exposición a riesgos', importancia: 0.91, direccion: 'negative' },
    { factor: 'Programa preventivo', importancia: 0.68, direccion: 'positive' },
    { factor: 'Capacitación en seguridad', importancia: 0.76, direccion: 'positive' },
    { factor: 'Cumplimiento EPP', importancia: 0.83, direccion: 'positive' }
  ]
})

export function AnalyticsPredictivos({ filtros }: AnalyticsPredictivosProps) {
  const [datos, setDatos] = useState(generarDatosPredictivos())
  const [modeloSeleccionado, setModeloSeleccionado] = useState('riesgo_completo')
  const [precision, setPrecision] = useState(94.7)
  const [entrenando, setEntrenando] = useState(false)

  const modelos = [
    { id: 'riesgo_completo', nombre: 'Modelo Integral de Riesgo', precision: 94.7 },
    { id: 'ausentismo', nombre: 'Predicción de Ausentismo', precision: 91.2 },
    { id: 'incapacidades', nombre: 'Análisis de Incapacidades', precision: 88.9 },
    { id: 'cumplimiento', nombre: 'Cumplimiento Normativo', precision: 96.1 }
  ]

  // Simular entrenamiento del modelo
  const entrenarModelo = () => {
    setEntrenando(true)
    toast.success('Iniciando entrenamiento del modelo de IA...')
    
    setTimeout(() => {
      setEntrenando(false)
      setPrecision(94.7 + Math.random() * 2)
      toast.success('Modelo entrenado exitosamente')
    }, 3000)
  }

  const getProbabilidadColor = (prob: number) => {
    if (prob >= 70) return 'text-red-600 bg-red-100'
    if (prob >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getImpactoIcon = (impacto: string) => {
    switch (impacto) {
      case 'Crítico': return AlertTriangle
      case 'Alto': return TrendingUp
      case 'Medio': return Target
      default: return CheckCircle
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con controles de IA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Brain className="h-6 w-6 text-purple-600 mr-2" />
            Analytics Predictivos
          </h2>
          <p className="text-gray-600">Predicciones con inteligencia artificial</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Precisión del modelo</p>
            <p className="text-2xl font-bold text-purple-600">{precision.toFixed(1)}%</p>
          </div>
          
          <button
            onClick={entrenarModelo}
            disabled={entrenando}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 font-medium text-sm disabled:opacity-50"
          >
            {entrenando ? (
              <>
                <Cpu className="h-4 w-4 animate-spin" />
                <span>Entrenando...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Re-entrenar Modelo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Métricas predictivas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Reducción de Riesgo</h3>
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Proyección Q2 2026</span>
                <span className="font-medium text-green-600">-32%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Reducción esperada en empleados de alto riesgo
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Precisión Ausentismo</h3>
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Predicción 6 meses</span>
                <span className="font-medium text-blue-600">91.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '91.2%' }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Precisión en predicciones de ausentismo
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">ROI Predictivo</h3>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Proyección anual</span>
                <span className="font-medium text-purple-600">4.2x</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Retorno esperado por inversión en IA
            </p>
          </div>
        </motion.div>
      </div>

      {/* Selector de modelo y gráficos predictivos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de selección de modelo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Modelos de Predicción</h3>
          <div className="space-y-3">
            {modelos.map((modelo) => (
              <button
                key={modelo.id}
                onClick={() => setModeloSeleccionado(modelo.id)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  modeloSeleccionado === modelo.id
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{modelo.nombre}</p>
                    <p className="text-sm text-gray-600">Precisión: {modelo.precision}%</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-purple-600 font-medium">
                      {modelo.precision > 93 ? 'Excelente' : 'Buena'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Predicciones de riesgo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución Predicha de Riesgos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={datos.prediccionesRiesgo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="mes" 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                formatter={(value: any, name: string) => [value, name]}
              />
              <Line 
                type="monotone" 
                dataKey="riesgoAlto" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Riesgo Alto"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="riesgoMedio" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Riesgo Medio"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="riesgoBajo" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Riesgo Bajo"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Patrones ocupacionales y alertas predictivas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patrones ocupacionales */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patrones de Riesgo</h3>
          <div className="space-y-4">
            {datos.patronesOcupacionales.map((patron, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{patron.factor}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{patron.empleados} empleados</span>
                    {patron.tendencia === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : patron.tendencia === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          patron.riesgo >= 70 ? 'bg-red-600' :
                          patron.riesgo >= 40 ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${patron.riesgo}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    patron.riesgo >= 70 ? 'text-red-600 bg-red-100' :
                    patron.riesgo >= 40 ? 'text-yellow-600 bg-yellow-100' : 'text-green-600 bg-green-100'
                  }`}>
                    {patron.riesgo}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alertas predictivas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Predictivas</h3>
          <div className="space-y-4">
            {datos.alertasPrediccion.map((alerta, index) => {
              const Icon = getImpactoIcon(alerta.impacto)
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alerta.impacto === 'Crítico' ? 'bg-red-50 border-red-500' :
                    alerta.impacto === 'Alto' ? 'bg-orange-50 border-orange-500' :
                    'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 ${
                        alerta.impacto === 'Crítico' ? 'text-red-500' :
                        alerta.impacto === 'Alto' ? 'text-orange-500' : 'text-yellow-500'
                      }`} />
                      <h4 className="font-medium text-gray-900">{alerta.tipo}</h4>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getProbabilidadColor(alerta.probabilidad)}`}>
                      {alerta.probabilidad}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{alerta.descripcion}</p>
                  <p className="text-sm font-medium text-gray-900 mb-1">Acción recomendada:</p>
                  <p className="text-xs text-gray-600">{alerta.accion}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Proyección: {alerta.fecha}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Factores de influencia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Factores de Influencia IA</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={datos.factoresInfluencia} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              domain={[0, 1]}
              stroke="#666"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <YAxis 
              dataKey="factor" 
              type="category" 
              width={150}
              stroke="#666"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              formatter={(value: any, name: string) => [value.toFixed(2), 'Importancia']}
              labelFormatter={(label) => `Factor: ${label}`}
            />
            <Bar 
              dataKey="importancia" 
              fill="#00BFA6"
              cornerRadius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}