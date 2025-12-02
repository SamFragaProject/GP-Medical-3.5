import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, FileText, UserCircle2, Stethoscope, ChevronRight, Download, FileSearch, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPaciente() {
  const { user } = useAuth()

  // Tarjetas de acción principales
  const acciones = [
    {
      titulo: 'Mis Citas',
      descripcion: 'Consulta tus próximas citas y tu historial de atenciones',
      icono: Calendar,
      path: '/citas',
      color: 'from-blue-500 to-cyan-500',
      cta: 'Ver agenda',
    },
    {
      titulo: 'Mis Resultados',
      descripcion: 'Descarga e interpreta tus resultados y certificados',
      icono: FileText,
      path: '/resultados',
      color: 'from-emerald-500 to-green-500',
      cta: 'Ver resultados',
    },
    {
      titulo: 'Mi Perfil',
      descripcion: 'Actualiza tus datos, alergias y contactos de emergencia',
      icono: UserCircle2,
      path: '/perfil',
      color: 'from-purple-500 to-indigo-500',
      cta: 'Actualizar perfil',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="hc-card hc-card-hover p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hola {user?.nombre}, este es tu panel</h1>
            <p className="text-gray-600 mt-1">Accede rápidamente a tus citas, resultados y perfil</p>
          </div>
        </div>
      </motion.div>

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {acciones.map((a, i) => (
          <motion.a
            key={a.titulo}
            href={a.path}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="hc-card hc-card-hover p-6 group"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-r ${a.color} flex items-center justify-center shadow-sm mb-4`}>
              <a.icono className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">{a.titulo}</h3>
            <p className="text-sm text-gray-600 mt-1">{a.descripcion}</p>
            <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
              {a.cta}
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </div>
          </motion.a>
        ))}
      </div>

      {/* Sugerencias rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas acciones */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="hc-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Próximas acciones</h3>
          <div className="space-y-3">
            <a className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50" href="/citas">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-900">Agendar nueva cita</span>
              </div>
              <Plus className="h-4 w-4 text-gray-400" />
            </a>
            <a className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50" href="/resultados">
              <div className="flex items-center space-x-3">
                <FileSearch className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-gray-900">Revisar resultados recientes</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </a>
            <a className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50" href="/perfil">
              <div className="flex items-center space-x-3">
                <UserCircle2 className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-900">Actualizar datos personales</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </a>
          </div>
        </motion.div>

        {/* Resultados rápidos */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="hc-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Resultados rápidos</h3>
          <div className="space-y-3">
            {[{ nombre: 'Examen general', fecha: 'hace 2 días' }, { nombre: 'Radiografía de tórax', fecha: 'hace 1 semana' }].map((r, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.nombre}</p>
                  <p className="text-xs text-gray-500">{r.fecha}</p>
                </div>
                <button className="text-sm text-primary inline-flex items-center">
                  <Download className="h-4 w-4 mr-1" /> Descargar
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recomendaciones */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="hc-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recomendaciones</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start"><span className="mt-1 mr-2 h-2 w-2 rounded-full bg-emerald-500"></span> Llega 10 minutos antes a tus citas programadas.</li>
            <li className="flex items-start"><span className="mt-1 mr-2 h-2 w-2 rounded-full bg-blue-500"></span> Lleva tu identificación y receta si aplica.</li>
            <li className="flex items-start"><span className="mt-1 mr-2 h-2 w-2 rounded-full bg-purple-500"></span> Mantén tus datos y alergias siempre actualizados.</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
