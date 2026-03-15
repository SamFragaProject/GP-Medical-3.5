/**
 * useDeleteEstudio — Hook reutilizable para eliminar cualquier estudio clínico
 * 
 * Uso:
 *   const { deleting, deleteEstudio } = useDeleteEstudio(onDeleted)
 *   <button onClick={() => deleteEstudio(id)} disabled={!!deleting}>Eliminar</button>
 */
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface UseDeleteEstudioResult {
    deleting: string | null
    deleteEstudio: (id: string, label?: string) => Promise<void>
}

export function useDeleteEstudio(onDeleted?: () => void): UseDeleteEstudioResult {
    const [deleting, setDeleting] = useState<string | null>(null)

    const deleteEstudio = useCallback(async (id: string, label = 'estudio') => {
        if (!confirm(`¿Eliminar este ${label}? Esta acción no se puede deshacer.`)) return
        setDeleting(id)
        try {
            // Delete dependent records first (FK constraints)
            await supabase.from('graficas_estudio').delete().eq('estudio_id', id)
            await supabase.from('resultados_estudio').delete().eq('estudio_id', id)
            // Delete study record
            const { error } = await supabase.from('estudios_clinicos').delete().eq('id', id)
            if (error) throw error
            toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} eliminado correctamente`)
            if (onDeleted) onDeleted()
        } catch (err: any) {
            console.error('Error deleting estudio:', err)
            toast.error(`No se pudo eliminar: ${err.message || 'Error desconocido'}`)
        } finally {
            setDeleting(null)
        }
    }, [onDeleted])

    return { deleting, deleteEstudio }
}
