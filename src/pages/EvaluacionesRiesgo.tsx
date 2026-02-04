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
  Settings,
  PieChart
} from 'lucide-react'
import { AnalisisErgonomicoIA } from '@/components/AnalisisErgonomicoIA'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { Button } from '@/components/ui/button'
import {
  BarChart as ReChartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as ReChartsLineChart,
  Line,
  PieChart as ReChartsPieChart,
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
    email: 'demo@GPMedical.com',
    name: 'Usuario Demo',
    hierarchy: 'super_admin' as const,
    empresa: { nombre: 'GPMedical Demo Corp' },
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
      <PremiumPageHeader
        title="Evaluación de Riesgos & Ergonomía"
        subtitle="Análisis biomecánico avanzado y monitoreo ambiental preventivo impulsado por visión artificial."
        icon={ShieldCheck}
        badge="NORMATIVA NOM-036"
        actions={
          <div className="flex flex-wrap gap-3">
            <Button
              variant={vistaActual === 'dashboard' ? 'premium' : 'outline'}
              onClick={() => setVistaActual('dashboard')}
              className="h-11 px-6 shadow-xl shadow-emerald-500/20"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Intelligence
            </Button>

            <Button
              variant={vistaActual === 'lista' ? 'premium' : 'outline'}
              onClick={() => setVistaActual('lista')}
              className="h-11 px-6 shadow-xl shadow-emerald-500/20"
            >
              <FileText className="w-5 h-5 mr-2" />
              Inventario
            </Button>

            <Button
              variant={vistaActual === 'ia' ? 'premium' : 'outline'}
              onClick={() => setVistaActual('ia')}
              className="h-11 px-6 shadow-xl shadow-emerald-500/20"
            >
              <Brain className="w-5 h-5 mr-2" />
              Análisis Vision IA
            </Button>

            <Button
              variant="premium"
              onClick={handleNuevaEvaluacion}
              className="h-11 px-8 bg-gradient-to-r from-emerald-500 to-teal-700 shadow-xl shadow-emerald-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Evaluación
            </Button>
          </div>
        }
      />

      {/* Vista Dashboard */}
      {vistaActual === 'dashboard' && (
        <>
          {/* Métricas principales - Premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PremiumMetricCard
              title="Métricas de Riesgo Global"
              value={evaluaciones.length}
              subtitle="Expedientes Biomecánicos"
              icon={ShieldCheck}
              gradient="emerald"
              trend={{ value: 12, isPositive: true }}
            />

            <PremiumMetricCard
              title="Alertas Críticas"
              value={evaluaciones.filter(e => e.nivel_riesgo === 'alto' || e.nivel_riesgo === 'critico').length}
              subtitle="Intervención Requerida"
              icon={AlertTriangle}
              gradient="rose"
            />

            <PremiumMetricCard
              title="Predictive Compliance"
              value={`${Math.round(evaluaciones.reduce((acc, e) => acc + e.score_riesgo, 0) / evaluaciones.length)}%`}
              subtitle="Eficiencia Ergonómica"
              icon={Target}
              gradient="emerald"
              trend={{ value: 5, isPositive: true }}
            />

            <PremiumMetricCard
              title="Vigilancia Normativa"
              value="87%"
              subtitle="NOM-036 Cumplimiento"
              icon={Award}
              gradient="amber"
            />
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Distribución de riesgo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-[2rem] border border-white/40 p-8 shadow-xl"
            >
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <PieChart className="w-5 h-5 text-emerald-600" />
                </div>
                Distribución de Niveles de Riesgo
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReChartsPieChart>
                    <Pie
                      data={datosEvaluacionesPorNivel}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="cantidad"
                      label={({ nivel, cantidad }) => `${nivel}: ${cantidad}`}
                    >
                      {datosEvaluacionesPorNivel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                  </ReChartsPieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Tendencias de evaluaciones */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-[2rem] border border-white/40 p-8 shadow-xl"
            >
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                Tendencias de Salud Ocupacional
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReChartsLineChart data={datosTendenciasEvaluaciones}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Line type="monotone" dataKey="evaluaciones" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="completadas" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </ReChartsLineChart>
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
                        className={`h-2 rounded-full ${medicion.actual > medicion.limite ? 'bg-red-500' : 'bg-primary'
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
                  <ReChartsBarChart data={datosCumplimientoNormativo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="norma" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Cumplimiento']} />
                    <Bar dataKey="cumplimiento" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </ReChartsBarChart>
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
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 max-w-2xl">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por empresa, puesto o empleado..."
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="h-12 px-4 text-xs font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white/50 outline-none transition-all cursor-pointer"
                >
                  <option value="todos">Estado: Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completada">Completada</option>
                  <option value="vencida">Vencida</option>
                </select>
                <select
                  value={filtroEmpresa}
                  onChange={(e) => setFiltroEmpresa(e.target.value)}
                  className="h-12 px-4 text-xs font-bold border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white/50 outline-none transition-all cursor-pointer"
                >
                  <option value="todas">Empresa: Todas</option>
                  <option value="1">Corporativo Industrial SA</option>
                  <option value="2">Servicios Médicos ABC</option>
                </select>
                <Button variant="outline" className="h-12 rounded-xl border-slate-200 hover:border-emerald-200 hover:text-emerald-600 font-bold px-6">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla de evaluaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      ID Registro
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Entidad Corporativa
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Capital Humano
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Estado Operativo
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Riesgo
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Score (IA)
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Vigilancia
                    </th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
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
                              className={`h-2 rounded-full ${evaluacion.score_riesgo > 70 ? 'bg-red-500' :
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleVerEvaluacion(evaluacion.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-600 hover:text-white transition-all shadow-sm"
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
