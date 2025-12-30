import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, FileText, UserCircle2, Stethoscope, ChevronRight, Download, FileSearch, Plus, Activity, Clock, Pill, FlaskConical, Search, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PremiumStatCard } from '@/components/dashboard/PremiumStatCard'

export default function DashboardPaciente() {
  const { user } = useAuth()

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-400">{user?.nombre.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1 font-medium">
            Bienvenido a tu portal de salud personal.
          </p>
        </div>
        <button className="glass-button px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/25 transition-all group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="font-semibold">Nueva Cita</span>
        </button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumStatCard
          title="Próxima Cita"
          value="Mañana"
          subtext="10:30 AM - Cardiología"
          trend={0}
          trendLabel="Confirmada"
          icon={Calendar}
          variant="primary"
          delay={0.1}
        />
        <PremiumStatCard
          title="Resultados Nuevos"
          value="2"
          subtext="Laboratorio Clínico"
          trend={0}
          trendLabel="Disponibles"
          icon={FileText}
          variant="success"
          delay={0.2}
        />
        <PremiumStatCard
          title="Mi Salud"
          value="Estable"
          subtext="Último chequeo: Hace 1 mes"
          trend={0}
          trendLabel="Al día"
          icon={Activity}
          variant="default"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Actions & Appointments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-3xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all cursor-pointer group border border-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors border border-white/20 shadow-inner">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-xl tracking-tight">Agendar Cita</h3>
                <p className="text-sm text-white/80 mt-1 font-medium">Programa una nueva consulta</p>
              </div>
            </div>
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 p-6 rounded-3xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all cursor-pointer group border border-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors border border-white/20 shadow-inner">
                  <FileSearch className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-xl tracking-tight">Ver Resultados</h3>
                <p className="text-sm text-white/80 mt-1 font-medium">Descarga tus exámenes</p>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Appointments List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Mis Citas
              </h3>
              <button className="text-sm text-gray-400 hover:text-white font-medium hover:underline transition-colors">Ver historial</button>
            </div>

            <div className="space-y-4 relative z-10">
              {[
                { doctor: 'Dr. Sarah Wilson', spec: 'Cardiología', date: 'Mañana, 10:30 AM', status: 'confirmed' },
                { doctor: 'Dra. Emily Brown', spec: 'Medicina General', date: 'Jueves 24, 09:00 AM', status: 'pending' },
              ].map((cita, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-lg font-bold text-white shadow-lg border border-white/10">
                      {cita.doctor.charAt(4)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors">{cita.doctor}</h4>
                      <p className="text-sm text-gray-400">{cita.spec}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {cita.date}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cita.status === 'confirmed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                    {cita.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Recent Results & Profile */}
        <div className="space-y-6">
          {/* Recent Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              Resultados Recientes
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Biometría Hemática', date: 'Hace 2 días', type: 'pdf' },
                { name: 'Perfil Lipídico', date: 'Hace 2 días', type: 'pdf' },
                { name: 'Radiografía Tórax', date: 'Hace 1 semana', type: 'img' },
              ].map((result, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-white group-hover:bg-primary/20 transition-colors">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white">{result.name}</p>
                      <p className="text-xs text-gray-500">{result.date}</p>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-primary transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl border border-white/10 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-pink-600 opacity-90" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border-2 border-white/30 shadow-xl">
                  {user?.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xl tracking-tight">{user?.nombre}</h3>
                  <p className="text-white/80 text-sm font-medium">Paciente Premium</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-white/90 bg-black/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-white/70">ID Paciente</span>
                  <span className="font-mono font-bold tracking-wider">#P-8832</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Tipo Sangre</span>
                  <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-xs">O+</span>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-white text-primary rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-lg">
                Ver Perfil Completo
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
