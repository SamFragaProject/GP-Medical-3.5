import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import DashboardPaciente from './DashboardPaciente'
import { DoctorView } from '@/components/dashboard/DoctorView'
import { AdminView } from '@/components/dashboard/AdminView'
import { SuperAdminView } from '@/components/dashboard/SuperAdminView'
import { Sparkles } from 'lucide-react'
import { useMeta } from '@/hooks/useMeta'

export function Dashboard() {
  const { user } = useAuth()

  useMeta({
    title: `Dashboard ${user?.rol || ''}`,
    description: 'Centro de control operativo GPMedical MediFlow.'
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Renderizado condicional basado en el rol
  const renderDashboardContent = () => {
    switch (user.rol) {
      case 'super_admin':
      case 'admin_saas':
        return <SuperAdminView />
      case 'medico':
        return <DoctorView />
      case 'admin_empresa':
      case 'contador_saas':
        return <AdminView />
      case 'enfermera':
      case 'recepcion':
      case 'asistente':
        return <AdminView /> // Usan vista de admin con permisos limitados
      case 'paciente':
        return <DashboardPaciente />
      default:
        // Fallback para cualquier rol no manejado
        console.warn(`Rol no manejado: ${user.rol}, mostrando AdminView`)
        return <AdminView />
    }
  }

  return (
    <div className="space-y-8 p-2" data-hc-dashboard>
      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {renderDashboardContent()}
      </motion.div>
    </div>
  )
}
