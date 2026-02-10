// =====================================================
// ExcelImporter - Componente reutilizable
// =====================================================
// Importa datos desde archivos Excel/CSV con:
// - Drag & drop de archivos
// - Mapeo visual de columnas
// - Preview de datos antes de confirmar
// - Validación de campos requeridos
// =====================================================

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Check, X, ChevronDown, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos
interface ColumnMapping {
    excelHeader: string;
    targetField: string;
    sample?: string;
}

interface TargetField {
    campo: string;
    nombre: string;
    obligatorio: boolean;
}

interface ExcelImporterProps {
    titulo?: string;
    descripcion?: string;
    camposDestino: TargetField[];
    onImport: (data: Record<string, unknown>[]) => Promise<{ insertados: number; errores: string[] }>;
    onCancel?: () => void;
    maxRows?: number;
}

// Parser simple de CSV
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
        // Handle quoted fields with commas
        const cells: string[] = [];
        let current = '';
        let inQuotes = false;
        for (const char of line) {
            if (char === '"') { inQuotes = !inQuotes; continue; }
            if (char === ',' && !inQuotes) { cells.push(current.trim()); current = ''; continue; }
            current += char;
        }
        cells.push(current.trim());
        return cells;
    });

    return { headers, rows };
}

// Parser de Excel usando FileReader (sin lib externa)
async function parseExcelFile(file: File): Promise<{ headers: string[]; rows: string[][] }> {
    const text = await file.text();

    // Si es CSV o TSV, usar parser simple
    if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
        const separator = file.name.endsWith('.tsv') ? '\t' : ',';
        const lines = text.split('\n').filter(l => l.trim());
        const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
        const rows = lines.slice(1).map(l =>
            l.split(separator).map(c => c.trim().replace(/"/g, ''))
        );
        return { headers, rows };
    }

    // Para .xlsx, intentar usar la lib xlsx si está disponible
    try {
        const XLSX = await import('xlsx');
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1 }) as unknown as string[][];

        if (jsonData.length === 0) return { headers: [], rows: [] };
        const headers = jsonData[0].map(h => String(h || '').trim());
        const rows = jsonData.slice(1).map(r =>
            headers.map((_, i) => String(r[i] ?? '').trim())
        );
        return { headers, rows };
    } catch {
        // Fallback: inform user to use CSV
        throw new Error('Para archivos .xlsx, instala la dependencia xlsx (npm i xlsx). Mientras, puedes usar .csv');
    }
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function ExcelImporter({
    titulo = 'Importar Datos',
    descripcion = 'Sube un archivo Excel (.xlsx) o CSV (.csv) para importar datos.',
    camposDestino,
    onImport,
    onCancel,
    maxRows = 500,
}: ExcelImporterProps) {
    // State
    const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'done'>('upload');
    const [fileName, setFileName] = useState('');
    const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
    const [excelRows, setExcelRows] = useState<string[][]>([]);
    const [mappings, setMappings] = useState<ColumnMapping[]>([]);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ insertados: number; errores: string[] } | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFile = useCallback(async (file: File) => {
        setParseError(null);
        setFileName(file.name);

        try {
            const { headers, rows } = await parseExcelFile(file);

            if (headers.length === 0) {
                setParseError('El archivo está vacío o no tiene encabezados.');
                return;
            }

            const limitedRows = rows.slice(0, maxRows);
            setExcelHeaders(headers);
            setExcelRows(limitedRows);

            // Auto-map columns by matching names
            const autoMappings: ColumnMapping[] = headers.map(header => {
                const normalized = header.toLowerCase().replace(/[^a-záéíóúñ]/gi, '');
                const match = camposDestino.find(c => {
                    const normCampo = c.nombre.toLowerCase().replace(/[^a-záéíóúñ]/gi, '');
                    const normField = c.campo.toLowerCase().replace(/_/g, '');
                    return normalized.includes(normCampo) || normalized.includes(normField)
                        || normCampo.includes(normalized) || normField.includes(normalized);
                });

                return {
                    excelHeader: header,
                    targetField: match?.campo || '',
                    sample: limitedRows[0]?.[headers.indexOf(header)] || '',
                };
            });

            setMappings(autoMappings);
            setStep('mapping');
        } catch (err) {
            setParseError(err instanceof Error ? err.message : 'Error leyendo archivo');
        }
    }, [camposDestino, maxRows]);

    // Drag & Drop handlers
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
    const handleDragLeave = useCallback(() => setDragOver(false), []);

    // Update mapping
    const updateMapping = useCallback((index: number, targetField: string) => {
        setMappings(prev => prev.map((m, i) =>
            i === index ? { ...m, targetField } : m
        ));
    }, []);

    // Build mapped data
    const getMappedData = useCallback((): Record<string, unknown>[] => {
        return excelRows.map(row => {
            const obj: Record<string, unknown> = {};
            mappings.forEach((mapping, i) => {
                if (mapping.targetField) {
                    obj[mapping.targetField] = row[i] || '';
                }
            });
            return obj;
        });
    }, [excelRows, mappings]);

    // Validate required fields
    const missingRequired = useMemo(() => {
        const mapped = mappings.filter(m => m.targetField).map(m => m.targetField);
        return camposDestino.filter(c => c.obligatorio && !mapped.includes(c.campo));
    }, [mappings, camposDestino]);

    // Execute import
    const handleImport = useCallback(async () => {
        setImporting(true);
        setStep('importing');
        try {
            const data = getMappedData();
            const importResult = await onImport(data);
            setResult(importResult);
            setStep('done');
        } catch (err) {
            setResult({
                insertados: 0,
                errores: [err instanceof Error ? err.message : 'Error en importación'],
            });
            setStep('done');
        } finally {
            setImporting(false);
        }
    }, [getMappedData, onImport]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{titulo}</h3>
                        <p className="text-sm text-white/50">{descripcion}</p>
                    </div>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/50 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
                {['upload', 'mapping', 'preview', 'done'].map((s, i) => (
                    <React.Fragment key={s}>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all
              ${step === s ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' :
                                ['upload', 'mapping', 'preview', 'importing', 'done'].indexOf(step) > i ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-white/30'}`}>
                            {['upload', 'mapping', 'preview', 'importing', 'done'].indexOf(step) > i ? <Check className="w-3 h-3" /> : null}
                            {['Archivo', 'Mapeo', 'Preview', 'Listo'][i]}
                        </div>
                        {i < 3 && <div className="h-px flex-1 bg-white/10" />}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 1: UPLOAD */}
                {step === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => inputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                ${dragOver ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
                        >
                            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-emerald-400' : 'text-white/30'}`} />
                            <p className="text-white/70 font-medium">
                                Arrastra un archivo aquí o <span className="text-emerald-400">haz clic para seleccionar</span>
                            </p>
                            <p className="text-white/40 text-sm mt-2">
                                Formatos: .xlsx, .csv — Máximo {maxRows} filas
                            </p>
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv,.tsv"
                            className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleFile(file);
                            }}
                        />
                        {parseError && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {parseError}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* STEP 2: MAPPING */}
                {step === 'mapping' && (
                    <motion.div
                        key="mapping"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
                            📄 <strong>{fileName}</strong> — {excelRows.length} filas, {excelHeaders.length} columnas
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {mappings.map((mapping, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                    <div className="flex-1">
                                        <div className="text-sm text-white/80 font-medium">{mapping.excelHeader}</div>
                                        <div className="text-xs text-white/40 truncate" title={mapping.sample}>
                                            Ej: {mapping.sample || '(vacío)'}
                                        </div>
                                    </div>
                                    <div className="text-white/30">→</div>
                                    <div className="relative flex-1">
                                        <select
                                            value={mapping.targetField}
                                            onChange={e => updateMapping(i, e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm appearance-none cursor-pointer hover:border-white/20"
                                        >
                                            <option value="">— No importar —</option>
                                            {camposDestino.map(c => (
                                                <option key={c.campo} value={c.campo}>
                                                    {c.nombre} {c.obligatorio ? '★' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-white/30 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {missingRequired.length > 0 && (
                            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-sm">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                Campos obligatorios sin mapear: {missingRequired.map(c => c.nombre).join(', ')}
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => { setStep('upload'); setExcelHeaders([]); setExcelRows([]); }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm transition-all"
                            >
                                ← Cambiar archivo
                            </button>
                            <button
                                onClick={() => setStep('preview')}
                                disabled={missingRequired.length > 0}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" /> Vista previa
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: PREVIEW */}
                {step === 'preview' && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="mb-4 text-sm text-white/60">
                            Se importarán <strong className="text-white">{excelRows.length}</strong> registros. Revisa los primeros 5:
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        {mappings.filter(m => m.targetField).map((m, i) => (
                                            <th key={i} className="text-left px-3 py-2 text-white/60 font-medium">
                                                {camposDestino.find(c => c.campo === m.targetField)?.nombre || m.targetField}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelRows.slice(0, 5).map((row, ri) => (
                                        <tr key={ri} className="border-b border-white/5">
                                            {mappings.filter(m => m.targetField).map((m, ci) => {
                                                const colIdx = mappings.indexOf(m);
                                                return (
                                                    <td key={ci} className="px-3 py-2 text-white/80 whitespace-nowrap">
                                                        {row[colIdx] || '-'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {excelRows.length > 5 && (
                            <div className="text-center text-xs text-white/30 mt-2">
                                ... y {excelRows.length - 5} más
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setStep('mapping')}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm transition-all"
                            >
                                ← Ajustar mapeo
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                {importing ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                Importar {excelRows.length} registros
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: IMPORTING */}
                {step === 'importing' && (
                    <motion.div
                        key="importing"
                        initial={{ opacity: 0. }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-white/60">Importando datos...</p>
                    </motion.div>
                )}

                {/* STEP 5: DONE */}
                {step === 'done' && result && (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8"
                    >
                        {result.errores.length === 0 ? (
                            <>
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h4 className="text-white font-semibold text-lg">¡Importación exitosa!</h4>
                                <p className="text-white/50 mt-1">
                                    Se importaron <strong className="text-white">{result.insertados}</strong> registros correctamente.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-amber-400" />
                                </div>
                                <h4 className="text-white font-semibold text-lg">Importación parcial</h4>
                                <p className="text-white/50 mt-1">
                                    {result.insertados} importados · {result.errores.length} errores
                                </p>
                                <div className="mt-4 text-left max-h-[200px] overflow-y-auto">
                                    {result.errores.map((err, i) => (
                                        <div key={i} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-xs mb-1">
                                            {err}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
