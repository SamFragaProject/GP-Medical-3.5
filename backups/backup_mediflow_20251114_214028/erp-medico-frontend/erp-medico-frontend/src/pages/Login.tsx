// Página de login para ERP Médico con tema verde
import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Heart, Lock, Mail, AlertCircle, Loader, Crown, Building, User, Users } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUserDemo'
import toast from 'react-hot-toast'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const { currentUser: user } = useCurrentUser()
  const navigate = useNavigate()

  // En modo demo, no redirigir automáticamente
  // El usuario puede elegir entre usar una cuenta demo o hacer login manual

  // Cargar credenciales guardadas
  useEffect(() => {
    const savedEmail = localStorage.getItem('mediflow_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    // En modo demo, simular login exitoso
    setLoading(true)
    
    // Simular delay de login
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Guardar email si está marcada la opción
    if (rememberMe) {
      localStorage.setItem('mediflow_email', email)
    } else {
      localStorage.removeItem('mediflow_email')
    }
    
    toast.success('¡Bienvenido a MediFlow (Modo Demo)!')
    
    // Navegar al dashboard
    navigate('/dashboard', { replace: true })
    setLoading(false)
  }

  // Función para usar cuenta demo SaaS actualizada
  const usarCuentaDemo = (cuenta: { email: string; password: string; nombre: string; rol: string }) => {
    setEmail(cuenta.email)
    setPassword(cuenta.password)
    toast(`Credenciales de ${cuenta.rol} cargadas`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex rounded-2xl shadow-2xl overflow-hidden bg-white">
        
        {/* Panel izquierdo - Información */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-700 p-12 flex-col justify-center relative overflow-hidden"
        >
          {/* Decoración de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-white p-3 rounded-xl">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">MediFlow</h1>
                <p className="text-secondary-200">Medicina del Trabajo</p>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Sistema ERP<br />
                Médico Especializado
              </h2>
              
              <p className="text-secondary-100 text-lg leading-relaxed">
                Plataforma integral para la gestión de medicina ocupacional con 
                IA predictiva, chatbot superinteligente y cumplimiento normativo.
              </p>

              {/* Características destacadas */}
              <div className="space-y-4 mt-8">
                {[
                  'Exámenes ocupacionales digitalizados',
                  'Evaluaciones de riesgo automatizadas',
                  'Cumplimiento NOM-006-STPS y NOM-017-STPS',
                  'Chatbot IA especializado en medicina',
                  'Analytics predictivos de salud laboral'
                ].map((caracteristica, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-secondary-300 rounded-full"></div>
                    <span className="text-secondary-100">{caracteristica}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel derecho - Formulario de login */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center"
        >
          {/* Header móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">MediFlow</span>
            </div>
            <p className="text-gray-600">Medicina del Trabajo</p>
          </div>

          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-gray-600">
                Accede a tu cuenta de MediFlow
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="tu@empresa.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary-700 transition-colors"
                  onClick={() => toast('Funcionalidad próximamente')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </form>

            {/* Cuentas demo - Usuarios reales */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Heart className="w-3 h-3 mr-1" />
                  Usuarios de Prueba
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
                Acceso Rápido - Cuentas Demo
              </h3>
              <div className="space-y-2">
                {/* 1. Administrador */}
                <button
                  onClick={() => usarCuentaDemo({ email: 'admin@mediflow.mx', password: 'admin123', nombre: 'Dr. Carlos Ramírez', rol: 'Administrador' })}
                  className="w-full text-left p-3 rounded-lg border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <Crown className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Dr. Carlos Ramírez</p>
                        <p className="text-xs text-red-600 font-medium">Administrador / Director</p>
                        <p className="text-xs text-gray-500">admin@mediflow.mx</p>
                      </div>
                    </div>
                    <div className="text-xs text-red-600 font-medium">Acceso Total</div>
                  </div>
                </button>

                {/* 2. Médico */}
                <button
                  onClick={() => usarCuentaDemo({ email: 'medico@mediflow.mx', password: 'medico123', nombre: 'Dra. Ana López', rol: 'Médico' })}
                  className="w-full text-left p-3 rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Heart className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Dra. Ana López</p>
                        <p className="text-xs text-green-600 font-medium">Médico del Trabajo</p>
                        <p className="text-xs text-gray-500">medico@mediflow.mx</p>
                      </div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">Médico</div>
                  </div>
                </button>

                {/* 3. Recepcionista */}
                <button
                  onClick={() => usarCuentaDemo({ email: 'recepcion@mediflow.mx', password: 'recepcion123', nombre: 'María González', rol: 'Recepcionista' })}
                  className="w-full text-left p-3 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">María González</p>
                        <p className="text-xs text-blue-600 font-medium">Recepcionista</p>
                        <p className="text-xs text-gray-500">recepcion@mediflow.mx</p>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">Atención</div>
                  </div>
                </button>

                {/* 4. Paciente */}
                <button
                  onClick={() => usarCuentaDemo({ email: 'paciente@mediflow.mx', password: 'paciente123', nombre: 'Juan Pérez', rol: 'Paciente' })}
                  className="w-full text-left p-3 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Juan Pérez García</p>
                        <p className="text-xs text-purple-600 font-medium">Paciente / Trabajador</p>
                        <p className="text-xs text-gray-500">paciente@mediflow.mx</p>
                      </div>
                    </div>
                    <div className="text-xs text-purple-600 font-medium">Paciente</div>
                  </div>
                </button>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800 font-medium">✨ Sistema Simplificado</p>
                <p className="text-xs text-green-700 mt-1">
                  Usa cualquiera de estas cuentas para acceder al sistema de medicina del trabajo.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Al iniciar sesión, aceptas nuestros{' '}
                <button className="text-primary hover:text-primary-700 transition-colors">
                  Términos de Servicio
                </button>{' '}
                y{' '}
                <button className="text-primary hover:text-primary-700 transition-colors">
                  Política de Privacidad
                </button>
              </p>
              
              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <span>Desarrollado por MiniMax Agent</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}