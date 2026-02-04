// Dashboard principal con KPIs clave de medicina del trabajo
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Award,
  Activity,
  Heart,
  Stethoscope,
  FileText,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Zap
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

interface DashboardKPIsProps {
  filtros: {
    empresa: string
    sede: string
    departamento: string
    fechaInicio: string
    fechaFin: string
  }
}

interface TendenciasMensualesData {
  mes: string
  examenes: number
  cumplimiento: number
  costos: number
}

interface DistribucionRiesgosData {
  name: string
  value: number
  color: string
}

interface TopRiesgosData {
  tipo: string
  empleados: number
  tendencia: string
}

interface CumplimientoNormativoData {
  norma: string
  cumplimiento: number
  icon: any
}

interface AlertasActivasData {
  tipo: string
  mensaje: string
  critico: boolean
}

// Datos simulados realistas para medicina del trabajo
const generarDatosKPIs = () => ({
  metricasGenerales: {
    totalEmpleados: 1247,
    examenesCompletados: 892,
    examenesPendientes: 134,
    tasaCumplimiento: 94.2,
    empresasActivas: 12,
    certificacionesVigentes: 1156,
    riesgoAlto: 23,
    riesgoMedio: 89,
    riesgoBajo: 1135,
    ausentismo: 4.2,
    costosMedicina: 245000,
    roiSalud: 3.8
  },
  
  tendenciasMensuales: [
    { mes: 'Ene', examenes: 145, cumplimiento: 92, costos: 45000 },
    { mes: 'Feb', examenes: 132, cumplimiento: 94, costos: 38000 },
    { mes: 'Mar', examenes: 167, cumplimiento: 89, costos: 52000 },
    { mes: 'Abr', examenes: 189, cumplimiento: 96, costos: 48000 },
    { mes: 'May', examenes: 156, cumplimiento: 93, costos: 42000 },
    { mes: 'Jun', examenes: 203, cumplimiento: 97, costos: 58000 }
  ],
  
  distribucionRiesgos: [
    { name: 'Bajo Riesgo', value: 85, color: '#10B981' },
    { name: 'Riesgo Medio', value: 12, color: '#F59E0B' },
    { name: 'Alto Riesgo', value: 3, color: '#EF4444' }
  ],
  
  topRiesgos: [
    { tipo: 'Exposición Química', empleados: 45, tendencia: 'up' },
    { tipo: 'Ergonomía', empleados: 32, tendencia: 'down' },
    { tipo: 'Ruido Industrial', empleados: 28, tendencia: 'stable' },
    { tipo: 'Temperaturas Extremas', empleados: 18, tendencia: 'up' },
    { tipo: 'Tráfico/Vehículos', empleados: 15, tendencia: 'down' }
  ],
  
  cumplimientoNormativo: [
    { norma: 'NOM-017-STPS-1993', cumplimiento: 98, icon: Shield },
    { norma: 'NOM-006-STPS-2014', cumplimiento: 94, icon: Activity },
    { norma: 'NOM-015-STPS-2001', cumplimiento: 91, icon: FileText },
    { norma: 'NOM-010-STPS-1999', cumplimiento: 96, icon: Heart }
  ],
  
  alertasActivas: [
    { tipo: 'Riesgo', mensaje: '3 empleados con exposición alta a químicos', critico: true },
    { tipo: 'Vencimiento', mensaje: '15 certificaciones vencen en 30 días', critico: false },
    { tipo: 'Cumplimiento', mensaje: '2 empresas por debajo del 90% cumplimiento', critico: true },
    { tipo: 'Costos', mensaje: 'Incremento del 15% en costos médicos', critico: false }
  ]
})

export function DashboardKPIs({ filtros }: DashboardKPIsProps) {
  const [datos, setDatos] = useState(generarDatosKPIs())
  const [tiempoReal, setTiempoReal] = useState(true)

  // Simular actualización en tiempo real
  useEffect(() => {
    if (tiempoReal) {
      const interval = setInterval(() => {
        setDatos(prev => ({
          ...prev,
          metricasGenerales: {
            ...prev.metricasGenerales,
            examenesCompletados: prev.metricasGenerales.examenesCompletados + Math.floor(Math.random() * 3),
            tasaCumplimiento: 94.2 + (Math.random() - 0.5) * 2
          }
        }))
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [tiempoReal])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX').format(num)
  }

  const formatTooltip = (value: any, name: string, props: any): [React.ReactNode, string] => {
    return [value, name === 'examenes' ? 'Exámenes' : 'Cumplimiento %']
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard Principal</h2>
          <p className="text-gray-600">Métricas en tiempo real de medicina del trabajo</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${tiempoReal ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {tiempoReal ? 'Tiempo Real' : 'Modo Manual'}
            </span>
          </div>
          
          <button
            onClick={() => setTiempoReal(!tiempoReal)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            {tiempoReal ? 'Pausar' : 'Activar'} Tiempo Real
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Empleados</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(datos.metricasGenerales.totalEmpleados)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% vs mes anterior</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cumplimiento</p>
              <p className="text-3xl font-bold text-gray-900">
                {datos.metricasGenerales.tasaCumplimiento.toFixed(1)}%
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+2.1% vs mes anterior</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Riesgo Alto</p>
              <p className="text-3xl font-bold text-red-600">
                {datos.metricasGenerales.riesgoAlto}
              </p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">Requiere atención</span>
              </div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI Salud</p>
              <p className="text-3xl font-bold text-purple-600">
                {datos.metricasGenerales.roiSalud.toFixed(1)}x
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm text-purple-600">+0.3x vs trimestre</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias mensuales */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={datos.tendenciasMensuales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={formatTooltip} />
              <Area 
                type="monotone" 
                dataKey="examenes" 
                stackId="1"
                stroke="#00BFA6" 
                fill="#00BFA6" 
                fillOpacity={0.3}
              />
              <Line 
                type="monotone" 
                dataKey="cumplimiento" 
                stroke="#8884d8" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distribución de riesgos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Riesgos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                dataKey="value"
                data={datos.distribucionRiesgos}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {datos.distribucionRiesgos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Sección de alertas y cumplimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas activas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Activas</h3>
          <div className="space-y-3">
            {datos.alertasActivas.map((alerta, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  alerta.critico 
                    ? 'bg-red-50 border-red-500' 
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{alerta.tipo}</p>
                    <p className="text-sm text-gray-600">{alerta.mensaje}</p>
                  </div>
                  <AlertTriangle className={`h-5 w-5 ${
                    alerta.critico ? 'text-red-500' : 'text-yellow-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cumplimiento normativo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cumplimiento Normativo</h3>
          <div className="space-y-4">
            {datos.cumplimientoNormativo.map((norma, index) => {
              const Icon = norma.icon
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{norma.norma}</p>
                      <div className="flex items-center mt-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${norma.cumplimiento}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {norma.cumplimiento}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Top riesgos ocupacionales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Riesgos Ocupacionales</h3>
        <div className="space-y-3">
          {datos.topRiesgos.map((riesgo, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{riesgo.tipo}</p>
                  <p className="text-sm text-gray-600">{riesgo.empleados} empleados afectados</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {riesgo.tendencia === 'up' && (
                  <TrendingUp className="h-5 w-5 text-red-500" />
                )}
                {riesgo.tendencia === 'down' && (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                )}
                {riesgo.tendencia === 'stable' && (
                  <div className="h-5 w-5 bg-yellow-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
