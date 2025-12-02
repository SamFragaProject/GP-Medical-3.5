import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import DashboardPaciente from './DashboardPaciente'
import { DoctorView } from '@/components/dashboard/DoctorView'
import { AdminView } from '@/components/dashboard/AdminView'
import { SuperAdminView } from '@/components/dashboard/SuperAdminView'
import { Sparkles } from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()

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
      case 'medico':
        return <DoctorView />
      case 'super_admin':
        return <SuperAdminView />
      case 'admin_empresa':
        return <AdminView />
      case 'paciente':
        return <DashboardPaciente />
      default:
        return <DashboardPaciente />
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