/**
 * Dashboard del Paciente/Trabajador - Medicina del Trabajo
 * 
 * Vista optimizada para que el trabajador vea:
 * - Su estado de aptitud laboral actual
 * - Próximas citas y evaluaciones pendientes
 * - Resultados de exámenes
 * - Restricciones laborales activas
 * - Certificados disponibles
 */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, FileText, Activity, Clock, Download,
  CheckCircle2, AlertTriangle, XCircle, ChevronRight,
  Stethoscope, Shield, FileCheck, Bell, User,
  Building2, Briefcase, Heart, Eye, Ear
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'

// =============================================
// TIPOS
// =============================================
interface EstadoAptitud {
  estado: 'apto' | 'apto_restriccion' | 'no_apto' | 'pendiente'
  vigencia: string
  restricciones?: string[]
  proximaEvaluacion: string
}

interface CitaProgramada {
  id: string
  tipo: string
  fecha: string
  hora: string
  medico: string
  especialidad: string
  estado: 'confirmada' | 'pendiente' | 'completada'
}

interface ResultadoExamen {
  id: string
  nombre: string
  fecha: string
  estado: 'normal' | 'alterado' | 'pendiente'
  descargable: boolean
}

interface Certificado {
  id: string
  tipo: string
  fechaEmision: string
  vigencia: string
  descargable: boolean
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function DashboardPaciente() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  // Datos del trabajador (en producción vendrían del backend)
  const [aptitud] = useState<EstadoAptitud>({
    estado: 'apto_restriccion',
    vigencia: '31 Dic 2025',
    restricciones: ['No cargar más de 10kg', 'Evitar exposición prolongada a ruido'],
    proximaEvaluacion: '15 Mar 2025'
  })

  const [citas] = useState<CitaProgramada[]>([
    { id: '1', tipo: 'Examen Periódico', fecha: 'Mañana', hora: '09:00', medico: 'Dr. García Mendoza', especialidad: 'Medicina del Trabajo', estado: 'confirmada' },
    { id: '2', tipo: 'Audiometría', fecha: '25 Ene', hora: '10:30', medico: 'Dra. López Rivera', especialidad: 'Audiología', estado: 'pendiente' },
    { id: '3', tipo: 'Espirometría', fecha: '28 Ene', hora: '11:00', medico: 'Dr. Martínez', especialidad: 'Neumología', estado: 'pendiente' },
  ])

  const [resultados] = useState<ResultadoExamen[]>([
    { id: '1', nombre: 'Biometría Hemática Completa', fecha: 'Hace 3 días', estado: 'normal', descargable: true },
    { id: '2', nombre: 'Química Sanguínea 6 elementos', fecha: 'Hace 3 días', estado: 'normal', descargable: true },
    { id: '3', nombre: 'Audiometría Tonal', fecha: 'Hace 1 semana', estado: 'alterado', descargable: true },
    { id: '4', nombre: 'Radiografía de Tórax PA', fecha: 'Hace 2 semanas', estado: 'normal', descargable: true },
  ])

  const [certificados] = useState<Certificado[]>([
    { id: '1', tipo: 'Certificado de Aptitud Laboral', fechaEmision: '15 Dic 2024', vigencia: '31 Dic 2025', descargable: true },
    { id: '2', tipo: 'Constancia de No Embarazo', fechaEmision: '15 Dic 2024', vigencia: '15 Ene 2025', descargable: true },
  ])

  useEffect(() => {
    // Simular carga
    setTimeout(() => setLoading(false), 500)
  }, [])

  const getAptitudConfig = (estado: EstadoAptitud['estado']) => {
    const configs = {
      apto: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'APTO', gradient: 'from-emerald-500 to-teal-500' },
      apto_restriccion: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'APTO CON RESTRICCIÓN', gradient: 'from-amber-500 to-orange-500' },
      no_apto: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'NO APTO', gradient: 'from-red-500 to-rose-500' },
      pendiente: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', label: 'PENDIENTE', gradient: 'from-slate-500 to-gray-500' }
    }
    return configs[estado]
  }

  const aptitudConfig = getAptitudConfig(aptitud.estado)
  const AptitudIcon = aptitudConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 p-6">
      {/* Header con saludo y datos del trabajador */}
      <PremiumPageHeader
        title={`Hola, ${user?.nombre?.split(' ')[0] || 'Trabajador'}`}
        subtitle="Tu centro de salud laboral: Consulta tu estado de aptitud, resultados y programaciones."
        icon={User}
        badge="PORTAL DEL TRABAJADOR"
        actions={
          <Button
            variant="premium"
            className="h-11 px-8 shadow-xl shadow-emerald-500/20"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        }
      />

      {/* Card de Estado de Aptitud - Lo más importante */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 container mx-auto"
      >
        <Card className={`border-0 shadow-2xl shadow-emerald-900/10 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden`}>
          <div className="flex flex-col lg:flex-row">
            {/* Estado principal */}
            <div className={`p-6 lg:p-8 flex-1 bg-gradient-to-br ${aptitudConfig.gradient} text-white`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <AptitudIcon className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80 uppercase tracking-wider">Estado de Aptitud</p>
                  <h2 className="text-3xl font-bold">{aptitudConfig.label}</h2>
                </div>
              </div>
              <div className="flex items-center gap-6 text-white/90">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-80">Vigencia</p>
                  <p className="font-semibold">{aptitud.vigencia}</p>
                </div>
                <div className="w-px h-8 bg-white/30" />
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-80">Próxima Evaluación</p>
                  <p className="font-semibold">{aptitud.proximaEvaluacion}</p>
                </div>
              </div>
            </div>

            {/* Restricciones si las hay */}
            {aptitud.restricciones && aptitud.restricciones.length > 0 && (
              <div className="p-6 lg:p-8 lg:w-96 bg-white border-l border-amber-200">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Restricciones Activas
                </h3>
                <ul className="space-y-2">
                  {aptitud.restricciones.map((restriccion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      {restriccion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 container mx-auto">
        {/* Columna Izquierda - Citas */}
        <div className="lg:col-span-2 space-y-8">
          {/* Próximas Citas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl shadow-slate-900/5 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                  Próximas Citas
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700">
                  Ver todas <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {citas.map((cita) => (
                  <div
                    key={cita.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${cita.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-600' :
                        cita.estado === 'completada' ? 'bg-slate-100 text-slate-500' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{cita.tipo}</h4>
                        <p className="text-sm text-slate-500">{cita.medico}</p>
                        <p className="text-xs text-slate-400">{cita.especialidad}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{cita.fecha}</p>
                      <p className="text-sm text-slate-500">{cita.hora}</p>
                      <Badge className={`mt-1 ${cita.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-700' :
                        cita.estado === 'completada' ? 'bg-slate-100 text-slate-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                        {cita.estado === 'confirmada' ? '✓ Confirmada' : cita.estado === 'completada' ? 'Completada' : '⏳ Pendiente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Resultados de Exámenes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-2xl shadow-slate-900/5 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  Resultados de Exámenes
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                  Ver historial <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resultados.map((resultado) => (
                    <div
                      key={resultado.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${resultado.estado === 'normal' ? 'bg-emerald-50 text-emerald-600' :
                          resultado.estado === 'alterado' ? 'bg-red-50 text-red-600' :
                            'bg-slate-50 text-slate-500'
                          }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-800">{resultado.nombre}</p>
                          <p className="text-xs text-slate-400">{resultado.fecha}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {resultado.estado === 'alterado' && (
                          <Badge className="bg-red-100 text-red-700 text-xs">Alterado</Badge>
                        )}
                        {resultado.descargable && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-cyan-600">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Columna Derecha - Acciones Rápidas y Certificados */}
        <div className="space-y-6">
          {/* Acciones Rápidas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl shadow-slate-900/5 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Agendar Cita', icon: Calendar, color: 'from-cyan-500 to-blue-500' },
                  { label: 'Mis Resultados', icon: FileText, color: 'from-purple-500 to-pink-500' },
                  { label: 'Certificados', icon: FileCheck, color: 'from-emerald-500 to-teal-500' },
                  { label: 'Notificaciones', icon: Bell, color: 'from-amber-500 to-orange-500' },
                ].map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg flex flex-col items-center gap-2 group`}
                  >
                    <action.icon className="w-6 h-6" />
                    <span className="text-xs font-semibold">{action.label}</span>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Certificados Disponibles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-2xl shadow-slate-900/5 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  Mis Certificados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certificados.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm text-slate-800">{cert.tipo}</h4>
                        <p className="text-xs text-slate-400 mt-1">Emitido: {cert.fechaEmision}</p>
                        <p className="text-xs text-slate-500">Vigente hasta: <span className="font-medium text-emerald-600">{cert.vigencia}</span></p>
                      </div>
                      {cert.descargable && (
                        <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recordatorio de Exámenes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Activity className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Exámenes Próximos</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Tu evaluación periódica anual está programada para el <strong>15 de Marzo</strong>.
                      Recuerda asistir en ayuno de 8 horas.
                    </p>
                    <Button variant="link" className="text-cyan-600 p-0 h-auto text-xs mt-2">
                      Ver preparación requerida →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
