// @ts-nocheck
/**
 * LaboratorioTab — Extracción directa con IA (LabClone) + Análisis Clínico Interactivo
 *
 * Flujo idéntico a Espirometría:
 *   1. Subir PDF → Gemini extrae JSON completo con exams/results
 *   2. Preview con botones Confirmar / Cancelar
 *   3. Si confirma → guarda en estudios_clinicos + archivo en Storage
 *   4. Vista 1: Reporte extraído (réplica digital)
 *   5. Vista 2: Análisis IA (gráficos interactivos, semáforos, barras, radar, etc.)
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FlaskConical, Upload, Loader2, CheckCircle, AlertTriangle, RefreshCw,
    Save, X, Activity, TrendingUp, TrendingDown, Minus, Brain, Shield,
    BarChart3, Zap, Target, FileCheck, Table2, Eye, Beaker
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { analyzeLabDirect } from '@/services/geminiDocumentService'
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos'
import { secureStorageService } from '@/services/secureStorageService'
import { useAuth } from '@/contexts/AuthContext'
import {
    BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, ReferenceLine, PieChart, Pie
} from 'recharts'

// ─── CLINICAL KNOWLEDGE BASE — interpretations per parameter ───
const CLINICAL_KNOWLEDGE: Record<string, { high?: string; low?: string; area: string }> = {
    'glucosa': { high: 'Hiperglucemia. Evaluar diabetes mellitus (DM2) o prediabetes. Confirmar con HbA1c ≥6.5% o glucosa en ayuno ≥126 mg/dL en dos ocasiones.', low: 'Hipoglucemia. Posible ayuno prolongado, exceso de insulina o tumor productor de insulina. Evaluar sintomatología asociada.', area: 'metabolico' },
    'glucose': { high: 'Hyperglycemia. Evaluate for diabetes.', low: 'Hypoglycemia.', area: 'metabolico' },
    'hemoglobina': { high: 'Poliglobulia o deshidratación. Evaluar policitemia vera o hipoxia crónica.', low: 'Anemia. Clasificar por VCM: microcítica (ferropénica), normocítica (crónica) o macrocítica (B12/folato).', area: 'hematologico' },
    'hematocrito': { high: 'Hemoconcentración o policitemia. Considerar deshidratación severa.', low: 'Hemodilución o anemia. Correlacionar con hemoglobina y reticulocitos.', area: 'hematologico' },
    'leucocitos': { high: 'Leucocitosis. Evaluar infección bacteriana, estrés, inflamación o neoplasia mieloproliferativa.', low: 'Leucopenia. Considerar viral, autoinmune, mielodepresión o medicamentos.', area: 'hematologico' },
    'eritrocitos': { high: 'Policitemia. Evaluar hipoxia crónica, tabaquismo o policitemia vera.', low: 'Eritropenia. Orientar por índices eritrocitarios (VCM, HCM, CHCM).', area: 'hematologico' },
    'plaquetas': { high: 'Trombocitosis. Puede ser reactiva (infección/inflamación) o primaria. Riesgo trombótico.', low: 'Trombocitopenia. Riesgo hemorrágico. Evaluar causa (inmune, viral, hepática, medicamentosa).', area: 'hematologico' },
    'colesterol': { high: 'Hipercolesterolemia. Riesgo cardiovascular aumentado. Evaluar perfil lipídico completo y score Framingham.', low: 'Hipocolesterolemia. Raro. Evaluar malabsorción o enfermedad hepática.', area: 'lipidos' },
    'colesterol total': { high: 'Hipercolesterolemia. Riesgo cardiovascular. Meta <200 mg/dL. Evaluar dieta, ejercicio y factores de riesgo.', area: 'lipidos' },
    'trigliceridos': { high: 'Hipertrigliceridemia. >500 mg/dL riesgo de pancreatitis. Evaluar dieta, DM, hipotiroidismo y consumo de alcohol.', area: 'lipidos' },
    'triglycerides': { high: 'Hypertriglyceridemia. Pancreatitis risk >500mg/dL.', area: 'lipidos' },
    'hdl': { low: 'HDL bajo. Factor de riesgo cardiovascular independiente. Recomendar ejercicio aeróbico y dieta mediterránea.', area: 'lipidos' },
    'ldl': { high: 'LDL elevado. Principal factor modificable de enfermedad ateroesclerótica cardiovascular.', area: 'lipidos' },
    'creatinina': { high: 'Creatinina elevada. Evaluar función renal (TFG). Posible insuficiencia renal aguda o crónica.', low: 'Creatinina baja. Masa muscular reducida o desnutrición.', area: 'renal' },
    'urea': { high: 'Azotemia. Evaluar causas prerrenales (deshidratación), renales o posrenales (obstructivas).', area: 'renal' },
    'bun': { high: 'BUN elevado. Insuficiencia renal, deshidratación o hemorragia digestiva alta.', area: 'renal' },
    'acido urico': { high: 'Hiperuricemia. Riesgo de gota y nefrolitiasis. Evaluar dieta, medicamentos y función renal.', area: 'renal' },
    'tgo': { high: 'Elevación de AST/TGO. Daño hepático, muscular o cardiaco. Relación AST/ALT >2 sugiere daño alcohólico.', area: 'hepatico' },
    'tgp': { high: 'Elevación de ALT/TGP. Más específica de daño hepático. Evaluar hepatitis viral, esteatosis, medicamentos.', area: 'hepatico' },
    'ast': { high: 'AST elevada. Daño hepatocelular. Correlacionar con ALT y GGT.', area: 'hepatico' },
    'alt': { high: 'ALT elevada. Daño hepático. Causa más frecuente: esteatosis hepática no alcohólica (EHGNA).', area: 'hepatico' },
    'ggt': { high: 'GGT elevada. Colestasis, consumo de alcohol o medicamentos. Marcador sensible de ingesta etílica.', area: 'hepatico' },
    'bilirrubina': { high: 'Hiperbilirrubinemia. Evaluar ictericia: prehepática (hemólisis), hepática o poshepática (obstructiva).', area: 'hepatico' },
    'bilirrubina total': { high: 'Bilirrubina total elevada. Clasificar en directa vs indirecta para orientar diagnóstico.', area: 'hepatico' },
    'fosfatasa alcalina': { high: 'FA elevada. Colestasis, enfermedad ósea o embarazo. Correlacionar con GGT para confirmar origen hepático.', area: 'hepatico' },
    'albumina': { low: 'Hipoalbuminemia. Desnutrición, enfermedad hepática crónica o síndrome nefrótico. Marcador pronóstico.', area: 'hepatico' },
    'proteinas totales': { low: 'Proteínas totales bajas. Desnutrición proteica o pérdida renal/gastrointestinal.', high: 'Proteínas elevadas. Evaluar deshidratación, mieloma múltiple o infección crónica.', area: 'metabolico' },
    'sodio': { high: 'Hipernatremia. Deshidratación, diabetes insípida. Riesgo de encefalopatía.', low: 'Hiponatremia. Causa más frecuente: SIADH. Evaluar osmolaridad sérica.', area: 'metabolico' },
    'potasio': { high: 'Hiperpotasemia. Riesgo de arritmias cardiacas mortales. Descartar pseudohiperpotasemia (hemólisis de muestra).', low: 'Hipopotasemia. Debilidad muscular, arritmias. Evaluar pérdidas GI o renales.', area: 'metabolico' },
    'calcio': { high: 'Hipercalcemia. Hiperparatiroidismo o malignidad. Evaluar PTH y vitamina D.', low: 'Hipocalcemia. Riesgo de tetania. Evaluar vitamina D, PTH y magnesio.', area: 'metabolico' },
    'hierro': { low: 'Ferropenia. Causa más frecuente de anemia microcítica. Evaluar pérdidas hemáticas y absorción.', high: 'Sobrecarga de hierro. Evaluar hemocromatosis hereditaria.', area: 'hematologico' },
    'ferritina': { low: 'Ferritina baja. Confirmación de ferropenia. Indicar suplementación con hierro.', high: 'Ferritina elevada. Fase aguda, hemocromatosis o hepatopatía. Evaluar saturación de transferrina.', area: 'hematologico' },
    'vsg': { high: 'VSG elevada. Marcador inespecífico de inflamación, infección o neoplasia.', area: 'hematologico' },
    'pcr': { high: 'PCR elevada. Inflamación aguda o infección. Más específica que VSG para respuesta inflamatoria.', area: 'hematologico' },
    'hemoglobina glucosilada': { high: 'HbA1c elevada. ≥6.5% = diagnóstico de diabetes. 5.7-6.4% = prediabetes. Refleja control glucémico de 2-3 meses.', area: 'metabolico' },
    'hba1c': { high: 'HbA1c elevada. Diagnóstico de diabetes ≥6.5%. Meta de control <7% en la mayoría de pacientes.', area: 'metabolico' },
    'tsh': { high: 'TSH elevada. Hipotiroidismo. Evaluar T4 libre para confirmar (primario vs subclínico).', low: 'TSH suprimida. Hipertiroidismo. Evaluar T3 y T4 libres y anticuerpos antitiroideos.', area: 'metabolico' },
    't4 libre': { high: 'T4L elevada. Hipertiroidismo. Gravedad por tormenta tiroidea si >5ng/dL.', low: 'T4L baja. Hipotiroidismo confirmado. Iniciar levotiroxina según peso y edad.', area: 'metabolico' },
    'neutrofilos': { high: 'Neutrofilia. Infección bacteriana aguda, estrés o uso de corticoides.', low: 'Neutropenia. <500/µL = riesgo severo de infección. Evaluar quimioterapia, viral o autoinmune.', area: 'hematologico' },
    'linfocitos': { high: 'Linfocitosis. Infección viral aguda, leucemia linfocítica crónica.', low: 'Linfopenia. VIH, corticoides, quimioterapia o inmunosupresión.', area: 'hematologico' },
    'eosinofilos': { high: 'Eosinofilia. Alergia, parasitosis o vasculitis eosinofílica. Evaluar IgE total.', area: 'hematologico' },
    'monocitos': { high: 'Monocitosis. Infección crónica (TB, endocarditis), recuperación de neutropenia.', area: 'hematologico' },
}

// Clinical area labels
const AREA_LABELS: Record<string, { name: string; icon: string; gradient: string; bg: string; border: string; text: string }> = {
    metabolico: { name: 'Perfil Metabólico', icon: '🔬', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    hematologico: { name: 'Perfil Hematológico', icon: '🩸', gradient: 'from-red-500 to-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
    renal: { name: 'Función Renal', icon: '💧', gradient: 'from-cyan-500 to-sky-600', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
    hepatico: { name: 'Función Hepática', icon: '🫁', gradient: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    lipidos: { name: 'Perfil Lipídico', icon: '❤️', gradient: 'from-rose-500 to-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
}

// Helper: find clinical interpretation for a parameter
const getClinicalInterpretation = (param: string, isHigh: boolean): string | null => {
    const key = param.toLowerCase().trim()
    for (const [pattern, info] of Object.entries(CLINICAL_KNOWLEDGE)) {
        if (key.includes(pattern) || pattern.includes(key)) {
            return isHigh ? (info.high || null) : (info.low || null)
        }
    }
    return null
}

const getClinicalArea = (param: string): string => {
    const key = param.toLowerCase().trim()
    for (const [pattern, info] of Object.entries(CLINICAL_KNOWLEDGE)) {
        if (key.includes(pattern) || pattern.includes(key)) {
            return info.area
        }
    }
    return 'otro'
}

// ─── Hook: cargar laboratorio desde Supabase (universal para todos los pacientes) ───
const useLaboratorio = (pacienteId: string) => {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const load = async () => {
        setLoading(true)
        try {
            // 1. Buscar en estudios_clinicos (LabClone directo o importado)
            const { data: estudios } = await supabase
                .from('estudios_clinicos')
                .select('*')
                .eq('paciente_id', pacienteId)
                .in('tipo_estudio', ['laboratorio_directo', 'laboratorio'])
                .order('fecha_estudio', { ascending: false })
                .limit(1)

            // Opción A: datos LabClone directos
            if (estudios?.[0]?.datos_extra?.labclone_data) {
                setData(estudios[0].datos_extra.labclone_data)
                return
            }

            // Opción B: datos del pipeline genérico (ImportarExpediente wizard)
            if (estudios?.[0]?.datos_extra) {
                const extra = estudios[0].datos_extra
                // Intentar convertir del formato genérico con results[]
                if (extra.results && Array.isArray(extra.results)) {
                    const converted = convertGenericToLabClone(extra)
                    if (converted) { setData(converted); return }
                }
            }

            // 2. Fallback: buscar en la tabla laboratorios (legacy)
            const { data: labRecords } = await supabase
                .from('laboratorios')
                .select('*')
                .eq('paciente_id', pacienteId)
                .order('fecha_resultados', { ascending: false })
                .limit(1)

            if (labRecords?.[0]) {
                const record = labRecords[0]
                let grupos: any[] = []
                try {
                    grupos = typeof record.resultados === 'string'
                        ? JSON.parse(record.resultados)
                        : (Array.isArray(record.resultados) ? record.resultados : [])
                } catch { }
                if (grupos.length > 0) {
                    const converted = convertLegacyToLabClone(record, grupos)
                    if (converted) { setData(converted); return }
                }
            }

            // 3. Fallback: buscar en pacientes.laboratorio (JSONB)
            const { data: pac } = await supabase
                .from('pacientes')
                .select('laboratorio, nombre, apellido_paterno')
                .eq('id', pacienteId)
                .single()

            if (pac?.laboratorio && typeof pac.laboratorio === 'object') {
                const lab = pac.laboratorio as Record<string, any>
                const hasValues = Object.values(lab).some(v => v !== null && v !== undefined && v !== '' && v !== 0)
                if (hasValues) {
                    const converted = convertJsonbToLabClone(lab, pac.nombre, pac.apellido_paterno)
                    if (converted) { setData(converted); return }
                }
            }

            setData(null)
        } catch (err) {
            console.error('[Laboratorio] Error cargando:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { if (pacienteId) load() }, [pacienteId])
    return { data, loading, reload: load }
}

// ─── Converters for universal patient support ───
function convertGenericToLabClone(extra: any): any | null {
    try {
        const results = extra.results || []
        const grouped: Record<string, any[]> = {}
        for (const r of results) {
            const cat = r.category || r.categoria || 'General'
            if (!grouped[cat]) grouped[cat] = []
            grouped[cat].push({
                parameter: r.name || r.parametro || '',
                value: String(r.value ?? r.resultado ?? ''),
                unit: r.unit || r.unidad || '',
                referenceValue: r.range || r.rango || '',
                isAbnormal: false,
            })
        }
        return {
            patientInfo: {
                name: extra.patientData?.name || extra.patientData?.nombre || '',
                registrationDate: '',
            },
            exams: Object.entries(grouped).map(([name, results]) => ({ examName: name, results })),
            signatures: [],
        }
    } catch { return null }
}

function convertLegacyToLabClone(record: any, grupos: any[]): any | null {
    try {
        return {
            patientInfo: { name: '', registrationDate: record.fecha_resultados || '' },
            exams: grupos.map((g: any) => ({
                examName: g.grupo || 'General',
                results: (g.resultados || []).map((r: any) => ({
                    parameter: r.parametro || r.nombre_display || '',
                    value: String(r.resultado ?? r.resultado_numerico ?? ''),
                    unit: r.unidad || '',
                    referenceValue: r.valor_referencia || (r.rango_ref_min != null ? `${r.rango_ref_min} - ${r.rango_ref_max}` : ''),
                    isAbnormal: (r.bandera || 'normal') !== 'normal',
                }))
            })),
            signatures: [],
        }
    } catch { return null }
}

function convertJsonbToLabClone(lab: Record<string, any>, nombre?: string, apellido?: string): any | null {
    const RANGOS: Record<string, { min: number; max: number; unit: string; group: string }> = {
        hemoglobina: { min: 13, max: 17.5, unit: 'g/dL', group: 'Biometría Hemática' },
        hematocrito: { min: 38, max: 52, unit: '%', group: 'Biometría Hemática' },
        leucocitos: { min: 4500, max: 11000, unit: '/µL', group: 'Biometría Hemática' },
        eritrocitos: { min: 4.2, max: 5.8, unit: 'M/µL', group: 'Biometría Hemática' },
        plaquetas: { min: 150000, max: 400000, unit: '/µL', group: 'Biometría Hemática' },
        glucosa: { min: 70, max: 100, unit: 'mg/dL', group: 'Química Sanguínea' },
        creatinina: { min: 0.7, max: 1.3, unit: 'mg/dL', group: 'Química Sanguínea' },
        colesterol_total: { min: 0, max: 200, unit: 'mg/dL', group: 'Perfil Lipídico' },
        trigliceridos: { min: 0, max: 150, unit: 'mg/dL', group: 'Perfil Lipídico' },
    }
    try {
        const groups: Record<string, any[]> = {}
        for (const [key, value] of Object.entries(lab)) {
            if (value === null || value === undefined || value === '' || value === 0) continue
            const ref = RANGOS[key]
            if (ref) {
                const n = parseFloat(String(value))
                if (isNaN(n)) continue
                if (!groups[ref.group]) groups[ref.group] = []
                groups[ref.group].push({
                    parameter: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    value: String(n), unit: ref.unit,
                    referenceValue: `${ref.min} - ${ref.max}`,
                    isAbnormal: n < ref.min || n > ref.max,
                })
            }
        }
        if (Object.keys(groups).length === 0) return null
        return {
            patientInfo: { name: [nombre, apellido].filter(Boolean).join(' '), registrationDate: '' },
            exams: Object.entries(groups).map(([name, results]) => ({ examName: name, results })),
            signatures: [],
        }
    } catch { return null }
}

// ─── Hook: upload + IA extraction (con preview) ───
const useLabUpload = (
    pacienteId: string, empresaId: string,
    userId: string | undefined, userName: string | undefined, userRol: string | undefined,
    onComplete: () => void
) => {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [previewData, setPreviewData] = useState<any>(null)
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        setUploading(true)
        setError(null)
        setPreviewData(null)
        setOriginalFile(file)
        setProgress('Analizando documento con IA...')

        try {
            const labData = await analyzeLabDirect('', [file])
            const totalParams = labData.exams?.reduce((acc: number, e: any) => acc + (e.results?.length || 0), 0) || 0

            if (totalParams === 0) {
                throw new Error('La IA no pudo extraer parámetros de laboratorio del documento.')
            }

            setProgress(`✅ ${totalParams} parámetros de ${labData.exams?.length || 0} exámenes extraídos. Revisa y confirma.`)
            setPreviewData(labData)
        } catch (err: any) {
            console.error('[LabUpload] Error:', err)
            setError(err.message || 'Error al procesar el documento')
            setOriginalFile(null)
        } finally {
            setUploading(false)
        }
    }

    const confirmSave = async () => {
        if (!previewData) return
        setSaving(true)
        try {
            const { error: dbErr } = await supabase.from('estudios_clinicos').insert({
                paciente_id: pacienteId,
                tipo_estudio: 'laboratorio_directo',
                fecha_estudio: new Date().toISOString().split('T')[0],
                datos_extra: {
                    labclone_data: previewData,
                    _source: 'LabClone Pipeline',
                    _extracted_at: new Date().toISOString(),
                }
            })
            if (dbErr) throw dbErr

            if (originalFile && empresaId) {
                try {
                    const patientName = previewData.patientInfo?.name || 'Paciente'
                    const fecha = new Date().toISOString().split('T')[0]
                    const ext = originalFile.name.split('.').pop() || 'pdf'
                    const renamedFile = new File(
                        [originalFile],
                        `Laboratorio_${patientName.replace(/\s+/g, '_')}_${fecha}.${ext}`,
                        { type: originalFile.type }
                    )
                    await secureStorageService.upload(renamedFile, {
                        pacienteId,
                        empresaId,
                        categoria: 'laboratorio',
                        subcategoria: 'reporte_original',
                        descripcion: `Laboratorios de ${patientName} — ${fecha}`,
                        userId,
                        userNombre: userName,
                        userRol: userRol,
                    })
                } catch (storageErr) {
                    console.warn('⚠️ No se pudo guardar el archivo original:', storageErr)
                }
            }

            setPreviewData(null)
            setOriginalFile(null)
            onComplete()
        } catch (err: any) {
            setError(err.message || 'Error al guardar en base de datos')
        } finally {
            setSaving(false)
        }
    }

    const cancelPreview = () => {
        setPreviewData(null)
        setOriginalFile(null)
        setProgress('')
        setError(null)
    }

    const triggerUpload = () => fileInputRef.current?.click()

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
        if (e.target) e.target.value = ''
    }

    return { uploading, saving, progress, error, previewData, fileInputRef, triggerUpload, onFileSelected, confirmSave, cancelPreview }
}

// ──────────────────────────────────────────
// LAB REPORT COMPONENT (réplica del PDF)
// ──────────────────────────────────────────
function LabReport({ data }: { data: any }) {
    if (!data) return null
    return (
        <div className="bg-white text-slate-800 w-full rounded-2xl overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 px-8 py-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">
                            {data.patientInfo?.laboratoryName || 'REPORTE DE LABORATORIO'}
                        </h1>
                        <p className="text-emerald-300 text-xs mt-1 font-medium uppercase tracking-widest">Resultados de Análisis Clínicos</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/50 text-[9px] uppercase tracking-widest">Folio</p>
                        <p className="text-lg font-black text-white">{data.patientInfo?.folio || '—'}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
                {/* Patient Card */}
                <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl border border-slate-200 p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Datos del Paciente</p>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">{data.patientInfo?.name || '—'}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Edad', value: data.patientInfo?.age },
                            { label: 'Sexo', value: data.patientInfo?.gender },
                            { label: 'F. Nacimiento', value: data.patientInfo?.dob },
                            { label: 'Fecha Registro', value: data.patientInfo?.registrationDate },
                            { label: 'Médico', value: data.patientInfo?.doctor },
                            { label: 'Impresión', value: data.patientInfo?.printDate },
                        ].filter(f => f.value).map((f, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{f.label}</p>
                                <p className="text-xs font-bold text-slate-800">{f.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Exams */}
                {data.exams?.map((exam: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 rounded-xl">
                            <h3 className="text-sm font-black text-white">{exam.examName}</h3>
                            <div className="flex gap-4 mt-1">
                                {exam.method && <p className="text-[10px] text-emerald-200">Método: {exam.method}</p>}
                                {exam.sampleType && <p className="text-[10px] text-emerald-200">Muestra: {exam.sampleType}</p>}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="grid grid-cols-12 gap-0 bg-slate-100 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                <span className="col-span-4">Parámetro</span>
                                <span className="col-span-2 text-center">Resultado</span>
                                <span className="col-span-2 text-center">Unidad</span>
                                <span className="col-span-2 text-center">Absolutos</span>
                                <span className="col-span-2 text-right">Referencia</span>
                            </div>
                            {exam.results?.map((r: any, ri: number) => {
                                const showGroup = ri === 0 || r.groupName !== exam.results[ri - 1]?.groupName
                                return (
                                    <div key={ri}>
                                        {showGroup && r.groupName && (
                                            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                                                <p className="text-xs font-black text-slate-700">{r.groupName}</p>
                                            </div>
                                        )}
                                        <div className={`grid grid-cols-12 gap-0 px-4 py-2 text-xs border-t border-slate-50 items-center ${r.isAbnormal ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}`}>
                                            <span className="col-span-4 font-medium text-slate-700">{r.parameter}</span>
                                            <span className={`col-span-2 text-center font-black tabular-nums ${r.isAbnormal ? 'text-red-600' : 'text-slate-900'}`}>
                                                {r.value}
                                            </span>
                                            <span className="col-span-2 text-center text-slate-400 text-[10px]">{r.unit}</span>
                                            <span className="col-span-2 text-center text-slate-500 text-[10px]">{r.absolutes || ''}</span>
                                            <span className="col-span-2 text-right text-slate-400 text-[10px]">{r.referenceValue}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {/* Signatures */}
                {data.signatures?.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                        {data.signatures.map((sig: any, i: number) => (
                            <div key={i} className="text-center px-8">
                                <div className="w-48 border-b border-slate-300 mb-2 mx-auto" />
                                <p className="text-[10px] tracking-[0.3em] text-slate-400 mb-1">A T E N T A M E N T E</p>
                                <p className="text-xs font-bold text-slate-700">{sig.name}</p>
                                {sig.title && <p className="text-[10px] text-slate-500">{sig.title}</p>}
                                {sig.id && <p className="text-[10px] text-slate-500">{sig.id}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ──────────────────────────────────────────
// LAB ANALYTICS COMPONENT
// ──────────────────────────────────────────
function LabAnalytics({ data }: { data: any }) {
    if (!data) return null

    const allResults = useMemo(() => {
        return data.exams?.flatMap((e: any) =>
            (e.results || []).map((r: any) => ({ ...r, examName: e.examName }))
        ) || []
    }, [data])

    const totalParams = allResults.length
    const abnormalCount = allResults.filter((r: any) => r.isAbnormal).length
    const normalCount = totalParams - abnormalCount

    // Parse numeric results for charts
    const numericResults = useMemo(() => {
        return allResults.filter((r: any) => {
            const val = parseFloat(String(r.value || '').replace(/[<>,]/g, ''))
            if (isNaN(val)) return false
            // Parse reference range
            const refStr = String(r.referenceValue || '')
            const parts = refStr.replace(/–/g, '-').split('-').map((s: string) => parseFloat(s.trim()))
            return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])
        }).map((r: any) => {
            const val = parseFloat(String(r.value || '').replace(/[<>,]/g, ''))
            const refStr = String(r.referenceValue || '')
            const parts = refStr.replace(/–/g, '-').split('-').map((s: string) => parseFloat(s.trim()))
            const min = parts[0], max = parts[1]
            const pct = ((val - min) / (max - min)) * 100
            return { ...r, numValue: val, refMin: min, refMax: max, pctInRange: pct }
        })
    }, [allResults])

    // Group by exam for radar/distribution
    const examGroups = useMemo(() => {
        const groups: Record<string, { total: number; abnormal: number }> = {}
        allResults.forEach((r: any) => {
            const name = r.examName || 'Otros'
            if (!groups[name]) groups[name] = { total: 0, abnormal: 0 }
            groups[name].total++
            if (r.isAbnormal) groups[name].abnormal++
        })
        return Object.entries(groups).map(([name, { total, abnormal }]) => ({
            name: name.length > 20 ? name.substring(0, 20) + '…' : name,
            fullName: name,
            total, abnormal, normal: total - abnormal,
            pctNormal: Math.round(((total - abnormal) / total) * 100)
        }))
    }, [allResults])

    // Abnormal results for detail
    const abnormalResults = allResults.filter((r: any) => r.isAbnormal)

    // Bar chart data for numeric results
    const barData = numericResults.slice(0, 20).map((r: any) => ({
        name: (r.parameter || '').length > 12 ? (r.parameter || '').slice(0, 12) + '…' : r.parameter,
        value: r.numValue,
        min: r.refMin,
        max: r.refMax,
        isAbnormal: r.isAbnormal,
    }))

    // Pie chart data
    const pieData = [
        { name: 'Normal', value: normalCount, fill: '#10b981' },
        { name: 'Alterado', value: abnormalCount, fill: '#f59e0b' },
    ]

    const COLORS_BAR = barData.map((d: any) => d.isAbnormal ? '#ef4444' : '#10b981')

    return (
        <div className="space-y-5">
            {/* KPI Header */}
            <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-black text-base">Análisis Clínico de Laboratorio</p>
                        <p className="text-emerald-200 text-xs">{data.patientInfo?.name} — {data.patientInfo?.registrationDate || ''}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Exámenes', count: data.exams?.length || 0, color: 'bg-white/10 text-white' },
                        { label: 'Parámetros', count: totalParams, color: 'bg-cyan-500/20 text-cyan-200' },
                        { label: 'Normales', count: normalCount, color: 'bg-emerald-500/20 text-emerald-200' },
                        { label: 'Alterados', count: abnormalCount, color: 'bg-amber-500/20 text-amber-200' },
                    ].map(({ label, count, color }) => (
                        <div key={label} className={`p-3 rounded-xl ${color} text-center`}>
                            <p className="text-3xl font-black">{count}</p>
                            <p className="text-xs font-bold opacity-80">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Distribution Overview: Pie + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-emerald-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Distribución Global</p>
                    </div>
                    <div className="h-[220px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                                    paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}>
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-slate-600 font-medium">Normal ({normalCount})</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-slate-600 font-medium">Alterado ({abnormalCount})</span></div>
                    </div>
                </div>

                {/* Radar by Exam Group */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">% Normal por Examen</p>
                    </div>
                    <div className="h-[220px]">
                        <ResponsiveContainer>
                            <RadarChart data={examGroups}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="% Normal" dataKey="pctNormal" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                <Tooltip formatter={(v: number) => `${v}%`} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bar Chart — Values vs Reference */}
            {barData.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Valores vs Rango de Referencia</p>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer>
                            <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 10 }} />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                                <Tooltip content={({ active, payload }) => {
                                    if (!active || !payload?.[0]) return null
                                    const d = payload[0].payload
                                    return (
                                        <div className="bg-white p-3 rounded-xl shadow-lg border text-xs">
                                            <p className="font-bold text-slate-800">{d.name}</p>
                                            <p>Valor: <span className="font-black">{d.value}</span></p>
                                            <p className="text-slate-400">Ref: {d.min} – {d.max}</p>
                                        </div>
                                    )
                                }} />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                                    {barData.map((_, i) => <Cell key={i} fill={COLORS_BAR[i]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Animated Value Bars for ALL numeric results */}
            {numericResults.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Posición dentro del Rango</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {numericResults.slice(0, 30).map((r: any, i: number) => {
                            const rangeExtMin = r.refMin * 0.7
                            const rangeExtMax = r.refMax * 1.3
                            const totalRange = rangeExtMax - rangeExtMin
                            const minPct = ((r.refMin - rangeExtMin) / totalRange) * 100
                            const maxPct = ((r.refMax - rangeExtMin) / totalRange) * 100
                            const valPct = Math.max(2, Math.min(98, ((r.numValue - rangeExtMin) / totalRange) * 100))
                            const isHigh = r.numValue > r.refMax
                            const isLow = r.numValue < r.refMin
                            const isNorm = !isHigh && !isLow

                            return (
                                <div key={i} className={`p-3 rounded-xl border ${isNorm ? 'border-slate-100 bg-white' : isHigh ? 'border-red-100 bg-red-50' : 'border-blue-100 bg-blue-50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-slate-700 truncate max-w-[60%]">{r.parameter}</span>
                                        <div className="text-right">
                                            <span className={`text-sm font-black tabular-nums ${isNorm ? 'text-emerald-700' : isHigh ? 'text-red-700' : 'text-blue-700'}`}>{r.numValue}</span>
                                            <span className="text-[9px] text-slate-400 ml-1">{r.unit}</span>
                                        </div>
                                    </div>
                                    <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="absolute top-0 h-full bg-emerald-100 rounded-full"
                                            style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
                                        <motion.div className={`absolute top-0.5 bottom-0.5 w-2 rounded-full shadow-sm ${isNorm ? 'bg-emerald-500' : isHigh ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ left: `calc(${valPct}% - 4px)` }}
                                            initial={{ left: `calc(${minPct}% - 4px)`, opacity: 0 }}
                                            animate={{ left: `calc(${valPct}% - 4px)`, opacity: 1 }}
                                            transition={{ delay: i * 0.03, duration: 0.7, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-medium">
                                        <span>{r.refMin}</span>
                                        <span className={`font-bold ${isNorm ? 'text-emerald-600' : isHigh ? 'text-red-600' : 'text-blue-600'}`}>
                                            {isNorm ? '✓ Normal' : isHigh ? '↑ Elevado' : '↓ Bajo'}
                                        </span>
                                        <span>{r.refMax}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Abnormal Detail */}
            {abnormalResults.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <p className="text-xs font-black uppercase tracking-widest text-amber-700">Parámetros Fuera de Rango — Detalle</p>
                    </div>
                    <div className="space-y-2">
                        {abnormalResults.map((r: any, i: number) => (
                            <motion.div key={i}
                                initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-amber-50 border-amber-200">
                                <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{r.parameter}</p>
                                    <p className="text-[10px] text-slate-400">{r.examName}</p>
                                </div>
                                <span className="text-sm font-black tabular-nums text-amber-700">{r.value} {r.unit}</span>
                                {r.referenceValue && <span className="text-[10px] text-slate-400 hidden sm:block">Ref: {r.referenceValue}</span>}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══ CLINICAL RISK PROFILES ══ */}
            {(() => {
                // Compute risk profiles from abnormal results
                const riskAreas: Record<string, { params: any[]; area: string }> = {}
                abnormalResults.forEach((r: any) => {
                    const area = getClinicalArea(r.parameter || '')
                    if (area === 'otro') return
                    if (!riskAreas[area]) riskAreas[area] = { params: [], area }
                    riskAreas[area].params.push(r)
                })
                const activeRisks = Object.values(riskAreas).filter(r => r.params.length > 0)
                if (activeRisks.length === 0) return null
                return (
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-purple-600" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Perfil de Riesgo Clínico</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {activeRisks.map(({ params, area }) => {
                                const info = AREA_LABELS[area]
                                if (!info) return null
                                return (
                                    <div key={area} className={`p-4 rounded-xl border ${info.border} ${info.bg}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{info.icon}</span>
                                            <p className={`text-xs font-black ${info.text}`}>{info.name}</p>
                                        </div>
                                        <p className="text-2xl font-black text-slate-800 mb-1">{params.length}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">parámetros alterados</p>
                                        <div className="mt-2 space-y-1">
                                            {params.slice(0, 3).map((p: any, i: number) => (
                                                <p key={i} className="text-[10px] text-slate-600 truncate">• {p.parameter}: <span className="font-bold">{p.value} {p.unit}</span></p>
                                            ))}
                                            {params.length > 3 && <p className="text-[10px] text-slate-400">+{params.length - 3} más</p>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })()}

            {/* ══ CLINICAL INTERPRETATIONS PER PARAMETER ══ */}
            {abnormalResults.length > 0 && (() => {
                const withInterpretation = abnormalResults.filter((r: any) => {
                    const val = parseFloat(String(r.value || '').replace(/[<>,]/g, ''))
                    const refStr = String(r.referenceValue || '')
                    const parts = refStr.replace(/–/g, '-').split('-').map((s: string) => parseFloat(s.trim()))
                    const isHigh = parts.length === 2 && !isNaN(val) && !isNaN(parts[1]) ? val > parts[1] : r.isAbnormal
                    return getClinicalInterpretation(r.parameter || '', isHigh) !== null
                })
                if (withInterpretation.length === 0) return null
                return (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-2xl border border-blue-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5 text-blue-600" />
                            <p className="text-xs font-black uppercase tracking-widest text-blue-700">Interpretación Clínica por Parámetro</p>
                            <Badge className="bg-blue-100 text-blue-700 border-0 text-[9px] font-black ml-auto">{withInterpretation.length} hallazgos</Badge>
                        </div>
                        <div className="space-y-3">
                            {withInterpretation.map((r: any, i: number) => {
                                const val = parseFloat(String(r.value || '').replace(/[<>,]/g, ''))
                                const refStr = String(r.referenceValue || '')
                                const parts = refStr.replace(/–/g, '-').split('-').map((s: string) => parseFloat(s.trim()))
                                const isHigh = parts.length === 2 && !isNaN(val) && !isNaN(parts[1]) ? val > parts[1] : true
                                const interpretation = getClinicalInterpretation(r.parameter || '', isHigh)
                                const area = getClinicalArea(r.parameter || '')
                                const areaInfo = AREA_LABELS[area]
                                return (
                                    <motion.div key={i}
                                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="p-4 bg-white rounded-xl border border-blue-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {areaInfo && <span className="text-sm">{areaInfo.icon}</span>}
                                                <p className="text-sm font-black text-slate-800">{r.parameter}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-black tabular-nums ${isHigh ? 'text-red-600' : 'text-blue-600'}`}>{r.value} {r.unit}</span>
                                                <Badge className={`border-0 text-[9px] font-black ${isHigh ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{isHigh ? '↑ ALTO' : '↓ BAJO'}</Badge>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {interpretation}
                                        </p>
                                        {r.referenceValue && <p className="text-[10px] text-slate-400 mt-1.5">Ref: {r.referenceValue} {r.unit}</p>}
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                )
            })()}

            {/* ══ PER-EXAM SUMMARY ══ */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Interpretación por Examen</p>
                </div>
                <div className="space-y-3">
                    {examGroups.map((g, i) => {
                        // Find abnormal params with interpretation for this exam
                        const examAbnormals = allResults.filter((r: any) => (r.examName || 'Otros') === g.fullName && r.isAbnormal)
                        return (
                            <div key={i} className={`p-4 bg-white rounded-xl border ${g.abnormal > 0 ? 'border-amber-100' : 'border-emerald-100'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Beaker className="w-4 h-4 text-emerald-500" />
                                        <p className="text-xs font-black text-slate-700">{g.fullName}</p>
                                    </div>
                                    {g.abnormal > 0
                                        ? <Badge className="bg-amber-100 text-amber-700 border-0 text-[9px] font-black">{g.abnormal} alterado{g.abnormal > 1 ? 's' : ''}</Badge>
                                        : <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[9px] font-black">✓ Normal</Badge>}
                                </div>
                                <p className="text-xs text-slate-600 mt-1.5 pl-6 leading-relaxed">
                                    {g.abnormal === 0
                                        ? `Todos los ${g.total} parámetros dentro de rangos de referencia establecidos. Sin hallazgos que ameriten seguimiento.`
                                        : `${g.abnormal} de ${g.total} parámetros fuera de rango.`}
                                </p>
                                {examAbnormals.length > 0 && (
                                    <div className="mt-2 pl-6 space-y-1">
                                        {examAbnormals.slice(0, 4).map((r: any, ri: number) => (
                                            <p key={ri} className="text-[10px] text-amber-700">
                                                • <span className="font-bold">{r.parameter}</span>: {r.value} {r.unit}
                                                {r.referenceValue && <span className="text-slate-400"> (ref: {r.referenceValue})</span>}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Global conclusion */}
                <div className={`mt-4 p-4 rounded-xl border ${abnormalCount === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className={`font-black text-xs uppercase tracking-widest mb-2 ${abnormalCount === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>Conclusión Global</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {abnormalCount === 0
                            ? `Panel completo de ${totalParams} determinaciones analíticas en ${data.exams?.length || 0} exámenes. Todos los parámetros dentro de intervalos de referencia. Sin evidencia de alteraciones metabólicas, hematológicas, hepáticas, renales ni lipídicas que requieran intervención.`
                            : `Estudio de ${totalParams} parámetros distribuidos en ${data.exams?.length || 0} exámenes. Se identificaron ${abnormalCount} resultado${abnormalCount > 1 ? 's' : ''} fuera de los rangos establecidos (${Math.round(abnormalCount / totalParams * 100)}% del panel). Los hallazgos deben correlacionarse con la clínica, antecedentes del paciente y, de ser necesario, repetirse para confirmar tendencias.`}
                    </p>
                </div>
            </div>

            {/* ══ OCCUPATIONAL HEALTH ══ */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Relevancia para Salud Ocupacional</p>
                </div>
                <div className={`p-4 rounded-xl ${abnormalCount === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {abnormalCount === 0
                            ? 'Perfil hematológico y bioquímico dentro de parámetros normales. El trabajador no presenta alteraciones laboratoriales que limiten su actividad laboral actual. Sin restricción laboral de origen metabólico, hematológico, hepático, renal ni lipídico.'
                            : (() => {
                                const areas = new Set(abnormalResults.map((r: any) => getClinicalArea(r.parameter || '')).filter(a => a !== 'otro'))
                                const areaNames = [...areas].map(a => AREA_LABELS[a]?.name || a).join(', ')
                                return `Se identificaron alteraciones en: ${areaNames || 'parámetros laboratoriales'}. Se recomienda: 1) Correlación clínica con sintomatología actual. 2) Control laboratorial de seguimiento en 3-6 meses. 3) Referencia a especialista si los valores persisten o se agravan. 4) Ajuste del programa de vigilancia epidemiológica según hallazgos.`
                            })()}
                    </p>
                </div>
            </div>
        </div>
    )
}

// ──────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────
export default function LaboratorioTab({ pacienteId }: { pacienteId: string }) {
    const { user } = useAuth()
    const { data, loading, reload } = useLaboratorio(pacienteId)
    const [activeView, setActiveView] = useState<'reporte' | 'analisis'>('reporte')
    const upload = useLabUpload(
        pacienteId,
        user?.empresa_id || '',
        user?.id,
        user?.nombre || user?.email,
        user?.rol,
        reload
    )

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-slate-500 text-xs font-medium">Cargando resultados de laboratorio...</p>
        </div>
    )

    // Preview mode (after extraction, before save)
    if (upload.previewData) return (
        <div className="space-y-5">
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Eye className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-emerald-800">Vista Previa — Revisa y Confirma</h3>
                            <p className="text-xs text-emerald-600">{upload.progress}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={upload.cancelPreview}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 border border-red-200 text-red-700 bg-red-50 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                            <X className="w-4 h-4" /> Cancelar
                        </button>
                        <button onClick={upload.confirmSave} disabled={upload.saving}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50">
                            {upload.saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                : <><Save className="w-4 h-4" /> Confirmar y Guardar</>}
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto bg-gradient-to-br from-slate-50 to-slate-100/50 p-2 md:p-6 rounded-2xl border border-slate-200 shadow-inner">
                <div className="w-full min-w-[800px]">
                    <LabReport data={upload.previewData} />
                </div>
            </div>
        </div>
    )

    // No data → empty upload state
    if (!data) return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FlaskConical className="w-8 h-8 text-emerald-300" />
                </div>
                <h3 className="text-slate-800 font-bold text-lg">Sin resultados de laboratorio</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-8">
                    Sube el PDF del reporte de laboratorio y la IA extraerá automáticamente
                    todos los exámenes, parámetros, valores y rangos de referencia.
                </p>

                <input ref={upload.fileInputRef} type="file" accept=".pdf,application/pdf,image/*"
                    onChange={upload.onFileSelected} className="hidden" />

                {upload.uploading ? (
                    <div className="max-w-sm mx-auto space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                            <p className="text-sm font-medium text-emerald-800">{upload.progress}</p>
                        </div>
                    </div>
                ) : (
                    <button onClick={upload.triggerUpload}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:scale-[1.02] transition-all">
                        <Upload className="w-5 h-5" />
                        Subir Reporte de Laboratorio
                    </button>
                )}

                {upload.error && (
                    <div className="mt-6 max-w-sm mx-auto flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{upload.error}</p>
                    </div>
                )}

                <p className="text-[10px] text-slate-400 mt-6">
                    Powered by Gemini Pro — Extracción completa multiexamen, con detección de anormales
                </p>
            </CardContent>
        </Card>
    )

    // ── Data loaded → Report + Analytics with toggle ──
    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <FlaskConical className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Laboratorio</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {data.patientInfo?.laboratoryName || 'GP Medical Health'} — {data.patientInfo?.registrationDate || ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Exámenes</p>
                            <p className="text-sm font-bold text-emerald-700">{data.exams?.length || 0}</p>
                        </div>
                        <input ref={upload.fileInputRef} type="file" accept=".pdf,application/pdf,image/*"
                            onChange={upload.onFileSelected} className="hidden" />
                        <button onClick={upload.triggerUpload} disabled={upload.uploading}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors disabled:opacity-50">
                            {upload.uploading
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                                : <><RefreshCw className="w-3.5 h-3.5" /> Actualizar Laboratorio</>}
                        </button>
                    </div>
                </div>

                {upload.uploading && (
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                        <p className="text-sm font-medium text-emerald-700">{upload.progress}</p>
                    </div>
                )}
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl w-fit">
                <button onClick={() => setActiveView('reporte')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeView === 'reporte' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                    <FlaskConical className="w-4 h-4" />
                    Reporte Extraído
                </button>
                <button onClick={() => setActiveView('analisis')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeView === 'analisis' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                    <Activity className="w-4 h-4" />
                    Análisis Clínico
                </button>
            </div>

            {/* Sections */}
            {activeView === 'reporte' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-xs text-slate-400 font-medium mb-3 ml-1">Réplica digital completa del reporte original de laboratorio</p>
                    <div className="overflow-x-auto bg-gradient-to-br from-slate-50 to-slate-100/50 p-2 md:p-6 rounded-2xl border border-slate-200 shadow-inner">
                        <div className="w-full min-w-[800px]">
                            <LabReport data={data} />
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'analisis' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <LabAnalytics data={data} />
                </div>
            )}

            {/* Attached Documents */}
            <DocumentosAdjuntos
                pacienteId={pacienteId}
                categoria="laboratorio"
                titulo="Reporte Original"
                collapsedByDefault={false}
            />
        </div>
    )
}
