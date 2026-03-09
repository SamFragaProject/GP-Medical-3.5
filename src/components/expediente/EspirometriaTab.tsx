/**
 * EspirometriaTab — Digitalización fiel de espirometría
 *
 * Flujo único:
 *   1. Subir PDF → Gemini extrae JSON completo (SpiroClone format)
 *   2. JSON se guarda en Supabase (estudios_clinicos.datos_extra.spiroclone_data)
 *   3. SpirometryReport renderiza la réplica digital exacta del PDF
 *
 * Sin datos planos. Sin dos opciones. Un solo pipeline.
 */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Wind, Upload, Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { SpirometryReport } from './SpirometryReport'
import { analyzeSpirometryDirect } from '@/services/geminiDocumentService'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'

// ─── Hook: cargar espirometría desde Supabase ───
const useSpirometry = (pacienteId: string) => {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const load = async () => {
        setLoading(true)
        try {
            const { data: estudios } = await supabase
                .from('estudios_clinicos')
                .select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['espirometria', 'spirometry'])
                .order('fecha_estudio', { ascending: false })
                .limit(1)

            if (estudios?.[0]?.datos_extra?.spiroclone_data) {
                setData(estudios[0].datos_extra.spiroclone_data)
            } else {
                setData(null)
            }
        } catch (err) {
            console.error('[Espirometría] Error cargando:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { if (pacienteId) load() }, [pacienteId])

    return { data, loading, reload: load }
}

// ─── Hook: upload + extracción IA ───
const useSpirometryUpload = (pacienteId: string, onComplete: () => void) => {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        setUploading(true)
        setError(null)
        setProgress('Analizando documento con IA...')

        try {
            // 1. Gemini extrae JSON completo (sin schema, cascada de modelos)
            const spiroData = await analyzeSpirometryDirect('', [file])

            if (!spiroData?.results?.length) {
                throw new Error('La IA no pudo extraer los parámetros espirométricos del documento.')
            }

            setProgress(`Extracción completada: ${spiroData.results.length} parámetros. Guardando...`)

            // 2. Guardar JSON completo en Supabase
            const { error: dbErr } = await supabase.from('estudios_clinicos').insert({
                paciente_id: pacienteId,
                tipo_estudio: 'espirometria',
                fecha_estudio: new Date().toISOString().split('T')[0],
                datos_extra: {
                    spiroclone_data: spiroData,
                    _source: 'SpiroClone Pipeline',
                    _extracted_at: new Date().toISOString(),
                }
            })

            if (dbErr) throw dbErr

            setProgress('✅ Espirometría guardada correctamente')
            onComplete()
        } catch (err: any) {
            console.error('[SpiroUpload] Error:', err)
            setError(err.message || 'Error al procesar el documento')
        } finally {
            setUploading(false)
        }
    }

    const triggerUpload = () => fileInputRef.current?.click()

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
    }

    return { uploading, progress, error, fileInputRef, triggerUpload, onFileSelected }
}

// ─── Componente principal ───
export default function EspirometriaTab({ pacienteId }: { pacienteId: string }) {
    const { data, loading, reload } = useSpirometry(pacienteId)
    const upload = useSpirometryUpload(pacienteId, reload)

    // ── Loading ──
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                <Wind className="w-8 h-8 text-cyan-500" />
            </motion.div>
            <p className="text-slate-400 text-xs font-medium">Cargando espirometría...</p>
        </div>
    )

    // ── Sin datos → Subir PDF ──
    if (!data) return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wind className="w-8 h-8 text-cyan-300" />
                </div>
                <h3 className="text-slate-800 font-bold text-lg">Sin registros de espirometría</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-8">
                    Sube el PDF del reporte de espirometría y la IA extraerá automáticamente
                    todos los datos, tablas y gráficas para crear la réplica digital.
                </p>

                {/* Upload */}
                <input
                    ref={upload.fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf,image/*"
                    onChange={upload.onFileSelected}
                    className="hidden"
                />

                {upload.uploading ? (
                    <div className="max-w-sm mx-auto space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                            <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                            <p className="text-sm font-medium text-cyan-800">{upload.progress}</p>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={upload.triggerUpload}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-200/50 hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                        <Upload className="w-5 h-5" />
                        Subir Reporte de Espirometría
                    </button>
                )}

                {upload.error && (
                    <div className="mt-6 max-w-sm mx-auto flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{upload.error}</p>
                    </div>
                )}

                <p className="text-[10px] text-slate-400 mt-6">
                    Powered by Gemini Pro — Extracción completa con gráficas, tablas y diagnóstico
                </p>
            </CardContent>
        </Card>
    )

    // ── Con datos → SpirometryReport ──
    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-200">
                            <Wind className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Espirometría</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {data.doctor?.name || 'GP Medical Health'} — {data.testDetails?.date || ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Resultado */}
                        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Interpretación</p>
                            <p className="text-sm font-bold text-emerald-700">
                                {data.session?.interpretation || 'N/A'}
                            </p>
                        </div>

                        {/* Re-upload */}
                        <input
                            ref={upload.fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf,image/*"
                            onChange={upload.onFileSelected}
                            className="hidden"
                        />
                        <button
                            onClick={upload.triggerUpload}
                            disabled={upload.uploading}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-cyan-700 border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {upload.uploading ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                            ) : (
                                <><RefreshCw className="w-3.5 h-3.5" /> Actualizar Espirometría</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Notas del doctor */}
                {data.doctor?.notes && (
                    <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-emerald-700">{data.doctor.notes}</p>
                    </div>
                )}

                {upload.uploading && (
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-cyan-50 border border-cyan-200">
                        <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
                        <p className="text-sm font-medium text-cyan-700">{upload.progress}</p>
                    </div>
                )}
            </div>

            {/* SpirometryReport — réplica digital completa del PDF */}
            <div className="overflow-x-auto bg-slate-50/50 p-2 md:p-6 rounded-2xl border border-slate-200 shadow-inner">
                <div className="min-w-[800px]">
                    <SpirometryReport data={data} />
                </div>
            </div>

            {/* Documentos adjuntos */}
            <DocumentosAdjuntos
                pacienteId={pacienteId}
                categoria="espirometria"
                titulo="Reporte Original"
                collapsedByDefault={false}
            />
        </div>
    )
}
