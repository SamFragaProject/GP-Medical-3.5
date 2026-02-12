import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import DashboardPaciente from './DashboardPaciente'
import { DoctorView } from '@/components/dashboard/DoctorView'
import { AdminView } from '@/components/dashboard/AdminView'
import { SuperAdminView } from '@/components/dashboard/SuperAdminView'
import { ReceptionView } from '@/components/dashboard/ReceptionView'
import { Sparkles, Rocket, ArrowRight } from 'lucide-react'
import { useMeta } from '@/hooks/useMeta'
import { useOnboarding } from '@/hooks/useOnboarding'
import { Button } from '@/components/ui/button'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { needsOnboarding, loading: onboardingLoading, hasSedes, hasPacientes } = useOnboarding()

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
        return <ReceptionView />
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

      {/* Banner de Onboarding para empresas nuevas */}
      {needsOnboarding && !onboardingLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 shadow-2xl shadow-emerald-500/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 flex items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  ¡Configura tu empresa!
                </h2>
                <p className="text-emerald-100 text-sm max-w-lg">
                  {!hasSedes && !hasPacientes
                    ? 'Aún no tienes sedes ni trabajadores registrados. Configura tu empresa en pocos minutos con nuestro asistente.'
                    : !hasSedes
                      ? 'Agrega al menos una sede para comenzar a operar.'
                      : 'Importa tus trabajadores para comenzar con la gestión médica.'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/onboarding')}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-black text-sm px-8 py-4 rounded-2xl h-auto shadow-xl flex-shrink-0"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Iniciar Configuración
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

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
