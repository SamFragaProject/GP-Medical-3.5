import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Calendar as CalendarIcon,
  FileText,
  Activity,
  ChevronRight,
  Pill,
  Clock,
  AlertCircle,
  ArrowLeft,
  AlertTriangle,
  FlaskConical,
  FileSearch,
  Filter,
  SlidersHorizontal
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { mockDataService } from '@/services/mockDataService'
import { AnatomyViewer } from '@/components/dashboard/AnatomyViewer'
import { PrescriptionEditor } from '@/components/medicina/PrescriptionEditor'
import { ClinicalRecordView } from '@/components/medicina/ClinicalRecordView'
import { WorkHistoryTimeline } from '@/components/dashboard/WorkHistoryTimeline'
import { PatientStats } from '@/components/patients/PatientStats'
import toast from 'react-hot-toast'

// Tipos
interface Paciente {
  id: string
  numero_empleado: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  genero: string
  fecha_nacimiento: string
  estatus: string
  foto_url?: string
  puesto_trabajo?: {
    nombre: string
    departamento: string
  }
}

export function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'details' | 'prescription' | 'history'>('details')
  const [activeFilter, setActiveFilter] = useState('all')

  // Simulación de usuario actual
  const currentUser = {
    role: 'super_admin' as const,
    id: 'user-admin-1',
    empresa_id: 'empresa-demo-1'
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await mockDataService.getPacientes(currentUser)
        setPacientes(data)
      } catch (error) {
        console.error(error)
        toast.error('Error al cargar pacientes')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredPatients = pacientes.filter(p =>
    (p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.apellido_paterno.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (activeFilter === 'all' || p.estatus === activeFilter) // Note: Mock data doesn't have estatus, so this is placeholder logic
  )

  // Reset view mode when selecting a new patient
  const handleSelectPatient = (patient: Paciente) => {
    setSelectedPatient(patient)
    setViewMode('details')
  }

  const handleBackToList = () => {
    setSelectedPatient(null)
    setViewMode('details')
  }

  return (
    <div
      className="min-h-screen p-6 space-y-6"
      style={{
        background: '#F8FAFC',
        minHeight: '100vh'
      }}
    >

      {/* Header - Only show when no patient is selected or simplified when selected */}
      {!selectedPatient && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pacientes</h1>
              <p className="text-gray-600 mt-1">Gestión clínica y seguimiento integral</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-gray-900 shadow-lg shadow-primary/25 rounded-xl px-6 transition-all hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Paciente
            </Button>
          </div>

          {/* Patient Stats Widget */}
          <PatientStats />
        </div>
      )}

      <div className="flex gap-6 h-[calc(100vh-240px)]">

        {/* Lista de Pacientes (Izquierda) - Hidden when patient selected */}
        <AnimatePresence mode="wait">
          {!selectedPatient && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, width: 0 }}
              className="w-full rounded-3xl overflow-hidden flex flex-col bg-white shadow-sm border border-gray-200"
            >
              <div className="p-4 border-b border-gray-200 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, ID o puesto..."
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('all')}
                    className="rounded-lg text-xs"
                  >
                    Todos
                  </Button>
                  <Button
                    variant={activeFilter === 'apto' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('apto')}
                    className="rounded-lg text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    Aptos
                  </Button>
                  <Button
                    variant={activeFilter === 'restriccion' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('restriccion')}
                    className="rounded-lg text-xs border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                  >
                    Con Restricción
                  </Button>
                  <Button
                    variant={activeFilter === 'alerta' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('alerta')}
                    className="rounded-lg text-xs border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  >
                    No Aptos
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {loading ? (
                  <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                ) : (
                  filteredPatients.map((patient, index) => {
                    // Mock data for status - in real app, this would come from patient data
                    const mockStatuses = ['apto', 'restriccion', 'alerta'];
                    const mockAlerts = [0, 2, 1, 0, 3];
                    const mockNextAppointments = ['25 Oct', '28 Oct', '1 Nov', '5 Nov', '10 Nov'];

                    const status = mockStatuses[index % 3];
                    const alertCount = mockAlerts[index % 5];
                    const nextAppointment = mockNextAppointments[index % 5];

                    return (
                      <motion.div
                        key={patient.id}
                        layoutId={`patient-${patient.id}`}
                        onClick={() => handleSelectPatient(patient)}
                        className="p-4 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 border border-transparent hover:border-primary/20 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-2 ring-primary/10">
                              <AvatarImage src={patient.foto_url} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                {patient.nombre[0]}{patient.apellido_paterno[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-gray-900 truncate">
                                  {patient.nombre} {patient.apellido_paterno}
                                </h3>
                                {/* Status Badge */}
                                {status === 'apto' && (
                                  <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                                    ✓ Apto
                                  </Badge>
                                )}
                                {status === 'restriccion' && (
                                  <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                                    ⚠ Restricción
                                  </Badge>
                                )}
                                {status === 'alerta' && (
                                  <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
                                    🔴 Alerta
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">
                                  {patient.puesto_trabajo?.nombre || 'Sin puesto'}
                                </Badge>
                                <span>•</span>
                                <span className="text-xs">{patient.numero_empleado}</span>
                              </div>

                              {/* Next Appointment & Alerts */}
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  <span>Próxima: {nextAppointment}</span>
                                </div>
                                {alertCount > 0 && (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <AlertCircle className="w-3 h-3" />
                                    <span className="font-semibold">{alertCount} alerta{alertCount > 1 ? 's' : ''}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel Derecho Dinámico (Full Width when selected) */}
        <AnimatePresence mode="wait">
          {selectedPatient && (
            <motion.div
              key="patient-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full flex flex-col"
            >
              {/* Top Navigation Bar */}
              <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="icon" onClick={handleBackToList} className="hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </Button>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage src={selectedPatient.foto_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {selectedPatient.nombre[0]}{selectedPatient.apellido_paterno[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">
                        {selectedPatient.nombre} {selectedPatient.apellido_paterno}
                      </h2>
                      <p className="text-xs text-gray-500">Expediente: {selectedPatient.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === 'details' ? 'secondary' : 'ghost'}
                    onClick={() => setViewMode('details')}
                    className="text-sm"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant={viewMode === 'history' ? 'secondary' : 'ghost'}
                    onClick={() => setViewMode('history')}
                    className="text-sm"
                  >
                    Expediente
                  </Button>
                  <Button
                    variant={viewMode === 'prescription' ? 'secondary' : 'ghost'}
                    onClick={() => setViewMode('prescription')}
                    className="text-sm"
                  >
                    Receta
                  </Button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {viewMode === 'details' && (
                  <div className="h-full overflow-y-auto pr-2 space-y-6">

                    {/* CRM Dashboard Header Cards - Medicina Laboral */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { title: 'Estado Laboral', value: 'Apto', icon: Activity, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', subtitle: 'Sin restricciones' },
                        { title: 'Días Sin Incidentes', value: '127', icon: AlertTriangle, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', subtitle: 'Récord personal' },
                        { title: 'Riesgo Ergonómico', value: 'Medio', icon: Activity, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', subtitle: 'Evaluación pendiente' },
                        { title: 'Próxima Evaluación', value: '15 Dic', icon: CalendarIcon, gradient: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/20', subtitle: 'Anual programada' }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-5 rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg ${item.shadow} flex items-center space-x-4 group relative overflow-hidden border border-white/10`}
                        >
                          {/* Decorative Circle */}
                          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md shadow-inner border border-white/20">
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="relative z-10">
                            <p className="text-xs font-bold text-white/90 uppercase tracking-wider">{item.title}</p>
                            <p className="text-2xl font-bold text-white tracking-tight">{item.value}</p>
                            <p className="text-xs text-white/80 mt-0.5">{item.subtitle}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Left Column: Important Data & Alerts */}
                      <div className="lg:col-span-2 space-y-6">

                        {/* Critical Alerts Section - Medicina Laboral */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="glass-card rounded-3xl p-6"
                        >
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                            Atención Requerida - Salud Ocupacional
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-start p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer">
                              <div className="p-2 bg-white rounded-lg shadow-sm mr-3 text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-amber-900">Restricción Laboral Activa</h4>
                                <p className="text-sm text-amber-700 mt-1">No levantar objetos mayores a 10kg. Válido hasta 30 Nov. Síndrome del túnel carpiano en tratamiento.</p>
                              </div>
                            </div>
                            <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                              <div className="p-2 bg-white rounded-lg shadow-sm mr-3 text-red-500">
                                <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-red-900">Evaluación Ergonómica Vencida</h4>
                                <p className="text-sm text-red-700 mt-1">Última evaluación: 15 Ago 2024. Requiere evaluación anual. Programar antes del 31 Dic.</p>
                              </div>
                            </div>
                            <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                              <div className="p-2 bg-white rounded-lg shadow-sm mr-3 text-blue-600">
                                <Activity className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-blue-900">Exposición a Ruido - Protección Requerida</h4>
                                <p className="text-sm text-blue-700 mt-1">Área de producción: 85dB promedio. Uso obligatorio de protección auditiva. Audiometría anual programada.</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Work History Timeline */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <WorkHistoryTimeline />
                        </motion.div>

                      </div>

                      {/* Right Column: Quick Actions & Vitals */}
                      <div className="space-y-6">

                        {/* Quick Actions - Redesigned */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="glass-card rounded-3xl p-6"
                        >
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas - Medicina Laboral</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            {[
                              { label: 'Nueva Receta', icon: Pill, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', onClick: () => setViewMode('prescription') },
                              { label: 'Certificado Aptitud', icon: FileText, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', onClick: () => { } },
                              { label: 'Eval. Ergonómica', icon: Activity, color: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/20', onClick: () => { } },
                              { label: 'Reporte Incidente', icon: AlertTriangle, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', onClick: () => { } }
                            ].map((action, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={action.onClick}
                                className={`relative overflow-hidden rounded-2xl p-4 flex items-center justify-center space-x-3 bg-gradient-to-br ${action.color} text-white shadow-lg ${action.shadow} group border border-white/10`}
                              >
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner border border-white/20">
                                  <action.icon size={20} className="text-white" />
                                </div>
                                <span className="font-bold tracking-wide text-sm">{action.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>

                        {/* Mini Vitals */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                          className="glass-card rounded-3xl p-6"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-900">Signos Vitales</h3>
                            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Hace 2 días</span>
                          </div>
                          <div className="space-y-5">
                            <div>
                              <div className="flex justify-between items-end mb-1">
                                <span className="text-xs text-gray-500 font-medium">Presión Arterial</span>
                                <span className="text-lg font-bold text-gray-900">120/80</span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-3/4 rounded-full" />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-end mb-1">
                                <span className="text-xs text-gray-500 font-medium">IMC</span>
                                <span className="text-lg font-bold text-gray-900">24.2</span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-1/2 rounded-full" />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-end mb-1">
                                <span className="text-xs text-gray-500 font-medium">Frecuencia Cardíaca</span>
                                <span className="text-lg font-bold text-gray-900">72 <span className="text-xs font-normal text-gray-400">bpm</span></span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-rose-500 h-full w-1/3 rounded-full" />
                              </div>
                            </div>
                          </div>
                        </motion.div>

                      </div>
                    </div>
                  </div >
                )
                }

                {
                  viewMode === 'prescription' && (
                    <PrescriptionEditor
                      patient={selectedPatient}
                      onCancel={() => setViewMode('details')}
                      onSave={() => {
                        toast.success('Receta guardada e impresa')
                        setViewMode('details')
                      }}
                    />
                  )
                }

                {
                  viewMode === 'history' && (
                    <ClinicalRecordView
                      patient={selectedPatient}
                      onBack={() => setViewMode('details')}
                    />
                  )
                }
              </div >
            </motion.div >
          )}
        </AnimatePresence >
      </div >
    </div >
  )
}



