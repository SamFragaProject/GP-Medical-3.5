import { useState, useEffect, useCallback } from 'react'
import { pacientesService, Paciente } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

// Roles que tienen acceso completo a ver pacientes (sin filtrado por empresa)
const FULL_ACCESS_ROLES = ['super_admin']

// Roles que ven los pacientes de su propia empresa
const EMPRESA_ROLES = ['admin_empresa', 'medico', 'enfermera', 'recepcion', 'asistente']

export function usePacientes() {
    const { user } = useAuth()
    const [pacientes, setPacientes] = useState<Paciente[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchPacientes = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true)
            setError(null)
            let data = await pacientesService.getAll()

            // Filtrado por rol — Supabase RLS ya filtra en backend,
            // pero aplicamos doble seguridad en frontend
            if (FULL_ACCESS_ROLES.includes(user.rol)) {
                // Super Admin ve TODOS los pacientes de todas las empresas
            } else if (EMPRESA_ROLES.includes(user.rol)) {
                // Admin empresa, médico, enfermera, recepción y asistente
                // ven los pacientes de SU empresa
                if (user.empresa_id) {
                    data = data.filter((p: Paciente) => p.empresa_id === user.empresa_id)
                }
            }

            setPacientes(data)

            if (data.length === 0) {
                console.info('ℹ️ 0 pacientes encontrados para este usuario/empresa')
            } else {
                console.info(`✅ ${data.length} pacientes cargados`)
            }
        } catch (err: any) {
            console.error('❌ Error cargando pacientes:', err)
            setError(err)
            toast.error('Error al cargar pacientes. Verifica tu conexión.')
        } finally {
            setLoading(false)
        }
    }, [user?.id, user?.rol, user?.empresa_id])

    useEffect(() => {
        fetchPacientes()
    }, [fetchPacientes])

    const createPaciente = async (data: any) => {
        try {
            const newPatient = await pacientesService.create({
                ...data,
                empresa_id: data.empresa_id || user?.empresa_id
            })
            setPacientes(prev => [newPatient, ...prev])
            toast.success('Paciente registrado exitosamente')
            return newPatient
        } catch (err) {
            toast.error('Error al crear paciente')
            throw err
        }
    }

    const updatePaciente = async (id: string, data: any) => {
        try {
            const updated = await pacientesService.update(id, data)
            setPacientes(prev => prev.map(p => p.id === id ? updated : p))
            toast.success('Paciente actualizado')
            return updated
        } catch (err) {
            toast.error('Error al actualizar paciente')
            throw err
        }
    }

    const deletePaciente = async (id: string) => {
        try {
            await pacientesService.delete(id)
            setPacientes(prev => prev.filter(p => p.id !== id))
            toast.success('Paciente eliminado')
        } catch (err) {
            toast.error('Error al eliminar paciente')
            throw err
        }
    }

    return {
        pacientes,
        loading,
        error,
        refresh: fetchPacientes,
        createPaciente,
        updatePaciente,
        deletePaciente
    }
}
