/**
 * Página para Aceptar Invitación
 * GPMedical ERP Pro
 * 
 * Cuando un usuario recibe una invitación por email, es redirigido aquí
 * para crear su cuenta y unirse a la empresa.
 */

import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Building2,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Check,
    Loader2,
    AlertCircle,
    ArrowRight,
    Shield,
    Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { invitacionesService, InvitacionUsuario } from '@/services/tenantService'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AceptarInvitacion() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const [loading, setLoading] = useState(true)
    const [invitacion, setInvitacion] = useState<InvitacionUsuario | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [registrando, setRegistrando] = useState(false)

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        password: '',
        confirmPassword: ''
    })

    // Verificar token al cargar
    useEffect(() => {
        if (token) {
            verificarToken()
        } else {
            setError('Token de invitación no válido')
            setLoading(false)
        }
    }, [token])

    const verificarToken = async () => {
        try {
            const data = await invitacionesService.verificarToken(token!)
            if (data) {
                setInvitacion(data)
                // Pre-llenar nombre si existe
                if (data.nombre) {
                    const partes = data.nombre.split(' ')
                    setFormData(prev => ({
                        ...prev,
                        nombre: partes[0] || '',
                        apellido: partes.slice(1).join(' ') || ''
                    }))
                }
            } else {
                setError('Esta invitación ha expirado o ya fue utilizada')
            }
        } catch (err) {
            setError('Error al verificar la invitación')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validaciones
        if (!formData.nombre.trim()) {
            toast.error('El nombre es requerido')
            return
        }
        if (formData.password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres')
            return
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }

        setRegistrando(true)
        try {
            // 1. Crear cuenta en Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invitacion!.email,
                password: formData.password,
                options: {
                    data: {
                        nombre: formData.nombre,
                        apellido: formData.apellido
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // 2. Aceptar la invitación (asigna empresa y rol)
                const result = await invitacionesService.aceptar(token!, authData.user.id)

                if (result.success) {
                    toast.success('¡Bienvenido! Tu cuenta ha sido creada')
                    // Redirigir al dashboard
                    navigate('/dashboard')
                } else {
                    toast.error(result.error || 'Error al completar el registro')
                }
            }
        } catch (err: any) {
            toast.error(err.message || 'Error al crear la cuenta')
        } finally {
            setRegistrando(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-white font-medium">Verificando invitación...</p>
                </motion.div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl"
                >
                    <div className="w-20 h-20 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-rose-500" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-3">Invitación no válida</h1>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <Button
                        onClick={() => navigate('/login')}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-8"
                    >
                        Ir al Login
                    </Button>
                </motion.div>
            </div>
        )
    }

    // Datos de la empresa (si están disponibles)
    const empresa = (invitacion as any)?.empresa

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                        className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    >
                        <Sparkles className="w-10 h-10 text-emerald-500" />
                    </motion.div>
                    <h1 className="text-2xl font-black text-white mb-2">¡Has sido invitado!</h1>
                    <p className="text-emerald-100">Completa tu registro para unirte al equipo</p>
                </div>

                {/* Info de la invitación */}
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        {empresa?.logo_url ? (
                            <img
                                src={empresa.logo_url}
                                alt={empresa.nombre}
                                className="w-14 h-14 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center">
                                <Building2 className="w-7 h-7 text-slate-400" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="font-bold text-slate-900">{empresa?.nombre || 'Empresa'}</h2>
                            <p className="text-sm text-slate-500">{invitacion?.email}</p>
                        </div>
                        <Badge
                            className="text-white border-none"
                            style={{ backgroundColor: invitacion?.rol?.color || '#3B82F6' }}
                        >
                            {invitacion?.rol?.nombre || 'Usuario'}
                        </Badge>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Nombre *
                            </Label>
                            <Input
                                value={formData.nombre}
                                onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                placeholder="Tu nombre"
                                className="mt-2 h-12 rounded-xl"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Apellido
                            </Label>
                            <Input
                                value={formData.apellido}
                                onChange={e => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                                placeholder="Tu apellido"
                                className="mt-2 h-12 rounded-xl"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Contraseña *
                        </Label>
                        <div className="relative mt-2">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Mínimo 8 caracteres"
                                className="h-12 rounded-xl pl-12 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Confirmar Contraseña *
                        </Label>
                        <div className="relative mt-2">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Repetir contraseña"
                                className="h-12 rounded-xl pl-12"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={registrando}
                        className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-emerald-500/25"
                    >
                        {registrando ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Creando cuenta...
                            </>
                        ) : (
                            <>
                                Unirme al equipo
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>

                    <p className="text-center text-xs text-slate-400">
                        Al registrarte aceptas nuestros{' '}
                        <a href="/terminos" className="text-blue-500 hover:underline">Términos</a>
                        {' '}y{' '}
                        <a href="/privacidad" className="text-blue-500 hover:underline">Privacidad</a>
                    </p>
                </form>
            </motion.div>
        </div>
    )
}
