// Motor de Análisis Predictivo para Medicina del Trabajo
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Users,
  Activity,
  Target,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import toast from 'react-hot-toast'

interface PredictionModel {
  id: string
  nombre: string
  categoria: 'ergonomico' | 'psicosocial' | 'seguridad' | 'salud_general'
  precision: number
  ultimas_actualizaciones: string[]
  variables_entrada: string[]
  prediccion: number
  tendencia: 'subiendo' | 'bajando' | 'estable'
  confianza: number
  accion_recomendada: string
  normativos_relacionados: string[]
}

interface RiskScenario {
  id: string
  tipo: 'esenario_optimo' | 'esenario_actual' | 'esenario_pesimista'
  probabilidad: number
  descripcion: string
  impacto: 'bajo' | 'medio' | 'alto' | 'critico'
  medidas_preventivas: string[]
  tiempo_estimado: string // meses
}

export function MotorAnalisisPredictivo() {
  const [activeModel, setActiveModel] = useState<string>('ergonomico')
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<PredictionModel[]>([])
  const [scenarios, setScenarios] = useState<RiskScenario[]>([])

  useEffect(() => {
    cargarModelosPredictivos()
  }, [])

  const cargarModelosPredictivos = () => {
    // Simular modelos de IA entrenados
    const modelosSimulados: PredictionModel[] = [
      {
        id: 'ergonomico',
        nombre: 'Análisis de Riesgos Ergonómicos',
        categoria: 'ergonomico',
        precision: 94.7,
        ultimas_actualizaciones: ['2025-10-15', '2025-10-28', '2025-11-01'],
        variables_entrada: ['postura', 'carga_laboral', 'tiempo_actividad', 'repeticiones', 'fuerza_aplicada'],
        prediccion: 78.5,
        tendencia: 'bajando',
        confianza: 96.2,
        accion_recomendada: 'Implementar programa de ergonomía y rotación de personal',
        normativos_relacionados: ['NOM-025-SSA3-2012', 'ISO 45001:2018']
      },
      {
        id: 'psicosocial',
        nombre: 'Riesgo Psicosocial y Estrés',
        categoria: 'psicosocial',
        precision: 91.3,
        ultimas_actualizaciones: ['2025-10-20', '2025-10-30', '2025-11-01'],
        variables_entrada: ['horas_trabajo', 'presion_tiempo', 'autonomia', 'carga_mental', 'clima_laboral'],
        prediccion: 65.8,
        tendencia: 'subiendo',
        confianza: 89.7,
        accion_recomendada: 'Programa de manejo de estrés y evaluación psicosocial organizacional',
        normativos_relacionados: ['NOM-035-STPS-2018', 'NMX-025-SSA3-2015']
      },
      {
        id: 'seguridad',
        nombre: 'Predicción de Incidentes de Seguridad',
        categoria: 'seguridad',
        precision: 96.1,
        ultimas_actualizaciones: ['2025-10-25', '2025-10-29', '2025-11-01'],
        variables_entrada: ['entrenamiento', 'equipos_proteccion', 'experiencia', 'fatiga', 'factores_ambientales'],
        prediccion: 23.4,
        tendencia: 'estable',
        confianza: 93.8,
        accion_recomendada: 'Refuerzo en capacitación y mejora de procedimientos de seguridad',
        normativos_relacionados: ['NOM-017-STPS-2008', 'NOM-002-STPS-2010']
      },
      {
        id: 'salud_general',
        nombre: 'Salud General y Ausentismo',
        categoria: 'salud_general',
        precision: 88.9,
        ultimas_actualizaciones: ['2025-10-18', '2025-10-27', '2025-11-01'],
        variables_entrada: ['edad', 'tiempo_antiguedad', 'turno_trabajo', 'actividades_fisicas', 'estilo_vida'],
        prediccion: 45.2,
        tendencia: 'bajando',
        confianza: 87.5,
        accion_recomendada: 'Programa integral de promoción de la salud ocupacional',
        normativos_relacionados: ['NOM-006-STPS-2014', 'NOM-010-STPS-2014']
      }
    ]

    const escenariosSimulados: RiskScenario[] = [
      {
        id: 'optimo',
        tipo: 'esenario_optimo',
        probabilidad: 85,
        descripcion: 'Implementación completa de medidas preventivas y cultura de seguridad',
        impacto: 'alto',
        medidas_preventivas: ['Capacitación continua', 'Rotación de puestos', 'Evaluaciones médicas regulares'],
        tiempo_estimado: '12-18'
      },
      {
        id: 'actual',
        tipo: 'esenario_actual',
        probabilidad: 60,
        descripcion: 'Situación actual con medidas básicas de prevención',
        impacto: 'medio',
        medidas_preventivas: ['Protocolos estándar', 'Exámenes ocupacionales anuales'],
        tiempo_estimado: '6-12'
      },
      {
        id: 'pesimista',
        tipo: 'esenario_pesimista',
        probabilidad: 25,
        descripcion: 'Incremento en factores de riesgo sin medidas preventivas adecuadas',
        impacto: 'critico',
        medidas_preventivas: ['Intervención urgente', 'Revisión completa de procesos', 'Medidas correctivas inmediatas'],
        tiempo_estimado: '3-6'
      }
    ]

    setPredictions(modelosSimulados)
    setScenarios(escenariosSimulados)
  }

  const runAnalysis = async () => {
    setLoading(true)
    toast.loading('Ejecutando análisis predictivo...', { id: 'analysis' })
    
    setTimeout(() => {
      setLoading(false)
      toast.success('Análisis predictivo completado', { id: 'analysis' })
      cargarModelosPredictivos()
    }, 2000)
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subiendo': return <ArrowUp className="h-4 w-4 text-red-500" />
      case 'bajando': return <ArrowDown className="h-4 w-4 text-green-500" />
      case 'estable': return <Minus className="h-4 w-4 text-yellow-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'ergonomico': return 'from-blue-500 to-blue-600'
      case 'psicosocial': return 'from-purple-500 to-purple-600'
      case 'seguridad': return 'from-red-500 to-red-600'
      case 'salud_general': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const currentModel = predictions.find(p => p.id === activeModel)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Motor de Análisis Predictivo</h2>
            <p className="text-indigo-100">
              Algoritmos de machine learning especializados en medicina del trabajo
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runAnalysis}
            disabled={loading}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Brain className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
            <span>{loading ? 'Analizando...' : 'Nueva Predicción'}</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Modelos Predictivos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modelos de IA</h3>
            <div className="space-y-3">
              {predictions.map((model) => (
                <motion.button
                  key={model.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveModel(model.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    activeModel === model.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{model.nombre}</h4>
                    {getTendenciaIcon(model.tendencia)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Precisión: {model.precision}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Riesgo: {model.prediccion}%
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Principal */}
        <div className="lg:col-span-3 space-y-6">
          {currentModel && (
            <>
              {/* Resumen del Modelo */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">{currentModel.nombre}</h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Confianza del Modelo</p>
                      <p className="text-lg font-bold text-primary">{currentModel.confianza}%</p>
                    </div>
                    {getTendenciaIcon(currentModel.tendencia)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Predicción Actual</h4>
                    <div className="text-2xl font-bold text-primary mb-2">{currentModel.prediccion}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${currentModel.prediccion}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Precisión del Modelo</h4>
                    <div className="text-2xl font-bold text-green-600 mb-2">{currentModel.precision}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${currentModel.precision}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Tendencia</h4>
                    <div className={`text-2xl font-bold mb-2 capitalize ${
                      currentModel.tendencia === 'subiendo' ? 'text-red-500' :
                      currentModel.tendencia === 'bajando' ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {currentModel.tendencia}
                    </div>
                    <div className="flex items-center space-x-1">
                      {getTendenciaIcon(currentModel.tendencia)}
                      <span className="text-sm text-gray-600">
                        {currentModel.tendencia === 'subiendo' ? 'Aumentando' : 
                         currentModel.tendencia === 'bajando' ? 'Disminuyendo' : 'Estable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variables de Entrada */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Variables de Entrada Analizadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {currentModel.variables_entrada.map((variable, index) => (
                    <div key={index} className="bg-primary/5 rounded-lg p-3 text-center">
                      <p className="text-sm font-medium text-primary capitalize">
                        {variable.replace('_', ' ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acción Recomendada */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 text-primary mr-2" />
                  Acción Recomendada por IA
                </h4>
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/20">
                  <p className="text-gray-800 font-medium mb-3">{currentModel.accion_recomendada}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Normativos relacionados:</span>
                    <span className="text-primary font-medium">{currentModel.normativos_relacionados.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Escenarios de Riesgo */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Escenarios de Riesgo</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900 capitalize">
                          {scenario.tipo.replace('_', ' ')}
                        </h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scenario.impacto === 'critico' ? 'bg-red-100 text-red-800' :
                          scenario.impacto === 'alto' ? 'bg-orange-100 text-orange-800' :
                          scenario.impacto === 'medio' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {scenario.impacto}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">{scenario.descripcion}</p>
                        <div className="text-lg font-bold text-primary">{scenario.probabilidad}%</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Tiempo estimado: {scenario.tiempo_estimado} meses
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
