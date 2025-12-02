// Página de login espectacular con modo demo para 4 roles
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Crown,
  Building2,
  Stethoscope,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  Shield
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole, ROLE_LABELS, ROLE_COLORS } from '@/types/auth'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

// Usuarios demo para cada rol
const DEMO_USERS = [
  {
    rol: 'super_admin' as UserRole,
    email: 'superadmin@mediflow.com',
    password: 'admin123',
    nombre: 'Carlos',
    apellido_paterno: 'Administrador',
    icon: Crown,
    gradient: 'from-purple-500 to-pink-500',
    description: 'Acceso total al sistema'
  },
  {
    rol: 'admin_empresa' as UserRole,
    email: 'admin@empresa.com',
    password: 'admin123',
    nombre: 'Ana',
    apellido_paterno: 'Gerente',
    icon: Building2,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Gestión empresarial completa'
  },
  {
    rol: 'medico' as UserRole,
    email: 'medico@mediflow.com',
    password: 'medico123',
    nombre: 'Dr. Roberto',
    apellido_paterno: 'Pérez',
    icon: Stethoscope,
    gradient: 'from-green-500 to-emerald-500',
    description: 'Atención médica y pacientes'
  },
  {
    rol: 'paciente' as UserRole,
    email: 'paciente@mediflow.com',
    password: 'paciente123',
    nombre: 'María',
    apellido_paterno: 'López',
    icon: UserIcon,
    gradient: 'from-orange-500 to-red-500',
    description: 'Portal del paciente'
  }
]

export function LoginNew() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState<UserRole | null>(null)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  // Login demo rápido (sin Supabase)
  const handleDemoLogin = async (demoUser: typeof DEMO_USERS[0]) => {
    setLoading(true)
    
    try {
      // Crear usuario demo en localStorage
      const user = {
        id: `demo-${demoUser.rol}`,
        email: demoUser.email,
        nombre: demoUser.nombre,
        apellido_paterno: demoUser.apellido_paterno,
        rol: demoUser.rol,
        empresa_id: 'demo-empresa',
        sede_id: 'demo-sede'
      }

      localStorage.setItem('mediflow_user', JSON.stringify(user))
      
      toast.success(`¡Bienvenido ${demoUser.nombre}!`, {
        icon: '👋',
        duration: 3000
      })

      setTimeout(() => {
        try {
          const key = `mediflow_prefs_${user.id}`
          const stored = localStorage.getItem(key)
          const startPage = stored ? (JSON.parse(stored).startPage || '/dashboard') : '/dashboard'
          window.location.href = startPage
        } catch (_) {
          window.location.href = '/dashboard'
        }
      }, 500)
    } catch (error) {
      console.error('Error en demo login:', error)
      toast.error('Error al iniciar sesión demo')
    } finally {
      setLoading(false)
    }
  }

  // Login normal con Supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error en login:', error)
      toast.error('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* Panel izquierdo - Login Form */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl"
          >
            {/* Logo y título */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl mb-4 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-2">
                MediFlow
              </h1>
              <p className="text-gray-300 text-sm">
                Sistema de Gestión Médica Inteligente
              </p>
            </div>

            {/* Formulario de login */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 group"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles size={20} />
                  </motion.div>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </motion.div>

          {/* Panel derecho - Demo Users */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl mb-4">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Acceso Rápido Demo</h2>
              </div>
              <p className="text-gray-300 text-sm">
                Prueba el sistema con diferentes roles de usuario
              </p>
            </div>

            <div className="space-y-3">
              {DEMO_USERS.map((demoUser, index) => (
                <motion.button
                  key={demoUser.rol}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.2 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDemoLogin(demoUser)}
                  disabled={loading}
                  className={`
                    w-full bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20
                    hover:bg-white/20 hover:border-white/30 transition-all
                    flex items-center space-x-4 group relative overflow-hidden
                  `}
                >
                  {/* Gradiente de fondo en hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${demoUser.gradient} opacity-0 group-hover:opacity-20 transition-opacity`} />

                  {/* Icono del rol */}
                  <div className={`relative z-10 w-14 h-14 rounded-xl bg-gradient-to-br ${demoUser.gradient} flex items-center justify-center shadow-lg`}>
                    <demoUser.icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Info del usuario */}
                  <div className="relative z-10 flex-1 text-left">
                    <p className="text-white font-semibold text-lg">
                      {demoUser.nombre}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {ROLE_LABELS[demoUser.rol]}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {demoUser.description}
                    </p>
                  </div>

                  {/* Flecha */}
                  <ArrowRight className="relative z-10 h-6 w-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-4 border border-yellow-500/30 mt-6">
              <p className="text-yellow-200 text-sm text-center">
                💡 <strong>Tip:</strong> Usa el acceso rápido para probar diferentes roles sin necesidad de credenciales
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-gray-400 text-sm"
        >
          <p>
            © 2025 MediFlow - Sistema de Gestión Médica
            <br />
            Todos los derechos reservados
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
