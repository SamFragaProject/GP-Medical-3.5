// Dashboard principal del ERP Médico con tema verde mejorado
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  TrendingUp, 
  UserPlus, 
  Shield, 
  FileText, 
  Heart,
  DollarSign,
  FileDown,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Award,
  Stethoscope,
  TestTube,
  Brain,
  TrendingDown,
  Target,
  Zap,
  Building,
  Settings,
  Bell,
  TrendingUpIcon,
  TrendingDownIcon,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { useSaaSAuth } from '@/contexts/SaaSAuthContext'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalPacientes: number
  citasHoy: number
  examenesCompletados: number
  alertasActivas: number
  ingresosMes: number
  crecimiento: number
  pacientesPendientes: number
  estudiosRetrasados: number
  certificadosEmitidos: number
  facturacionPendiente: number
  tiempoPromedioAtencion: number
  satisfaccionCliente: number
  emergenciasHoy: number
  equiposDisponibles: number
}

interface AlertaRiesgo {
  id: string
  empresa_id: string
  tipo: string
  descripcion: string
  nivel_urgencia: string
  created_at: string
  resolved_at: string | null
}

// Interfaces para datos de gráficos
interface DatosExamenes {
  mes: string
  examenes: number
  completados: number
}

interface DatosIncapacidades {
  name: string
  value: number
  color: string
}

interface IngresosMensuales {
  mes: string
  ingresos: number
  objetivo: number
  crecimiento: number
}

interface MetricasRendimiento {
  categoria: string
  actual: number
  objetivo: number
  tendencia: string
  cambio: number
}

interface TopProcedimientos {
  nombre: string
  cantidad: number
  porcentaje: number
  ingresos: number
}

interface AlertaCritica {
  id: string
  tipo: 'critica' | 'warning' | 'info'
  titulo: string
  descripcion: string
  tiempo: string
  usuario: string
}

interface TooltipFormatterProps {
  value: any
  name: string
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alertas, setAlertas] = useState<AlertaRiesgo[]>([])
  const [loading, setLoading] = useState(true)
  
  const { user, hasRole } = useSaaSAuth()
  const { canAccess } = usePermissionCheck()
  const { currentUser } = useCurrentUser()

  // Verificar permisos antes de renderizar
  if (!currentUser || !canAccess('dashboard', 'view')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para ver el dashboard</p>
        </div>
      </div>
    )
  }

  // Renderizar dashboard específico por rol
  if (hasRole('paciente')) {
    const DashboardPaciente = React.lazy(() => import('@/components/dashboard/DashboardPaciente').then(module => ({ default: module.DashboardPaciente })))
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>}>
        <DashboardPaciente />
      </React.Suspense>
    )
  }

  if (hasRole('bot')) {
    const DashboardBot = React.lazy(() => import('@/components/dashboard/DashboardBot').then(module => ({ default: module.DashboardBot })))
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>}>
        <DashboardBot />
      </React.Suspense>
    )
  }

  // Dashboard general para otros roles (médicos, admin, etc.)
  // Resto del código del dashboard original...

  useEffect(() => {
    cargarDatosDashboard()
  }, [user])

  const cargarDatosDashboard = async () => {
    if (!user?.enterpriseId) return

    try {
      setLoading(true)
      
      // Datos profesionales simulados para demo
      const estadisticas: DashboardStats = {
        totalPacientes: 1847,
        citasHoy: 28,
        examenesCompletados: 186,
        alertasActivas: 7,
        ingresosMes: 142750,
        crecimiento: 18.5,
        pacientesPendientes: 42,
        estudiosRetrasados: 15,
        certificadosEmitidos: 134,
        facturacionPendiente: 23400,
        tiempoPromedioAtencion: 35, // minutos
        satisfaccionCliente: 94.2, // porcentaje
        emergenciasHoy: 3,
        equiposDisponibles: 96.7 // porcentaje
      }
      setStats(estadisticas)
      
      // Alertas simuladas
      const alertasActivas: AlertaRiesgo[] = [
        {
          id: '1',
          empresa_id: '1',
          tipo: 'alto_riesgo',
          descripcion: 'Empleado en puesto de alto riesgo requiere evaluación',
          nivel_urgencia: 'alta',
          created_at: new Date().toISOString(),
          resolved_at: null
        },
        {
          id: '2',
          empresa_id: '1',
          tipo: 'inventario_bajo',
          descripcion: 'Medicamentos próximos a vencer',
          nivel_urgencia: 'media',
          created_at: new Date().toISOString(),
          resolved_at: null
        }
      ]
      setAlertas(alertasActivas)

    } catch (error) {
      console.error('Error cargando dashboard:', error)
      toast.error('Error cargando datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Datos profesionales para gráficos
  const datosExamenes: DatosExamenes[] = [
    { mes: 'Ene', examenes: 85, completados: 82 },
    { mes: 'Feb', examenes: 92, completados: 88 },
    { mes: 'Mar', examenes: 78, completados: 75 },
    { mes: 'Abr', examenes: 101, completados: 96 },
    { mes: 'May', examenes: 95, completados: 92 },
    { mes: 'Jun', examenes: 88, completados: 85 }
  ]

  const datosIncapacidades: DatosIncapacidades[] = [
    { name: 'Medicina General', value: 45, color: '#10B981' },
    { name: 'Exámenes Ocupacionales', value: 30, color: '#3B82F6' },
    { name: 'Cardiología', value: 15, color: '#F59E0B' },
    { name: 'Traumatología', value: 10, color: '#EF4444' }
  ]

  const ingresosMensuales: IngresosMensuales[] = [
    { mes: 'Ene', ingresos: 125000, objetivo: 120000, crecimiento: 4.2 },
    { mes: 'Feb', ingresos: 132000, objetivo: 125000, crecimiento: 5.6 },
    { mes: 'Mar', ingresos: 118000, objetivo: 130000, crecimiento: -9.2 },
    { mes: 'Abr', ingresos: 145000, objetivo: 135000, crecimiento: 7.4 },
    { mes: 'May', ingresos: 138000, objetivo: 140000, crecimiento: -1.4 },
    { mes: 'Jun', ingresos: 152000, objetivo: 145000, crecimiento: 4.8 }
  ]

  // Nuevas métricas de rendimiento
  const metricasRendimiento: MetricasRendimiento[] = [
    { categoria: 'Tiempo de Atención', actual: 35, objetivo: 30, tendencia: 'up', cambio: -2.5 },
    { categoria: 'Satisfacción Cliente', actual: 94.2, objetivo: 95, tendencia: 'up', cambio: 1.8 },
    { categoria: 'Eficiencia Exámenes', actual: 92.5, objetivo: 90, tendencia: 'up', cambio: 2.1 },
    { categoria: 'Disponibilidad Equipos', actual: 96.7, objetivo: 98, tendencia: 'down', cambio: -1.3 },
    { categoria: 'Precisión Diagnóstica', actual: 98.1, objetivo: 97, tendencia: 'up', cambio: 0.8 }
  ]

  // Top procedimientos del mes
  const topProcedimientos: TopProcedimientos[] = [
    { nombre: 'Examen Periódico Anual', cantidad: 145, porcentaje: 35.2, ingresos: 87000 },
    { nombre: 'Evaluación Cardiovascular', cantidad: 89, porcentaje: 21.6, ingresos: 44500 },
    { nombre: 'Audiometría', cantidad: 67, porcentaje: 16.3, ingresos: 20100 },
    { nombre: 'Espirometría', cantidad: 45, porcentaje: 10.9, ingresos: 13500 },
    { nombre: 'Examen Oftalmológico', cantidad: 38, porcentaje: 9.2, ingresos: 11400 },
    { nombre: 'Otros', cantidad: 29, porcentaje: 7.0, ingresos: 14500 }
  ]

  // Alertas críticas del sistema
  const alertasCriticas: AlertaCritica[] = [
    {
      id: '1',
      tipo: 'critica',
      titulo: 'Examen de Emergencia Pendiente',
      descripcion: 'Paciente con síntomas cardiacos requiere atención inmediata',
      tiempo: 'Hace 15 min',
      usuario: 'Dr. Silva'
    },
    {
      id: '2',
      tipo: 'warning',
      titulo: 'Inventario Bajo',
      descripcion: 'Material para exámenes se agota en 3 días',
      tiempo: 'Hace 2 horas',
      usuario: 'Sistema'
    },
    {
      id: '3',
      tipo: 'info',
      titulo: 'Certificado Vencido',
      descripcion: '15 pacientes necesitan renovación de certificado médico',
      tiempo: 'Hace 4 horas',
      usuario: 'Sistema'
    }
  ]

  // Tarjetas de resumen profesionales
  const tarjetasResumen = [
    {
      titulo: 'Pacientes Activos',
      icono: Users,
      valor: stats?.totalPacientes?.toLocaleString() || '0',
      subtitulo: 'Total registrados',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      tendencia: '+12.5%',
      descripcion: 'Crecimiento mensual'
    },
    {
      titulo: 'Citas Hoy',
      icono: Calendar,
      valor: stats?.citasHoy?.toString() || '0',
      subtitulo: 'Consultas programadas',
      color: 'bg-gradient-to-r from-primary to-primary-600',
      tendencia: '+8.3%',
      descripcion: 'Eficiencia de agenda'
    },
    {
      titulo: 'Exámenes Completados',
      icono: Stethoscope,
      valor: stats?.examenesCompletados?.toString() || '0',
      subtitulo: 'Estudios realizados',
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      tendencia: '+18.7%',
      descripcion: 'Productividad mensual'
    },
    {
      titulo: 'Ingresos del Mes',
      icono: DollarSign,
      valor: `$${(stats?.ingresosMes || 0).toLocaleString()}`,
      subtitulo: 'Facturación mensual',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      tendencia: `+${stats?.crecimiento || 0}%`,
      descripcion: 'Crecimiento vs mes anterior'
    },
    {
      titulo: 'Alertas Activas',
      icono: AlertCircle,
      valor: stats?.alertasActivas?.toString() || '0',
      subtitulo: 'Requieren atención',
      color: stats?.alertasActivas > 5 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-amber-500 to-amber-600',
      tendencia: stats?.alertasActivas > 5 ? 'Crítico' : 'Normal',
      descripcion: 'Estado del sistema'
    },
    {
      titulo: 'Satisfacción Cliente',
      icono: Heart,
      valor: `${stats?.satisfaccionCliente || 0}%`,
      subtitulo: 'Puntuación promedio',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      tendencia: '+2.1%',
      descripcion: 'Índice de satisfacción'
    },
    {
      titulo: 'Tiempo Promedio',
      icono: Clock,
      valor: `${stats?.tiempoPromedioAtencion || 0} min`,
      subtitulo: 'Atención por paciente',
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      tendencia: stats?.tiempoPromedioAtencion && stats.tiempoPromedioAtencion <= 35 ? 'Excelente' : 'Mejorar',
      descripcion: 'Eficiencia operativa'
    },
    {
      titulo: 'Equipos Disponibles',
      icono: Activity,
      valor: `${stats?.equiposDisponibles || 0}%`,
      subtitulo: 'Operatividad',
      color: 'bg-gradient-to-r from-teal-500 to-teal-600',
      tendencia: '+1.2%',
      descripcion: 'Mantenimiento preventivo'
    }
  ]

  const getSeverityColor = (severidad: string) => {
    switch (severidad) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200'
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baja': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header de bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Bienvenido, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Aquí tienes un resumen de la actividad médica ocupacional de hoy
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-lg font-semibold text-primary">
              {user?.hierarchy || 'Medicina del Trabajo'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tarjetas de resumen profesionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tarjetasResumen.map((tarjeta, index) => (
          <motion.div
            key={tarjeta.titulo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2.5 rounded-lg ${tarjeta.color} shadow-sm`}>
                      <tarjeta.icono className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {tarjeta.titulo}
                    </h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {tarjeta.valor}
                    </p>
                    <p className="text-sm text-gray-600">
                      {tarjeta.subtitulo}
                    </p>
                    {tarjeta.descripcion && (
                      <p className="text-xs text-gray-500 mt-1">
                        {tarjeta.descripcion}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    tarjeta.tendencia.includes('+') && !tarjeta.tendencia.includes('Crítico')
                      ? 'bg-green-100 text-green-800'
                      : tarjeta.tendencia.includes('-')
                      ? 'bg-red-100 text-red-800'
                      : tarjeta.tendencia === 'Crítico'
                      ? 'bg-red-100 text-red-800'
                      : tarjeta.tendencia === 'Excelente'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tarjeta.tendencia === 'Mejorar'
                      ? 'bg-yellow-100 text-yellow-800'
                      : tarjeta.tendencia === 'Normal'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {tarjeta.tendencia}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Métricas de rendimiento y alertas críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Métricas de Rendimiento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Métricas de Rendimiento</span>
            </h2>
            <span className="text-sm text-gray-500">Actualizado hace 5 min</span>
          </div>
          
          <div className="space-y-4">
            {metricasRendimiento.map((metrica, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{metrica.categoria}</h3>
                  <div className="flex items-center space-x-2">
                    {metrica.tendencia === 'up' ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      metrica.tendencia === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrica.cambio > 0 ? '+' : ''}{metrica.cambio}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2 mr-4">
                      <div 
                        className={`h-2 rounded-full ${
                          metrica.actual >= metrica.objetivo ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min((metrica.actual / metrica.objetivo) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {metrica.actual}{metrica.categoria === 'Satisfacción Cliente' || metrica.categoria === 'Eficiencia Exámenes' || metrica.categoria === 'Disponibilidad Equipos' || metrica.categoria === 'Precisión Diagnóstica' ? '%' : metrica.categoria === 'Tiempo de Atención' ? ' min' : ''}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      Objetivo: {metrica.objetivo}{metrica.categoria === 'Satisfacción Cliente' || metrica.categoria === 'Eficiencia Exámenes' || metrica.categoria === 'Disponibilidad Equipos' || metrica.categoria === 'Precisión Diagnóstica' ? '%' : metrica.categoria === 'Tiempo de Atención' ? ' min' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alertas críticas y top procedimientos */}
        <div className="space-y-6">
          {/* Alertas Críticas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>Alertas Críticas</span>
            </h3>
            <div className="space-y-3">
              {alertasCriticas.map((alerta) => (
                <div key={alerta.id} className={`p-3 rounded-lg border-l-4 ${
                  alerta.tipo === 'critica' ? 'bg-red-50 border-red-500' :
                  alerta.tipo === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{alerta.titulo}</h4>
                      <p className="text-xs text-gray-600 mt-1">{alerta.descripcion}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">{alerta.tiempo}</span>
                        <span className="text-xs text-gray-500">• {alerta.usuario}</span>
                      </div>
                    </div>
                    {alerta.tipo === 'critica' && <XCircle className="h-4 w-4 text-red-600 mt-1" />}
                    {alerta.tipo === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600 mt-1" />}
                    {alerta.tipo === 'info' && <Bell className="h-4 w-4 text-blue-600 mt-1" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Procedimientos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span>Top Procedimientos</span>
            </h3>
            <div className="space-y-3">
              {topProcedimientos.slice(0, 4).map((procedimiento, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{procedimiento.nombre}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="bg-gray-200 rounded-full h-1.5 flex-1">
                        <div 
                          className="h-1.5 bg-primary rounded-full"
                          style={{ width: `${procedimiento.porcentaje}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{procedimiento.porcentaje}%</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-gray-900">{procedimiento.cantidad}</p>
                    <p className="text-xs text-gray-500">${procedimiento.ingresos.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Panel central */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingresos actuales y acciones */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>Ingresos Actuales</span>
              </h2>
              <p className="text-3xl font-bold text-primary mt-2">$112,450.00</p>
              <p className="text-sm text-gray-600">Ingresos del mes actual</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
                <UserPlus size={16} />
                <span>Nuevo Cargo</span>
              </button>
              <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2">
                <FileDown size={16} />
                <span>Emitir Factura</span>
              </button>
            </div>
          </div>

          {/* Gráfico de ingresos */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ingresosMensuales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="mes" 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [`$${value.toLocaleString()}`, 'Ingresos']}
                  labelStyle={{ color: '#666' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#00BFA6" 
                  strokeWidth={3}
                  dot={{ fill: '#00BFA6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#00BFA6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Registro de actividad */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="h-4 w-4 text-primary" />
              <span>Registro de Actividad</span>
            </h3>
            <div className="space-y-3">
              {[
                { accion: 'Consulta médica realizada', paciente: 'Juan Pérez', tiempo: 'hace 15 min', tipo: 'examen' },
                { accion: 'Pago seguro procesado', monto: '$2,500', tiempo: 'hace 1 hora', tipo: 'pago' },
                { accion: 'Compra suministros médicos', proveedor: 'MedSupply', tiempo: 'hace 2 horas', tipo: 'compra' }
              ].map((actividad, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-full ${
                      actividad.tipo === 'examen' ? 'bg-green-100' :
                      actividad.tipo === 'pago' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      {actividad.tipo === 'examen' && <CheckCircle size={12} className="text-green-600" />}
                      {actividad.tipo === 'pago' && <DollarSign size={12} className="text-blue-600" />}
                      {actividad.tipo === 'compra' && <Heart size={12} className="text-orange-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{actividad.accion}</p>
                      <p className="text-xs text-gray-500">
                        {actividad.paciente || actividad.monto || actividad.proveedor}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{actividad.tiempo}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Widget lateral - Resumen financiero y tarjetas de seguro */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Resumen Financiero */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Resumen Financiero</span>
            </h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosExamenes.slice(-3)}>
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
                  />
                  <Bar 
                    dataKey="examenes" 
                    fill="#00BFA6" 
                    cornerRadius={[4, 4, 0, 0]}
                    name="Exámenes"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ingresos totales</span>
                <span className="font-semibold text-gray-900">$112,450</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gastos operativos</span>
                <span className="font-semibold text-red-600">$45,200</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                <span className="text-gray-900 font-semibold">Utilidad neta</span>
                <span className="font-bold text-primary">$67,250</span>
              </div>
            </div>
          </div>

          {/* Tarjetas de Seguro */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Tarjetas de Seguro</span>
            </h3>
            <div className="space-y-3">
              {[
                { seguro: 'IMSS', pacientes: 156, color: 'bg-green-500' },
                { seguro: 'ISSSTE', pacientes: 43, color: 'bg-blue-500' },
                { seguro: 'Particular', pacientes: 78, color: 'bg-purple-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-900">{item.seguro}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.pacientes} pacientes</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alertas y estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alertas de riesgo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            <span>Alertas de Riesgo</span>
            {alertas.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {alertas.length}
              </span>
            )}
          </h3>
          
          {alertas.length > 0 ? (
            <div className="space-y-3">
              {alertas.slice(0, 5).map((alerta) => (
                <div key={alerta.id} className={`p-3 rounded-lg border ${getSeverityColor(alerta.nivel_urgencia)}`}>
                  <h4 className="font-medium text-sm">Alerta {alerta.tipo}</h4>
                  <p className="text-xs mt-1">{alerta.descripcion}</p>
                  <p className="text-xs mt-2 opacity-75">
                    {new Date(alerta.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No hay alertas activas</p>
              <p className="text-sm text-gray-500">Todo funcionando correctamente</p>
            </div>
          )}
        </motion.div>

        {/* Distribución de incapacidades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Award className="h-4 w-4 text-primary" />
            <span>Distribución de Incapacidades</span>
          </h3>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosIncapacidades}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {datosIncapacidades.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: string) => [`${value}%`, 'Porcentaje']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 mt-4">
            {datosIncapacidades.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}