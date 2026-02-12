/**
 * BulkImportWorkers - Componente de importación masiva de trabajadores
 * 
 * Soporta:
 * - Drag & drop de archivos CSV/Excel (.csv, .xlsx, .xls)
 * - Previsualización de datos antes de importar
 * - Validación de campos obligatorios
 * - Plantilla descargable
 * - Indicador de progreso
 */

import React, { useState, useCallback, useRef } from 'react'
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X, Loader2, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dataService } from '@/services/dataService'
import toast from 'react-hot-toast'

interface BulkImportProps {
    empresaId: string
    sedeId?: string
    onComplete: (count: number) => void
    onCancel: () => void
}

interface ParsedRow {
    nombre: string
    apellido_paterno: string
    apellido_materno?: string
    curp?: string
    nss?: string
    rfc?: string
    email?: string
    puesto?: string
    area?: string
    departamento?: string
    turno?: string
    fecha_nacimiento?: string
    fecha_ingreso?: string
    genero?: string
    telefono?: string
    numero_empleado?: string
    // Validation
    isValid: boolean
    errors: string[]
}

const REQUIRED_COLUMNS = ['nombre', 'apellido_paterno', 'puesto']
const ALL_COLUMNS = [
    'nombre', 'apellido_paterno', 'apellido_materno', 'curp', 'nss', 'rfc',
    'email', 'puesto', 'area', 'departamento', 'turno', 'fecha_nacimiento',
    'fecha_ingreso', 'genero', 'telefono', 'numero_empleado'
]

// Column name aliases for auto-mapping
const COLUMN_ALIASES: Record<string, string> = {
    'nombre': 'nombre',
    'nombres': 'nombre',
    'name': 'nombre',
    'primer_nombre': 'nombre',
    'apellido_paterno': 'apellido_paterno',
    'apellido paterno': 'apellido_paterno',
    'paterno': 'apellido_paterno',
    'apellido_materno': 'apellido_materno',
    'apellido materno': 'apellido_materno',
    'materno': 'apellido_materno',
    'curp': 'curp',
    'nss': 'nss',
    'numero_seguro': 'nss',
    'rfc': 'rfc',
    'email': 'email',
    'correo': 'email',
    'correo_electronico': 'email',
    'puesto': 'puesto',
    'puesto_trabajo': 'puesto',
    'cargo': 'puesto',
    'area': 'area',
    'área': 'area',
    'departamento': 'departamento',
    'depto': 'departamento',
    'turno': 'turno',
    'fecha_nacimiento': 'fecha_nacimiento',
    'nacimiento': 'fecha_nacimiento',
    'fecha_ingreso': 'fecha_ingreso',
    'ingreso': 'fecha_ingreso',
    'genero': 'genero',
    'género': 'genero',
    'sexo': 'genero',
    'telefono': 'telefono',
    'teléfono': 'telefono',
    'celular': 'telefono',
    'numero_empleado': 'numero_empleado',
    'no_empleado': 'numero_empleado',
    'num_empleado': 'numero_empleado',
}

function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }
    result.push(current.trim())
    return result
}

function mapColumnName(raw: string): string | null {
    const normalized = raw.toLowerCase().trim().replace(/\s+/g, '_')
    return COLUMN_ALIASES[normalized] || (ALL_COLUMNS.includes(normalized) ? normalized : null)
}

function validateRow(row: Record<string, string>): ParsedRow {
    const errors: string[] = []

    if (!row.nombre?.trim()) errors.push('Falta nombre')
    if (!row.apellido_paterno?.trim()) errors.push('Falta apellido paterno')
    if (!row.puesto?.trim()) errors.push('Falta puesto')

    if (row.curp && row.curp.length !== 18) errors.push('CURP inválido (debe tener 18 caracteres)')
    if (row.email && !row.email.includes('@')) errors.push('Email inválido')

    return {
        nombre: row.nombre?.trim() || '',
        apellido_paterno: row.apellido_paterno?.trim() || '',
        apellido_materno: row.apellido_materno?.trim(),
        curp: row.curp?.trim()?.toUpperCase(),
        nss: row.nss?.trim(),
        rfc: row.rfc?.trim()?.toUpperCase(),
        email: row.email?.trim(),
        puesto: row.puesto?.trim() || '',
        area: row.area?.trim(),
        departamento: row.departamento?.trim(),
        turno: row.turno?.trim(),
        fecha_nacimiento: row.fecha_nacimiento?.trim(),
        fecha_ingreso: row.fecha_ingreso?.trim(),
        genero: row.genero?.trim(),
        telefono: row.telefono?.trim(),
        numero_empleado: row.numero_empleado?.trim(),
        isValid: errors.length === 0,
        errors
    }
}

export function BulkImportWorkers({ empresaId, sedeId, onComplete, onCancel }: BulkImportProps) {
    const [parsedData, setParsedData] = useState<ParsedRow[]>([])
    const [importing, setImporting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [dragOver, setDragOver] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const parseFile = useCallback(async (file: File) => {
        setFileName(file.name)
        const ext = file.name.split('.').pop()?.toLowerCase()

        if (ext === 'csv') {
            const text = await file.text()
            const lines = text.split(/\r?\n/).filter(l => l.trim())
            if (lines.length < 2) {
                toast.error('El archivo está vacío o solo tiene encabezados')
                return
            }

            const headerRaw = parseCSVLine(lines[0])
            const columnMap = headerRaw.map(mapColumnName)

            const rows: ParsedRow[] = []
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i])
                const rowObj: Record<string, string> = {}
                columnMap.forEach((col, idx) => {
                    if (col && values[idx]) rowObj[col] = values[idx]
                })
                if (Object.keys(rowObj).length > 0) {
                    rows.push(validateRow(rowObj))
                }
            }
            setParsedData(rows)
        } else if (ext === 'xlsx' || ext === 'xls') {
            try {
                const XLSX = await import('xlsx')
                const data = await file.arrayBuffer()
                const workbook = XLSX.read(data, { type: 'array' })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { raw: false })

                const rows: ParsedRow[] = jsonData.map(row => {
                    const mapped: Record<string, string> = {}
                    Object.entries(row).forEach(([key, val]) => {
                        const col = mapColumnName(key)
                        if (col) mapped[col] = String(val)
                    })
                    return validateRow(mapped)
                })
                setParsedData(rows)
            } catch {
                toast.error('Error al leer archivo Excel. Verifica que el formato sea correcto.')
            }
        } else {
            toast.error('Formato no soportado. Use CSV o Excel (.xlsx, .xls)')
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) parseFile(file)
    }, [parseFile])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) parseFile(file)
    }, [parseFile])

    const downloadTemplate = () => {
        const headers = ALL_COLUMNS.join(',')
        const example = 'Juan,García,López,GAJL900101HJCRRN09,12345678901,GAJL900101ABC,juan@empresa.com,Operador,Producción,Embarques,Matutino,1990-01-01,2020-06-15,Masculino,3331234567,EMP001'
        const csv = `${headers}\n${example}`
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'plantilla_trabajadores_gpmedical.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleImport = async () => {
        const validRows = parsedData.filter(r => r.isValid)
        if (validRows.length === 0) {
            toast.error('No hay filas válidas para importar')
            return
        }

        setImporting(true)
        setProgress(0)
        let success = 0
        let failed = 0

        for (let i = 0; i < validRows.length; i++) {
            try {
                const row = validRows[i]
                await dataService.pacientes.create({
                    empresa_id: empresaId,
                    sede_id: sedeId,
                    nombre: row.nombre,
                    apellido_paterno: row.apellido_paterno,
                    apellido_materno: row.apellido_materno || '',
                    curp: row.curp,
                    nss: row.nss,
                    rfc: row.rfc,
                    email: row.email,
                    puesto: row.puesto,
                    area: row.area,
                    departamento: row.departamento,
                    turno: (row.turno as any) || 'Matutino',
                    fecha_nacimiento: row.fecha_nacimiento,
                    fecha_ingreso: row.fecha_ingreso,
                    genero: row.genero,
                    telefono: row.telefono,
                    numero_empleado: row.numero_empleado,
                    estatus: 'activo'
                })
                success++
            } catch (err) {
                console.error(`Error importing row ${i}:`, err)
                failed++
            }
            setProgress(Math.round(((i + 1) / validRows.length) * 100))
        }

        setImporting(false)
        setImportResult({ success, failed })

        if (success > 0) {
            toast.success(`✅ ${success} trabajadores importados correctamente`)
        }
        if (failed > 0) {
            toast.error(`⚠️ ${failed} filas no se pudieron importar`)
        }

        onComplete(success)
    }

    const validCount = parsedData.filter(r => r.isValid).length
    const invalidCount = parsedData.filter(r => !r.isValid).length

    return (
        <div className="space-y-6">
            {/* Template Download */}
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-800">Plantilla de importación</p>
                    <p className="text-xs text-emerald-600">Descarga la plantilla CSV con las columnas esperadas</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                </Button>
            </div>

            {/* Drop Zone */}
            {parsedData.length === 0 && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300
                        ${dragOver
                            ? 'border-emerald-500 bg-emerald-50 scale-[1.02]'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }
                    `}
                >
                    <Upload className={`h-12 w-12 mx-auto mb-4 ${dragOver ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <p className="text-lg font-bold text-slate-700 mb-1">
                        {dragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
                    </p>
                    <p className="text-sm text-slate-400 mb-4">o haz clic para seleccionar</p>
                    <p className="text-xs text-slate-400">Formatos soportados: .csv, .xlsx, .xls</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            )}

            {/* Preview Table */}
            {parsedData.length > 0 && !importResult && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-bold text-slate-700">{fileName}</span>
                            </div>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded-full font-medium">
                                {parsedData.length} filas
                            </span>
                        </div>
                        <button
                            onClick={() => { setParsedData([]); setFileName(null) }}
                            className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1"
                        >
                            <X className="h-4 w-4" /> Cambiar archivo
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <div>
                                <p className="text-lg font-black text-emerald-800">{validCount}</p>
                                <p className="text-xs text-emerald-600">Filas válidas</p>
                            </div>
                        </div>
                        {invalidCount > 0 && (
                            <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
                                <AlertCircle className="h-5 w-5 text-rose-600" />
                                <div>
                                    <p className="text-lg font-black text-rose-800">{invalidCount}</p>
                                    <p className="text-xs text-rose-600">Con errores</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview of first 5 rows */}
                    <div className="border rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="text-left p-3 font-bold text-slate-600">Estado</th>
                                        <th className="text-left p-3 font-bold text-slate-600">Nombre</th>
                                        <th className="text-left p-3 font-bold text-slate-600">Apellido P.</th>
                                        <th className="text-left p-3 font-bold text-slate-600">Puesto</th>
                                        <th className="text-left p-3 font-bold text-slate-600">CURP</th>
                                        <th className="text-left p-3 font-bold text-slate-600">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.slice(0, 8).map((row, i) => (
                                        <tr key={i} className={`border-b last:border-0 ${!row.isValid ? 'bg-rose-50/50' : ''}`}>
                                            <td className="p-3">
                                                {row.isValid
                                                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    : <span className="text-xs text-rose-600">{row.errors.join(', ')}</span>
                                                }
                                            </td>
                                            <td className="p-3 font-medium">{row.nombre || '—'}</td>
                                            <td className="p-3">{row.apellido_paterno || '—'}</td>
                                            <td className="p-3">{row.puesto || '—'}</td>
                                            <td className="p-3 font-mono text-xs">{row.curp || '—'}</td>
                                            <td className="p-3">{row.email || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {parsedData.length > 8 && (
                            <div className="p-2 bg-slate-50 text-center text-xs text-slate-400">
                                ... y {parsedData.length - 8} filas más
                            </div>
                        )}
                    </div>

                    {/* Import Progress */}
                    {importing && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                                <span className="text-sm font-bold text-slate-700">Importando... {progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {!importing && (
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl">
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={validCount === 0}
                                className="flex-1 btn-premium-primary rounded-xl h-12 text-base"
                            >
                                <Users className="h-5 w-5 mr-2" />
                                Importar {validCount} trabajadores
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Import Result */}
            {importResult && (
                <div className="text-center p-8 bg-emerald-50 rounded-3xl border border-emerald-200">
                    <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-emerald-800 mb-2">
                        ¡Importación completada!
                    </h3>
                    <p className="text-emerald-600">
                        {importResult.success} trabajadores importados correctamente
                        {importResult.failed > 0 && ` • ${importResult.failed} con errores`}
                    </p>
                </div>
            )}
        </div>
    )
}
