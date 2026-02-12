/**
 * Agenda - Vista Dual (Super Admin vs Operativa)
 * 
 * Super Admin: Panel de monitoreo de agenda global
 * Otros roles: Vista operativa de calendario
 */
import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarioPrincipal } from './agenda/CalendarioPrincipal'
import { useAgenda } from '@/hooks/useAgenda'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { statsService, sedesService } from '@/services/dataService'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NewAppointmentDialog } from '@/components/agenda/NewAppointmentDialog'
import {
  Calendar as CalendarIcon, Plus, Shield, Users, Clock, CheckCircle, XCircle,
  Building2, TrendingUp, TrendingDown, BarChart3, Activity, AlertCircle,
  ChevronRight, RefreshCw, Download, Eye, Stethoscope, Timer, Loader2,
  Brain, Zap, BarChart, PieChart as PieChartIcon
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart as ReChartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart as ReChartsBarChart,
  Bar,
  Cell
} from 'recharts'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { DataContainer } from '@/components/ui/DataContainer'

// Interfaces
interface MetricasAgenda {
  citasHoy: number
  citasCompletadas: number
  citasPendientes: number
  citasCanceladas: number
  promedioTiempoEspera: number
  tasaCumplimiento: number
}

interface SedeMetrica {
  nombre: string
  citasHoy: number
  medicosActivos: number
  ocupacion: number
  satisfaccion: number
}

// Componente: Stat Card de Agenda
const AgendaStatCard = ({ icon: Icon, title, value, subtitle, color, trend }: {
  icon: any; title: string; value: string | number; subtitle?: string; color: string; trend?: { direction: 'up' | 'down'; value: string }
}) => {
  const gradients: Record<string, string> = {
    blue: 'from-slate-800 to-slate-950',
    emerald: 'from-emerald-500 to-emerald-700',
    purple: 'from-indigo-600 to-indigo-800',
    orange: 'from-amber-500 to-amber-700',
    rose: 'from-rose-500 to-rose-700',
    slate: 'from-slate-600 to-slate-800',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[color]} p-5 shadow-lg text-white`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trend.direction === 'up' ? 'text-emerald-200' : 'text-red-200'}`}>
              {trend.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </div>
          )}
        </div>
        <h3 className="text-3xl font-black">{value}</h3>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  )
}

// Componente: Fila de Sede
const SedeRow = ({ sede, index }: { sede: SedeMetrica; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
        {sede.nombre.charAt(0)}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{sede.nombre}</h4>
        <p className="text-xs text-gray-500">{sede.medicosActivos} médicos activos</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="text-center">
        <p className="text-xl font-bold text-gray-900">{sede.citasHoy}</p>
        <p className="text-xs text-gray-500">Citas hoy</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-blue-600">{sede.ocupacion}%</p>
        <p className="text-xs text-gray-500">Ocupación</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-emerald-600">{sede.satisfaccion}⭐</p>
        <p className="text-xs text-gray-500">Rating</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
    </div>
  </motion.div>
)

// Componente: Alerta de Agenda
const AgendaAlert = ({ icon: Icon, message, severity, time }: {
  icon: any; message: string; severity: 'warning' | 'error' | 'info'; time: string
}) => {
  const colors = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }
  const iconColors = { warning: 'text-amber-500', error: 'text-red-500', info: 'text-blue-500' }

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${colors[severity]}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${iconColors[severity]}`} />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <span className="text-xs opacity-70">{time}</span>
    </div>
  )
}

export const Agenda = () => {
  const { user } = useAuth()
  const isSuperAdmin = user?.rol === 'super_admin'
  const { obtenerEventosCalendario, loading, obtenerCitas } = useAgenda()

  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState('overview')
  const [loadingMetrics, setLoadingMetrics] = useState(true)

  // Métricas para Super Admin
  const [metricas, setMetricas] = useState<MetricasAgenda>({
    citasHoy: 0, citasCompletadas: 0, citasPendientes: 0, citasCanceladas: 0,
    promedioTiempoEspera: 0, tasaCumplimiento: 0
  })
  const [sedes, setSedes] = useState<SedeMetrica[]>([])

  const eventos = obtenerEventosCalendario()

  // Cargar métricas para Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const fetchMetrics = async () => {
        setLoadingMetrics(true)
        try {
          const [agendaStats, sedesData] = await Promise.all([
            statsService.getAgendaStats(),
            sedesService.getAll()
          ])

          setMetricas({
            citasHoy: agendaStats.citasHoy,
            citasCompletadas: agendaStats.citasCompletadas,
            citasPendientes: agendaStats.citasPendientes,
            citasCanceladas: agendaStats.citasCanceladas,
            promedioTiempoEspera: 12,
            tasaCumplimiento: agendaStats.tasaCumplimiento
          })

          if (sedesData) {
            setSedes(sedesData.map((s: any) => ({
              nombre: s.nombre,
              citasHoy: 0, // En el futuro obtendremos esto por sede
              medicosActivos: 0,
              ocupacion: 0,
              satisfaccion: 5
            })))
          }
        } catch (error) {
          console.error('Error fetching agenda stats:', error)
        } finally {
          setLoadingMetrics(false)
        }
      }
      fetchMetrics()
    }
  }, [isSuperAdmin])

  const handleNuevaCita = (fecha?: Date) => {
    setSelectedDate(fecha)
    setIsNewAppointmentOpen(true)
  }

  const handleCitaSeleccionada = (citaId: string) => {
    // TODO: Abrir detalle de cita
  }

  // ============================================
  // RENDER: VISTA SUPER ADMIN
  // ============================================
  if (isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        {/* Header God Mode */}
        <PremiumPageHeader
          title="Command Center: Agenda"
          subtitle="Monitoreo de slots médicos y optimización de flujo de pacientes asistida por IA."
          icon={CalendarIcon}
          badge="REAL-TIME MONITORING"
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-11 px-6 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest"
              >
                <Download className="w-4 h-4 mr-2" /> Exportar
              </Button>
              <Button
                variant="outline"
                className="h-11 px-6 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
              </Button>
            </div>
          }
        />

        <div className="w-full px-8 py-8 space-y-8">
          {/* Stats Grid */}
          <DataContainer
            loading={loadingMetrics}
            error={null}
            data={metricas}
            onRetry={() => window.location.reload()}
            hideEmpty
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <AgendaStatCard icon={CalendarIcon} title="Citas Hoy" value={metricas.citasHoy} color="blue" trend={{ direction: 'up', value: '+8%' }} />
              <AgendaStatCard icon={CheckCircle} title="Completadas" value={metricas.citasCompletadas} subtitle="Históricas" color="emerald" />
              <AgendaStatCard icon={Clock} title="Pendientes" value={metricas.citasPendientes} color="purple" />
              <AgendaStatCard icon={XCircle} title="Canceladas" value={metricas.citasCanceladas} color="rose" />
              <AgendaStatCard icon={Zap} title="Predicción IA" value="Alta" subtitle="Carga mañana" color="orange" trend={{ direction: 'up', value: '92%' }} />
              <AgendaStatCard icon={Activity} title="Cumplimiento" value={`${metricas.tasaCumplimiento}%`} color="slate" trend={{ direction: 'up', value: '+2%' }} />
            </div>
          </DataContainer>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/40 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl w-full justify-start shadow-sm">
              <TabsTrigger value="overview" className="rounded-xl px-6 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">
                📊 Vista General
              </TabsTrigger>
              <TabsTrigger value="sedes" className="rounded-xl px-6 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">
                🏥 Por Sede
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-xl px-6 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">
                📅 Calendario
              </TabsTrigger>
              <TabsTrigger value="alerts" className="rounded-xl px-6 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">
                ⚠️ Alertas
              </TabsTrigger>
            </TabsList>

            {/* Tab: Vista General */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ocupación Global (Gráfico Panorámico) */}
                <Card className="lg:col-span-2 border-0 shadow-xl bg-white overflow-hidden">
                  <CardHeader className="border-b bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-blue-500" />
                        Curva de Ocupación Global
                      </CardTitle>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En Tiempo Real</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReChartsAreaChart data={[
                          { hora: '8am', citas: 15, capacity: 50 },
                          { hora: '10am', citas: 45, capacity: 50 },
                          { hora: '12pm', citas: 30, capacity: 50 },
                          { hora: '2pm', citas: 48, capacity: 50 },
                          { hora: '4pm', citas: 25, capacity: 50 },
                          { hora: '6pm', citas: 10, capacity: 50 },
                        ]}>
                          <defs>
                            <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                          <Area type="monotone" dataKey="citas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCitas)" />
                        </ReChartsAreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* IA Predictive - No-show Risk */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Brain className="w-5 h-5 text-indigo-200" />
                      Predicción No-Show (IA)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="text-5xl font-black mb-1">12%</div>
                      <p className="text-indigo-200 text-sm font-medium">Riesgo de cancelación hoy</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Factores de Riesgo</p>
                      {[
                        { label: 'Clima (Lluvia)', impact: 'Alto', color: 'bg-rose-400' },
                        { label: 'Tráfico Zona Centro', impact: 'Medio', color: 'bg-amber-400' },
                        { label: 'Fecha Quincena', impact: 'Bajo', color: 'bg-emerald-400' },
                      ].map((factor, i) => (
                        <div key={i} className="flex items-center justify-between text-sm bg-white/10 p-2 rounded-lg">
                          <span>{factor.label}</span>
                          <span className={`${factor.color} px-2 py-0.5 rounded text-[10px] font-black`}>{factor.impact}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Rendimiento por Sede */}
                <Card className="lg:col-span-2 border-0 shadow-xl bg-white">
                  <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      Eficiencia por Sede
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-blue-600 font-bold">Ver Todo</Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {sedes.length > 0 ? sedes.map((sede, idx) => (
                      <SedeRow key={idx} sede={sede} index={idx} />
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No hay sedes registradas</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mix de Servicios */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-lg font-bold">Distribución de Citas</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReChartsBarChart data={[
                          { name: 'Cons.', value: 400 },
                          { name: 'Exám.', value: 300 },
                          { name: 'Cirug.', value: 200 },
                          { name: 'Otr.', value: 100 },
                        ]}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#10b981" />
                        </ReChartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Por Sede */}
            <TabsContent value="sedes" className="space-y-6">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Detalle por Sede</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Sede</th>
                          <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Citas Hoy</th>
                          <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Médicos</th>
                          <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Ocupación</th>
                          <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Satisfacción</th>
                          <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {sedes.map((sede, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-4 font-semibold text-gray-900">{sede.nombre}</td>
                            <td className="p-4 text-center text-2xl font-bold text-blue-600">{sede.citasHoy}</td>
                            <td className="p-4 text-center">{sede.medicosActivos}</td>
                            <td className="p-4 text-center">
                              <Badge className={sede.ocupacion > 80 ? 'bg-red-100 text-red-700' : sede.ocupacion > 60 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>
                                {sede.ocupacion}%
                              </Badge>
                            </td>
                            <td className="p-4 text-center text-emerald-600 font-bold">{sede.satisfaccion}⭐</td>
                            <td className="p-4 text-center">
                              <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Calendario */}
            <TabsContent value="calendar" className="space-y-6">
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-6">
                  <div className="h-[600px]">
                    <CalendarioPrincipal
                      eventos={eventos}
                      loading={loading}
                      onNuevaCita={handleNuevaCita}
                      onCitaSeleccionada={handleCitaSeleccionada}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Alertas */}
            <TabsContent value="alerts" className="space-y-6">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Alertas y Notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AgendaAlert icon={Clock} message="3 citas retrasadas en Sede Norte" severity="warning" time="Hace 15 min" />
                  <AgendaAlert icon={Users} message="5 pacientes esperando más de 30 minutos" severity="error" time="Ahora" />
                  <AgendaAlert icon={CalendarIcon} message="40% de slots sin agendar en Sede Sur" severity="info" time="Hoy" />
                  <AgendaAlert icon={Stethoscope} message="Dr. García sin citas asignadas mañana" severity="info" time="Ayer" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER: VISTA OPERATIVA (Otros roles)
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <NewAppointmentDialog
        open={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}
        defaultDate={selectedDate}
        onSuccess={() => obtenerCitas()}
      />

      <div className="w-full px-8 py-6">
        <PremiumPageHeader
          title="Agenda Médica"
          subtitle="Gestión predictiva de citas y optimización de flujo de consultorios."
          icon={CalendarIcon}
          badge="OPERATIVA ACTIVA"
          actions={
            <Button
              variant="premium"
              onClick={() => handleNuevaCita()}
              className="h-11 px-8 shadow-xl shadow-emerald-500/20 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-widest"
            >
              <Plus className="w-4 h-4 mr-2" /> Nueva Cita
            </Button>
          }
        />

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="h-[calc(100vh-250px)]">
              <CalendarioPrincipal
                eventos={eventos}
                loading={loading}
                onNuevaCita={handleNuevaCita}
                onCitaSeleccionada={handleCitaSeleccionada}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
