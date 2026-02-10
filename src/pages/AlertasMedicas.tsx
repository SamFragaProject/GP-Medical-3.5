// Dashboard de Alertas de Seguimiento Médico
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Filter,
  Download,
  Settings,
  Eye
} from 'lucide-react'
import { AlertasSeguimiento } from '@/components/AlertasSeguimiento'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertaSeguimiento } from '@/types/alertas'

import toast from 'react-hot-toast'
import { PremiumHeader } from '@/components/ui/PremiumHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { PremiumButton } from '@/components/ui/PremiumButton'

// Datos demo para las alertas
const DEMO_ALERTAS = [
  {
    id: '1',
    tipo_alerta: 'examen_vencido' as const,
    titulo: 'Examen Ocupacional Vencido',
    descripcion: 'Juan Carlos García López requiere examen médico ocupacional anual',
    paciente_id: '1',
    paciente_nombre: 'Juan Carlos García López',
    numero_empleado: 'EMP001',
    fecha_vencimiento: '2024-10-15',
    prioridad: 'alta' as const,
    estado: 'activa' as const,
    dias_restantes: -15,
    accion_requerida: 'Programar examen médico ocupacional de inmediato',
    fecha_creacion: '2024-10-15'
  },
  {
    id: '2',
    tipo_alerta: 'proximo_examen' as const,
    titulo: 'Próximo Examen Periódico',
    descripcion: 'María Elena Rodríguez tiene examen programado para la próxima semana',
    paciente_id: '2',
    paciente_nombre: 'María Elena Rodríguez Martínez',
    numero_empleado: 'EMP002',
    fecha_programada: '2024-11-10',
    prioridad: 'media' as const,
    estado: 'activa' as const,
    dias_restantes: 7,
    accion_requerida: 'Confirmar cita y enviar recordatorio al paciente',
    fecha_creacion: '2024-11-01'
  },
  {
    id: '3',
    tipo_alerta: 'seguimiento_requerido' as const,
    titulo: 'Seguimiento Post-Incapacidad',
    descripción: 'Carlos Mendoza requiere seguimiento médico post-incapacidad',
    paciente_id: '3',
    paciente_nombre: 'Carlos Mendoza',
    numero_empleado: 'EMP003',
    fecha_programada: '2024-11-05',
    prioridad: 'alta' as const,
    estado: 'activa' as const,
    dias_restantes: 2,
    accion_requerida: 'Evaluación médica para retorno al trabajo',
    fecha_creacion: '2024-11-01'
  },
  {
    id: '4',
    tipo_alerta: 'certificado_vencido' as const,
    titulo: 'Certificado de Aptitud Vencido',
    descripción: 'Ana López tiene certificado de aptitud laboral vencido',
    paciente_id: '4',
    paciente_nombre: 'Ana López',
    numero_empleado: 'EMP004',
    fecha_vencimiento: '2024-09-30',
    prioridad: 'alta' as const,
    estado: 'activa' as const,
    dias_restantes: -30,
    accion_requerida: 'Renovar certificado de aptitud médica',
    fecha_creacion: '2024-09-30'
  },
  {
    id: '5',
    tipo_alerta: 'medicamento_vencido' as const,
    titulo: 'Medicamento de Emergencia Vencido',
    descripción: 'Revisar botiquín de emergencia en área de producción',
    paciente_id: '1',
    paciente_nombre: 'Juan Carlos García López',
    numero_empleado: 'EMP001',
    fecha_vencimiento: '2024-10-01',
    prioridad: 'alta' as const,
    estado: 'resuelta' as const,
    dias_restantes: -25,
    accion_requerida: 'Reemplazar medicamentos vencidos en botiquín',
    fecha_creacion: '2024-10-01'
  }
]

export function AlertasMedicas() {
  const [alertas] = useState<AlertaSeguimiento[]>(DEMO_ALERTAS as AlertaSeguimiento[])
  const [filtroVista, setFiltroVista] = useState<string>('dashboard')

  const alertasActivas = alertas.filter(a => a.estado === 'activa')
  const alertasAltas = alertasActivas.filter(a => a.prioridad === 'alta')
  const alertasVencidas = alertasActivas.filter(a => a.dias_restantes !== undefined && a.dias_restantes < 0)
  const proximasVencer = alertasActivas.filter(a =>
    a.dias_restantes !== undefined && a.dias_restantes >= 0 && a.dias_restantes <= 7
  )

  const handleResolveAlert = (alertaId: string) => {
    toast.success('Alerta marcada como resuelta')
  }

  const handlePostponeAlert = (alertaId: string, nuevaFecha: string) => {
    toast.success('Alerta pospuesta exitosamente')
  }

  const handleViewAlert = (alerta: any) => {
    toast.success(`Visualizando: ${alerta.titulo}`)
  }

  if (filtroVista === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Header Premium */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <PremiumHeader
            title="Alertas Médicas Pro"
            subtitle="Inteligencia preventiva y seguimiento médico en tiempo real"
            gradient={true}
            badges={[
              { text: `${alertasActivas.length} Activas`, variant: "danger", icon: <Bell size={14} /> },
              { text: `${alertasVencidas.length} Críticas`, variant: "purple", icon: <Clock size={14} /> }
            ]}
            actions={
              <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar
                </Button>
              </div>
            }
          />
        </div>

        {/* Estadísticas principales - Premium */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <PremiumMetricCard
            title="Alertas Activas"
            value={alertasActivas.length}
            subtitle="Total pendiente"
            icon={Bell}
            gradient="blue"
          />

          <PremiumMetricCard
            title="Prioridad Alta"
            value={alertasAltas.length}
            subtitle="Requiere atención"
            icon={AlertTriangle}
            gradient="rose"
          />

          <PremiumMetricCard
            title="Vencidas"
            value={alertasVencidas.length}
            subtitle="Acción inmediata"
            icon={Clock}
            gradient="amber"
          />

          <PremiumMetricCard
            title="Esta Semana"
            value={proximasVencer.length}
            subtitle="Próximos 7 días"
            icon={Calendar}
            gradient="purple"
          />
        </div>

        {/* Alertas críticas */}
        {alertasVencidas.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Atención requerida:</strong> Hay {alertasVencidas.length} alerta{alertasVencidas.length !== 1 ? 's' : ''} vencida{alertasVencidas.length !== 1 ? 's' : ''}.
              Revisar inmediatamente para evitar incumplimientos normativos.
            </AlertDescription>
          </Alert>
        )}

        {/* Listado completo de alertas */}
        <AlertasSeguimiento
          alertas={alertas}
          onResolve={handleResolveAlert}
          onPostpone={handlePostponeAlert}
          onView={handleViewAlert}
        />
      </div>
    )
  }

  return null
}
