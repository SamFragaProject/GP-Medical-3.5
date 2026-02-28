/**
 * SectionFileUpload — Adaptado al Motor IA Pro
 * Reemplaza documentExtractorService por geminiDocumentService.
 */
import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import EstudioUploadReview from './EstudioUploadReview'
import { TipoEstudio } from '@/services/estudiosService'

interface Props {
    pacienteId: string
    tipoEstudio: string
    pacienteNombre?: string
    onComplete?: () => void
    onDataSaved?: () => void
    enableExtraction?: boolean
    compact?: boolean
}

export default function SectionFileUpload({
    pacienteId,
    tipoEstudio,
    pacienteNombre,
    onComplete,
    onDataSaved,
    enableExtraction = true,
    compact = false
}: Props) {
    const [showReview, setShowReview] = useState(false)

    // Si es compacto, mostramos solo un trigger, pero por ahora lo delegamos a EstudioUploadReview
    // que ya tiene un diseño premium.

    return (
        <div className="w-full">
            {!showReview && compact ? (
                <button
                    onClick={() => setShowReview(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors text-xs font-black uppercase tracking-widest"
                >
                    <Sparkles className="w-4 h-4" />
                    Analizar Documento
                    <Badge className="bg-emerald-500 text-white border-0 text-[8px] h-4">Pro</Badge>
                </button>
            ) : (
                <EstudioUploadReview
                    pacienteId={pacienteId}
                    tipoEstudio={tipoEstudio as TipoEstudio}
                    pacienteNombre={pacienteNombre}
                    onSaved={() => {
                        onComplete?.()
                        onDataSaved?.()
                    }}
                />
            )}
        </div>
    )
}
