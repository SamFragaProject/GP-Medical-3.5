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
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { PremiumMetricCard } from '@/components/ui/PremiumMetricCard'
import { PremiumButton } from '@/components/ui/PremiumButton'

// Las alertas se cargarán dinámicamente desde Supabase
const DEMO_ALERTAS: AlertaSeguimiento[] = []

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
      <div className="space-y-8 pb-12">
        <PremiumPageHeader
          title="Alertas Médicas Pro"
          subtitle="Inteligencia preventiva y seguimiento médico en tiempo real"
          icon={Bell}
          badge={`${alertasActivas.length} ACTIVAS`}
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-black h-12 rounded-2xl px-6 transition-all"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          }
        />

        <div className="container mx-auto px-6 -mt-10 relative z-40">
          {/* KPIs Premium */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
      </div>
    );
  }

  return null;
}
