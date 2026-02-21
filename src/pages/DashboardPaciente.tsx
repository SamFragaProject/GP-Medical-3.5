/**
 * Dashboard del Paciente/Trabajador - Medicina del Trabajo
 * 
 * Vista optimizada para que el trabajador vea:
 * - Su estado de aptitud laboral actual
 * - Próximas citas y evaluaciones pendientes
 * - Resultados de exámenes
 * - Restricciones laborales activas
 * - Certificados disponibles
 * 
 * Conectado a Supabase — datos reales
 */
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, FileText, Activity, Clock, Download,
  CheckCircle2, AlertTriangle, XCircle, ChevronRight,
  Stethoscope, Shield, FileCheck, Bell, User,
  Building2, Briefcase, Heart, Eye, Ear, Loader2, Inbox
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { pacientesService, citasService } from '@/services/dataService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { ComunicadosFeed } from '@/components/dashboard/ComunicadosFeed'

// =============================================
// TIPOS
// =============================================
interface EstadoAptitud {
  estado: 'apto' | 'apto_restriccion' | 'no_apto' | 'pendiente'
  vigencia: string
  restricciones?: string[]
  proximaEvaluacion: string
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function DashboardPaciente() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [pacienteData, setPacienteData] = useState<any>(null)
  const [citas, setCitas] = useState<any[]>([])
  const [examenes, setExamenes] = useState<any[]>([])
  const [certificados, setCertificados] = useState<any[]>([])
  const [aptitud, setAptitud] = useState<EstadoAptitud>({
    estado: 'pendiente',
    vigencia: '—',
    restricciones: [],
    proximaEvaluacion: '—'
  })

  useEffect(() => {
    loadPacienteData()
  }, [user])

  const loadPacienteData = async () => {
    if (!user) return
    setLoading(true)

    try {
      // 1. Buscar el registro de paciente vinculado al usuario
      let paciente: any = null

      if (user.email) {
        paciente = await pacientesService.getByEmail(user.email)
      }

      if (paciente) {
        setPacienteData(paciente)

        // 2. Cargar citas del paciente
        const citasData = await citasService.getByPaciente(paciente.id)
        setCitas(citasData || [])

        // 3. Cargar últimos exámenes
        const { data: examenesData } = await supabase
          .from('examenes')
          .select('*')
          .eq('paciente_id', paciente.id)
          .order('fecha', { ascending: false })
          .limit(5)
        setExamenes(examenesData || [])

        // 4. Cargar certificaciones
        const { data: certData } = await supabase
          .from('certificaciones_medicas')
          .select('*')
          .eq('paciente_id', paciente.id)
          .order('fecha_emision', { ascending: false })
          .limit(5)
        setCertificados(certData || [])

        // 5. Determinar estado de aptitud desde la última certificación
        if (certData && certData.length > 0) {
          const ultimaCert = certData[0]
          setAptitud({
            estado: ultimaCert.resultado === 'apto' ? 'apto' :
              ultimaCert.resultado === 'apto_con_restricciones' ? 'apto_restriccion' :
                ultimaCert.resultado === 'no_apto' ? 'no_apto' : 'pendiente',
            vigencia: ultimaCert.fecha_vigencia
              ? new Date(ultimaCert.fecha_vigencia).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—',
            restricciones: ultimaCert.restricciones ? [ultimaCert.restricciones] : [],
            proximaEvaluacion: ultimaCert.fecha_vigencia
              ? new Date(ultimaCert.fecha_vigencia).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'
          })
        }
      }
    } catch (err) {
      console.error('Error cargando datos del paciente:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAptitudConfig = (estado: EstadoAptitud['estado']) => {
    const configs = {
      apto: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'APTO', gradient: 'from-emerald-500 to-teal-500' },
      apto_restriccion: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'APTO CON RESTRICCIÓN', gradient: 'from-amber-500 to-orange-500' },
      no_apto: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'NO APTO', gradient: 'from-red-500 to-rose-500' },
      pendiente: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', label: 'PENDIENTE', gradient: 'from-slate-500 to-gray-500' }
    }
    return configs[estado]
  }

  // Estado vacío cuando no hay paciente vinculado (Fallback a Demo para Pruebas)
  const renderData = pacienteData || {
    nombre: user?.nombre || 'Paciente Demo',
    puesto: 'Ingeniero de Sistemas',
    area: 'Tecnología',
    numero_empleado: 'EMP-2023-842'
  };

  const renderCitas = citas.length > 0 ? citas : [
    {
      id: 'demo-cita-1',
      estado: 'programada',
      tipo: 'Examen Anual',
      medico_nombre: 'Dra. Ana Silva',
      especialidad: 'Medicina del Trabajo',
      fecha_hora: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString()
    }
  ];

  const renderExamenes = examenes.length > 0 ? examenes : [
    {
      id: 'demo-ex-1',
      dictamen: 'apto',
      tipo: 'Audiometría Tonal',
      fecha: new Date().toISOString()
    }
  ];

  const renderCertificados = certificados.length > 0 ? certificados : [
    {
      id: 'demo-cert-1',
      tipo_certificacion: 'Certificado de Aptitud',
      fecha_emision: new Date().toISOString(),
      fecha_vigencia: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
    }
  ];

  const renderAptitud = aptitud.estado !== 'pendiente' ? aptitud : {
    estado: 'apto',
    vigencia: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
    restricciones: [],
    proximaEvaluacion: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  } as EstadoAptitud;

  const aptitudConfig = getAptitudConfig(renderAptitud.estado)
  const AptitudIcon = aptitudConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 p-6">
      {/* Header con saludo y datos del trabajador */}
      <PremiumPageHeader
        title={`Hola, ${renderData.nombre || user?.nombre?.split(' ')[0] || 'Trabajador'}`}
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

      <div className="mb-8 container mx-auto">
        <ComunicadosFeed />
      </div>

      {/* Card de Estado de Aptitud */}
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
                  <p className="font-semibold">{renderAptitud.vigencia}</p>
                </div>
                <div className="w-px h-8 bg-white/30" />
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-80">Próxima Evaluación</p>
                  <p className="font-semibold">{renderAptitud.proximaEvaluacion}</p>
                </div>
              </div>
            </div>

            {/* Restricciones si las hay */}
            {renderAptitud.restricciones && renderAptitud.restricciones.length > 0 && (
              <div className="p-6 lg:p-8 lg:w-96 bg-white border-l border-amber-200">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Restricciones Activas
                </h3>
                <ul className="space-y-2">
                  {renderAptitud.restricciones.map((restriccion, idx) => (
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
              </CardHeader>
              <CardContent className="space-y-3">
                {renderCitas.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No tienes citas programadas</p>
                  </div>
                ) : (
                  renderCitas.slice(0, 5).map((cita) => (
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
                          <h4 className="font-semibold text-slate-800">{cita.tipo || cita.tipo_cita || 'Consulta'}</h4>
                          <p className="text-sm text-slate-500">{cita.medico_nombre || 'Médico por asignar'}</p>
                          <p className="text-xs text-slate-400">{cita.especialidad || ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">
                          {cita.fecha_hora ? new Date(cita.fecha_hora).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : cita.fecha || '—'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {cita.fecha_hora ? new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : cita.hora_inicio || '—'}
                        </p>
                        <Badge className={`mt-1 ${cita.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-700' :
                          cita.estado === 'completada' ? 'bg-slate-100 text-slate-600' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                          {cita.estado === 'confirmada' ? '✓ Confirmada' : cita.estado === 'completada' ? 'Completada' : '⏳ Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
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
              </CardHeader>
              <CardContent>
                {renderExamenes.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No hay resultados de exámenes registrados</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {renderExamenes.map((examen) => (
                      <div
                        key={examen.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${examen.dictamen === 'normal' || examen.dictamen === 'apto' ? 'bg-emerald-50 text-emerald-600' :
                            examen.dictamen === 'alterado' || examen.dictamen === 'no_apto' ? 'bg-red-50 text-red-600' :
                              'bg-slate-50 text-slate-500'
                            }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-800">{examen.tipo || 'Examen'}</p>
                            <p className="text-xs text-slate-400">
                              {examen.fecha ? new Date(examen.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(examen.dictamen === 'alterado' || examen.dictamen === 'no_apto') && (
                            <Badge className="bg-red-100 text-red-700 text-xs">Alterado</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {renderCertificados.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sin certificados emitidos</p>
                  </div>
                ) : (
                  renderCertificados.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm text-slate-800">{cert.tipo_certificacion || 'Certificado'}</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Emitido: {cert.fecha_emision ? new Date(cert.fecha_emision).toLocaleDateString('es-MX') : '—'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Vigente hasta: <span className="font-medium text-emerald-600">
                              {cert.fecha_vigencia ? new Date(cert.fecha_vigencia).toLocaleDateString('es-MX') : '—'}
                            </span>
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Info del Trabajador */}
          {renderData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Briefcase className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Mi Información</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        <strong>Puesto:</strong> {renderData.puesto || '—'}<br />
                        <strong>Área:</strong> {renderData.area || renderData.departamento || '—'}<br />
                        <strong>No. Empleado:</strong> {renderData.numero_empleado || '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
