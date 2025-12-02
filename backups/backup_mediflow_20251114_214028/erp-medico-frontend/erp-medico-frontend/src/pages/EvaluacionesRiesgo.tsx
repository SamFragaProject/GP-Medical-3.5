// Página principal de Evaluaciones de Riesgo Ergonómico con IA
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Camera,
  FileText,
  TrendingUp,
  Map,
  Thermometer,
  Volume2,
  Sun,
  Droplets,
  Zap,
  Target,
  Award,
  Calendar,
  Building,
  Users,
  Activity,
  Brain,
  Lightbulb,
  BarChart3,
  MessageSquare,
  Settings
} from 'lucide-react'
import { AnalisisErgonomicoIA } from '@/components/AnalisisErgonomicoIA'
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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import toast from 'react-hot-toast'


interface EvaluacionRiesgo {
  id: string
  empresa_id: string
  empresa_nombre: string
  sede_id: string
  sede_nombre: string
  puesto_trabajo: string
  empleado_id: string
  empleado_nombre: string
  tipo_evaluacion: string
  fecha_evaluacion: string
  fecha_proxima_evaluacion: string
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'vencida'
  nivel_riesgo: 'bajo' | 'medio' | 'alto' | 'critico'
  score_riesgo: number
  hallazgos_principales: string[]
  recomendaciones_ia: string[]
  cumplimiento_normativo: string[]
  created_at: string
  updated_at: string
}

interface MedicionAmbiental {
  id: string
  evaluacion_id: string
  tipo_medio: 'ruido' | 'iluminacion' | 'temperatura' | 'humedad' | 'vibracion'
  valor_medido: number
  unidad: string
  valor_referencia: number
  porcentaje_cumplimiento: number
  fecha_medicion: string
  ubicacion: string
}

interface RecomendacionIA {
  id: string
  evaluacion_id: string
  tipo: 'equipamiento' | 'procedimiento' | 'capacitacion' | 'rediseño'
  descripcion: string
  impacto_esperado: 'bajo' | 'medio' | 'alto'
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  costo_estimado: number
  tiempo_implementacion: number
  fecha_creacion: string
}

export function EvaluacionesRiesgo() {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionRiesgo[]>([])
  const [mediciones, setMediciones] = useState<MedicionAmbiental[]>([])
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionIA[]>([])
  const [loading, setLoading] = useState(true)
  const [vistaActual, setVistaActual] = useState<'dashboard' | 'lista' | 'nueva' | 'analisis' | 'ia'>('dashboard')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('todas')
  const [searchQuery, setSearchQuery] = useState('')
  
const user = {
  id: 'demo-user',
  email: 'demo@mediflow.com',
  name: 'Usuario Demo',
  hierarchy: 'super_admin' as const,
  empresa: { nombre: 'MediFlow Demo Corp' },
  sede: { nombre: 'Sede Principal' }
}

  

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {

    try {
      setLoading(true)
      
      // Datos simulados para demostración
      const evaluacionesSimuladas: EvaluacionRiesgo[] = [
        {
          id: '1',
          empresa_id: '1',
          empresa_nombre: 'Corporativo Industrial SA',
          sede_id: '1',
          sede_nombre: 'Planta Norte',
          puesto_trabajo: 'Operador de Máquinas',
          empleado_id: '1',
          empleado_nombre: 'Juan Pérez García',
          tipo_evaluacion: 'ergonomica_completa',
          fecha_evaluacion: '2024-10-15',
          fecha_proxima_evaluacion: '2025-01-15',
          estado: 'completada',
          nivel_riesgo: 'alto',
          score_riesgo: 78,
          hallazgos_principales: [
            'Postura forzada en columna vertebral',
            'Movimientos repetitivos en muñeca',
            'Iluminación insuficiente'
          ],
          recomendaciones_ia: [
            'Adquirir silla ergonómica con soporte lumbar',
            'Implementar pausas activas cada 45 minutos',
            'Mejorar iluminación a 500 lux',
            'Capacitación en ergonomía'
          ],
          cumplimiento_normativo: ['NOM-006-STPS', 'OSHA-29CFR1910.95'],
          created_at: '2024-10-15T10:00:00Z',
          updated_at: '2024-10-15T16:30:00Z'
        },
        {
          id: '2',
          empresa_id: '2',
          empresa_nombre: 'Servicios Médicos ABC',
          sede_id: '2',
          sede_nombre: 'Sede Principal',
          puesto_trabajo: 'Enfermero/a',
          empleado_id: '2',
          empleado_nombre: 'María González',
          tipo_evaluacion: 'medicion_ambiental',
          fecha_evaluacion: '2024-10-20',
          fecha_proxima_evaluacion: '2024-12-20',
          estado: 'en_progreso',
          nivel_riesgo: 'medio',
          score_riesgo: 45,
          hallazgos_principales: [
            'Ruido ambiente superior a 60 dB',
            'Estaciones de trabajo sin regulaciones'
          ],
          recomendaciones_ia: [
            'Instalar materiales absorbentes de sonido',
            'Proveer escritorio regulable en altura'
          ],
          cumplimiento_normativo: ['NOM-011-STPS'],
          created_at: '2024-10-20T09:00:00Z',
          updated_at: '2024-10-20T15:45:00Z'
        }
      ]

      const medicionesSimuladas: MedicionAmbiental[] = [
        {
          id: '1',
          evaluacion_id: '1',
          tipo_medio: 'ruido',
          valor_medido: 85,
          unidad: 'dB',
          valor_referencia: 80,
          porcentaje_cumplimiento: 95,
          fecha_medicion: '2024-10-15T10:30:00Z',
          ubicacion: 'Área de producción'
        },
        {
          id: '2',
          evaluacion_id: '1',
          tipo_medio: 'iluminacion',
          valor_medido: 380,
          unidad: 'lux',
          valor_referencia: 500,
          porcentaje_cumplimiento: 76,
          fecha_medicion: '2024-10-15T11:00:00Z',
          ubicacion: 'Estación de trabajo'
        }
      ]

      const recomendacionesSimuladas: RecomendacionIA[] = [
        {
          id: '1',
          evaluacion_id: '1',
          tipo: 'equipamiento',
          descripcion: 'Silla ergonómica con soporte lumbar ajustable',
          impacto_esperado: 'alto',
          prioridad: 'alta',
          costo_estimado: 2500,
          tiempo_implementacion: 7,
          fecha_creacion: '2024-10-15T16:30:00Z'
        },
        {
          id: '2',
          evaluacion_id: '1',
          tipo: 'procedimiento',
          descripcion: 'Programa de pausas activas cada 45 minutos',
          impacto_esperado: 'medio',
          prioridad: 'media',
          costo_estimado: 0,
          tiempo_implementacion: 1,
          fecha_creacion: '2024-10-15T16:30:00Z'
        }
      ]

      setEvaluaciones(evaluacionesSimuladas)
      setMediciones(medicionesSimuladas)
      setRecomendaciones(recomendacionesSimuladas)

    } catch (error) {
      console.error('Error cargando evaluaciones:', error)
      toast.error('Error cargando datos de evaluaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleNuevaEvaluacion = () => {
    setVistaActual('nueva')
    toast.success('Abriendo formulario de nueva evaluación')
  }

  const handleVerEvaluacion = (id: string) => {
    toast.success(`Abriendo evaluación ${id}`)
    // Implementar navegación a vista detallada
  }

  const getNivelRiesgoColor = (nivel: string) => {
    switch (nivel) {
      case 'bajo': return 'bg-green-100 text-green-800 border-green-200'
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'alto': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critico': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 text-green-800'
      case 'en_progreso': return 'bg-blue-100 text-blue-800'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'vencida': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Datos para gráficos
  const datosEvaluacionesPorNivel = [
    { nivel: 'Bajo', cantidad: 12, color: '#10B981' },
    { nivel: 'Medio', cantidad: 8, color: '#F59E0B' },
    { nivel: 'Alto', cantidad: 5, color: '#EF4444' },
    { nivel: 'Crítico', cantidad: 2, color: '#DC2626' }
  ]

  const datosTendenciasEvaluaciones = [
    { mes: 'Ene', evaluaciones: 15, completadas: 12 },
    { mes: 'Feb', evaluaciones: 18, completadas: 16 },
    { mes: 'Mar', evaluaciones: 22, completadas: 20 },
    { mes: 'Abr', evaluaciones: 19, completadas: 17 },
    { mes: 'May', evaluaciones: 25, completadas: 23 },
    { mes: 'Jun', evaluaciones: 28, completadas: 26 }
  ]

  const datosCumplimientoNormativo = [
    { norma: 'NOM-006-STPS', cumplimiento: 85 },
    { norma: 'OSHA-29CFR', cumplimiento: 78 },
    { norma: 'NOM-011-STPS', cumplimiento: 92 },
    { norma: 'ISO-45001', cumplimiento: 88 }
  ]

  const datosMedicionesAmbientales = [
    { medio: 'Ruido', actual: 85, limite: 80 },
    { medio: 'Iluminación', actual: 380, limite: 500 },
    { medio: 'Temperatura', actual: 22, limite: 25 },
    { medio: 'Humedad', actual: 45, limite: 60 }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <span>Evaluaciones de Riesgo Ergonómico</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Análisis integral de riesgos ergonómicos y mediciones ambientales
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setVistaActual('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                vistaActual === 'dashboard'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 size={16} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setVistaActual('lista')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                vistaActual === 'lista'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={16} />
              <span>Evaluaciones</span>
            </button>
            <button
              onClick={() => setVistaActual('ia')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                vistaActual === 'ia'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Brain size={16} />
              <span>IA Ergonómica</span>
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNuevaEvaluacion}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Nueva Evaluación</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Vista Dashboard */}
      {vistaActual === 'dashboard' && (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Evaluaciones</p>
                  <p className="text-2xl font-bold text-gray-900">{evaluaciones.length}</p>
                  <p className="text-sm text-green-600">+12% vs mes anterior</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alto Riesgo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {evaluaciones.filter(e => e.nivel_riesgo === 'alto' || e.nivel_riesgo === 'critico').length}
                  </p>
                  <p className="text-sm text-red-600">Requiere atención</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Score Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(evaluaciones.reduce((acc, e) => acc + e.score_riesgo, 0) / evaluaciones.length)}%
                  </p>
                  <p className="text-sm text-green-600">Mejora continua</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cumplimiento</p>
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                  <p className="text-sm text-blue-600">Normativo</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Distribución de riesgo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Niveles de Riesgo</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datosEvaluacionesPorNivel}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="cantidad"
                      label={({ nivel, cantidad }) => `${nivel}: ${cantidad}`}
                    >
                      {datosEvaluacionesPorNivel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Tendencias de evaluaciones */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de Evaluaciones</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosTendenciasEvaluaciones}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="evaluaciones" stroke="#00BFA6" strokeWidth={2} />
                    <Line type="monotone" dataKey="completadas" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Mediciones ambientales y cumplimiento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mediciones ambientales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Mediciones Ambientales</span>
              </h3>
              <div className="space-y-4">
                {datosMedicionesAmbientales.map((medicion, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{medicion.medio}</span>
                      <span className="text-gray-600">
                        {medicion.actual}/{medicion.limite}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          medicion.actual > medicion.limite ? 'bg-red-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min((medicion.actual / medicion.limite) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cumplimiento normativo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <span>Cumplimiento Normativo</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosCumplimientoNormativo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="norma" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Cumplimiento']} />
                    <Bar dataKey="cumplimiento" fill="#00BFA6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Vista Lista */}
      {vistaActual === 'lista' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por empresa, puesto o empleado..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completada">Completada</option>
                  <option value="vencida">Vencida</option>
                </select>
                <select
                  value={filtroEmpresa}
                  onChange={(e) => setFiltroEmpresa(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="todas">Todas las empresas</option>
                  <option value="1">Corporativo Industrial SA</option>
                  <option value="2">Servicios Médicos ABC</option>
                </select>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                  <Filter size={16} />
                  <span>Filtrar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de evaluaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evaluación
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa/Sede
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puesto/Empleado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Riesgo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Próxima Evaluación
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {evaluaciones.map((evaluacion) => (
                    <tr key={evaluacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            #{evaluacion.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(evaluacion.fecha_evaluacion).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {evaluacion.empresa_nombre}
                          </p>
                          <p className="text-sm text-gray-500">
                            {evaluacion.sede_nombre}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {evaluacion.puesto_trabajo}
                          </p>
                          <p className="text-sm text-gray-500">
                            {evaluacion.empleado_nombre}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(evaluacion.estado)}`}>
                          {evaluacion.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getNivelRiesgoColor(evaluacion.nivel_riesgo)}`}>
                          {evaluacion.nivel_riesgo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                evaluacion.score_riesgo > 70 ? 'bg-red-500' :
                                evaluacion.score_riesgo > 40 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${evaluacion.score_riesgo}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{evaluacion.score_riesgo}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(evaluacion.fecha_proxima_evaluacion).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVerEvaluacion(evaluacion.id)}
                            className="text-primary hover:text-primary/80"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            title="Descargar reporte"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Vista Nueva Evaluación */}
      {vistaActual === 'nueva' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nueva Evaluación de Riesgo Ergonómico</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario de datos básicos */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Seleccionar empresa</option>
                        <option>Corporativo Industrial SA</option>
                        <option>Servicios Médicos ABC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sede
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Seleccionar sede</option>
                        <option>Planta Norte</option>
                        <option>Sede Principal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Puesto de Trabajo
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ej: Operador de Máquinas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empleado Evaluado
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Seleccionar empleado</option>
                        <option>Juan Pérez García</option>
                        <option>María González</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tipo de Evaluación</h3>
                  <div className="space-y-3">
                    {[
                      { value: 'ergonomica_completa', label: 'Análisis Ergonómico Completo', icon: Users },
                      { value: 'medicion_ambiental', label: 'Mediciones Ambientales', icon: Activity },
                      { value: 'postura_movimiento', label: 'Postura y Movimientos', icon: Target },
                      { value: 'evaluacion_visual', label: 'Evaluación Visual del Puesto', icon: Eye }
                    ].map((tipo) => (
                      <label key={tipo.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name="tipo_evaluacion" value={tipo.value} className="text-primary" />
                        <tipo.icon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{tipo.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Herramientas de medición */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Mediciones Ambientales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Volume2, label: 'Ruido (dB)', color: 'bg-blue-100 text-blue-600' },
                      { icon: Sun, label: 'Iluminación (lux)', color: 'bg-yellow-100 text-yellow-600' },
                      { icon: Thermometer, label: 'Temperatura (°C)', color: 'bg-red-100 text-red-600' },
                      { icon: Droplets, label: 'Humedad (%)', color: 'bg-cyan-100 text-cyan-600' },
                      { icon: Zap, label: 'Vibración (m/s²)', color: 'bg-purple-100 text-purple-600' }
                    ].map((herramienta) => (
                      <button
                        key={herramienta.label}
                        className={`p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors ${herramienta.color}`}
                      >
                        <herramienta.icon className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-xs font-medium">{herramienta.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Herramientas de Análisis</h3>
                  <div className="space-y-3">
                    <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <Map className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Mapa de Calor de Riesgo</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Visualización gráfica de áreas de riesgo</p>
                    </button>
                    <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <Camera className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Captura Fotográfica</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Documentación visual del puesto</p>
                    </button>
                    <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Generar Reporte</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Reporte técnico detallado</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setVistaActual('dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Iniciar Evaluación
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Vista IA Ergonómica */}
      {vistaActual === 'ia' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AnalisisErgonomicoIA />
        </motion.div>
      )}
    </div>
  )
}