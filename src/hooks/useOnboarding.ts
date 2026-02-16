/**
 * useOnboarding - Hook para detectar si el usuario necesita configuración inicial
 * 
 * Verifica:
 * 1. Si la empresa del usuario tiene al menos 1 sede configurada
 * 2. Si la empresa tiene al menos 1 paciente/trabajador registrado
 * 
 * Si no cumple alguna condición, retorna needsOnboarding = true
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface OnboardingState {
    needsOnboarding: boolean
    loading: boolean
    hasSedes: boolean
    hasPacientes: boolean
    empresaId: string | null
    step: 'welcome' | 'empresa' | 'sedes' | 'importar' | 'complete'
}

export function useOnboarding(): OnboardingState {
    const { user } = useAuth()
    const [state, setState] = useState<OnboardingState>({
        needsOnboarding: false,
        loading: true,
        hasSedes: false,
        hasPacientes: false,
        empresaId: null,
        step: 'welcome'
    })

    useEffect(() => {
        const checkOnboarding = async () => {
            if (!user?.id || !user?.empresa_id) {
                setState(prev => ({ ...prev, loading: false }))
                return
            }

            // Skip for demo/mock users
            const isMock = user.id.startsWith('mock-') ||
                user.id.startsWith('demo-') ||
                user.id.startsWith('00000000') ||
                user.id.startsWith('u1a')

            if (isMock) {
                setState(prev => ({ ...prev, loading: false, needsOnboarding: false }))
                return
            }

            // Skip for super_admin - they manage everything
            if (user.rol === 'super_admin') {
                setState(prev => ({ ...prev, loading: false, needsOnboarding: false }))
                return
            }

            try {
                // Timeout de protección para evitar que queries colgadas bloqueen la UI
                const timeout = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Onboarding check timeout')), 3000)
                )

                const checkData = async () => {
                    // Check if empresa has sedes
                    const { count: sedesCount } = await supabase
                        .from('sedes')
                        .select('*', { count: 'exact', head: true })
                        .eq('empresa_id', user.empresa_id!)

                    // Check if empresa has pacientes
                    const { count: pacientesCount } = await supabase
                        .from('pacientes')
                        .select('*', { count: 'exact', head: true })
                        .eq('empresa_id', user.empresa_id!)

                    return { sedesCount, pacientesCount }
                }

                const { sedesCount, pacientesCount } = await Promise.race([checkData(), timeout]) as any

                const hasSedes = (sedesCount || 0) > 0
                const hasPacientes = (pacientesCount || 0) > 0
                const needsOnboarding = !hasSedes || !hasPacientes

                let step: OnboardingState['step'] = 'welcome'
                if (!hasSedes) step = 'sedes'
                else if (!hasPacientes) step = 'importar'
                else step = 'complete'

                setState({
                    needsOnboarding,
                    loading: false,
                    hasSedes,
                    hasPacientes,
                    empresaId: user.empresa_id!,
                    step
                })
            } catch (error) {
                console.warn('⚠️ Error/timeout checking onboarding status:', error)
                setState(prev => ({ ...prev, loading: false, needsOnboarding: false }))
            }
        }

        checkOnboarding()
    }, [user?.id, user?.empresa_id, user?.rol])

    return state
}
