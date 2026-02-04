/**
 * Mis Citas - Portal del Trabajador
 * 
 * Vista para que el trabajador gestione sus citas:
 * - Ver citas programadas
 * - Historial de citas
 * - Solicitar nueva cita
 */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, CheckCircle, XCircle, Plus,
  ChevronRight, MapPin, Stethoscope, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Cita {
  id: string
  tipo: string
  fecha: string
  hora: string
  medico: string
  especialidad: string
  ubicacion: string
  estado: 'programada' | 'confirmada' | 'completada' | 'cancelada'
  notas?: string
}

export default function MisCitas() {
  const [activeTab, setActiveTab] = useState('proximas')

  const citasProximas: Cita[] = [
    { id: '1', tipo: 'Examen Médico Periódico', fecha: '20 Ene 2025', hora: '09:00', medico: 'Dr. García Mendoza', especialidad: 'Medicina del Trabajo', ubicacion: 'Consultorio 3', estado: 'confirmada' },
    { id: '2', tipo: 'Audiometría Anual', fecha: '25 Ene 2025', hora: '10:30', medico: 'Dra. López Rivera', especialidad: 'Audiología', ubicacion: 'Laboratorio 2', estado: 'programada' },
    { id: '3', tipo: 'Espirometría de Control', fecha: '28 Ene 2025', hora: '11:00', medico: 'Dr. Martínez Soto', especialidad: 'Neumología', ubicacion: 'Consultorio 5', estado: 'programada' },
  ]

  const citasHistorial: Cita[] = [
    { id: '4', tipo: 'Examen de Ingreso', fecha: '15 Dic 2024', hora: '08:00', medico: 'Dr. García Mendoza', especialidad: 'Medicina del Trabajo', ubicacion: 'Consultorio 3', estado: 'completada', notas: 'Apto sin restricciones' },
    { id: '5', tipo: 'Biometría Hemática', fecha: '15 Dic 2024', hora: '07:30', medico: 'Lab. Central', especialidad: 'Laboratorio', ubicacion: 'Laboratorio 1', estado: 'completada' },
  ]

  const getEstadoConfig = (estado: Cita['estado']) => {
    const configs = {
      programada: { label: 'Programada', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
      confirmada: { label: 'Confirmada', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
      completada: { label: 'Completada', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckCircle },
      cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    }
    return configs[estado]
  }

  const renderCita = (cita: Cita) => {
    const estadoConfig = getEstadoConfig(cita.estado)
    const EstadoIcon = estadoConfig.icon

    return (
      <motion.div
        key={cita.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border border-slate-100 hover:border-cyan-200 hover:shadow-md transition-all bg-white"
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{cita.tipo}</h3>
              <p className="text-sm text-slate-500">{cita.medico} • {cita.especialidad}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {cita.fecha}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {cita.hora}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {cita.ubicacion}
                </span>
              </div>
              {cita.notas && (
                <p className="mt-2 text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg inline-block">
                  {cita.notas}
                </p>
              )}
            </div>
          </div>
          <Badge className={`${estadoConfig.color} border`}>
            <EstadoIcon className="w-3 h-3 mr-1" />
            {estadoConfig.label}
          </Badge>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mis Citas</h1>
            <p className="text-slate-500">Gestiona tus citas médicas y evaluaciones</p>
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg shadow-cyan-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Solicitar Cita
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Próximas', value: citasProximas.length, color: 'from-cyan-500 to-blue-500' },
          { label: 'Confirmadas', value: citasProximas.filter(c => c.estado === 'confirmada').length, color: 'from-emerald-500 to-teal-500' },
          { label: 'Este Mes', value: citasProximas.length + citasHistorial.length, color: 'from-purple-500 to-pink-500' },
        ].map((stat) => (
          <Card key={stat.label} className={`border-0 bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
            <CardContent className="p-4">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de citas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-6">
          <TabsTrigger value="proximas" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Próximas
          </TabsTrigger>
          <TabsTrigger value="historial" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proximas">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-500" />
                Próximas Citas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {citasProximas.map(renderCita)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                Historial de Citas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {citasHistorial.map(renderCita)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recordatorio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">Recordatorio</h4>
              <p className="text-sm text-amber-700">
                Para tu examen del <strong>20 de Enero</strong>, recuerda presentarte con ayuno de 8 horas
                y traer tu identificación oficial vigente.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
