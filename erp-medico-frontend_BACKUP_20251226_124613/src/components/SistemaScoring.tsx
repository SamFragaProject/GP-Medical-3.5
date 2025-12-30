// Sistema de Scoring Automático de Riesgos para Medicina del Trabajo
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  Target,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Activity,
  Award,
  Zap,
  Eye,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'
import toast from 'react-hot-toast'

interface ScoreData {
  empleado_id: string
  nombre: string
  puesto: string
  departamento: string
  scores: {
    ergonomico: number
    psicosocial: number
    seguridad: number
    salud_general: number
    riesgo_total: number
  }
  factores_contribuyentes: string[]
  recomendaciones: string[]
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  ultimo_evaluado: string
}

interface CriterioScoring {
  id: string
  nombre: string
  peso: number
  categoria: string
  descripcion: string
  normativo_relacionado: string
}

export function SistemaScoring() {
  const [scores, setScores] = useState<ScoreData[]>([])
  const [criterios, setCriterios] = useState<CriterioScoring[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDept, setSelectedDept] = useState<string>('todos')
  const [sortBy, setSortBy] = useState<string>('riesgo_total')

  useEffect(() => {
    cargarDatosScoring()
  }, [])

  const cargarDatosScoring = () => {
    // Criterios de scoring con pesos basados en normativas mexicanas
    const criteriosSimulados: CriterioScoring[] = [
      {
        id: 'postura',
        nombre: 'Evaluación Postural',
        peso: 0.25,
        categoria: 'Ergonómico',
        descripcion: 'Análisis de posturas prolongadas y movimientos repetitivos',
        normativo_relacionado: 'NOM-025-SSA3-2012'
      },
      {
        id: 'carga_laboral',
        nombre: 'Carga de Trabajo',
        peso: 0.20,
        categoria: 'Psicosocial',
        descripcion: 'Carga mental, presión temporal y autonomía laboral',
        normativo_relacionado: 'NOM-035-STPS-2018'
      },
      {
        id: 'seguridad_personal',
        nombre: 'Seguridad Personal',
        peso: 0.20,
        categoria: 'Seguridad',
        descripcion: 'Uso de equipos de protección y entrenamiento',
        normativo_relacionado: 'NOM-017-STPS-2008'
      },
      {
        id: 'exposicion_ambiental',
        nombre: 'Exposición Ambiental',
        peso: 0.15,
        categoria: 'Ambiental',
        descripcion: 'Ruido, iluminación, temperatura y sustancias',
        normativo_relacionado: 'NOM-010-STPS-2014'
      },
      {
        id: 'horas_trabajo',
        nombre: 'Jornada Laboral',
        peso: 0.10,
        categoria: 'Salud General',
        descripcion: 'Horas extraordinarias, rotación de turnos',
        normativo_relacionado: 'LFTR - Ley Federal del Trabajo'
      },
      {
        id: 'experiencia',
        nombre: 'Experiencia Laboral',
        peso: 0.10,
        categoria: 'Capacitación',
        descripcion: 'Años en el puesto y nivel de especialización',
        normativo_relacionado: 'Art. 153 LFT'
      }
    ]

    // Scores simulados de empleados
    const scoresSimulados: ScoreData[] = [
      {
        empleado_id: 'EMP001',
        nombre: 'Ana García López',
        puesto: 'Operaria de Línea',
        departamento: 'Producción',
        scores: {
          ergonomico: 78,
          psicosocial: 45,
          seguridad: 65,
          salud_general: 52,
          riesgo_total: 60
        },
        factores_contribuyentes: ['Posturas prolongadas', 'Movimientos repetitivos', 'Presión temporal'],
        recomendaciones: ['Evaluación ergonómica', 'Rotación de puesto', 'Manejo de estrés'],
        prioridad: 'alta',
        ultimo_evaluado: '2025-11-01'
      },
      {
        empleado_id: 'EMP002',
        nombre: 'Carlos Mendoza',
        puesto: 'Supervisor de Turno',
        departamento: 'Operaciones',
        scores: {
          ergonomico: 32,
          psicosocial: 82,
          seguridad: 45,
          salud_general: 68,
          riesgo_total: 56
        },
        factores_contribuyentes: ['Estrés laboral', 'Responsabilidad por equipo', 'Horarios variables'],
        recomendaciones: ['Programa anti-estrés', 'Apoyo psicológico', 'Revisión de turnos'],
        prioridad: 'media',
        ultimo_evaluado: '2025-11-01'
      },
      {
        empleado_id: 'EMP003',
        nombre: 'María Rodríguez',
        puesto: 'Analista de Calidad',
        departamento: 'Calidad',
        scores: {
          ergonomico: 45,
          psicosocial: 55,
          seguridad: 30,
          salud_general: 42,
          riesgo_total: 43
        },
        factores_contribuyentes: ['Postura sedentaria', 'Trabajo visual prolongado'],
        recomendaciones: ['Evaluación ergonómica de oficina', 'Pausas visuales', 'Ejercicios posturales'],
        prioridad: 'media',
        ultimo_evaluado: '2025-11-01'
      },
      {
        empleado_id: 'EMP004',
        nombre: 'Luis Hernández',
        puesto: 'Técnico de Mantenimiento',
        departamento: 'Mantenimiento',
        scores: {
          ergonomico: 85,
          psicosocial: 35,
          seguridad: 88,
          salud_general: 65,
          riesgo_total: 68
        },
        factores_contribuyentes: ['Esfuerzos físicos', 'Manejo de herramientas pesadas', 'Trabajo en espacios reducidos'],
        recomendaciones: ['Capacitación en ergonomía', 'Equipos de asistencia mecánica', 'Evaluación física'],
        prioridad: 'critica',
        ultimo_evaluado: '2025-11-01'
      },
      {
        empleado_id: 'EMP005',
        nombre: 'Elena Martínez',
        puesto: 'Coordinadora de RH',
        departamento: 'Recursos Humanos',
        scores: {
          ergonomico: 25,
          psicosocial: 72,
          seguridad: 40,
          salud_general: 58,
          riesgo_total: 49
        },
        factores_contribuyentes: ['Estrés emocional', 'Manejo de conflictos', 'Responsabilidad social'],
        recomendaciones: ['Terapia de manejo de estrés', 'Técnicas de relajación', 'Apoyo profesional'],
        prioridad: 'media',
        ultimo_evaluado: '2025-11-01'
      }
    ]

    setCriterios(criteriosSimulados)
    setScores(scoresSimulados)
  }

  const recalcularScoring = async () => {
    setLoading(true)
    toast.loading('Recalculando scores...', { id: 'scoring' })
    
    setTimeout(() => {
      setLoading(false)
      toast.success('Scoring actualizado correctamente', { id: 'scoring' })
      cargarDatosScoring()
    }, 2000)
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'bg-red-500'
      case 'alta': return 'bg-orange-500'
      case 'media': return 'bg-yellow-500'
      case 'baja': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600'
    if (score >= 50) return 'text-orange-600'
    if (score >= 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getPriorityIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return <XCircle className="h-4 w-4 text-red-500" />
      case 'alta': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'media': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'baja': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const departamentos = ['todos', 'Producción', 'Operaciones', 'Calidad', 'Mantenimiento', 'Recursos Humanos']
  
  const scoresFiltered = selectedDept === 'todos' 
    ? scores 
    : scores.filter(score => score.departamento === selectedDept)

  const sortedScores = [...scoresFiltered].sort((a, b) => {
    if (sortBy === 'riesgo_total') return b.scores.riesgo_total - a.scores.riesgo_total
    if (sortBy === 'empleado_id') return a.empleado_id.localeCompare(b.empleado_id)
    if (sortBy === 'prioridad') return a.prioridad.localeCompare(b.prioridad)
    return 0
  })

  // Datos para gráficos
  const riesgoData = scores.map(score => ({
    nombre: score.nombre.split(' ')[0],
    ergonomico: score.scores.ergonomico,
    psicosocial: score.scores.psicosocial,
    seguridad: score.scores.seguridad,
    salud_general: score.scores.salud_general,
    total: score.scores.riesgo_total
  }))

  const distribucionRiesgos = scores.reduce((acc, score) => {
    const rango = score.scores.riesgo_total
    if (rango >= 70) acc.alto++
    else if (rango >= 50) acc.medio++
    else if (rango >= 30) acc.bajo++
    else acc.minimo++
    return acc
  }, { alto: 0, medio: 0, bajo: 0, minimo: 0 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Sistema de Scoring Automático</h2>
            <p className="text-purple-100">
              Evaluación integral de riesgos por empleado con algoritmos de IA
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={recalcularScoring}
              disabled={loading}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Recalcular</span>
            </motion.button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empleados Evaluados</p>
              <p className="text-2xl font-bold text-gray-900">{scores.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Riesgo Alto/Crítico</p>
              <p className="text-2xl font-bold text-red-600">
                {scores.filter(s => s.scores.riesgo_total >= 70).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Riesgo Medio</p>
              <p className="text-2xl font-bold text-orange-600">
                {scores.filter(s => s.scores.riesgo_total >= 50 && s.scores.riesgo_total < 70).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Riesgo Bajo</p>
              <p className="text-2xl font-bold text-green-600">
                {scores.filter(s => s.scores.riesgo_total < 50).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtros y Controles */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 text-primary mr-2" />
              Filtros y Ordenamiento
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {departamentos.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'todos' ? 'Todos los Departamentos' : dept}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="riesgo_total">Riesgo Total</option>
                  <option value="empleado_id">ID Empleado</option>
                  <option value="prioridad">Prioridad</option>
                </select>
              </div>
            </div>
          </div>

          {/* Criterios de Scoring */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Criterios de Scoring</h3>
            <div className="space-y-3">
              {criterios.map((criterio) => (
                <div key={criterio.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-900">{criterio.nombre}</h4>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {(criterio.peso * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{criterio.categoria}</p>
                  <p className="text-xs text-gray-500">{criterio.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scores por Empleado</h3>
            
            <div className="space-y-4">
              {sortedScores.map((score) => (
                <motion.div
                  key={score.empleado_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{score.nombre}</h4>
                      <p className="text-sm text-gray-600">{score.puesto} - {score.departamento}</p>
                      <p className="text-xs text-gray-500">ID: {score.empleado_id}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {getPriorityIcon(score.prioridad)}
                        <span className="text-sm font-medium text-gray-900">
                          {score.prioridad.toUpperCase()}
                        </span>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(score.scores.riesgo_total)}`}>
                        {score.scores.riesgo_total}/100
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Ergonómico</span>
                        <span className="text-xs font-medium">{score.scores.ergonomico}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${score.scores.ergonomico}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Psicosocial</span>
                        <span className="text-xs font-medium">{score.scores.psicosocial}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${score.scores.psicosocial}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Seguridad</span>
                        <span className="text-xs font-medium">{score.scores.seguridad}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${score.scores.seguridad}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Salud General</span>
                        <span className="text-xs font-medium">{score.scores.salud_general}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${score.scores.salud_general}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Recomendaciones IA:</h5>
                    <div className="flex flex-wrap gap-2">
                      {score.recomendaciones.map((rec, index) => (
                        <span 
                          key={index}
                          className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                        >
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}