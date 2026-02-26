/**
 * AgregarParametroModal — Modal reutilizable para agregar parámetros nuevos
 * Disponible en cada sección del expediente del paciente.
 * 
 * Flujo:
 * 1. El usuario escribe el nombre del parámetro (autocomplete del catálogo)
 * 2. Ingresa el resultado
 * 3. Selecciona unidad (desplegable)
 * 4. Opcionalmente define rango de referencia
 * 5. Si el parámetro no existe en el catálogo, se crea automáticamente
 */
import { useState, useEffect, useMemo } from 'react'
import {
    type TipoEstudio,
    type ParametroCatalogo,
    getCatalogo,
    agregarParametroCatalogo,
    agregarResultadoAEstudio,
    UNIDADES_DISPONIBLES,
} from '@/services/estudiosService'

interface Props {
    open: boolean
    onClose: () => void
    onAdded?: () => void
    estudioId: string
    pacienteId: string
    tipoEstudio: TipoEstudio
}

export default function AgregarParametroModal({ open, onClose, onAdded, estudioId, pacienteId, tipoEstudio }: Props) {
    const [catalogo, setCatalogo] = useState<ParametroCatalogo[]>([])
    const [nombre, setNombre] = useState('')
    const [resultado, setResultado] = useState('')
    const [unidad, setUnidad] = useState('')
    const [rangoMin, setRangoMin] = useState('')
    const [rangoMax, setRangoMax] = useState('')
    const [rangoTexto, setRangoTexto] = useState('')
    const [observacion, setObservacion] = useState('')
    const [esNumerico, setEsNumerico] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)

    useEffect(() => {
        if (open) {
            getCatalogo(tipoEstudio).then(setCatalogo)
            setNombre(''); setResultado(''); setUnidad(''); setRangoMin(''); setRangoMax(''); setRangoTexto(''); setObservacion(''); setEsNumerico(true)
        }
    }, [open, tipoEstudio])

    const filteredSuggestions = useMemo(() => {
        if (!nombre.trim()) return []
        const q = nombre.toLowerCase()
        return catalogo.filter(c =>
            c.nombre_display.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q)
        ).slice(0, 8)
    }, [nombre, catalogo])

    const selectSuggestion = (param: ParametroCatalogo) => {
        setNombre(param.nombre_display)
        setUnidad(param.unidad || '')
        setEsNumerico(param.es_numerico)
        if (param.rango_ref_min != null) setRangoMin(String(param.rango_ref_min))
        if (param.rango_ref_max != null) setRangoMax(String(param.rango_ref_max))
        if (param.rango_ref_texto) setRangoTexto(param.rango_ref_texto)
        setShowSuggestions(false)
    }

    const handleSave = async () => {
        if (!nombre.trim() || !resultado.trim()) return
        setSaving(true)

        try {
            // Check if param exists in catalog
            const existing = catalogo.find(c =>
                c.nombre_display.toLowerCase() === nombre.toLowerCase() ||
                c.nombre.toLowerCase() === nombre.toLowerCase()
            )

            let paramName = existing?.nombre || nombre.toLowerCase().replace(/[^a-z0-9]+/g, '_')

            // Create in catalog if new
            if (!existing) {
                await agregarParametroCatalogo({
                    nombre: paramName,
                    nombre_display: nombre,
                    categoria: 'Parámetro personalizado',
                    tipo_estudio: tipoEstudio,
                    unidad,
                    rango_ref_min: rangoMin ? parseFloat(rangoMin) : undefined,
                    rango_ref_max: rangoMax ? parseFloat(rangoMax) : undefined,
                    rango_ref_texto: rangoTexto || undefined,
                    es_numerico: esNumerico,
                })
            }

            // Add result to study
            await agregarResultadoAEstudio(
                estudioId,
                pacienteId,
                tipoEstudio,
                paramName,
                resultado,
                unidad,
                observacion || undefined
            )

            onAdded?.()
            onClose()
        } catch (err) {
            console.error('Error saving parameter:', err)
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Parámetro
                    </h3>
                    <p className="text-teal-100 text-sm mt-0.5">
                        Agrega un nuevo resultado al estudio actual
                    </p>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Nombre del parámetro */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Nombre del parámetro *
                        </label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={e => { setNombre(e.target.value); setShowSuggestions(true) }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Ej: Glucosa, FVC, Hemoglobina..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                            autoFocus
                        />
                        {/* Autocomplete dropdown */}
                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                {filteredSuggestions.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => selectSuggestion(s)}
                                        className="w-full px-4 py-2.5 text-left hover:bg-teal-50 text-sm flex items-center justify-between transition-colors"
                                    >
                                        <span>
                                            <span className="font-medium text-slate-800">{s.nombre_display}</span>
                                            {s.unidad && <span className="text-slate-400 ml-1">({s.unidad})</span>}
                                        </span>
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{s.categoria}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resultado */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Resultado *
                        </label>
                        <input
                            type="text"
                            value={resultado}
                            onChange={e => setResultado(e.target.value)}
                            placeholder={esNumerico ? "Ej: 86.0" : "Ej: Negativo"}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Unidad + Tipo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Unidad de medición
                            </label>
                            <select
                                value={unidad}
                                onChange={e => setUnidad(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm bg-white"
                            >
                                {UNIDADES_DISPONIBLES.map(u => (
                                    <option key={u} value={u}>{u || '— Sin unidad —'}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Tipo de dato
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEsNumerico(true)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${esNumerico
                                            ? 'bg-teal-100 text-teal-700 border-2 border-teal-400'
                                            : 'bg-slate-100 text-slate-500 border-2 border-transparent hover:bg-slate-200'
                                        }`}
                                >
                                    123 Número
                                </button>
                                <button
                                    onClick={() => setEsNumerico(false)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${!esNumerico
                                            ? 'bg-teal-100 text-teal-700 border-2 border-teal-400'
                                            : 'bg-slate-100 text-slate-500 border-2 border-transparent hover:bg-slate-200'
                                        }`}
                                >
                                    Abc Texto
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Rango de referencia */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Rango de referencia <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        {esNumerico ? (
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    step="any"
                                    value={rangoMin}
                                    onChange={e => setRangoMin(e.target.value)}
                                    placeholder="Mínimo"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                                />
                                <input
                                    type="number"
                                    step="any"
                                    value={rangoMax}
                                    onChange={e => setRangoMax(e.target.value)}
                                    placeholder="Máximo"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                                />
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={rangoTexto}
                                onChange={e => setRangoTexto(e.target.value)}
                                placeholder="Ej: Negativo, Ausentes..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                            />
                        )}
                    </div>

                    {/* Observación */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Observación <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={observacion}
                            onChange={e => setObservacion(e.target.value)}
                            placeholder="Notas adicionales..."
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!nombre.trim() || !resultado.trim() || saving}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/25"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                Guardando...
                            </span>
                        ) : 'Agregar Parámetro'}
                    </button>
                </div>
            </div>
        </div>
    )
}
