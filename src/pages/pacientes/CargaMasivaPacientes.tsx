/**
 * CargaMasivaPacientes - Importación masiva estilo Install Wizard
 * 
 * Pasos:
 * 1. Seleccionar archivo (CSV o Excel)
 * 2. Mapeo de columnas
 * 3. Vista previa y validación
 * 4. Confirmación e importación
 */
import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, FileSpreadsheet, ArrowLeft, ArrowRight, X,
    CheckCircle, AlertTriangle, XCircle, Download, Loader2,
    Table, Eye, Save, FileText, RefreshCw, Sparkles, FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

// =============================================
// TYPES
// =============================================
interface BulkProps {
    onComplete: (patients: any[]) => Promise<void>
    onCancel: () => void
    empresaId?: string
}

interface CsvRow {
    [key: string]: string
}

interface ColumnMapping {
    csvColumn: string
    dbField: string
}

interface ValidationResult {
    valid: boolean
    errors: string[]
}

// Campos esperados por la BD
const DB_FIELDS = [
    { key: 'nombre', label: 'Nombre(s)', required: true },
    { key: 'apellido_paterno', label: 'Apellido Paterno', required: true },
    { key: 'apellido_materno', label: 'Apellido Materno', required: false },
    { key: 'curp', label: 'CURP', required: false },
    { key: 'rfc', label: 'RFC', required: false },
    { key: 'nss', label: 'NSS', required: false },
    { key: 'fecha_nacimiento', label: 'Fecha Nacimiento', required: false },
    { key: 'genero', label: 'Género', required: false },
    { key: 'estado_civil', label: 'Estado Civil', required: false },
    { key: 'numero_empleado', label: 'No. Empleado', required: false },
    { key: 'puesto', label: 'Puesto', required: false },
    { key: 'area', label: 'Área', required: false },
    { key: 'departamento', label: 'Departamento', required: false },
    { key: 'turno', label: 'Turno', required: false },
    { key: 'fecha_ingreso', label: 'Fecha Ingreso', required: false },
    { key: 'tipo_contrato', label: 'Tipo Contrato', required: false },
    { key: 'tipo_sangre', label: 'Tipo Sangre', required: false },
    { key: 'alergias', label: 'Alergias', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'telefono', label: 'Teléfono', required: false },
    { key: 'contacto_emergencia_nombre', label: 'Contacto Emergencia', required: false },
    { key: 'contacto_emergencia_parentesco', label: 'Parentesco Emergencia', required: false },
    { key: 'contacto_emergencia_telefono', label: 'Tel. Emergencia', required: false },
]

// =============================================
// HELPERS
// =============================================
function parseCSV(text: string): { headers: string[]; rows: CsvRow[] } {
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    if (lines.length < 2) return { headers: [], rows: [] }

    // Detect delimiter
    const firstLine = lines[0]
    const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ','

    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''))
    const rows: CsvRow[] = []

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''))
        const row: CsvRow = {}
        headers.forEach((h, idx) => {
            row[h] = cols[idx] || ''
        })
        rows.push(row)
    }

    return { headers, rows }
}

function autoMapColumns(csvHeaders: string[]): ColumnMapping[] {
    const mappings: ColumnMapping[] = []
    const patterns: Record<string, RegExp[]> = {
        nombre: [/^nombre/i, /^first.*name/i, /^nombre\(?s?\)?/i],
        apellido_paterno: [/^apellido.*paterno/i, /^ap.*paterno/i, /^last.*name/i, /^apellido$/i],
        apellido_materno: [/^apellido.*materno/i, /^ap.*materno/i, /^second.*last/i],
        curp: [/^curp/i],
        rfc: [/^rfc/i],
        nss: [/^nss/i, /^imss/i, /^seguro.*social/i],
        fecha_nacimiento: [/^fecha.*nac/i, /^nacimiento/i, /^birth/i, /^f.*nac/i],
        genero: [/^g[eé]nero/i, /^sexo/i, /^gender/i],
        estado_civil: [/^estado.*civil/i, /^e.*civil/i],
        numero_empleado: [/^n[uú]mero.*empl/i, /^no.*empl/i, /^#.*empl/i, /^employee/i],
        puesto: [/^puesto/i, /^cargo/i, /^position/i, /^job/i],
        area: [/^[aá]rea/i],
        departamento: [/^departamento/i, /^depto/i, /^dept/i],
        turno: [/^turno/i, /^shift/i],
        fecha_ingreso: [/^fecha.*ingreso/i, /^ingreso/i, /^hire/i],
        tipo_contrato: [/^tipo.*contrato/i, /^contrato/i],
        tipo_sangre: [/^tipo.*sangre/i, /^sangre/i, /^blood/i],
        alergias: [/^alergia/i, /^allerg/i],
        email: [/^e?-?mail/i, /^correo/i],
        telefono: [/^tel[eé]fono/i, /^tel$/i, /^phone/i, /^celular/i],
        contacto_emergencia_nombre: [/^contacto.*emerg/i, /^emergencia.*nombre/i],
        contacto_emergencia_parentesco: [/^parentesco/i],
        contacto_emergencia_telefono: [/^tel.*emerg/i],
    }

    for (const csvHeader of csvHeaders) {
        let matched = false
        for (const [dbField, regexps] of Object.entries(patterns)) {
            if (regexps.some(r => r.test(csvHeader))) {
                if (!mappings.find(m => m.dbField === dbField)) {
                    mappings.push({ csvColumn: csvHeader, dbField })
                    matched = true
                    break
                }
            }
        }
        if (!matched) {
            mappings.push({ csvColumn: csvHeader, dbField: '' })
        }
    }

    return mappings
}

function validateRow(row: CsvRow, mappings: ColumnMapping[]): ValidationResult {
    const errors: string[] = []
    const requiredFields = DB_FIELDS.filter(f => f.required)

    for (const field of requiredFields) {
        const mapping = mappings.find(m => m.dbField === field.key)
        if (!mapping) {
            errors.push(`Campo requerido "${field.label}" no está mapeado`)
        } else {
            const value = row[mapping.csvColumn]?.trim()
            if (!value) {
                errors.push(`"${field.label}" está vacío`)
            }
        }
    }

    // Validar CURP si existe
    const curpMapping = mappings.find(m => m.dbField === 'curp')
    if (curpMapping) {
        const curp = row[curpMapping.csvColumn]?.trim()
        if (curp && curp.length !== 18) {
            errors.push(`CURP debe tener 18 caracteres (tiene ${curp.length})`)
        }
    }

    return { valid: errors.length === 0, errors }
}

function mapRowToPatient(row: CsvRow, mappings: ColumnMapping[], empresaId?: string): any {
    const patient: any = { estatus: 'activo' }
    if (empresaId) patient.empresa_id = empresaId

    for (const mapping of mappings) {
        if (mapping.dbField && row[mapping.csvColumn]) {
            patient[mapping.dbField] = row[mapping.csvColumn].trim()
        }
    }

    return patient
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function CargaMasivaPacientes({ onComplete, onCancel, empresaId }: BulkProps) {
    const [step, setStep] = useState(1)
    const [file, setFile] = useState<File | null>(null)
    const [csvHeaders, setCsvHeaders] = useState<string[]>([])
    const [csvRows, setCsvRows] = useState<CsvRow[]>([])
    const [mappings, setMappings] = useState<ColumnMapping[]>([])
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
    const [importing, setImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setFile(selectedFile)

        try {
            const text = await selectedFile.text()
            const { headers, rows } = parseCSV(text)

            if (headers.length === 0 || rows.length === 0) {
                toast.error('El archivo no contiene datos válidos')
                return
            }

            setCsvHeaders(headers)
            setCsvRows(rows)

            // Auto-map columns
            const autoMappings = autoMapColumns(headers)
            setMappings(autoMappings)

            toast.success(`${rows.length} filas detectadas con ${headers.length} columnas`)
            setStep(2)
        } catch {
            toast.error('Error al leer el archivo')
        }
    }

    const handleMappingChange = (csvColumn: string, dbField: string) => {
        setMappings(prev =>
            prev.map(m =>
                m.csvColumn === csvColumn ? { ...m, dbField } : m
            )
        )
    }

    const handleValidate = () => {
        const results = csvRows.map(row => validateRow(row, mappings))
        setValidationResults(results)
        setStep(3)
    }

    const handleImport = async () => {
        setImporting(true)
        setImportProgress(0)

        const validRows = csvRows.filter((_, idx) => validationResults[idx]?.valid !== false)
        const patients = validRows.map(row => mapRowToPatient(row, mappings, empresaId))

        try {
            await onComplete(patients)
            setImportProgress(100)
        } catch {
            toast.error('Error durante la importación')
        } finally {
            setImporting(false)
        }
    }

    const downloadTemplate = () => {
        const headers = DB_FIELDS.map(f => f.label).join(',')
        const example = DB_FIELDS.map(f => {
            const examples: Record<string, string> = {
                nombre: 'Juan Carlos', apellido_paterno: 'Hernández', apellido_materno: 'García',
                curp: 'HEGJ950101HDFRRN09', rfc: 'HEGJ950101', nss: '12345678901',
                fecha_nacimiento: '1995-01-01', genero: 'masculino', estado_civil: 'Soltero(a)',
                numero_empleado: 'EMP-001', puesto: 'Operador', area: 'Producción',
                departamento: 'Turno A', turno: 'Matutino', fecha_ingreso: '2023-01-15',
                tipo_contrato: 'Indefinido', tipo_sangre: 'O+', alergias: 'Ninguna',
                email: 'juan@empresa.com', telefono: '5512345678',
                contacto_emergencia_nombre: 'María López', contacto_emergencia_parentesco: 'Esposa',
                contacto_emergencia_telefono: '5587654321',
            }
            return examples[f.key] || ''
        }).join(',')

        const csv = `${headers}\n${example}`
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'plantilla_pacientes_GPMedical.csv'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Plantilla descargada')
    }

    const validCount = validationResults.filter(r => r.valid).length
    const errorCount = validationResults.filter(r => !r.valid).length

    return (
        <div className="min-h-[80vh] flex flex-col">
            {/* ── HEADER ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 p-6 mb-6 border border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.2),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.1),transparent_50%)]" />

                <div className="relative z-10 flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
                            <FileSpreadsheet className="w-7 h-7 text-indigo-400" />
                            Carga Masiva de Pacientes
                        </h1>
                        <p className="text-sm text-slate-400">Importa pacientes desde un archivo CSV o Excel</p>
                    </div>
                    <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Steps */}
                <div className="relative z-10 flex items-center gap-2">
                    {[
                        { id: 1, label: 'Seleccionar Archivo' },
                        { id: 2, label: 'Mapear Columnas' },
                        { id: 3, label: 'Validar Datos' },
                        { id: 4, label: 'Importar' },
                    ].map((s, idx) => (
                        <React.Fragment key={s.id}>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === s.id ? 'bg-white/10 border border-white/20 text-white' :
                                    step > s.id ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                        'bg-white/5 border border-white/5 text-slate-500'
                                }`}>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${step > s.id ? 'bg-emerald-500 text-white' :
                                        step === s.id ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-500'
                                    }`}>
                                    {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                                </div>
                                <span className="text-xs font-bold hidden md:block">{s.label}</span>
                            </div>
                            {idx < 3 && <div className={`h-px flex-1 ${step > s.id ? 'bg-emerald-500/40' : 'bg-white/10'}`} />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ── CONTENT ── */}
            <Card className="flex-1 border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* STEP 1: File Select */}
                            {step === 1 && (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                                        <Upload className="w-12 h-12 text-indigo-500" />
                                    </div>

                                    <h2 className="text-2xl font-black text-slate-800 mb-2">Selecciona tu archivo</h2>
                                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                        Arrastra o selecciona un archivo CSV con los datos de tus pacientes
                                    </p>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative mx-auto max-w-lg p-12 rounded-3xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all group"
                                    >
                                        <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-indigo-400 group-hover:text-indigo-500 transition-colors" />
                                        <p className="font-bold text-indigo-700 mb-1">Haz clic para seleccionar</p>
                                        <p className="text-sm text-indigo-500">CSV, TSV o TXT delimitado</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.tsv,.txt"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </div>

                                    <div className="mt-8">
                                        <Button variant="outline" onClick={downloadTemplate} className="gap-2 rounded-xl">
                                            <FileDown className="w-4 h-4" />
                                            Descargar Plantilla CSV
                                        </Button>
                                    </div>

                                    {file && (
                                        <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="font-medium text-sm">{file.name} ({csvRows.length} filas)</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: Column Mapping */}
                            {step === 2 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                            <Table className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Mapeo de Columnas</h2>
                                            <p className="text-sm text-slate-500">
                                                Asocia cada columna de tu archivo con el campo correspondiente
                                            </p>
                                        </div>
                                        <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-200">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Auto-detectado
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                                        {mappings.map((mapping, idx) => {
                                            const isRequired = DB_FIELDS.find(f => f.key === mapping.dbField)?.required
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${mapping.dbField ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                                                        }`}
                                                >
                                                    {/* CSV Column */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                            <span className="font-mono text-sm font-bold text-slate-700 truncate">{mapping.csvColumn}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 ml-6 truncate">
                                                            Ejemplo: {csvRows[0]?.[mapping.csvColumn] || '—'}
                                                        </p>
                                                    </div>

                                                    {/* Arrow */}
                                                    <ArrowRight className={`w-4 h-4 flex-shrink-0 ${mapping.dbField ? 'text-emerald-500' : 'text-slate-300'}`} />

                                                    {/* DB Field Select */}
                                                    <div className="flex-1">
                                                        <select
                                                            value={mapping.dbField}
                                                            onChange={e => handleMappingChange(mapping.csvColumn, e.target.value)}
                                                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-emerald-500/40"
                                                        >
                                                            <option value="">— No importar —</option>
                                                            {DB_FIELDS.map(f => (
                                                                <option key={f.key} value={f.key}>
                                                                    {f.label} {f.required ? '(requerido)' : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {isRequired && (
                                                        <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 text-[9px]">REQ</Badge>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Validation */}
                            {step === 3 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                                            <Eye className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">Validación de Datos</h2>
                                            <p className="text-sm text-slate-500">{csvRows.length} registros analizados</p>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                                            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                                            <p className="text-2xl font-black text-emerald-700">{validCount}</p>
                                            <p className="text-xs text-emerald-600 font-bold">Válidos</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                                            <XCircle className="w-6 h-6 mx-auto mb-1 text-rose-500" />
                                            <p className="text-2xl font-black text-rose-700">{errorCount}</p>
                                            <p className="text-xs text-rose-600 font-bold">Con errores</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                                            <Table className="w-6 h-6 mx-auto mb-1 text-slate-500" />
                                            <p className="text-2xl font-black text-slate-700">{csvRows.length}</p>
                                            <p className="text-xs text-slate-600 font-bold">Total</p>
                                        </div>
                                    </div>

                                    {/* Table preview */}
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-[50vh]">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 sticky top-0">
                                                <tr>
                                                    <th className="p-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Estado</th>
                                                    <th className="p-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">#</th>
                                                    {mappings.filter(m => m.dbField).slice(0, 5).map(m => (
                                                        <th key={m.dbField} className="p-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                            {DB_FIELDS.find(f => f.key === m.dbField)?.label || m.dbField}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {csvRows.slice(0, 50).map((row, idx) => {
                                                    const result = validationResults[idx]
                                                    return (
                                                        <tr key={idx} className={`${result?.valid ? 'hover:bg-emerald-50/50' : 'bg-rose-50/30 hover:bg-rose-50/50'}`}>
                                                            <td className="p-3">
                                                                {result?.valid ? (
                                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                                ) : (
                                                                    <div className="group relative">
                                                                        <XCircle className="w-4 h-4 text-rose-500" />
                                                                        <div className="absolute left-6 top-0 z-10 hidden group-hover:block bg-rose-900 text-white text-xs p-2 rounded-lg shadow-lg max-w-xs">
                                                                            {result?.errors.join(', ')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-3 text-slate-400 text-xs">{idx + 1}</td>
                                                            {mappings.filter(m => m.dbField).slice(0, 5).map(m => (
                                                                <td key={m.dbField} className="p-3 text-slate-700 truncate max-w-[200px]">
                                                                    {row[m.csvColumn] || '—'}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {csvRows.length > 50 && (
                                        <p className="text-xs text-slate-400 text-center mt-2">
                                            Mostrando 50 de {csvRows.length} filas
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* STEP 4: Import */}
                            {step === 4 && (
                                <div className="text-center py-12">
                                    {importing ? (
                                        <>
                                            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                                                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-800 mb-2">Importando pacientes...</h2>
                                            <p className="text-slate-500">No cierres esta ventana</p>
                                            <div className="max-w-md mx-auto mt-6 h-3 bg-slate-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                                    animate={{ width: `${importProgress}%` }}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                                                <Save className="w-12 h-12 text-emerald-500" />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-800 mb-2">¿Listo para importar?</h2>
                                            <p className="text-slate-500 mb-6">
                                                Se registrarán <span className="font-black text-emerald-600">{validCount}</span> pacientes válidos
                                                {errorCount > 0 && <span className="text-rose-500"> ({errorCount} con errores serán omitidos)</span>}
                                            </p>

                                            <Button
                                                onClick={handleImport}
                                                className="h-12 px-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2 font-black text-sm shadow-xl shadow-emerald-500/30"
                                            >
                                                <Save className="w-5 h-5" />
                                                Importar {validCount} Pacientes
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* ── FOOTER ── */}
            {!importing && (
                <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-2xl shadow-lg border border-slate-100">
                    <Button
                        variant="outline"
                        onClick={step === 1 ? onCancel : () => setStep(step - 1)}
                        className="h-11 px-6 rounded-xl gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {step === 1 ? 'Cancelar' : 'Anterior'}
                    </Button>

                    {step === 2 && (
                        <Button onClick={handleValidate} className="h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white gap-2 font-bold">
                            Validar Datos
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                    {step === 3 && validCount > 0 && (
                        <Button onClick={() => setStep(4)} className="h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white gap-2 font-bold">
                            Continuar a Importación
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
