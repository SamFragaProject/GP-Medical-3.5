import React, { useState, useEffect } from 'react'
import {
    Check,
    CreditCard,
    Zap,
    Shield,
    Star,
    Building2,
    CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PremiumHeader } from '@/components/ui/PremiumHeader'
import { billingService } from '@/services/billingService'
import { PlanSaaS, SuscripcionSaaS } from '@/types/facturacion'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function PlanesSuscripcion() {
    const { user } = useAuth()
    const [planes, setPlanes] = useState<PlanSaaS[]>([])
    const [suscripcion, setSuscripcion] = useState<SuscripcionSaaS | null>(null)
    const [loading, setLoading] = useState(true)

    // Demo plans por si la carga falla o está vacía
    const demoPlanes: PlanSaaS[] = [
        {
            id: 'basic',
            nombre: 'Plan Básico',
            descripcion: 'Sistema médico esencial',
            precioMensual: 1499,
            precioAnual: 14990,
            maxUsuarios: 3,
            maxPacientes: 500,
            caracteristicas: ['Expediente Clínico', 'Citas Médicas', 'Recetas en PDF'],
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
            caracteristicas: ['Todo del Básico', 'NOM-035 (Psicosocial)', 'NOM-036 (Ergonomía)', 'Dashboard Avanzado'],
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
            caracteristicas: ['Suite Completa', 'Ley Silla', 'Identidad Corporativa', 'API Access', 'Auditoría STPS'],
            nivel: 'enterprise'
        }
    ]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const plansData = await billingService.getPlanes()
            setPlanes(plansData && plansData.length > 0 ? plansData : demoPlanes)

            // Simular carga de suscripción
            if (user?.empresa_id) {
                const sub = await billingService.getSuscripcionActual(user.empresa_id)
                setSuscripcion(sub)
            }
        } catch (error) {
            console.error(error)
            setPlanes(demoPlanes)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectPlan = async (plan: PlanSaaS) => {
        try {
            toast.loading(`Procesando pago para ${plan.nombre}...`)
            // Simular proceso de pago
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Activar en DB simulada
            if (user?.empresa_id) {
                await billingService.simularActivacionPlan(user.empresa_id, plan.id)
                toast.dismiss()
                toast.success(`¡Bienvenido al ${plan.nombre}!`)
                loadData()
            }
        } catch (error) {
            toast.dismiss()
            toast.error('Error procesando el pago')
        }
    }

    return (
        <div className="space-y-8 pb-12">
            <PremiumHeader
                title="Planes y Facturación"
                subtitle="Gestiona tu suscripción y desbloquea características normativas"
                gradient={true}
                badges={[]}
            />

            {/* Estado Actual */}
            {suscripcion && (
                <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0 shadow-xl mb-8">
                    <CardContent className="p-8 flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Plan Actual</p>
                            <h2 className="text-3xl font-black">{suscripcion.plan?.nombre || 'Plan Activo'}</h2>
                            <p className="text-slate-300 mt-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                Estado: <span className="capitalize font-bold text-white">{suscripcion.estado}</span>
                            </p>
                        </div>
                        <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                            Gestionar en Stripe
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Grid de Planes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {planes.map((plan) => {
                    const isCurrent = suscripcion?.planId === plan.id
                    const isPro = plan.nivel === 'pro'
                    const isEnt = plan.nivel === 'enterprise'

                    return (
                        <Card
                            key={plan.id}
                            className={`relative border-0 shadow-lg transition-all hover:-translate-y-2 duration-300 flex flex-col ${isPro ? 'ring-2 ring-indigo-500 shadow-indigo-500/20' : ''}`}
                        >
                            {isPro && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                    Más Popular
                                </div>
                            )}
                            <CardHeader className={`${isEnt ? 'bg-slate-50' : ''} border-b border-slate-100 pb-8`}>
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                    {isEnt ? <Building2 className="w-6 h-6 text-slate-700" /> :
                                        isPro ? <Zap className="w-6 h-6 text-indigo-500" /> :
                                            <Star className="w-6 h-6 text-blue-500" />}
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">{plan.nombre}</CardTitle>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-black text-slate-900">${plan.precioMensual}</span>
                                    <span className="ml-1 text-slate-500 font-medium">/mes</span>
                                </div>
                                <CardDescription className="mt-2">
                                    {isEnt ? 'Para grandes corporativos' : isPro ? 'Para empresas en crecimiento' : 'Para consultorios pequeños'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 flex-1">
                                <ul className="space-y-4">
                                    {plan.caracteristicas.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                                            <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="p-6 pt-0">
                                <Button
                                    className={`w-full h-12 text-base font-bold ${isPro ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 text-white' : isCurrent ? 'bg-slate-100 text-slate-400 hover:bg-slate-100' : 'bg-slate-900 text-white'}`}
                                    disabled={isCurrent}
                                    onClick={() => handleSelectPlan(plan)}
                                >
                                    {isCurrent ? 'Plan Actual' : 'Seleccionar Plan'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
