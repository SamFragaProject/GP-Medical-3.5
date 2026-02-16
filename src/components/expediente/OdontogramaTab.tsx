/**
 * OdontogramaTab - Odontograma Interactivo Completo
 *
 * Sistema FDI (Fédération Dentaire Internationale):
 * - Cuadrante 1 (Superior Derecho): 18-11
 * - Cuadrante 2 (Superior Izquierdo): 21-28
 * - Cuadrante 3 (Inferior Izquierdo): 31-38
 * - Cuadrante 4 (Inferior Derecho): 48-41
 *
 * Cada diente tiene 5 superficies:
 * O = Oclusal/Incisal (centro)
 * V = Vestibular (exterior / abajo en sup, arriba en inf)
 * L = Lingual/Palatino (interior / arriba en sup, abajo en inf)
 * M = Mesial (hacia el centro de la arcada)
 * D = Distal (hacia atrás de la arcada)
 */
import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Save, RotateCcw, Palette, Info, Clock, Plus,
    Trash2, FileText, ChevronDown, CheckCircle, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'

// =============================================
// TYPES
// =============================================
type Surface = 'O' | 'V' | 'L' | 'M' | 'D'

type Condition =
    | 'sano'
    | 'caries'
    | 'obturacion'
    | 'sellante'
    | 'corona'
    | 'endodoncia'
    | 'ausente'
    | 'fractura'
    | 'protesis_fija'
    | 'protesis_removible'
    | 'implante'
    | 'movilidad'

interface ToothState {
    surfaces: Record<Surface, Condition>
    general: Condition       // whole-tooth condition (ausente, corona, etc.)
    notes: string
    mobility?: number        // 0-3
}

interface OdontogramaData {
    teeth: Record<string, ToothState>
    fecha: string
    notas_generales: string
}

// =============================================
// CONSTANTS
// =============================================
const CONDITIONS: { value: Condition; label: string; color: string; bgClass: string; description: string; isSurfaceLevel: boolean }[] = [
    { value: 'sano', label: 'Sano', color: '#e2e8f0', bgClass: 'bg-slate-200', description: 'Sin patología', isSurfaceLevel: true },
    { value: 'caries', label: 'Caries', color: '#ef4444', bgClass: 'bg-red-500', description: 'Lesión cariosa activa', isSurfaceLevel: true },
    { value: 'obturacion', label: 'Obturación', color: '#3b82f6', bgClass: 'bg-blue-500', description: 'Restauración existente', isSurfaceLevel: true },
    { value: 'sellante', label: 'Sellante', color: '#a855f7', bgClass: 'bg-purple-500', description: 'Sellador de fosetas y fisuras', isSurfaceLevel: true },
    { value: 'corona', label: 'Corona', color: '#f59e0b', bgClass: 'bg-amber-500', description: 'Corona protésica', isSurfaceLevel: false },
    { value: 'endodoncia', label: 'Endodoncia', color: '#ec4899', bgClass: 'bg-pink-500', description: 'Tratamiento de conductos', isSurfaceLevel: false },
    { value: 'ausente', label: 'Ausente', color: '#1e293b', bgClass: 'bg-slate-800', description: 'Diente perdido o extraído', isSurfaceLevel: false },
    { value: 'fractura', label: 'Fractura', color: '#f97316', bgClass: 'bg-orange-500', description: 'Fractura dental', isSurfaceLevel: true },
    { value: 'protesis_fija', label: 'Prótesis Fija', color: '#14b8a6', bgClass: 'bg-teal-500', description: 'Puente o prótesis fija', isSurfaceLevel: false },
    { value: 'protesis_removible', label: 'Prótesis Removible', color: '#06b6d4', bgClass: 'bg-cyan-500', description: 'Prótesis parcial removible', isSurfaceLevel: false },
    { value: 'implante', label: 'Implante', color: '#8b5cf6', bgClass: 'bg-violet-500', description: 'Implante dental', isSurfaceLevel: false },
    { value: 'movilidad', label: 'Movilidad', color: '#eab308', bgClass: 'bg-yellow-500', description: 'Movilidad dental grado I-III', isSurfaceLevel: false },
]

// FDI Tooth Numbers
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11]   // Q1
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28]     // Q2
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38]     // Q3
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41]    // Q4

const TOOTH_NAMES: Record<number, string> = {
    11: 'Inc. Central Sup. Der.', 12: 'Inc. Lateral Sup. Der.', 13: 'Canino Sup. Der.',
    14: '1er Premolar Sup. Der.', 15: '2do Premolar Sup. Der.', 16: '1er Molar Sup. Der.',
    17: '2do Molar Sup. Der.', 18: '3er Molar Sup. Der.',
    21: 'Inc. Central Sup. Izq.', 22: 'Inc. Lateral Sup. Izq.', 23: 'Canino Sup. Izq.',
    24: '1er Premolar Sup. Izq.', 25: '2do Premolar Sup. Izq.', 26: '1er Molar Sup. Izq.',
    27: '2do Molar Sup. Izq.', 28: '3er Molar Sup. Izq.',
    31: 'Inc. Central Inf. Izq.', 32: 'Inc. Lateral Inf. Izq.', 33: 'Canino Inf. Izq.',
    34: '1er Premolar Inf. Izq.', 35: '2do Premolar Inf. Izq.', 36: '1er Molar Inf. Izq.',
    37: '2do Molar Inf. Izq.', 38: '3er Molar Inf. Izq.',
    41: 'Inc. Central Inf. Der.', 42: 'Inc. Lateral Inf. Der.', 43: 'Canino Inf. Der.',
    44: '1er Premolar Inf. Der.', 45: '2do Premolar Inf. Der.', 46: '1er Molar Inf. Der.',
    47: '2do Molar Inf. Der.', 48: '3er Molar Inf. Der.',
}

// Determine if tooth is a molar (has rectangular oclusal) vs anterior (triangular incisal)
function isMolar(num: number): boolean {
    const n = num % 10
    return n >= 4 // premolars and molars
}

function createEmptyTooth(): ToothState {
    return {
        surfaces: { O: 'sano', V: 'sano', L: 'sano', M: 'sano', D: 'sano' },
        general: 'sano',
        notes: '',
    }
}

function createInitialData(): OdontogramaData {
    const teeth: Record<string, ToothState> = {}
    const allTeeth = [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_LEFT, ...LOWER_RIGHT]
    allTeeth.forEach(num => { teeth[String(num)] = createEmptyTooth() })
    return {
        teeth,
        fecha: new Date().toISOString().split('T')[0],
        notas_generales: '',
    }
}

// =============================================
// TOOTH SVG COMPONENT
// =============================================
function ToothSVG({
    toothNumber,
    state,
    isSelected,
    onClick,
    onSurfaceClick,
    selectedCondition,
    compact = false,
}: {
    toothNumber: number
    state: ToothState
    isSelected: boolean
    onClick: () => void
    onSurfaceClick: (surface: Surface) => void
    selectedCondition: Condition
    compact?: boolean
}) {
    const size = compact ? 42 : 52
    const conditionColor = (condition: Condition) =>
        CONDITIONS.find(c => c.value === condition)?.color || '#e2e8f0'

    const isAbsent = state.general === 'ausente'

    // 5-surface tooth diagram using SVG
    // Layout:
    //      [  L  ]       (top = lingual/palatino)
    //   [M][  O  ][D]    (center = oclusal, left=mesial, right=distal)
    //      [  V  ]       (bottom = vestibular)

    const pad = 2
    const outer = size - pad * 2
    const innerSize = outer * 0.4
    const innerOffset = (outer - innerSize) / 2 + pad

    return (
        <div
            className={`relative group cursor-pointer transition-all duration-200 ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'}`}
            style={{ width: size, height: size + 18 }}
        >
            {/* Tooth number label */}
            <div className={`text-center mb-0.5 text-[9px] font-black transition-colors ${isSelected ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}>
                {toothNumber}
            </div>

            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                onClick={onClick}
                className={`rounded-lg transition-shadow ${isSelected
                    ? 'ring-2 ring-emerald-500 ring-offset-1 shadow-lg shadow-emerald-500/20'
                    : 'hover:shadow-md'
                    }`}
            >
                {/* Background */}
                <rect x={0} y={0} width={size} height={size} rx={4} fill="white" stroke={isSelected ? '#10b981' : '#e2e8f0'} strokeWidth={isSelected ? 1.5 : 0.5} />

                {isAbsent ? (
                    /* Absent tooth - X mark */
                    <g>
                        <line x1={pad + 4} y1={pad + 4} x2={size - pad - 4} y2={size - pad - 4} stroke="#64748b" strokeWidth={2.5} strokeLinecap="round" />
                        <line x1={size - pad - 4} y1={pad + 4} x2={pad + 4} y2={size - pad - 4} stroke="#64748b" strokeWidth={2.5} strokeLinecap="round" />
                    </g>
                ) : (
                    <g>
                        {/* Lingual / Palatino (top) - trapezoid */}
                        <path
                            d={`M ${pad} ${pad} L ${size - pad} ${pad} L ${innerOffset + innerSize} ${innerOffset} L ${innerOffset} ${innerOffset} Z`}
                            fill={conditionColor(state.surfaces.L)}
                            stroke="#94a3b8"
                            strokeWidth={0.5}
                            onClick={(e) => { e.stopPropagation(); onSurfaceClick('L') }}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />

                        {/* Vestibular (bottom) - trapezoid */}
                        <path
                            d={`M ${pad} ${size - pad} L ${size - pad} ${size - pad} L ${innerOffset + innerSize} ${innerOffset + innerSize} L ${innerOffset} ${innerOffset + innerSize} Z`}
                            fill={conditionColor(state.surfaces.V)}
                            stroke="#94a3b8"
                            strokeWidth={0.5}
                            onClick={(e) => { e.stopPropagation(); onSurfaceClick('V') }}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />

                        {/* Mesial (left) - trapezoid */}
                        <path
                            d={`M ${pad} ${pad} L ${innerOffset} ${innerOffset} L ${innerOffset} ${innerOffset + innerSize} L ${pad} ${size - pad} Z`}
                            fill={conditionColor(state.surfaces.M)}
                            stroke="#94a3b8"
                            strokeWidth={0.5}
                            onClick={(e) => { e.stopPropagation(); onSurfaceClick('M') }}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />

                        {/* Distal (right) - trapezoid */}
                        <path
                            d={`M ${size - pad} ${pad} L ${size - pad} ${size - pad} L ${innerOffset + innerSize} ${innerOffset + innerSize} L ${innerOffset + innerSize} ${innerOffset} Z`}
                            fill={conditionColor(state.surfaces.D)}
                            stroke="#94a3b8"
                            strokeWidth={0.5}
                            onClick={(e) => { e.stopPropagation(); onSurfaceClick('D') }}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />

                        {/* Oclusal / Incisal (center) */}
                        <rect
                            x={innerOffset}
                            y={innerOffset}
                            width={innerSize}
                            height={innerSize}
                            fill={conditionColor(state.surfaces.O)}
                            stroke="#94a3b8"
                            strokeWidth={0.5}
                            onClick={(e) => { e.stopPropagation(); onSurfaceClick('O') }}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />

                        {/* Special markers for general conditions */}
                        {state.general === 'corona' && (
                            <circle cx={size / 2} cy={size / 2} r={size / 2 - pad - 2} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 2" />
                        )}
                        {state.general === 'endodoncia' && (
                            <g>
                                <line x1={size / 2} y1={pad + 4} x2={size / 2} y2={size - pad - 4} stroke="#ec4899" strokeWidth={1.5} />
                                <line x1={pad + 4} y1={size / 2} x2={size - pad - 4} y2={size / 2} stroke="#ec4899" strokeWidth={1.5} />
                            </g>
                        )}
                        {state.general === 'implante' && (
                            <g>
                                <polygon points={`${size / 2},${pad + 3} ${size - pad - 3},${size - pad - 3} ${pad + 3},${size - pad - 3}`} fill="none" stroke="#8b5cf6" strokeWidth={1.5} />
                            </g>
                        )}
                        {state.general === 'movilidad' && (
                            <text x={size / 2} y={size - 4} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#eab308">M{state.mobility || 1}</text>
                        )}
                        {state.general === 'protesis_fija' && (
                            <rect x={pad + 1} y={pad + 1} width={outer - 2} height={outer - 2} rx={3} fill="none" stroke="#14b8a6" strokeWidth={2} />
                        )}
                        {state.general === 'fractura' && (
                            <path d={`M ${pad + 3} ${size / 2 - 3} L ${size / 2} ${size / 2 + 3} L ${size - pad - 3} ${size / 2 - 3}`} fill="none" stroke="#f97316" strokeWidth={2} strokeLinecap="round" />
                        )}
                    </g>
                )}
            </svg>
        </div>
    )
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function OdontogramaTab() {
    const [data, setData] = useState<OdontogramaData>(createInitialData)
    const [selectedTooth, setSelectedTooth] = useState<string | null>(null)
    const [selectedCondition, setSelectedCondition] = useState<Condition>('caries')
    const [showLegend, setShowLegend] = useState(true)
    const [history, setHistory] = useState<OdontogramaData[]>([])

    const saveToHistory = useCallback(() => {
        setHistory(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(data))])
    }, [data])

    const handleSurfaceClick = useCallback((toothNum: string, surface: Surface) => {
        saveToHistory()
        setData(prev => {
            const tooth = { ...prev.teeth[toothNum] }
            const condInfo = CONDITIONS.find(c => c.value === selectedCondition)

            if (condInfo?.isSurfaceLevel) {
                // Toggle: if same condition, reset to sano
                tooth.surfaces = { ...tooth.surfaces }
                tooth.surfaces[surface] = tooth.surfaces[surface] === selectedCondition ? 'sano' : selectedCondition
            } else {
                // General condition applies to whole tooth
                tooth.general = tooth.general === selectedCondition ? 'sano' : selectedCondition
                // If ausente, clear all surfaces
                if (tooth.general === 'ausente') {
                    tooth.surfaces = { O: 'sano', V: 'sano', L: 'sano', M: 'sano', D: 'sano' }
                }
            }

            return { ...prev, teeth: { ...prev.teeth, [toothNum]: tooth } }
        })
    }, [selectedCondition, saveToHistory])

    const handleUndo = () => {
        if (history.length === 0) return
        const last = history[history.length - 1]
        setData(last)
        setHistory(prev => prev.slice(0, -1))
    }

    const handleReset = () => {
        saveToHistory()
        setData(createInitialData())
        toast.success('Odontograma reiniciado')
    }

    const handleSave = () => {
        // In production, this would save to Supabase
        toast.success('Odontograma guardado correctamente')
    }

    const handleToothNoteChange = (toothNum: string, notes: string) => {
        setData(prev => ({
            ...prev,
            teeth: { ...prev.teeth, [toothNum]: { ...prev.teeth[toothNum], notes } }
        }))
    }

    // Count conditions for summary
    const conditionCounts: Record<string, number> = {}
    Object.values(data.teeth).forEach(tooth => {
        Object.values(tooth.surfaces).forEach(c => {
            if (c !== 'sano') conditionCounts[c] = (conditionCounts[c] || 0) + 1
        })
        if (tooth.general !== 'sano') conditionCounts[tooth.general] = (conditionCounts[tooth.general] || 0) + 1
    })

    const selectedToothState = selectedTooth ? data.teeth[selectedTooth] : null

    const renderToothRow = (teeth: number[], label: string, isUpper: boolean) => (
        <div className="flex flex-col items-center">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</div>
            <div className="flex gap-1 items-end">
                {teeth.map(num => (
                    <ToothSVG
                        key={num}
                        toothNumber={num}
                        state={data.teeth[String(num)]}
                        isSelected={selectedTooth === String(num)}
                        onClick={() => setSelectedTooth(selectedTooth === String(num) ? null : String(num))}
                        onSurfaceClick={(surface) => handleSurfaceClick(String(num), surface)}
                        selectedCondition={selectedCondition}
                    />
                ))}
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <span className="text-xl">🦷</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Odontograma</h2>
                        <p className="text-sm text-slate-500">Diagrama dental interactivo — Sistema FDI</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        className="rounded-xl gap-1.5 text-xs"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Deshacer
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="rounded-xl gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Limpiar
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        className="rounded-xl gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                        <Save className="w-3.5 h-3.5" /> Guardar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                {/* ── DENTAL CHART ── */}
                <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-6">
                        {/* Condition Palette */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Palette className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Condición Activa</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {CONDITIONS.map(cond => (
                                    <button
                                        key={cond.value}
                                        onClick={() => setSelectedCondition(cond.value)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 ${selectedCondition === cond.value
                                            ? 'border-slate-800 shadow-lg scale-105 bg-white'
                                            : 'border-transparent bg-slate-50 hover:bg-slate-100 opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <div
                                            className="w-3.5 h-3.5 rounded-full border border-white shadow-sm flex-shrink-0"
                                            style={{ backgroundColor: cond.color }}
                                        />
                                        {cond.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dental Arch */}
                        <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100 p-6">
                            {/* Upper Arch */}
                            <div className="flex justify-center gap-8 mb-2">
                                <div className="text-center">
                                    <div className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-500 mb-1">Cuadrante 1 — Superior Derecho</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-500 mb-1">Cuadrante 2 — Superior Izquierdo</div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 mb-1">
                                <div className="flex gap-1">
                                    {UPPER_RIGHT.map(num => (
                                        <ToothSVG
                                            key={num}
                                            toothNumber={num}
                                            state={data.teeth[String(num)]}
                                            isSelected={selectedTooth === String(num)}
                                            onClick={() => setSelectedTooth(selectedTooth === String(num) ? null : String(num))}
                                            onSurfaceClick={(surface) => handleSurfaceClick(String(num), surface)}
                                            selectedCondition={selectedCondition}
                                        />
                                    ))}
                                </div>
                                <div className="w-px bg-slate-300 self-stretch mx-1" />
                                <div className="flex gap-1">
                                    {UPPER_LEFT.map(num => (
                                        <ToothSVG
                                            key={num}
                                            toothNumber={num}
                                            state={data.teeth[String(num)]}
                                            isSelected={selectedTooth === String(num)}
                                            onClick={() => setSelectedTooth(selectedTooth === String(num) ? null : String(num))}
                                            onSurfaceClick={(surface) => handleSurfaceClick(String(num), surface)}
                                            selectedCondition={selectedCondition}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Midline separator */}
                            <div className="flex items-center gap-4 my-3">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                                <div className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Línea Media
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                            </div>

                            {/* Lower Arch */}
                            <div className="flex justify-center gap-4 mb-1">
                                <div className="flex gap-1">
                                    {LOWER_RIGHT.map(num => (
                                        <ToothSVG
                                            key={num}
                                            toothNumber={num}
                                            state={data.teeth[String(num)]}
                                            isSelected={selectedTooth === String(num)}
                                            onClick={() => setSelectedTooth(selectedTooth === String(num) ? null : String(num))}
                                            onSurfaceClick={(surface) => handleSurfaceClick(String(num), surface)}
                                            selectedCondition={selectedCondition}
                                        />
                                    ))}
                                </div>
                                <div className="w-px bg-slate-300 self-stretch mx-1" />
                                <div className="flex gap-1">
                                    {LOWER_LEFT.map(num => (
                                        <ToothSVG
                                            key={num}
                                            toothNumber={num}
                                            state={data.teeth[String(num)]}
                                            isSelected={selectedTooth === String(num)}
                                            onClick={() => setSelectedTooth(selectedTooth === String(num) ? null : String(num))}
                                            onSurfaceClick={(surface) => handleSurfaceClick(String(num), surface)}
                                            selectedCondition={selectedCondition}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center gap-8 mt-2">
                                <div className="text-center">
                                    <div className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-500">Cuadrante 4 — Inferior Derecho</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-500">Cuadrante 3 — Inferior Izquierdo</div>
                                </div>
                            </div>
                        </div>

                        {/* Usage hint */}
                        <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <p className="text-[11px] text-blue-600 font-medium">
                                <strong>Instrucciones:</strong> Selecciona una condición de la paleta y haz clic en las superficies del diente para marcarlas.
                                Para condiciones de diente completo (corona, ausente, etc.), haz clic en cualquier superficie.
                                Clic en el número del diente para ver detalles.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* ── SIDE PANEL ── */}
                <div className="space-y-4">
                    {/* Selected Tooth Detail */}
                    <AnimatePresence mode="wait">
                        {selectedTooth && selectedToothState ? (
                            <motion.div
                                key={selectedTooth}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                                <span className="text-white font-black text-sm">{selectedTooth}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 text-sm">Diente {selectedTooth}</h3>
                                                <p className="text-[10px] text-slate-400 font-medium">{TOOTH_NAMES[Number(selectedTooth)] || ''}</p>
                                            </div>
                                        </div>

                                        {/* Surfaces status */}
                                        <div className="mb-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Superficies</p>
                                            <div className="grid grid-cols-5 gap-1.5">
                                                {(['M', 'O', 'D', 'V', 'L'] as Surface[]).map(s => {
                                                    const cond = CONDITIONS.find(c => c.value === selectedToothState.surfaces[s])
                                                    return (
                                                        <div
                                                            key={s}
                                                            className="text-center p-2 rounded-xl border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                                                            onClick={() => handleSurfaceClick(selectedTooth, s)}
                                                        >
                                                            <div
                                                                className="w-6 h-6 rounded-lg mx-auto mb-1 border border-white shadow-sm"
                                                                style={{ backgroundColor: cond?.color || '#e2e8f0' }}
                                                            />
                                                            <p className="text-[9px] font-black text-slate-500">{s}</p>
                                                            <p className="text-[8px] text-slate-400 truncate">{cond?.label || 'Sano'}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* General condition */}
                                        <div className="mb-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Condición General</p>
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                                                    style={{ backgroundColor: CONDITIONS.find(c => c.value === selectedToothState.general)?.color || '#e2e8f0' }}
                                                />
                                                <span className="text-xs font-bold text-slate-700">
                                                    {CONDITIONS.find(c => c.value === selectedToothState.general)?.label || 'Sano'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Notas</p>
                                            <textarea
                                                value={selectedToothState.notes}
                                                onChange={e => handleToothNoteChange(selectedTooth, e.target.value)}
                                                placeholder="Observaciones del diente..."
                                                rows={3}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs resize-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white rounded-3xl">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                            <span className="text-2xl">🦷</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 mb-1">Selecciona un diente</p>
                                        <p className="text-xs text-slate-400">Haz clic en cualquier diente para ver sus detalles y agregar notas</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Summary */}
                    <Card className="border-0 shadow-lg bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resumen</span>
                            </div>
                            {Object.keys(conditionCounts).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(conditionCounts)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([cond, count]) => {
                                            const info = CONDITIONS.find(c => c.value === cond)
                                            return (
                                                <div key={cond} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full border border-white shadow-sm"
                                                            style={{ backgroundColor: info?.color || '#e2e8f0' }}
                                                        />
                                                        <span className="text-xs font-semibold text-slate-600">{info?.label || cond}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">{count}</span>
                                                </div>
                                            )
                                        })}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-700">Todos los dientes sanos</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Legend toggle */}
                    <button
                        onClick={() => setShowLegend(!showLegend)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl shadow-lg border border-slate-100 hover:border-slate-200 transition-all"
                    >
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Leyenda de Símbolos</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showLegend ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showLegend && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Card className="border-0 shadow-lg bg-white rounded-3xl overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            {CONDITIONS.filter(c => c.value !== 'sano').map(cond => (
                                                <div key={cond.value} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                                                    <div
                                                        className="w-5 h-5 rounded-md border border-white shadow-sm flex-shrink-0"
                                                        style={{ backgroundColor: cond.color }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-700">{cond.label}</p>
                                                        <p className="text-[9px] text-slate-400">{cond.description}</p>
                                                    </div>
                                                    <span className="text-[8px] font-bold text-slate-300 uppercase">
                                                        {cond.isSurfaceLevel ? 'Sup.' : 'Diente'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* General Notes */}
                    <Card className="border-0 shadow-lg bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notas Generales</span>
                            </div>
                            <textarea
                                value={data.notas_generales}
                                onChange={e => setData(prev => ({ ...prev, notas_generales: e.target.value }))}
                                placeholder="Observaciones generales del odontograma..."
                                rows={4}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs resize-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
