// =====================================================
// PÁGINA: Importar / Exportar — GPMedical ERP Pro
// Importación masiva desde Excel y exportación de datos
// =====================================================

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Download, FileSpreadsheet, Check, X, AlertCircle,
    ArrowRight, FileText, Users, Building2, ClipboardList,
    Loader2, CheckCircle2, XCircle, Eye, Trash2
} from 'lucide-react';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ── Tipos de entidad soportados ──
const ENTIDADES_IMPORT = [
    {
        key: 'trabajadores', label: 'Trabajadores / Pacientes', icon: Users, color: 'emerald',
        campos: ['nombre', 'apellido_paterno', 'apellido_materno', 'curp', 'nss', 'fecha_nacimiento', 'sexo', 'puesto', 'departamento', 'email', 'telefono'],
        tabla: 'pacientes'
    },
    {
        key: 'empresas', label: 'Empresas Clientes', icon: Building2, color: 'blue',
        campos: ['nombre', 'rfc', 'razon_social', 'direccion', 'telefono', 'email', 'contacto_nombre'],
        tabla: 'empresas'
    },
    {
        key: 'puestos', label: 'Puestos de Trabajo', icon: ClipboardList, color: 'purple',
        campos: ['nombre', 'departamento', 'nivel_riesgo', 'descripcion'],
        tabla: 'puestos_trabajo'
    },
    {
        key: 'inventario', label: 'Inventario / Medicamentos', icon: FileText, color: 'amber',
        campos: ['nombre', 'codigo', 'categoria', 'unidad_medida', 'precio_unitario', 'stock_minimo'],
        tabla: 'productos'
    },
];

const ENTIDADES_EXPORT = [
    { key: 'pacientes', label: 'Pacientes', tabla: 'pacientes', icon: Users },
    { key: 'empresas', label: 'Empresas', tabla: 'empresas', icon: Building2 },
    { key: 'citas', label: 'Citas', tabla: 'citas', icon: ClipboardList },
    { key: 'dictamenes', label: 'Dictámenes', tabla: 'dictamenes', icon: FileText },
    { key: 'evidencias', label: 'Evidencias STPS', tabla: 'evidencias_stps', icon: FileSpreadsheet },
    { key: 'desviaciones', label: 'Desviaciones', tabla: 'desviaciones_stps', icon: AlertCircle },
];

interface FilaParseada {
    indice: number;
    datos: Record<string, string>;
    valido: boolean;
    errores: string[];
}

export default function ImportarExportarPage() {
    const [tab, setTab] = useState<'importar' | 'exportar'>('importar');
    const [entidadSeleccionada, setEntidadSeleccionada] = useState(ENTIDADES_IMPORT[0]);
    const [archivo, setArchivo] = useState<File | null>(null);
    const [filasParsed, setFilasParsed] = useState<FilaParseada[]>([]);
    const [columnas, setColumnas] = useState<string[]>([]);
    const [mapeoColumnas, setMapeoColumnas] = useState<Record<string, string>>({});
    const [paso, setPaso] = useState<'seleccion' | 'mapeo' | 'preview' | 'resultado'>('seleccion');
    const [importando, setImportando] = useState(false);
    const [resultadoImport, setResultadoImport] = useState<{ exitosos: number; errores: number; detalles: string[] }>({ exitosos: 0, errores: 0, detalles: [] });
    const [exportando, setExportando] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Parsear CSV/TSV ──
    const parsearArchivo = useCallback(async (file: File) => {
        const texto = await file.text();
        const lineas = texto.split(/\r?\n/).filter(l => l.trim());
        if (lineas.length < 2) {
            toast.error('El archivo debe tener al menos un encabezado y una fila');
            return;
        }

        // Detectar delimitador (tab, comma, semicolon)
        const primeraLinea = lineas[0];
        const delimitador = primeraLinea.includes('\t') ? '\t' : primeraLinea.includes(';') ? ';' : ',';

        const encabezados = primeraLinea.split(delimitador).map(h => h.trim().replace(/^"|"$/g, ''));
        setColumnas(encabezados);

        const filas: FilaParseada[] = [];
        for (let i = 1; i < lineas.length; i++) {
            const valores = lineas[i].split(delimitador).map(v => v.trim().replace(/^"|"$/g, ''));
            const datos: Record<string, string> = {};
            encabezados.forEach((col, idx) => {
                datos[col] = valores[idx] || '';
            });
            filas.push({
                indice: i,
                datos,
                valido: true,
                errores: []
            });
        }

        setFilasParsed(filas);

        // Auto-mapear columnas por nombre similar
        const autoMapeo: Record<string, string> = {};
        for (const campo of entidadSeleccionada.campos) {
            const match = encabezados.find(h =>
                h.toLowerCase().replace(/[_\s]/g, '') === campo.toLowerCase().replace(/[_\s]/g, '') ||
                h.toLowerCase().includes(campo.toLowerCase()) ||
                campo.toLowerCase().includes(h.toLowerCase())
            );
            if (match) autoMapeo[campo] = match;
        }
        setMapeoColumnas(autoMapeo);
        setPaso('mapeo');
    }, [entidadSeleccionada]);

    // ── Manejar archivo seleccionado ──
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['csv', 'tsv', 'txt'].includes(ext || '')) {
            toast.error('Formato no soportado. Usa CSV, TSV o TXT.');
            return;
        }

        setArchivo(file);
        parsearArchivo(file);
    };

    // ── Importar datos ──
    const ejecutarImportacion = async () => {
        setImportando(true);
        const resultados = { exitosos: 0, errores: 0, detalles: [] as string[] };

        for (const fila of filasParsed) {
            if (!fila.valido) continue;

            const registro: Record<string, any> = {};
            for (const [campo, colExcel] of Object.entries(mapeoColumnas)) {
                if (colExcel && fila.datos[colExcel]) {
                    registro[campo] = fila.datos[colExcel];
                }
            }

            if (Object.keys(registro).length === 0) continue;

            try {
                const { error } = await supabase
                    .from(entidadSeleccionada.tabla)
                    .insert(registro);

                if (error) {
                    resultados.errores++;
                    resultados.detalles.push(`Fila ${fila.indice}: ${error.message}`);
                } else {
                    resultados.exitosos++;
                }
            } catch (err: any) {
                resultados.errores++;
                resultados.detalles.push(`Fila ${fila.indice}: ${err.message}`);
            }
        }

        setResultadoImport(resultados);
        setPaso('resultado');
        setImportando(false);

        if (resultados.exitosos > 0) {
            toast.success(`${resultados.exitosos} registros importados correctamente`);
        }
        if (resultados.errores > 0) {
            toast.error(`${resultados.errores} errores durante la importación`);
        }
    };

    // ── Exportar datos ──
    const exportarDatos = async (entidad: typeof ENTIDADES_EXPORT[number]) => {
        setExportando(true);
        try {
            const { data, error } = await supabase
                .from(entidad.tabla)
                .select('*')
                .limit(10000);

            if (error) throw error;
            if (!data || data.length === 0) {
                toast.warning('No hay datos para exportar');
                setExportando(false);
                return;
            }

            // Generar CSV
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(h => {
                    const val = row[h];
                    if (val === null || val === undefined) return '';
                    const str = String(val);
                    return str.includes(',') || str.includes('"') || str.includes('\n')
                        ? `"${str.replace(/"/g, '""')}"`
                        : str;
                }).join(','))
            ].join('\n');

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${entidad.key}_export_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success(`${data.length} registros exportados como CSV`);
        } catch (err: any) {
            toast.error(`Error al exportar: ${err.message}`);
        }
        setExportando(false);
    };

    // ── Generar plantilla CSV ──
    const descargarPlantilla = () => {
        const csvContent = entidadSeleccionada.campos.join(',') + '\n';
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `plantilla_${entidadSeleccionada.key}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Plantilla descargada');
    };

    const reiniciar = () => {
        setArchivo(null);
        setFilasParsed([]);
        setColumnas([]);
        setMapeoColumnas({});
        setPaso('seleccion');
        setResultadoImport({ exitosos: 0, errores: 0, detalles: [] });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="Importar / Exportar"
                subtitle="Carga masiva de datos desde CSV y exportación de registros"
                icon={FileSpreadsheet}
                badge="HERRAMIENTAS"
            />

            {/* Tabs */}
            <div className="flex gap-2 px-4">
                {[
                    { key: 'importar' as const, label: 'Importar', icon: Upload },
                    { key: 'exportar' as const, label: 'Exportar', icon: Download },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => { setTab(t.key); reiniciar(); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.key
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {tab === 'importar' ? (
                    <motion.div
                        key="importar"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="px-4 space-y-6"
                    >
                        {/* Paso 1: Selección de entidad y archivo */}
                        {paso === 'seleccion' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Selector de entidad */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">1. ¿Qué quieres importar?</h3>
                                    <div className="space-y-2">
                                        {ENTIDADES_IMPORT.map(ent => (
                                            <button
                                                key={ent.key}
                                                onClick={() => setEntidadSeleccionada(ent)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${entidadSeleccionada.key === ent.key
                                                    ? `bg-${ent.color}-50 border-2 border-${ent.color}-500 text-${ent.color}-900`
                                                    : 'border-2 border-transparent hover:bg-gray-50'
                                                    }`}
                                            >
                                                <ent.icon className="w-5 h-5" />
                                                <span className="font-medium">{ent.label}</span>
                                                {entidadSeleccionada.key === ent.key && (
                                                    <Check className="w-4 h-4 ml-auto text-emerald-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Campos esperados:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {entidadSeleccionada.campos.map(c => (
                                                <span key={c} className="text-xs px-2 py-1 bg-white rounded-lg border text-gray-600">{c}</span>
                                            ))}
                                        </div>
                                        <button
                                            onClick={descargarPlantilla}
                                            className="mt-3 text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                                        >
                                            <Download className="w-3 h-3" /> Descargar plantilla CSV
                                        </button>
                                    </div>
                                </div>

                                {/* Drop zone */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">2. Selecciona tu archivo</h3>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
                                    >
                                        <Upload className="w-12 h-12 mx-auto text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                        <p className="mt-4 font-bold text-gray-700">Arrastra tu archivo aquí</p>
                                        <p className="text-sm text-gray-400 mt-1">o haz click para seleccionar</p>
                                        <p className="text-xs text-gray-300 mt-4">Formatos: CSV, TSV, TXT · Máx 10,000 filas</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.tsv,.txt"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    {archivo && (
                                        <div className="mt-4 flex items-center gap-3 bg-emerald-50 p-3 rounded-xl">
                                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-emerald-900">{archivo.name}</p>
                                                <p className="text-xs text-emerald-600">{(archivo.size / 1024).toFixed(1)} KB · {filasParsed.length} filas</p>
                                            </div>
                                            <button onClick={reiniciar} className="p-1 hover:bg-emerald-100 rounded"><X className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Paso 2: Mapeo de columnas */}
                        {paso === 'mapeo' && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Mapear columnas</h3>
                                        <p className="text-sm text-gray-500">Asigna las columnas de tu archivo a los campos del sistema</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={reiniciar} className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50">← Atrás</button>
                                        <button
                                            onClick={() => setPaso('preview')}
                                            className="px-5 py-2 text-sm bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-bold flex items-center gap-2"
                                        >
                                            Vista previa <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {entidadSeleccionada.campos.map(campo => (
                                        <div key={campo} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">{campo}</label>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300" />
                                            <select
                                                value={mapeoColumnas[campo] || ''}
                                                onChange={e => setMapeoColumnas(prev => ({ ...prev, [campo]: e.target.value }))}
                                                className="flex-1 text-sm px-3 py-2 border rounded-lg bg-white"
                                            >
                                                <option value="">— Ignorar —</option>
                                                {columnas.map(col => (
                                                    <option key={col} value={col}>{col}</option>
                                                ))}
                                            </select>
                                            {mapeoColumnas[campo] && (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Paso 3: Preview */}
                        {paso === 'preview' && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Vista previa ({filasParsed.length} filas)</h3>
                                        <p className="text-sm text-gray-500">Revisa los datos antes de importar</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPaso('mapeo')} className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50">← Mapeo</button>
                                        <button
                                            onClick={ejecutarImportacion}
                                            disabled={importando}
                                            className="px-5 py-2 text-sm bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-bold flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {importando ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</> : <><Upload className="w-4 h-4" /> Importar ahora</>}
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto max-h-[400px] border rounded-xl">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-bold text-gray-500 text-xs">#</th>
                                                {Object.entries(mapeoColumnas).filter(([, v]) => v).map(([campo]) => (
                                                    <th key={campo} className="px-3 py-2 text-left font-bold text-gray-500 text-xs uppercase">{campo}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filasParsed.slice(0, 50).map(fila => (
                                                <tr key={fila.indice} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2 text-gray-400 text-xs">{fila.indice}</td>
                                                    {Object.entries(mapeoColumnas).filter(([, v]) => v).map(([campo, colExcel]) => (
                                                        <td key={campo} className="px-3 py-2 text-gray-700">{fila.datos[colExcel] || '—'}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filasParsed.length > 50 && (
                                    <p className="text-xs text-gray-400 mt-2 text-center">Mostrando 50 de {filasParsed.length} filas</p>
                                )}
                            </div>
                        )}

                        {/* Paso 4: Resultado */}
                        {paso === 'resultado' && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
                                {resultadoImport.exitosos > 0 && resultadoImport.errores === 0 ? (
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                ) : resultadoImport.errores > 0 ? (
                                    <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                                ) : (
                                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                )}

                                <h3 className="text-2xl font-black text-gray-900 mb-2">Importación completada</h3>

                                <div className="flex items-center justify-center gap-8 my-6">
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-emerald-500">{resultadoImport.exitosos}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Exitosos</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-red-500">{resultadoImport.errores}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Errores</p>
                                    </div>
                                </div>

                                {resultadoImport.detalles.length > 0 && (
                                    <div className="mt-4 text-left bg-red-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                                        {resultadoImport.detalles.map((d, i) => (
                                            <p key={i} className="text-xs text-red-700 py-1">{d}</p>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={reiniciar}
                                    className="mt-6 px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-bold"
                                >
                                    Nueva importación
                                </button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="exportar"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="px-4"
                    >
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Exportar datos a CSV</h3>
                            <p className="text-sm text-gray-500 mb-6">Selecciona la entidad que deseas exportar. Se generará un archivo CSV compatible con Excel.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ENTIDADES_EXPORT.map(ent => (
                                    <button
                                        key={ent.key}
                                        onClick={() => exportarDatos(ent)}
                                        disabled={exportando}
                                        className="flex items-center gap-3 p-4 border-2 border-gray-100 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 transition-all disabled:opacity-50 text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                            <ent.icon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">{ent.label}</p>
                                            <p className="text-xs text-gray-400">Tabla: {ent.tabla}</p>
                                        </div>
                                        <Download className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
