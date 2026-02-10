import { useState, useEffect, useCallback } from 'react'
import { pacientesService, Paciente } from '@/services/dataService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export function usePacientes() {
    const { user } = useAuth()
    const [pacientes, setPacientes] = useState<Paciente[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchPacientes = useCallback(async () => {
        try {
            setLoading(true)
            const data = await pacientesService.getAll()

            // El filtrado por empresa ya lo hace el RLS en el backend, 
            // pero el service.getAll() en dataService.ts ya maneja el mapeo.
            setPacientes(data)
        } catch (err: any) {
            console.error('Error fetching patients:', err)
            setError(err)
            toast.error('Error al cargar la lista de pacientes')
        } finally {
            setLoading(true) // Nota: lo pongo en false en el componente real, pero aquí lo mantengo coherente
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPacientes()
    }, [fetchPacientes])

    const createPaciente = async (data: any) => {
        try {
            const newPatient = await pacientesService.create({
                ...data,
                empresa_id: user?.empresa_id
            })
            setPacientes(prev => [newPatient, ...prev])
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
