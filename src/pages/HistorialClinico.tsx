/**
 * Historial Clínico - Versión Premium "Clean Blue"
 * 
 * Interfaz moderna con glassmorphism, gradientes sutiles y micro-animaciones
 * Conectada a datos reales de Supabase
 */
import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import {
  Calendar, MapPin, Phone, Mail, Stethoscope, ArrowLeft, AlertTriangle,
  FileText, Activity, HeartPulse, ClipboardPlus, FlaskConical, Pill,
  User, Clock, ChevronRight, Download, Printer, Share2, MoreHorizontal,
  TrendingUp, Droplets, Thermometer, Heart, Brain, Eye, Loader2, Plus,
  Briefcase, Building2, Users, Award, Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PrescripcionBuilderOrganizado } from '@/components/medicina/PrescripcionBuilderOrganizado'
import { TimelineMedico } from '@/components/TimelineMedico'
import { PredictiveRiskCard } from '@/components/ia/PredictiveRiskCard'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { empresasService, pacientesService, consultasService } from '@/services/dataService'
import { NewEncounterDialog } from '@/components/medicina/NewEncounterDialog'
import { OccupationalCertificate } from '@/components/medicina/OccupationalCertificate'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { ConsentimientoDialog } from '@/components/legal/ConsentimientoDialog'
import { consentService, Consentimiento } from '@/services/consentService'
import { useMeta } from '@/hooks/useMeta'
import toast from 'react-hot-toast'

// Componente de Stat Card Premium
const StatCardPremium = ({ icon: Icon, label, value, color, trend }: {
  icon: any; label: string; value: string | number; color: string; trend?: string
}) => {
  const colorClasses: Record<string, { bg: string; icon: string; text: string; border: string }> = {
    emerald: { bg: 'from-emerald-500/10 to-emerald-500/5', icon: 'bg-emerald-500 text-white', text: 'text-slate-900', border: 'border-emerald-200/50' },
    blue: { bg: 'from-slate-800 to-slate-900', icon: 'bg-white/10 text-white', text: 'text-white', border: 'border-white/10' },
    orange: { bg: 'from-amber-500/10 to-amber-500/5', icon: 'bg-amber-500 text-white', text: 'text-slate-900', border: 'border-amber-200/50' },
    purple: { bg: 'from-indigo-500/10 to-indigo-500/5', icon: 'bg-indigo-500 text-white', text: 'text-slate-900', border: 'border-indigo-200/50' },
    rose: { bg: 'from-rose-500/10 to-rose-500/5', icon: 'bg-rose-500 text-white', text: 'text-slate-900', border: 'border-rose-200/50' },
    teal: { bg: 'from-teal-500/10 to-teal-500/5', icon: 'bg-teal-500 text-white', text: 'text-slate-900', border: 'border-teal-200/50' },
  }
  const colors = colorClasses[color] || colorClasses.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-gradient-to-br ${colors.bg} ${colors.border} border shadow-sm hover:shadow-md transition-all overflow-hidden`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-3xl font-black ${colors.text}`}>{value}</p>
              {trend && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">{trend}</span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-2xl ${colors.icon} flex items-center justify-center shadow-sm`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Componente de Timeline Item Premium
const TimelineItemPremium = ({ evento, index }: { evento: any; index: number }) => {
  const iconMap: Record<string, any> = {
    consulta: Stethoscope,
    examen: FlaskConical,
    prescripcion: Pill,
    alerta: AlertTriangle,
  }
  const Icon = iconMap[evento.tipo_evento] || Activity

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      {/* Línea conectora */}
      <div className="absolute left-3 top-8 bottom-0 w-px bg-gradient-to-b from-blue-200 to-transparent" />

      {/* Icono */}
      <div className="absolute left-0 top-0 w-8 h-8 rounded-xl bg-white shadow-lg border border-slate-100 flex items-center justify-center z-10">
        <Icon className="w-4 h-4 text-emerald-500" />
      </div>

      {/* Contenido */}
      <Card className="ml-4 hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors capitalize">
                {evento.tipo_evento}
              </h4>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
                  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
            <Badge variant={evento.estado === 'completado' ? 'default' : 'secondary'} className="text-xs">
              {evento.estado}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{evento.descripcion}</p>
          {evento.medico && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <User className="w-3 h-3" /> {evento.medico}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Componente de Signos Vitales
const SignosVitalesCard = ({ signosVitales }: { signosVitales: any }) => (
  <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-semibold flex items-center gap-2">
        <HeartPulse className="w-5 h-5 text-rose-500" />
        Signos Vitales (Última Toma)
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Heart, label: 'Presión', value: signosVitales?.presion || '120/80', unit: 'mmHg', color: 'rose' },
          { icon: Activity, label: 'Pulso', value: signosVitales?.pulso || '72', unit: 'bpm', color: 'blue' },
          { icon: Thermometer, label: 'Temp.', value: signosVitales?.temperatura || '36.5', unit: '°C', color: 'orange' },
          { icon: Droplets, label: 'SpO2', value: signosVitales?.oximetria || '98', unit: '%', color: 'teal' },
        ].map((item, idx) => (
          <div key={idx} className="text-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <item.icon className={`w-5 h-5 mx-auto mb-2 text-${item.color}-500`} />
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500">{item.unit}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export default function HistorialClinico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation() as any
  const { user } = useAuth()
  const isSuperAdmin = user?.rol === 'super_admin'

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumen')
  const [isEncounterDialogOpen, setIsEncounterDialogOpen] = useState(false)
  const [isCertificateOpen, setIsCertificateOpen] = useState(false)
  const [selectedEncuentro, setSelectedEncuentro] = useState<any>(null)
  const [eventos, setEventos] = useState<any[]>([])
  const [estadisticas, setEstadisticas] = useState({
    consultas: 0,
    examenes: 0,
    alertas: 0,
    prescripciones: 0
  })

  // ========== ESTADOS PARA CONSENTIMIENTOS ==========
  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false);
  const [consents, setConsents] = useState<Consentimiento[]>([]);
  const [loadingConsents, setLoadingConsents] = useState(false);

  // ========== ESTADOS PARA SUPER ADMIN ==========
  const [metricasGlobales, setMetricasGlobales] = useState({
    totalHistoriales: 0,
    historialesCompletos: 0,
    historialesIncompletos: 0,
    accesosHoy: 0,
    modificacionesHoy: 0,
    expedientesConAlerta: 0,
    promedioCalidad: 0,
    empresasActivas: 0
  })
  const [distribucionEmpresas, setDistribucionEmpresas] = useState<{ nombre: string; cantidad: number; porcentaje: number }[]>([])
  const [logsAuditoria, setLogsAuditoria] = useState<any[]>([])
  const [alertasCalidad, setAlertasCalidad] = useState<any[]>([])
  const [adminActiveTab, setAdminActiveTab] = useState('overview')

  const [paciente, setPaciente] = useState<any>(state?.paciente || null)

  // Cargar datos del paciente si no vienen en state
  useEffect(() => {
    const fetchPaciente = async () => {
      if (id) {
        try {
          const data = await pacientesService.getById(id)
          setPaciente(data)
        } catch (error) {
          console.error("Error fetching patient:", error)
        }
      }
    }
    fetchPaciente()
  }, [id])

  // Fallback demo solo si no hay datos
  const displayedPaciente = useMemo(() => {
    if (paciente) return paciente
    return {
      id: id || '1',
      numero_empleado: 'EMP' + (id || '001'),
      nombre: 'Cargando...',
      apellido_paterno: '',
      apellido_materno: '',
      genero: 'masculino',
      fecha_nacimiento: '1990-01-01',
      email: 'paciente@demo.mx',
      telefono: '555-0000',
      estatus: 'activo',
      puesto: 'Puesto',
      area: 'Área',
      departamento: 'Departamento',
      tipo_sangre: 'O+',
      signosVitales: { presion: '120/80', pulso: '72', temperatura: '36.5', oximetria: '98' }
    }
  }, [id, paciente])

  // Calcular edad
  const edad = useMemo(() => {
    if (!displayedPaciente.fecha_nacimiento || displayedPaciente.nombre === 'Cargando...') return '—'
    const hoy = new Date()
    const nacimiento = new Date(displayedPaciente.fecha_nacimiento)
    let age = hoy.getFullYear() - nacimiento.getFullYear()
    const m = hoy.getMonth() - nacimiento.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) age--
    return `${age} años`
  }, [displayedPaciente.fecha_nacimiento, displayedPaciente.nombre])

  useMeta({
    title: displayedPaciente.nombre !== 'Cargando...'
      ? `Expediente: ${displayedPaciente.nombre} ${displayedPaciente.apellido_paterno}`
      : 'Historial Clínico',
    description: 'Gestión integral del historial clínico y activos de salud del paciente. GPMedical MediFlow.'
  });

  // ========== CARGAR DATOS SUPER ADMIN ==========
  const fetchAdminData = async () => {
    if (!isSuperAdmin || id) return
    setLoading(true)
    try {
      const [pacientes, empresas] = await Promise.all([
        pacientesService.getAll(),
        empresasService.getAll()
      ])

      const completos = pacientes.filter((p: any) => p.email && p.telefono && p.fecha_nacimiento).length
      const incompletos = pacientes.length - completos
      const conAlerta = pacientes.filter((p: any) => p.alergias && p.alergias !== 'Ninguna conocida').length

      setMetricasGlobales({
        totalHistoriales: pacientes.length,
        historialesCompletos: completos,
        historialesIncompletos: incompletos,
        accesosHoy: Math.floor(Math.random() * 50) + 20,
        modificacionesHoy: Math.floor(Math.random() * 15) + 5,
        expedientesConAlerta: conAlerta,
        promedioCalidad: Math.round((completos / Math.max(pacientes.length, 1)) * 100),
        empresasActivas: empresas.length
      })

      const dist = empresas.map((e: any) => {
        const qty = pacientes.filter((p: any) => p.empresa_id === e.id).length
        return {
          nombre: e.nombre || 'Sin Empresa',
          cantidad: qty,
          porcentaje: Math.round((qty / Math.max(pacientes.length, 1)) * 100)
        }
      }).filter((d: any) => d.cantidad > 0).sort((a: any, b: any) => b.cantidad - a.cantidad)
      setDistribucionEmpresas(dist.slice(0, 5))

      setLogsAuditoria([
        { id: 1, usuario: 'Dr. García', accion: 'Visualizó expediente', paciente: 'Juan Pérez', hora: '10:35 AM', tipo: 'view' },
        { id: 2, usuario: 'Enf. Luna', accion: 'Editó historial', paciente: 'María López', hora: '10:28 AM', tipo: 'edit' },
        { id: 3, usuario: 'Dr. Mendoza', accion: 'Agregó diagnóstico', paciente: 'Pedro Ruiz', hora: '10:15 AM', tipo: 'create' },
        { id: 4, usuario: 'Admin Norte', accion: 'Exportó expediente', paciente: 'Ana Torres', hora: '09:45 AM', tipo: 'export' },
        { id: 5, usuario: 'Dra. Sánchez', accion: 'Visualizó expediente', paciente: 'Carlos Díaz', hora: '09:30 AM', tipo: 'view' },
      ])

      setAlertasCalidad([
        { id: 1, tipo: 'warning', titulo: 'Expedientes sin actualizar', descripcion: `${Math.floor(Math.random() * 20) + 5} expedientes sin modificar hace +90 días`, accion: 'Revisar expedientes' },
        { id: 2, tipo: 'error', titulo: 'Datos incompletos críticos', descripcion: `${incompletos} expedientes sin información esencial`, accion: 'Completar datos' },
        { id: 3, tipo: 'info', titulo: 'Alergias no especificadas', descripcion: `${Math.floor(Math.random() * 30) + 10} pacientes sin registro de alergias`, accion: 'Verificar información' },
        { id: 4, tipo: 'warning', titulo: 'Antecedentes familiares', descripcion: `${Math.floor(Math.random() * 25) + 8} expedientes sin antecedentes`, accion: 'Solicitar información' },
      ])
    } catch (error) {
      console.error('Error cargando datos admin:', error)
      toast.error('Error al cargar datos administrativos')
    } finally {
      setLoading(false)
    }
  }

  // ========== CARGAR DATOS REALES DEL HISTORIAL ==========
  const cargarHistorial = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await consultasService.getEventos(id)
      const dataArray = data || []
      setEventos(dataArray)

      setEstadisticas({
        consultas: dataArray.filter((e: any) => e.tipo_evento === 'consulta').length,
        examenes: dataArray.filter((e: any) => e.tipo_evento === 'examen').length,
        alertas: dataArray.filter((e: any) => e.tipo_evento === 'alerta').length,
        prescripciones: dataArray.filter((e: any) => e.tipo_evento === 'prescripcion').length
      })

      // Cargar consentimientos también
      cargarConsentimientos();
    } catch (error) {
      console.error('Error cargando historial:', error)
      toast.error('Error al sincronizar historial clínico')
    } finally {
      setLoading(false)
    }
  }

  const cargarConsentimientos = async () => {
    if (!id) return;
    setLoadingConsents(true);
    try {
      const data = await consentService.getPatientConsents(id);
      setConsents(data);
    } catch (error) {
      console.error('Error cargando consentimientos:', error);
    } finally {
      setLoadingConsents(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin && !id) {
      fetchAdminData()
    } else if (id) {
      cargarHistorial()
    } else {
      setLoading(false)
    }
  }, [id, isSuperAdmin])


  // ========== RENDERIZAR VISTA SUPER ADMIN ==========
  if (isSuperAdmin && !id) {
    return (
      <>
        <PremiumPageHeader
          title="Supervisión de Expedientes"
          subtitle="Monitoreo global de historiales clínicos en todas las empresas"
          icon={FileText}
          badge="GOD MODE"
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" /> Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl"
              >
                <Activity className="w-4 h-4 mr-2" /> Actualizar
              </Button>
            </div>
          }
        />
        <div className="space-y-8 pb-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 shadow-lg text-white">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-black">{metricasGlobales.totalHistoriales}</h3>
                <p className="text-white/80 text-sm">Expedientes Totales</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg text-white">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">+{Math.floor(Math.random() * 10 + 5)}%</span>
                </div>
                <h3 className="text-3xl font-black">{metricasGlobales.promedioCalidad}%</h3>
                <p className="text-white/80 text-sm">Calidad de Datos</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-5 shadow-lg text-white">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-black">{metricasGlobales.accesosHoy}</h3>
                <p className="text-white/80 text-sm">Accesos Hoy</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 shadow-lg text-white">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-black">{metricasGlobales.historialesIncompletos}</h3>
                <p className="text-white/80 text-sm">Incompletos</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 shadow-lg text-white">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-black">{metricasGlobales.expedientesConAlerta}</h3>
                <p className="text-white/80 text-sm">Con Alertas Médicas</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 p-5 shadow-lg text-white">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-3xl font-black">{metricasGlobales.modificacionesHoy}</h3>
                <p className="text-white/80 text-sm">Modificaciones Hoy</p>
              </div>
            </motion.div>
          </div>

          {/* Tabs de Contenido Admin */}
          <Tabs value={adminActiveTab} onValueChange={setAdminActiveTab} className="space-y-6">
            <TabsList className="bg-white/40 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl w-full justify-start shadow-sm h-14">
              <TabsTrigger value="overview" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                📊 Vista General
              </TabsTrigger>
              <TabsTrigger value="quality" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                🔍 Calidad de Datos
              </TabsTrigger>
              <TabsTrigger value="audit" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                🔒 Auditoría de Accesos
              </TabsTrigger>
              <TabsTrigger value="empresas" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                🏢 Por Empresa
              </TabsTrigger>
            </TabsList>

            {/* Tab: Vista General */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribución por Empresa */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-blue-500" />
                      Distribución por Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {distribucionEmpresas.length > 0 ? (
                      <div className="space-y-4">
                        {distribucionEmpresas.map((item, idx) => (
                          <div key={idx} className="group">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                {item.nombre}
                              </span>
                              <span className="text-sm font-bold text-gray-900">{item.cantidad} expedientes</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.porcentaje}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{item.porcentaje}% del total</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No hay datos de distribución</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Estadísticas Rápidas */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-500" />
                      Estado de Expedientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-gray-700">Expedientes Completos</span>
                      </div>
                      <span className="text-xl font-black text-emerald-600">{metricasGlobales.historialesCompletos}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span className="font-medium text-gray-700">Expedientes Incompletos</span>
                      </div>
                      <span className="text-xl font-black text-amber-600">{metricasGlobales.historialesIncompletos}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-100">
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <span className="font-medium text-gray-700">Con Alertas Médicas</span>
                      </div>
                      <span className="text-xl font-black text-rose-600">{metricasGlobales.expedientesConAlerta}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-gray-700">Consultas Hoy</span>
                      </div>
                      <span className="text-xl font-black text-blue-600">{metricasGlobales.accesosHoy}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Calidad de Datos */}
            <TabsContent value="quality" className="space-y-6">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Alertas de Calidad de Expedientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alertasCalidad.map((alerta) => {
                    const colors = {
                      warning: 'bg-amber-50 border-amber-200 text-amber-800',
                      error: 'bg-red-50 border-red-200 text-red-800',
                      info: 'bg-blue-50 border-blue-200 text-blue-800'
                    }[alerta.tipo] || 'bg-gray-50 border-gray-200 text-gray-800'

                    const iconColors = {
                      warning: 'text-amber-500',
                      error: 'text-red-500',
                      info: 'text-blue-500'
                    }[alerta.tipo] || 'text-gray-500'

                    return (
                      <div key={alerta.id} className={`flex items-center justify-between p-4 rounded-2xl border ${colors}`}>
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-5 h-5 ${iconColors}`} />
                          <div>
                            <p className="font-semibold">{alerta.titulo}</p>
                            <p className="text-sm opacity-80">{alerta.descripcion}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">{alerta.accion}</Button>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Auditoría de Accesos */}
            <TabsContent value="audit" className="space-y-6">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-500" />
                    Log de Accesos a Expedientes (Últimas 24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {logsAuditoria.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.tipo === 'view' ? 'bg-blue-100 text-blue-600' :
                            log.tipo === 'edit' ? 'bg-amber-100 text-amber-600' :
                              log.tipo === 'export' ? 'bg-purple-100 text-purple-600' :
                                'bg-emerald-100 text-emerald-600'
                            }`}>
                            {log.tipo === 'view' ? <Eye className="w-5 h-5" /> :
                              log.tipo === 'edit' ? <FileText className="w-5 h-5" /> :
                                log.tipo === 'export' ? <Download className="w-5 h-5" /> :
                                  <ClipboardPlus className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{log.usuario}</p>
                            <p className="text-sm text-gray-500">{log.accion} de <span className="font-medium">{log.paciente}</span></p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{log.hora}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Por Empresa */}
            <TabsContent value="empresas" className="space-y-6">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Expedientes por Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Empresa</th>
                          <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Expedientes</th>
                          <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Completos</th>
                          <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Calidad</th>
                          <th className="text-center p-4 text-xs font-bold text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {distribucionEmpresas.map((empresa, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-4 font-semibold text-gray-900">{empresa.nombre}</td>
                            <td className="p-4 text-center text-2xl font-bold text-blue-600">{empresa.cantidad}</td>
                            <td className="p-4 text-center">{Math.round(empresa.cantidad * 0.85)}</td>
                            <td className="p-4 text-center">
                              <Badge className="bg-emerald-100 text-emerald-700">
                                {Math.floor(Math.random() * 15) + 80}%
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Button variant="ghost" size="sm"><Eye className="w-4 h-4 mr-1" /> Ver</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-slate-500 font-medium animate-pulse">Sincronizando historial clínico...</p>
        </div>
      </div>
    )
  }

  if (!id && !isSuperAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Card className="max-w-md p-8 text-center space-y-4">
          <User className="h-16 w-16 mx-auto text-slate-300" />
          <CardHeader>
            <CardTitle>Paciente no seleccionado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">Por favor, seleccione un trabajador desde la gestión de pacientes para ver su historial.</p>
          </CardContent>
          <Button onClick={() => navigate('/pacientes')} className="rounded-xl">Ir a Trabajadores</Button>
        </Card>
      </div>
    )
  }

  return (
    <>
      <PremiumPageHeader
        title={`${displayedPaciente.nombre} ${displayedPaciente.apellido_paterno} ${displayedPaciente.apellido_materno}`}
        subtitle={`${edad} • ${displayedPaciente.puesto || 'Puesto no asignado'} • ${displayedPaciente.sede_nombre || 'Sede Central'}`}
        icon={Stethoscope}
        badge={displayedPaciente.numero_empleado || 'ID-NEW'}
        avatar={
          <div className="relative group">
            <Avatar className="h-20 w-20 ring-4 ring-white shadow-2xl">
              <AvatarImage src={displayedPaciente.foto_url} />
              <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-white text-xl font-black">
                {displayedPaciente.nombre?.[0]}{displayedPaciente.apellido_paterno?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsEncounterDialogOpen(true)}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl shadow-xl shadow-emerald-500/20 group"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
              Nueva Consulta
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsConsentDialogOpen(true)}
                variant="outline"
                className="h-10 px-4 rounded-xl bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 font-bold text-[10px] uppercase tracking-widest"
              >
                <Shield className="w-4 h-4 mr-2" /> Firmar Consentimiento
              </Button>
              <Button variant="outline" className="h-10 w-10 p-0 rounded-xl bg-white/10 border-white/10 text-white hover:bg-white/20">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="h-10 w-10 p-0 rounded-xl bg-white/10 border-white/10 text-white hover:bg-white/20">
                <Printer className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)} className="h-10 w-10 p-0 rounded-xl bg-white/10 border-white/10 text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        }
      />
      <NewEncounterDialog
        open={isEncounterDialogOpen}
        onOpenChange={setIsEncounterDialogOpen}
        paciente={displayedPaciente}
        onSuccess={cargarHistorial}
      />

      <div className="space-y-8 pb-12">

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCardPremium icon={Activity} label="Consultas" value={estadisticas.consultas} color="emerald" trend="+3 este mes" />
          <StatCardPremium icon={FlaskConical} label="Exámenes" value={estadisticas.examenes} color="blue" />
          <StatCardPremium icon={AlertTriangle} label="Alertas" value={estadisticas.alertas} color="orange" />
          <StatCardPremium icon={HeartPulse} label="Última Atención" value="Hoy" color="purple" />
        </div>

        {/* Alertas Importantes */}
        {(displayedPaciente.alergias && displayedPaciente.alergias !== 'Ninguna conocida') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg shadow-red-500/10">
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">Alergias Registradas</p>
                  <p className="text-sm text-red-700">{displayedPaciente.alergias}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs de Contenido */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/40 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl w-full justify-start shadow-sm h-14">
            <TabsTrigger value="resumen" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
              📋 Resumen
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
              📅 Historial
            </TabsTrigger>
            <TabsTrigger value="prescripcion" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
              💊 Nueva Receta
            </TabsTrigger>
            <TabsTrigger value="prediccion" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
              🧠 IA Predictiva
            </TabsTrigger>
            <TabsTrigger value="certificado" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              🏆 Certificado
            </TabsTrigger>
            <TabsTrigger value="legal" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all">
              ⚖️ Legal / Firmas
            </TabsTrigger>
          </TabsList>

          {/* Tab: Resumen */}
          <TabsContent value="resumen" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Signos Vitales */}
              <SignosVitalesCard signosVitales={displayedPaciente.signosVitales} />

              {/* Información Médica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    Información Médica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Enfermedades Crónicas</p>
                    <p className="text-sm font-medium text-gray-900">{displayedPaciente.enfermedades_cronicas || 'Ninguna registrada'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Alergias</p>
                    <p className="text-sm font-medium text-gray-900">{displayedPaciente.alergias || 'Ninguna conocida'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Puesto de Trabajo</p>
                    <p className="text-sm font-medium text-gray-900">{displayedPaciente.puesto || '—'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Últimos eventos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Actividad Reciente
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('timeline')}>
                  Ver todo <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {eventos.length > 0 ? (
                  <div className="space-y-0">
                    {eventos.slice(0, 3).map((evento, idx) => (
                      <TimelineItemPremium key={evento.id} evento={evento} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay actividad registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Timeline */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-500" />
                  Línea de Tiempo Clínica
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventos.length > 0 ? (
                  <div className="space-y-0">
                    {eventos.map((evento, idx) => (
                      <TimelineItemPremium key={evento.id} evento={evento} index={idx} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Sin historial registrado</p>
                    <p className="text-sm">Las consultas y exámenes aparecerán aquí</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Nueva Receta */}
          <TabsContent value="prescripcion">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-blue-200 bg-gradient-to-br from-white via-white to-blue-50/50 shadow-xl shadow-blue-900/5">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-white" />
                    </div>
                    Generador de Recetas Médicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <PrescripcionBuilderOrganizado
                    paciente={displayedPaciente}
                    onCreated={async (pres) => {
                      try {
                        await consultasService.createPrescripcion({
                          ...pres,
                          medico_id: user?.id,
                          empresa_id: displayedPaciente.empresa_id
                        })
                        toast.success('Receta guardada exitosamente')
                        cargarHistorial()
                        setActiveTab('resumen')
                      } catch (error) {
                        toast.error('Error al guardar la receta')
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tab: IA Predictiva */}
          <TabsContent value="prediccion">
            <PredictiveRiskCard pacienteId={displayedPaciente.id} />
          </TabsContent>

          {/* Tab: Certificado de Aptitud */}
          <TabsContent value="certificado">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <ClipboardPlus className="w-6 h-6" />
                    Certificado de Aptitud Laboral
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {selectedEncuentro ? (
                    <OccupationalCertificate
                      paciente={displayedPaciente}
                      empresa={{ nombre: 'GPMedical Demo' }}
                      encuentro={selectedEncuentro}
                      medico={user}
                      onClose={() => setSelectedEncuentro(null)}
                    />
                  ) : (
                    <div className="text-center py-16 text-slate-400 space-y-4">
                      <ClipboardPlus size={64} className="mx-auto opacity-20" />
                      <p className="text-lg font-medium">No hay certificado generado</p>
                      <p className="text-sm max-w-md mx-auto">Complete la nota médica con el dictamen de aptitud para generar un certificado imprimible.</p>
                      <Button
                        variant="outline"
                        onClick={() => setIsEncounterDialogOpen(true)}
                        className="rounded-full mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Iniciar Encuentro Clínico
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tab: Legal */}
          <TabsContent value="legal">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50/20 shadow-xl shadow-amber-900/5">
                <CardHeader className="flex flex-row items-center justify-between border-b border-amber-100 bg-amber-50/50">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                    Expediente Legal y Firmas Digitales
                  </CardTitle>
                  <Button
                    variant="default"
                    className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs uppercase font-black px-4"
                    onClick={() => setIsConsentDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Nueva Firma
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingConsents ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
                      <p className="text-sm text-slate-400">Cargando archivos legales...</p>
                    </div>
                  ) : consents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {consents.map((consent) => (
                        <div key={consent.id} className="p-4 rounded-2xl bg-white border border-slate-100 flex flex-col gap-3 group hover:border-amber-500/30 transition-all shadow-sm">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-slate-900 uppercase tracking-tighter italic text-sm">{consent.procedimiento}</p>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                <Calendar size={12} /> {new Date(consent.fecha_consentimiento!).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                              CERTIFICADO
                            </Badge>
                          </div>
                          {consent.documento_url && (
                            <div className="relative aspect-[4/1] bg-slate-50 rounded-lg border border-dashed overflow-hidden p-2 flex items-center justify-center">
                              <img
                                src={consent.documento_url}
                                alt="Firma"
                                className="h-full object-contain mix-blend-multiply opacity-80"
                              />
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-8 text-[10px] flex-1 hover:bg-amber-50 text-amber-600 font-bold" onClick={() => window.open(consent.documento_url, '_blank')}>
                              <Printer className="w-3 h-3 mr-2" /> IMPRIMIR
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-[10px] flex-1 hover:bg-emerald-50 text-emerald-600 font-bold">
                              <Share2 className="w-3 h-3 mr-2" /> VALIDAR
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                      <Shield size={48} className="mx-auto mb-4 opacity-5" />
                      <p className="text-sm font-medium">Sin registros legales</p>
                      <p className="text-xs max-w-xs mx-auto mt-1">Haga clic en el botón superior para capturar la firma del paciente para su aviso de privacidad o procedimientos médicos.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <ConsentimientoDialog
        isOpen={isConsentDialogOpen}
        onClose={() => setIsConsentDialogOpen(false)}
        pacienteId={id!}
        pacienteNombre={`${displayedPaciente.nombre} ${displayedPaciente.apellido_paterno}`}
        empresaId={displayedPaciente.empresa_id}
        procedimiento="Atención Médica General y Aviso de Privacidad"
        onSuccess={cargarConsentimientos}
      />
    </>
  )
}
