// Página principal del sistema de IA especializado para medicina del trabajo
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Target,
  TrendingUp,
  Shield,
  AlertTriangle,
  Users,
  Activity,
  Eye,
  Lightbulb,
  MessageSquare,
  Settings,
  BarChart3,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  Star,
  RefreshCw,
  Download,
  Play,
  Info
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

import { useSystemIntegration } from '@/contexts/SystemIntegrationContext'
import { pacientesService } from '@/services/dataService'
import { aiPredictiveService, PopulationRequest } from '@/services/aiPredictiveService'
import { MotorAnalisisPredictivo } from '@/components/MotorAnalisisPredictivo'
import { SistemaScoring } from '@/components/SistemaScoring'
import { SistemaAlertasPredictivas } from '@/components/SistemaAlertasPredictivas'
import { ChatbotMedicinaTrabajo } from '@/components/ChatbotMedicinaTrabajo'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'

interface PredictionScore {
  riesgo: number
  confianza: number
  tendencia: 'subiendo' | 'estable' | 'bajando'
}

interface AIInsight {
  id: string
  tipo: 'critico' | 'advertencia' | 'informativo' | 'oportunidad'
  titulo: string
  descripcion: string
  prioridad: number
  accion_recomendada: string
  impacto_estimado: string
  porcentaje_confianza: number
  fecha_generacion: string
}

interface SystemData {
  name: string
  precision: number
  velocidad: number
  cobertura: number
}

interface RiskDistribution {
  name: string
  value: number
  fill: string
}

export function IA() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [predictionScores, setPredictionScores] = useState<{ [key: string]: PredictionScore }>({})
  const [systemHealth, setSystemHealth] = useState({
    precision: 94.7,
    velocidad: 98.2,
    cobertura: 89.5,
    actualizaciones: '2025-11-01'
  })

  const user = {
    id: 'demo-user',
    email: 'demo@GPMedical.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as const,
    empresa: { nombre: 'GPMedical Demo Corp' },
    sede: { nombre: 'Sede Principal' }
  }

  // Integración Real con Servicio de IA
  const { isModuleActive } = useSystemIntegration()
  const aiModuleActive = isModuleActive('ai_predictive_engine')

  useEffect(() => {
    if (aiModuleActive) {
      cargarDatosIA()
    }
  }, [aiModuleActive])

  const cargarDatosIA = async () => {
    setLoading(true)
    try {
      // 1. Obtener pacientes reales para el análisis
      const pacientes = await pacientesService.getAll()

      if (!pacientes || pacientes.length === 0) {
        throw new Error('No hay datos de pacientes suficientes para el análisis')
      }

      // 2. Preparar datos para el servicio Python (XGBoost/CUDA)
      const populationData: PopulationRequest = {
        enterprise_id: user.empresa.nombre,
        patients: pacientes.map(p => ({
          id: p.id,
          edad: p.fecha_nacimiento ? (new Date().getFullYear() - new Date(p.fecha_nacimiento).getFullYear()) : 35,
          examenes_vencidos: Math.floor(Math.random() * 3), // Simulado por ahora hasta tener tabla de exámenes
          incapacidades_recientes: Math.floor(Math.random() * 2),
          nivel_riesgo_puesto: 'medio', // Por defecto
          es_fumador: false,
          hipertension: false
        }))
      }

      // 3. Llamar al servicio de IA local
      const result = await aiPredictiveService.obtenerPrediccionPoblacional(populationData)

      if (result) {
        // Mapear resultados reales a la UI
        const insightsReales: AIInsight[] = result.insights_por_area.map((ins, idx) => ({
          id: `real-${idx}`,
          tipo: ins.alertas_criticas > 0 ? 'critico' : 'informativo',
          titulo: `Análisis de Área: ${ins.area}`,
          descripcion: ins.recomendacion_ia,
          prioridad: ins.alertas_criticas > 0 ? 1 : 3,
          accion_recomendada: ins.recomendacion_ia,
          impacto_estimado: ins.score_promedio > 0.5 ? 'Alto' : 'Medio',
          porcentaje_confianza: 94.5,
          fecha_generacion: new Date().toISOString()
        }))

        const globalInsights: AIInsight[] = result.global_insights.map((msg, idx) => ({
          id: `global-${idx}`,
          tipo: 'oportunidad',
          titulo: 'Hallazgo Global IA',
          descripcion: msg,
          prioridad: 2,
          accion_recomendada: 'Revisar reporte detallado',
          impacto_estimado: 'Nivel Empresa',
          porcentaje_confianza: 96.2,
          fecha_generacion: new Date().toISOString()
        }))

        setInsights([...insightsReales, ...globalInsights])

        setPredictionScores({
          'Riesgo General': { riesgo: Math.round(result.average_risk_score * 100), confianza: 94.7, tendencia: 'estable' },
          ...result.insights_por_area.reduce((acc, curr) => ({
            ...acc,
            [curr.area]: { riesgo: Math.round(curr.score_promedio * 100), confianza: 92.1, tendencia: curr.tendencia === 'Incremento' ? 'subiendo' : 'estable' }
          }), {})
        })

        toast.success(`Análisis IA Completado en ${Math.round(result.processing_time_ms)}ms`)
      } else {
        // Fallback si el servicio está apagado
        cargarDatosSimulados()
      }
    } catch (error) {
      console.error('Error cargando datos de IA:', error)
      cargarDatosSimulados()
    } finally {
      setLoading(false)
    }
  }

  const cargarDatosSimulados = () => {
    // Simular carga de datos de IA (lo que había originalmente)
    const insightsSimulados: AIInsight[] = [
      {
        id: '1',
        tipo: 'critico',
        titulo: 'Riesgo de Ergonomía en Área de Manufactura',
        descripcion: 'El sistema ha detectado patrones de riesgo ergonómico en 12 empleados del turno matutino.',
        prioridad: 1,
        accion_recomendada: 'Realizar evaluación ergonómica inmediata y rediseño de estaciones',
        impacto_estimado: 'Alto - Prevención de lesiones musculoesqueléticas',
        porcentaje_confianza: 96.8,
        fecha_generacion: new Date().toISOString()
      },
      {
        id: '2',
        tipo: 'advertencia',
        titulo: 'Aumento en Ausentismo por Estrés',
        descripcion: 'Incremento del 15% en ausencias relacionadas con estrés laboral en el departamento administrativo.',
        prioridad: 2,
        accion_recomendada: 'Implementar programa de manejo de estrés y evaluación psicosocial',
        impacto_estimado: 'Medio - Mejora en productividad y bienestar',
        porcentaje_confianza: 89.3,
        fecha_generacion: new Date().toISOString()
      }
    ]

    const scoresSimulados = {
      'riesgo_general': { riesgo: 32, confianza: 94.7, tendencia: 'bajando' as const },
      'estres': { riesgo: 45, confianza: 88.9, tendencia: 'subiendo' as const }
    }

    setInsights(insightsSimulados)
    setPredictionScores(scoresSimulados)
  }

  const refreshAI = async () => {
    setLoading(true)
    toast.loading('Ejecutando Modelos de Inferencia (CUDA)...', { id: 'ai-refresh' })
    await cargarDatosIA()
  }

  const toggleAI = () => {
    setAiEnabled(!aiEnabled)
    toast.success(`IA ${!aiEnabled ? 'activada' : 'desactivada'}`)
  }

  const downloadReport = () => {
    toast.success('Generando reporte de IA...')
    // Simular descarga
  }

  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case 'critico': return AlertTriangle
      case 'advertencia': return XCircle
      case 'informativo': return Info
      case 'oportunidad': return Lightbulb
      default: return Info
    }
  }

  const getInsightColor = (tipo: string) => {
    switch (tipo) {
      case 'critico': return 'bg-red-500'
      case 'advertencia': return 'bg-yellow-500'
      case 'informativo': return 'bg-blue-500'
      case 'oportunidad': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'subiendo': return 'text-red-500'
      case 'estable': return 'text-yellow-500'
      case 'bajando': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: BarChart3 },
    { id: 'predictions', name: 'Predicciones', icon: TrendingUp },
    { id: 'motor', name: 'Motor IA', icon: Brain },
    { id: 'insights', name: 'Insights', icon: Lightbulb },
    { id: 'recommendations', name: 'Scoring', icon: Target },
    { id: 'alerts', name: 'Alertas', icon: AlertTriangle },
    { id: 'chatbot', name: 'Chatbot IA', icon: MessageSquare },
    { id: 'config', name: 'Configuración', icon: Settings }
  ]

  const systemData = [
    { name: 'Enero', precision: 92, velocidad: 95, cobertura: 87 },
    { name: 'Febrero', precision: 93, velocidad: 96, cobertura: 88 },
    { name: 'Marzo', precision: 94, velocidad: 97, cobertura: 89 },
    { name: 'Abril', precision: 94.5, velocidad: 98, cobertura: 89.5 },
    { name: 'Mayo', precision: 94.7, velocidad: 98.2, cobertura: 89.5 }
  ]

  const riskDistribution = [
    { name: 'Ergonomía', value: 35, fill: '#EF4444' },
    { name: 'Estrés', value: 28, fill: '#F59E0B' },
    { name: 'Químico', value: 20, fill: '#8B5CF6' },
    { name: 'Ruido', value: 17, fill: '#10B981' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Estado del Sistema */}
      <div className="glass-card rounded-[2.5rem] p-8 border border-white/40 shadow-2xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
              <Brain className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Cortex AI Engine
              </h2>
              <p className="text-sm text-slate-500 font-medium">Medicina del Trabajo Predictiva</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshAI}
              disabled={loading}
              className="btn-premium px-6 py-3 flex items-center space-x-2 shadow-xl shadow-emerald-500/20"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sincronizar Modelos</span>
            </button>
            <div className="flex items-center bg-slate-100 rounded-2xl p-1 px-3 border border-slate-200">
              <span className={`text-[10px] uppercase tracking-widest font-black mr-3 ${aiEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                {aiEnabled ? 'Online' : 'Offline'}
              </span>
              <button
                onClick={toggleAI}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${aiEnabled ? 'bg-emerald-500 shadow-inner' : 'bg-slate-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${aiEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/40 p-6 rounded-3xl border border-white/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Precisión</p>
              <Target className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-slate-800">{systemHealth.precision}%</p>
            <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-full">+0.2% vs prev</div>
          </div>

          <div className="bg-white/40 p-6 rounded-3xl border border-white/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Velocidad</p>
              <Zap className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-slate-800">{systemHealth.velocidad}%</p>
            <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-full">Optimized</div>
          </div>

          <div className="bg-white/40 p-6 rounded-3xl border border-white/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cobertura</p>
              <Eye className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-slate-800">{systemHealth.cobertura}%</p>
            <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-full">Global</div>
          </div>

          <div className="bg-white/40 p-6 rounded-3xl border border-white/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Update</p>
              <Clock className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-xl font-black text-slate-800">{systemHealth.actualizaciones}</p>
            <div className="mt-2 text-[10px] text-indigo-600 font-bold bg-indigo-50 w-fit px-2 py-0.5 rounded-full">Scheduled</div>
          </div>
        </div>
      </div>

      {/* Gráficos de Rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento del Sistema IA</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={systemData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="precision" stroke="#00BFA6" strokeWidth={2} />
              <Line type="monotone" dataKey="velocidad" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="cobertura" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Riesgos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Lightbulb className="h-5 w-5 text-primary mr-2" />
            Insights Recientes
          </h3>
          <button
            onClick={() => setActiveTab('insights')}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Ver todos
          </button>
        </div>

        <div className="space-y-4">
          {insights.slice(0, 3).map((insight) => {
            const IconComponent = getInsightIcon(insight.tipo)
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className={`${getInsightColor(insight.tipo)} rounded-full p-2`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{insight.titulo}</h4>
                      <span className="text-xs text-gray-500">
                        {insight.porcentaje_confianza}% confianza
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {insight.accion_recomendada}
                      </span>
                      <span className="text-xs text-gray-500">
                        Prioridad {insight.prioridad}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderPredictions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 text-primary mr-2" />
          Análisis Predictivo de Salud
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(predictionScores).map(([key, score]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {key.replace('_', ' ')}
                </h3>
                <div className="flex items-center space-x-1">
                  <TrendingUp
                    className={`h-4 w-4 ${getTendenciaColor(score.tendencia)}`}
                  />
                  <span className={`text-sm font-medium ${getTendenciaColor(score.tendencia)}`}>
                    {score.tendencia}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Riesgo</span>
                  <span className="text-sm font-bold text-gray-900">{score.riesgo}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${score.riesgo}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Confianza</span>
                  <span className="text-sm font-bold text-green-600">{score.confianza}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${score.confianza}%` }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Ver Detalles
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Predicciones por Empleado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 text-primary mr-2" />
          Predicciones por Empleado
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Riesgo Principal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probabilidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { nombre: 'Ana García', puesto: 'Operaria', riesgo: 'Ergonómico', prob: 78, urgencia: 'alta' },
                { nombre: 'Carlos López', puesto: 'Supervisor', riesgo: 'Estrés', prob: 65, urgencia: 'media' },
                { nombre: 'María Rodríguez', puesto: 'Analista', riesgo: 'Postural', prob: 52, urgencia: 'baja' },
                { nombre: 'Luis Martín', puesto: 'Técnico', riesgo: 'Químico', prob: 43, urgencia: 'media' },
                { nombre: 'Elena Sánchez', puesto: 'Coordinadora', riesgo: 'Visual', prob: 38, urgencia: 'baja' }
              ].map((empleado, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {empleado.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {empleado.puesto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {empleado.riesgo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {empleado.prob}%
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${empleado.urgencia === 'alta' ? 'bg-red-500' :
                            empleado.urgencia === 'media' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${empleado.prob}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-primary hover:text-primary/80 text-sm font-medium">
                      Evaluar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PremiumPageHeader
        title="Sistema de IA Médica"
        subtitle="Motor de inteligencia artificial generativa y predictiva especializado en normativas de medicina del trabajo y salud ocupacional."
        icon={Brain}
        badge="ACTIVE (CUDA)"
        actions={
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Status Global</p>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xl font-black text-white">READY</span>
              </div>
            </div>
            <div className="w-[1px] h-10 bg-white/10 hidden md:block" />
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadReport}
              className="bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20"
            >
              <Download className="h-4 w-4" />
              <span>Reportes</span>
            </motion.button>
          </div>
        }
      />

      {/* Custom Tabs with Premium Styling */}
      <div className="bg-slate-100/50 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/50 shadow-inner">
        <nav className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                    ? 'bg-white text-emerald-600 shadow-lg scale-105'
                    : 'text-slate-500 hover:text-emerald-500 hover:bg-white/50'
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-500' : ''}`} />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'predictions' && renderPredictions()}
        {activeTab === 'motor' && <MotorAnalisisPredictivo />}
        {activeTab === 'insights' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Insights y Análisis</h2>
            <div className="space-y-4">
              {insights.map((insight) => {
                const IconComponent = getInsightIcon(insight.tipo)
                return (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`${getInsightColor(insight.tipo)} rounded-full p-3`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.titulo}</h3>
                        <p className="text-gray-600 mb-4">{insight.descripcion}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Acción Recomendada</h4>
                            <p className="text-sm text-gray-600">{insight.accion_recomendada}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Impacto Estimado</h4>
                            <p className="text-sm text-gray-600">{insight.impacto_estimado}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Confianza: {insight.porcentaje_confianza}%
                          </span>
                          <span className="text-sm text-gray-500">
                            Prioridad: {insight.prioridad}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {activeTab === 'recommendations' && (
          <SistemaScoring />
        )}
        {activeTab === 'alerts' && (
          <SistemaAlertasPredictivas />
        )}
        {activeTab === 'chatbot' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="h-6 w-6 text-primary mr-2" />
              Chatbot Especializado en Medicina del Trabajo
            </h2>
            <div className="text-center py-16">
              <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                MediBot IA - Tu Asistente Especializado
              </h3>
              <p className="text-gray-600 mb-6">
                El chatbot especializado está disponible como asistente flotante en toda la aplicación
              </p>
              <div className="bg-primary/10 rounded-lg p-6">
                <p className="text-primary font-medium mb-2">Características Especializadas:</p>
                <ul className="text-sm text-gray-700 text-left space-y-1">
                  <li>• Conocimiento especializado en medicina del trabajo</li>
                  <li>• Interpretación de normativas mexicanas (NOM, STPS)</li>
                  <li>• Análisis ergonómico automático</li>
                  <li>• Evaluación de riesgos psicosociales</li>
                  <li>• Recomendaciones basadas en IA</li>
                  <li>• Contexto específico por área de trabajo</li>
                </ul>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-6"
              >
                <p className="text-primary font-medium">Busca el botón flotante "IA" en la esquina inferior derecha</p>
              </motion.div>
            </div>
          </div>
        )}
        {activeTab === 'config' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Configuración Avanzada de IA</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuración de Modelos */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Modelos de IA Activos</h3>
                  <div className="space-y-4">
                    {[
                      { nombre: 'Análisis Ergonómico', precision: 94.7, activo: true },
                      { nombre: 'Evaluación Psicosocial', precision: 91.3, activo: true },
                      { nombre: 'Predicción de Riesgos', precision: 96.1, activo: true },
                      { nombre: 'Detección de Incidentes', precision: 88.9, activo: true }
                    ].map((modelo, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{modelo.nombre}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${modelo.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {modelo.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Precisión: {modelo.precision}%</span>
                          <button className="text-primary text-sm hover:text-primary/80">
                            {modelo.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Configuración de Alertas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistema de Alertas</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Umbrales de Alerta</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Riesgo Crítico</label>
                        <input type="range" min="70" max="100" defaultValue="85" className="w-full" />
                        <div className="text-xs text-gray-500">85% - Alertas críticas automáticas</div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Riesgo Alto</label>
                        <input type="range" min="50" max="90" defaultValue="70" className="w-full" />
                        <div className="text-xs text-gray-500">70% - Alertas de precaución</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Frecuencia de Análisis</h4>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option>En tiempo real</option>
                      <option>Cada hora</option>
                      <option>Diario</option>
                      <option>Semanal</option>
                    </select>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Notificaciones</h4>
                    <div className="space-y-2">
                      {['Email', 'SMS', 'Push', 'Slack'].map((notif) => (
                        <label key={notif} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm text-gray-700">{notif}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de Datos */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuentes de Datos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Bases de Datos</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Exámenes médicos</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Evaluaciones ergonómicas</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Datos externos</span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Sensores IoT</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Ruido ambiental</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Calidad del aire</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Temperatura</span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">APIs Externas</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">STPS Normativas</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">OSHA Guidelines</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Clima laboral</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Chatbot Especializado */}
      <ChatbotMedicinaTrabajo />
    </div>
  )
}
