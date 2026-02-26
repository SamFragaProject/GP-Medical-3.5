/**
 * useDocumentosPaciente — Hook para acceder a documentos del paciente por categoría
 * 
 * Uso en cualquier Tab del expediente:
 *   const { documentos, loading, refresh } = useDocumentosPaciente(pacienteId, 'audiometria')
 *   
 * Categorías disponibles:
 *   historia_clinica | audiometria | espirometria | laboratorio | radiografia
 *   electrocardiograma | certificado_aptitud | dictamen | receta | incapacidad
 *   consentimiento | identificacion | otro
 */

import { useState, useEffect, useCallback } from 'react'
import {
    secureStorageService,
    type DocumentoExpediente,
} from '@/services/secureStorageService'

interface UseDocumentosResult {
    documentos: DocumentoExpediente[]
    loading: boolean
    refresh: () => Promise<void>
    totalCount: number
}

export function useDocumentosPaciente(
    pacienteId: string | undefined,
    categoria?: string
): UseDocumentosResult {
    const [documentos, setDocumentos] = useState<DocumentoExpediente[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        if (!pacienteId) {
            setDocumentos([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            let docs: DocumentoExpediente[]
            if (categoria) {
                docs = await secureStorageService.getByPacienteAndCategoria(pacienteId, categoria)
            } else {
                docs = await secureStorageService.getByPaciente(pacienteId)
            }
            setDocumentos(docs)
        } catch (err) {
            console.error('Error loading documentos:', err)
            setDocumentos([])
        } finally {
            setLoading(false)
        }
    }, [pacienteId, categoria])

    useEffect(() => {
        load()
    }, [load])

    return {
        documentos,
        loading,
        refresh: load,
        totalCount: documentos.length,
    }
}
