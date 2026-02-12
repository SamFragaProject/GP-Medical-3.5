/**
 * PlanesSuscripcion - Planes y Facturación SaaS
 * 
 * Gestión de suscripción y planes del sistema ERP.
 * Integrado con billingService de Supabase.
 * 
 * ✅ Diseño premium alineado con admin
 * ✅ Fallback a planes demo si no hay datos
 * ✅ Indicador de plan actual
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Check,
    CreditCard,
    Zap,
    Shield,
    Star,
    Building2,
    CheckCircle2,
    Sparkles,
    Lock,
    Crown,
    ArrowRight,
    Loader2,
    RefreshCw,
    TrendingUp,
    Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { billingService } from '@/services/billingService'
import { PlanSaaS, SuscripcionSaaS } from '@/types/facturacion'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

// ─── Plan icon config ────────────────────────────────────────────────────
const PLAN_VISUAL: Record<string, {
    icon: any; gradient: string; shadow: string; ring: string; badge?: string; badgeColor?: string
}> = {
    basic: {
        icon: Star,
        gradient: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/20',
        ring: '',
    },
    pro: {
        icon: Zap,
        gradient: 'from-indigo-500 to-violet-600',
        shadow: 'shadow-indigo-500/30',
        ring: 'ring-2 ring-indigo-500/50',
        badge: 'Más Popular',
        badgeColor: 'bg-indigo-500',
    },
    enterprise: {
        icon: Building2,
        gradient: 'from-slate-700 to-slate-900',
        shadow: 'shadow-slate-500/20',
        ring: '',
        badge: 'Máximo Poder',
        badgeColor: 'bg-slate-800',
    }
}

// Demo plans como fallback
const DEMO_PLANES: PlanSaaS[] = [
    {
        id: 'basic',
        nombre: 'Plan Básico',
        descripcion: 'Sistema médico esencial',
        precioMensual: 1499,
        precioAnual: 14990,
        maxUsuarios: 3,
        maxPacientes: 500,
        caracteristicas: ['Expediente Clínico', 'Citas Médicas', 'Recetas en PDF', 'Dashboard Básico', 'Soporte Email'],
        nivel: 'basic'
    },
    {
        id: 'pro',
        nombre: 'Plan Profesional',
        descripcion: 'Para empresas en crecimiento',
        precioMensual: 3999,
        precioAnual: 39990,
        maxUsuarios: 10,
        maxPacientes: 2000,
        caracteristicas: ['Todo del Básico', 'NOM-035 (Psicosocial)', 'NOM-036 (Ergonomía)', 'Dashboard Avanzado', 'Reportes PDF', 'Módulo de Farmacia', 'Soporte Prioritario'],
        nivel: 'pro'
    },
    {
        id: 'enterprise',
        nombre: 'Enterprise',
        descripcion: 'Para grandes corporativos',
        precioMensual: 9999,
        precioAnual: 99990,
        maxUsuarios: 100,
        maxPacientes: 10000,
        caracteristicas: ['Suite Completa', 'Ley Silla', 'Identidad Corporativa', 'API Access', 'Auditoría STPS', 'Multi-sede', 'SSO / LDAP', 'SLA 99.9%', 'Capacitación Incluida'],
        nivel: 'enterprise'
    }
]

export default function PlanesSuscripcion() {
    const { user } = useAuth()
    const [planes, setPlanes] = useState<PlanSaaS[]>([])
    const [suscripcion, setSuscripcion] = useState<SuscripcionSaaS | null>(null)
    const [loading, setLoading] = useState(true)
    const [procesando, setProcesando] = useState<string | null>(null)
    const [billing, setBilling] = useState<'mensual' | 'anual'>('mensual')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const plansData = await billingService.getPlanes()
            setPlanes(plansData && plansData.length > 0 ? plansData : DEMO_PLANES)

            if (user?.empresa_id) {
                const sub = await billingService.getSuscripcionActual(user.empresa_id)
                setSuscripcion(sub)
            }
        } catch (error) {
            console.error(error)
            setPlanes(DEMO_PLANES)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectPlan = async (plan: PlanSaaS) => {
        setProcesando(plan.id)
        try {
            toast.loading(`Procesando suscripción a ${plan.nombre}...`, { id: 'billing' })
            await new Promise(resolve => setTimeout(resolve, 2000))

            if (user?.empresa_id) {
                await billingService.simularActivacionPlan(user.empresa_id, plan.id)
                toast.dismiss('billing')
                toast.success(`¡Bienvenido al ${plan.nombre}!`, {
                    icon: '🎉',
                    duration: 4000
                })
                loadData()
            }
        } catch (error) {
            toast.dismiss('billing')
            toast.error('Error procesando la suscripción')
        } finally {
            setProcesando(null)
        }
    }

    const formatPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(precio)
    }

    return (
        <AdminLayout
            title="Planes y Facturación"
            subtitle="Gestiona tu suscripción y desbloquea características avanzadas del ecosistema."
            icon={CreditCard}
            badges={[{ text: 'Billing', variant: 'info', icon: <CreditCard size={12} /> }]}
            actions={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar
                </Button>
            }
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Cargando planes...</p>
                </div>
            ) : (
                <>
                    {/* ────── Estado Actual ────── */}
                    {suscripcion && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl mb-10"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full translate-y-1/3 -translate-x-1/3" />

                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-extrabold text-white/50 uppercase tracking-[0.2em] mb-2">Tu Plan Actual</p>
                                    <h2 className="text-3xl font-black tracking-tight">{suscripcion.plan?.nombre || 'Plan Activo'}</h2>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold capitalize">{suscripcion.estado}</span>
                                        </div>
                                        {suscripcion.plan?.maxUsuarios && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold">{suscripcion.plan.maxUsuarios} usuarios</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl"
                                >
                                    <CreditCard className="w-4 h-4 mr-2" /> Gestionar Facturación
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ────── Toggle Billing Period ────── */}
                    <div className="flex justify-center mb-10">
                        <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
                            <button
                                onClick={() => setBilling('mensual')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billing === 'mensual'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                Mensual
                            </button>
                            <button
                                onClick={() => setBilling('anual')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${billing === 'anual'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                Anual
                                <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-black">-17%</Badge>
                            </button>
                        </div>
                    </div>

                    {/* ────── Grid de Planes ────── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {planes.map((plan, idx) => {
                            const isCurrent = suscripcion?.planId === plan.id
                            const visual = PLAN_VISUAL[plan.nivel] || PLAN_VISUAL.basic
                            const PlanIcon = visual.icon
                            const precio = billing === 'anual' ? plan.precioAnual / 12 : plan.precioMensual

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -8 }}
                                    className={`relative bg-white rounded-[2.5rem] shadow-xl ${visual.shadow} border border-slate-100 overflow-hidden flex flex-col ${visual.ring} ${isCurrent ? 'ring-2 ring-emerald-500/50' : ''
                                        }`}
                                >
                                    {/* Badge popular */}
                                    {visual.badge && (
                                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 ${visual.badgeColor} text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg z-10`}>
                                            {visual.badge}
                                        </div>
                                    )}

                                    {/* Header del plan */}
                                    <div className={`p-8 pb-6 ${plan.nivel === 'enterprise' ? 'bg-slate-50/50' : ''}`}>
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${visual.gradient} flex items-center justify-center shadow-lg ${visual.shadow} mb-5`}>
                                            <PlanIcon className="w-7 h-7 text-white" />
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{plan.nombre}</h3>
                                        <p className="text-sm text-slate-500 font-medium mt-1">{plan.descripcion}</p>

                                        <div className="mt-6 flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-slate-900">{formatPrecio(Math.round(precio))}</span>
                                            <span className="text-slate-400 font-bold text-sm">/mes</span>
                                        </div>

                                        {billing === 'anual' && (
                                            <p className="text-[10px] text-emerald-600 font-bold mt-1">
                                                {formatPrecio(plan.precioAnual)}/año — Ahorra {formatPrecio((plan.precioMensual * 12) - plan.precioAnual)}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" />
                                                {plan.maxUsuarios} usuarios
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Shield className="w-3.5 h-3.5" />
                                                {plan.maxPacientes?.toLocaleString()} pacientes
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="p-8 pt-0 flex-1">
                                        <div className="h-px bg-slate-100 mb-6" />
                                        <ul className="space-y-3.5">
                                            {plan.caracteristicas.map((feature: string, fIdx: number) => (
                                                <motion.li
                                                    key={fIdx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 + fIdx * 0.03 }}
                                                    className="flex items-start gap-3"
                                                >
                                                    <div className="w-5 h-5 rounded-lg bg-emerald-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                    </div>
                                                    <span className="text-sm text-slate-600 font-medium">{feature}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* CTA */}
                                    <div className="p-8 pt-4">
                                        <Button
                                            className={`w-full h-13 text-sm font-black uppercase tracking-widest rounded-2xl transition-all ${isCurrent
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50 cursor-default border border-emerald-200'
                                                    : plan.nivel === 'pro'
                                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30'
                                                        : plan.nivel === 'enterprise'
                                                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xl'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20'
                                                }`}
                                            disabled={isCurrent || procesando !== null}
                                            onClick={() => handleSelectPlan(plan)}
                                        >
                                            {procesando === plan.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : isCurrent ? (
                                                <span className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" /> Plan Actual
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Seleccionar <ArrowRight className="w-4 h-4" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* ────── Footer info ────── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 text-center"
                    >
                        <p className="text-xs text-slate-400 font-medium">
                            Todos los precios son en MXN + IVA. Los planes se facturan de forma {billing === 'anual' ? 'anual' : 'mensual'}.
                        </p>
                        <p className="text-[10px] text-slate-300 mt-2">
                            ¿Necesitas un plan personalizado? Contáctanos en soporte@gpmedical.mx
                        </p>
                    </motion.div>
                </>
            )}
        </AdminLayout>
    )
}
