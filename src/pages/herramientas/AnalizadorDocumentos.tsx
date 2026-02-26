// =====================================================
// MedExtract Pro — Motor de Extracción Médica con IA
// GPMedical ERP Pro — La joya del sistema
// =====================================================

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UploadCloud, File as FileIcon, Download, FileText, CheckCircle, AlertCircle,
    Loader2, Play, Database, Brain, Sparkles, X, Eye, Shield,
    FileSpreadsheet, Image as ImageIcon, FileType, Trash2,
    ChevronDown, ChevronUp, ZapIcon, BarChart3, PieChart, Activity,
    Cpu, TrendingUp, Bookmark, BookmarkCheck, Info, CheckSquare, Square, Lightbulb, DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import {
    analyzeDocument, determineCategory, isGeminiConfigured,
    type FileItem, type ExtractedDocumentData, type StructuredMedicalData, type DatoClinico
} from '@/services/geminiDocumentService';
import { getUsageStats, getModelInfo, clearUsageHistory, type AIUsageStats } from '@/services/aiUsageTracker';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RPieChart, Pie, Cell
} from 'recharts';

// ── Wizard Steps ──
type WizardStep = 'upload' | 'results' | 'verify' | 'charts' | 'usage';

const STEP_INFO: Record<string, { title: string; tip: string }> = {
    upload: { title: 'Paso 1 — Sube tus documentos', tip: '💡 Sube archivos PDF, imágenes de rayos X, laboratorios escaneados o ZIPs completos. MedExtract Pro los clasificará automáticamente y extraerá cada parámetro médico.' },
    results: { title: 'Paso 2 — Resultados extraídos', tip: '💡 Aquí ves TODOS los datos que la IA extrajo. Cada parámetro (glucosa, hemoglobina, EI, mAs, etc.) aparece como fila individual. Puedes guardar parámetros favoritos con el bookmark.' },
    verify: { title: 'Paso 3 — Verificación e integración', tip: '💡 Selecciona qué datos deseas integrar al expediente del paciente. Puedes deseleccionar los que no apliquen. Los datos marcados se vincularán al perfil clínico.' },
    charts: { title: 'Paso 4 — Visualización', tip: '💡 Gráficas generadas a partir de los datos extraídos: audiogramas, curvas flujo-volumen, distribución de categorías y estado de resultados.' },
    usage: { title: 'Centro de Control IA', tip: '🔒 Panel exclusivo Super Admin — Monitorea tokens, costos y rendimiento de los modelos IA (Gemini + OpenAI).' },
};

// ── Colores ──
const CATEGORY_ICONS: Record<string, any> = {
    'Documentos PDF': FileText, 'Imágenes Médicas': ImageIcon,
    'Documentos de Word': FileType, 'Presentaciones': FileSpreadsheet,
    'Archivos de Texto / Datos': FileSpreadsheet, 'Otros Archivos': FileIcon,
};

const OBS_COLORS: Record<string, string> = {
    'Normal': 'text-emerald-600 bg-emerald-50', 'Alto': 'text-amber-600 bg-amber-50',
    'Bajo': 'text-blue-600 bg-blue-50', 'Crítico': 'text-red-600 bg-red-50',
    'Anormal': 'text-orange-600 bg-orange-50',
};

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalizadorDocumentos() {
    const { user } = useAuth();
    const isSuperAdmin = user?.rol === 'super_admin';

    const STEPS: { id: WizardStep; label: string; icon: any; superOnly?: boolean }[] = [
        { id: 'upload', label: 'Documentos', icon: UploadCloud },
        { id: 'results', label: 'Extracción', icon: Database },
        { id: 'verify', label: 'Verificar', icon: CheckSquare },
        { id: 'charts', label: 'Gráficas', icon: BarChart3 },
        ...(isSuperAdmin ? [{ id: 'usage' as WizardStep, label: 'Control IA', icon: Shield, superOnly: true }] : []),
    ];

    const [step, setStep] = useState<WizardStep>('upload');
    const [fileItems, setFileItems] = useState<FileItem[]>([]);
    const [isExpandingZip, setIsExpandingZip] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
    const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
    const [selectedForIntegration, setSelectedForIntegration] = useState<Set<string>>(new Set());
    const [savedParams, setSavedParams] = useState<Set<string>>(() => {
        try { return new Set(JSON.parse(localStorage.getItem('gp_saved_params') || '[]')); } catch { return new Set(); }
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const geminiReady = isGeminiConfigured();

    // ── ZIP Expansion ──
    const expandZipFiles = async (files: File[]): Promise<File[]> => {
        const allFiles: File[] = [];
        const JSZip = (await import('jszip')).default;
        for (const file of files) {
            if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
                try {
                    const zip = await JSZip.loadAsync(file);
                    const unzipped = await Promise.all(
                        Object.values(zip.files).map(async (entry) => {
                            if (!entry.dir && !entry.name.startsWith('__MACOSX') && !entry.name.endsWith('.DS_Store')) {
                                const blob = await entry.async('blob');
                                let mime = blob.type;
                                if (!mime) {
                                    if (entry.name.endsWith('.pdf')) mime = 'application/pdf';
                                    else if (/\.(jpg|jpeg)$/i.test(entry.name)) mime = 'image/jpeg';
                                    else if (entry.name.endsWith('.png')) mime = 'image/png';
                                    else if (entry.name.endsWith('.docx')) mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                                }
                                return new File([blob], entry.name.split('/').pop() || entry.name, { type: mime });
                            }
                            return null;
                        })
                    );
                    allFiles.push(...unzipped.filter((f): f is File => f !== null));
                } catch { allFiles.push(file); }
            } else { allFiles.push(file); }
        }
        return allFiles;
    };

    const addFiles = async (newFiles: File[]) => {
        setIsExpandingZip(true);
        const expanded = await expandZipFiles(newFiles);
        const items: FileItem[] = expanded.map(f => ({
            id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            file: f, status: 'pending', category: determineCategory(f)
        }));
        setFileItems(prev => [...prev, ...items]);
        setIsExpandingZip(false);
        toast.success(`${expanded.length} archivo(s) añadidos`);
    };

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        addFiles(Array.from(e.dataTransfer.files));
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(Array.from(e.target.files || [])); e.target.value = '';
    };

    // ── Extract helpers ──
    const extractTextFromPptx = async (file: File) => {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(file);
        let text = '';
        const slides = Object.keys(zip.files).filter(n => n.match(/ppt\/slides\/slide\d+\.xml/));
        for (const s of slides) {
            const c = await zip.files[s].async('string');
            text += c.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() + '\n';
        }
        return text || 'Sin contenido';
    };

    const extractFromPdf = async (file: File) => {
        const pdfjsLib = await import('pdfjs-dist');
        // @ts-ignore
        const workerUrl = await import('pdfjs-dist/build/pdf.worker.mjs?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;
        const images: File[] = []; let text = '';
        const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
        const pages = Math.min(pdf.numPages, 10);
        for (let i = 1; i <= pages; i++) {
            const page = await pdf.getPage(i);
            try { const tc = await page.getTextContent(); text += tc.items.map(it => ('str' in it ? it.str : '')).join(' ') + '\n'; } catch { }
            const vp = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.height = vp.height; canvas.width = vp.width;
                try {
                    // @ts-ignore
                    await page.render({ canvasContext: ctx, viewport: vp, canvas } as any).promise;
                    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.6));
                    if (blob) images.push(new File([blob], `page_${i}.jpg`, { type: 'image/jpeg' }));
                } catch { }
            }
        }
        return { text, images };
    };

    // ── Process file ──
    const processFile = async (id: string) => {
        setFileItems(prev => prev.map(i => i.id === id ? { ...i, status: 'processing' } : i));
        const item = fileItems.find(i => i.id === id);
        if (!item) return;
        const file = item.file;
        let rawText = '', images: File[] = [], fileType = file.type || 'unknown', error: string | undefined, structuredData: StructuredMedicalData | undefined;
        try {
            if (file.name.toLowerCase().endsWith('.zip')) { error = 'ZIP anidado'; fileType = 'zip'; }
            else if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)) { images = [file]; fileType = 'image'; }
            else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) { const e = await extractFromPdf(file); rawText = e.text; images = e.images; fileType = 'pdf'; }
            else if (file.name.toLowerCase().endsWith('.docx')) { const m = (await import('mammoth')).default; rawText = (await m.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value; fileType = 'docx'; }
            else if (file.name.toLowerCase().endsWith('.pptx')) { rawText = await extractTextFromPptx(file); fileType = 'pptx'; }
            else if (/\.(csv|xml|txt)$/i.test(file.name)) { rawText = await file.text(); fileType = 'text'; }
            else { error = `Formato no soportado: ${file.name}`; }
            if (!error) structuredData = await analyzeDocument(rawText, images);
        } catch (err: any) { error = err.message || 'Error de IA'; }
        setFileItems(prev => prev.map(i => i.id === id ? { ...i, status: error ? 'error' : 'completed', result: { fileName: file.name, fileType, rawText, structuredData, error } } : i));
        if (!error) { toast.success(`✅ ${file.name} analizado`); setUsageStats(getUsageStats()); }
        else toast.error(`❌ ${file.name}: ${error}`);
    };

    const processAll = async () => {
        for (const item of fileItems.filter(i => i.status === 'pending' || i.status === 'error')) await processFile(item.id);
    };

    // ── Saved params management ──
    const toggleSaveParam = (param: string) => {
        setSavedParams(prev => {
            const next = new Set(prev);
            if (next.has(param)) next.delete(param); else next.add(param);
            localStorage.setItem('gp_saved_params', JSON.stringify([...next]));
            return next;
        });
    };

    // ── Export CSV ──
    const exportToCsv = () => {
        const completed = fileItems.filter(i => i.status === 'completed' && i.result);
        if (!completed.length) return;
        const rows: any[] = [];
        completed.forEach(({ result }) => {
            result?.structuredData?.datos_estructurados?.forEach(d => {
                rows.push({ Archivo: result.fileName, Paciente: result.structuredData?.paciente || '', Fecha: result.structuredData?.fecha || '', Tipo: result.structuredData?.tipo_documento || '', Categoría: d.categoria || '', Parámetro: d.parametro, Resultado: d.resultado, Unidad: d.unidad || '', Referencia: d.rango_referencia || '', Obs: d.observacion || '' });
            });
        });
        const csv = Papa.unparse(rows);
        saveAs(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }), `analisis_${new Date().toISOString().slice(0, 10)}.csv`);
        toast.success('CSV exportado');
    };

    const exportToMarkdown = () => {
        const completed = fileItems.filter(i => i.status === 'completed' && i.result).map(i => i.result!);
        if (!completed.length) return;
        let md = `# Reporte GP Medical Health\nGenerado: ${new Date().toLocaleString()}\n\n---\n\n`;
        completed.forEach((d, i) => {
            md += `## ${i + 1}. ${d.fileName}\n- **Paciente:** ${d.structuredData?.paciente || 'N/D'}\n- **Fecha:** ${d.structuredData?.fecha || 'N/D'}\n- **Tipo:** ${d.structuredData?.tipo_documento || 'N/D'}\n\n`;
            if (d.structuredData?.datos_estructurados?.length) {
                md += `| Parámetro | Resultado | Unidad | Ref | Obs |\n|---|---|---|---|---|\n`;
                d.structuredData.datos_estructurados.forEach(r => { md += `| ${r.parametro} | **${r.resultado}** | ${r.unidad || '-'} | ${r.rango_referencia || '-'} | ${r.observacion || '-'} |\n`; });
                md += '\n';
            }
            if (d.structuredData?.interpretacion_general) md += `### Interpretación\n${d.structuredData.interpretacion_general}\n\n---\n\n`;
        });
        saveAs(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), `reporte_${new Date().toISOString().slice(0, 10)}.md`);
        toast.success('Reporte MD exportado');
    };

    // ── Stats ──
    const completedResults = useMemo(() => fileItems.filter(i => i.status === 'completed' && i.result).map(i => i.result!), [fileItems]);
    const stats = useMemo(() => ({ total: fileItems.length, pending: fileItems.filter(i => i.status === 'pending').length, processing: fileItems.filter(i => i.status === 'processing').length, completed: fileItems.filter(i => i.status === 'completed').length, errors: fileItems.filter(i => i.status === 'error').length }), [fileItems]);

    const allParams = useMemo(() => {
        const params: DatoClinico[] = [];
        completedResults.forEach(r => { r.structuredData?.datos_estructurados?.forEach(d => params.push(d)); });
        return params;
    }, [completedResults]);

    const allGraphData = useMemo(() => {
        const graphs: any[] = [];
        completedResults.forEach(r => { r.structuredData?.datos_graficas?.forEach(g => graphs.push(g)); });
        return graphs;
    }, [completedResults]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allParams.forEach(p => { const c = p.categoria || 'Sin Categoría'; counts[c] = (counts[c] || 0) + 1; });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [allParams]);

    const obsCounts = useMemo(() => {
        const counts: Record<string, number> = { Normal: 0, Alto: 0, Bajo: 0, Crítico: 0, Anormal: 0, 'Sin Obs': 0 };
        allParams.forEach(p => {
            const o = (p.observacion || '').trim();
            if (counts[o] !== undefined) counts[o]++; else if (o) counts['Anormal']++; else counts['Sin Obs']++;
        });
        return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
    }, [allParams]);

    const groupedFiles = useMemo(() => {
        const g: Record<string, FileItem[]> = {};
        fileItems.forEach(i => { if (!g[i.category]) g[i.category] = []; g[i.category].push(i); });
        return g;
    }, [fileItems]);

    // ── Render Step Navigation ──
    const renderStepNav = () => (
        <div className="mx-4 mb-6">
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const active = step === s.id;
                    const done = (s.id === 'upload' && stats.total > 0) || (s.id === 'results' && stats.completed > 0) || (s.id === 'charts' && allGraphData.length > 0);
                    return (
                        <button key={s.id} onClick={() => setStep(s.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20' : done ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{s.label}</span>
                            {done && !active && <CheckCircle className="w-3 h-3" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    // ── STEP 1: Upload ──
    const renderUpload = () => (
        <div className="px-4 space-y-4">
            {/* Stats bar */}
            {stats.total > 0 && (
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-6 bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm flex-1">
                        {[{ l: 'Total', v: stats.total, c: 'text-gray-700' }, { l: 'Pendientes', v: stats.pending, c: 'text-gray-400' }, { l: 'OK', v: stats.completed, c: 'text-emerald-600' }, { l: 'Errores', v: stats.errors, c: 'text-red-500' }].map(s => (
                            <div key={s.l} className="text-center"><p className={`text-xl font-black ${s.c}`}>{s.v}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.l}</p></div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {stats.pending > 0 && <button onClick={processAll} disabled={stats.processing > 0} className="btn-premium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">{stats.processing > 0 ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : <><ZapIcon className="w-4 h-4" /> Procesar Todos ({stats.pending})</>}</button>}
                        <button onClick={() => { setFileItems([]); setExpandedResults(new Set()); }} className="px-3 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {/* Drop zone */}
            <div className="glass-card rounded-[2rem] p-8">
                <div className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all relative group ${isDragging ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]' : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/20'}`}
                    onDrop={handleFileDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput} accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.docx,.doc,.pptx,.csv,.xml,.txt,.zip" />
                    {isExpandingZip ? (
                        <div className="flex flex-col items-center text-emerald-600"><Loader2 className="w-14 h-14 mb-4 animate-spin" /><p className="font-bold text-lg">Descomprimiendo...</p></div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 transition-all ${isDragging ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
                                <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-emerald-400'}`} />
                            </div>
                            <p className="font-bold text-lg text-gray-800">Arrastra documentos o <span className="text-emerald-600">ZIP</span></p>
                            <p className="text-sm text-gray-400 mt-1.5">PDF, JPG, DOCX, PPTX, CSV, ZIP</p>
                        </div>
                    )}
                </div>
            </div>

            {/* File list by category */}
            {Object.entries(groupedFiles).map(([cat, items]) => {
                const CatIcon = CATEGORY_ICONS[cat] || FileIcon;
                return (
                    <div key={cat} className="glass-card rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center"><CatIcon className="w-4 h-4 text-emerald-600" /></div>
                                <div><h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">{cat}</h3><p className="text-[10px] text-gray-400">{items.length} archivo(s)</p></div>
                            </div>
                            {items.some(i => i.status === 'pending') && (
                                <button onClick={async () => { for (const i of items.filter(x => x.status === 'pending')) await processFile(i.id); }} disabled={!geminiReady} className="btn-premium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"><Play className="w-3.5 h-3.5" /> Procesar</button>
                            )}
                        </div>
                        <ul className="space-y-2">
                            {items.map(item => (
                                <li key={item.id} className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all group">
                                    <div className="flex items-center overflow-hidden"><FileIcon className="w-4 h-4 mr-2 text-emerald-400 flex-shrink-0" /><span className="text-sm font-semibold text-gray-700 truncate">{item.file.name}</span><span className="text-[10px] text-gray-400 ml-2">{(item.file.size / 1024).toFixed(0)}KB</span></div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : item.status === 'processing' ? 'bg-emerald-50 text-emerald-600' : item.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {item.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}{item.status === 'completed' ? '✓' : item.status === 'processing' ? 'IA...' : item.status === 'error' ? '✗' : '○'} {item.result?.structuredData?.datos_estructurados ? `${item.result.structuredData.datos_estructurados.length} params` : ''}
                                        </span>
                                        {item.status === 'pending' && <button onClick={() => processFile(item.id)} disabled={!geminiReady} className="text-xs font-bold bg-emerald-500 text-white px-3 py-1 rounded-lg hover:bg-emerald-600 disabled:opacity-50">Procesar</button>}
                                        <button onClick={() => setFileItems(p => p.filter(x => x.id !== item.id))} className="p-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}

            {stats.completed > 0 && <div className="flex justify-center"><button onClick={() => setStep('results')} className="btn-premium px-8 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xl"><Sparkles className="w-5 h-5" /> Ver Resultados Estructurados ({stats.completed})</button></div>}
        </div>
    );

    // ── STEP 2: Results ──
    const renderResults = () => (
        <div className="px-4 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"><Sparkles className="w-5 h-5 text-white" /></div>
                    <div><h2 className="text-lg font-black text-gray-900">Resultados Estructurados</h2><p className="text-xs text-gray-400">{completedResults.length} documento(s) · {allParams.length} parámetros totales</p></div>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportToCsv} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 font-bold text-xs"><Download className="w-4 h-4" /> CSV</button>
                    <button onClick={exportToMarkdown} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black font-bold text-xs"><FileText className="w-4 h-4" /> MD</button>
                </div>
            </div>

            {completedResults.map((data, idx) => {
                const itemId = `r-${idx}`;
                const isExp = expandedResults.has(itemId);
                return (
                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
                        <button onClick={() => setExpandedResults(p => { const n = new Set(p); n.has(itemId) ? n.delete(itemId) : n.add(itemId); return n; })} className="w-full flex items-center justify-between p-5 hover:bg-emerald-50/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-600" /></div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-800 text-sm">{data.fileName}</h3>
                                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                        {data.structuredData?.paciente && <span className="text-[10px] text-emerald-600 font-bold">👤 {data.structuredData.paciente}</span>}
                                        {data.structuredData?.fecha && <span className="text-[10px] text-gray-400">📅 {data.structuredData.fecha}</span>}
                                        {data.structuredData?.tipo_documento && <span className="text-[10px] text-blue-500 font-semibold">{data.structuredData.tipo_documento}</span>}
                                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">{data.structuredData?.datos_estructurados?.length || 0} params</span>
                                    </div>
                                </div>
                            </div>
                            {isExp ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>
                        <AnimatePresence>
                            {isExp && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                                        {/* Info cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {[{ l: 'Paciente', v: data.structuredData?.paciente }, { l: 'Fecha', v: data.structuredData?.fecha }, { l: 'Tipo', v: data.structuredData?.tipo_documento }].map(({ l, v }) => (
                                                <div key={l} className="bg-gray-50 rounded-xl p-3"><span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1 font-bold">{l}</span><span className="text-sm font-bold text-gray-800">{v || 'N/D'}</span></div>
                                            ))}
                                        </div>
                                        {/* Data table */}
                                        {data.structuredData?.datos_estructurados && data.structuredData.datos_estructurados.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2"><Database className="w-3.5 h-3.5 text-emerald-500" /> Datos Clínicos ({data.structuredData.datos_estructurados.length})</h4>
                                                <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-[400px] overflow-y-auto custom-scrollbar">
                                                    <table className="min-w-full text-sm text-left text-gray-600">
                                                        <thead className="text-[10px] text-gray-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0">
                                                            <tr><th className="px-3 py-2.5">Cat.</th><th className="px-3 py-2.5">Parámetro</th><th className="px-3 py-2.5">Resultado</th><th className="px-3 py-2.5">Unidad</th><th className="px-3 py-2.5">Ref.</th><th className="px-3 py-2.5">Obs.</th><th className="px-3 py-2.5 w-8"></th></tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {data.structuredData.datos_estructurados.map((row, i) => {
                                                                const obsClass = OBS_COLORS[(row.observacion || '').trim()] || '';
                                                                const isSaved = savedParams.has(row.parametro);
                                                                return (
                                                                    <tr key={i} className={`hover:bg-emerald-50/30 transition-colors ${obsClass ? '' : ''}`}>
                                                                        <td className="px-3 py-2 text-[10px] text-gray-400">{row.categoria || '-'}</td>
                                                                        <td className="px-3 py-2 font-semibold text-gray-800 text-xs">{row.parametro}</td>
                                                                        <td className="px-3 py-2 font-black text-emerald-600 text-xs">{row.resultado}</td>
                                                                        <td className="px-3 py-2 text-xs text-gray-500">{row.unidad || '-'}</td>
                                                                        <td className="px-3 py-2 text-[10px] text-gray-400">{row.rango_referencia || '-'}</td>
                                                                        <td className="px-3 py-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${obsClass || 'text-gray-400'}`}>{row.observacion || '-'}</span></td>
                                                                        <td className="px-3 py-1"><button onClick={() => toggleSaveParam(row.parametro)} title={isSaved ? 'Parámetro guardado' : 'Guardar parámetro'}>{isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5 text-gray-300 hover:text-emerald-400" />}</button></td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                        {/* Interpretation */}
                                        {data.structuredData?.interpretacion_general && (
                                            <div><h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Interpretación</h4>
                                                <div className="p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl border border-emerald-100"><p className="text-sm text-gray-700 leading-relaxed">{data.structuredData.interpretacion_general}</p></div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}

            {completedResults.length === 0 && <div className="text-center py-12"><p className="text-gray-400">No hay resultados aún. Procesa documentos primero.</p><button onClick={() => setStep('upload')} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">← Ir a Subir Documentos</button></div>}
        </div>
    );

    // ── STEP 3: Charts ──
    const renderCharts = () => (
        <div className="px-4 space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                <div><h2 className="text-lg font-black text-gray-900">Visualización de Datos</h2><p className="text-xs text-gray-400">{allParams.length} parámetros · {allGraphData.length} gráficas extraídas</p></div>
            </div>

            {/* Summary pie charts */}
            {allParams.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-card rounded-2xl p-5">
                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2"><PieChart className="w-4 h-4 text-blue-500" /> Distribución por Categoría</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <RPieChart><Pie data={categoryCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                {categoryCounts.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Pie><Tooltip /></RPieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Estado de Resultados</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={obsCounts}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="#10b981" /></BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Extracted graph data (audiograms, spirometry curves, etc.) */}
            {allGraphData.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2"><Eye className="w-4 h-4 text-indigo-500" /> Gráficas Médicas Reconstruidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allGraphData.map((g, gIdx) => (
                            <div key={gIdx} className="glass-card rounded-2xl p-5">
                                <h4 className="font-bold text-emerald-600 text-sm mb-1">{g.titulo || 'Gráfica'}</h4>
                                <div className="flex gap-4 text-[10px] text-gray-400 mb-3"><span><strong>X:</strong> {g.eje_x_label || 'N/D'}</span><span><strong>Y:</strong> {g.eje_y_label || 'N/D'}</span></div>
                                {g.puntos && g.puntos.length > 0 && (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={g.puntos.map((p: any) => ({ x: p.x, value: parseFloat(p.y) || 0 }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="value" stroke={CHART_COLORS[gIdx % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} name={g.eje_y_label || 'Y'} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {allParams.length === 0 && <div className="text-center py-12"><p className="text-gray-400">Procesa documentos para ver gráficas.</p><button onClick={() => setStep('upload')} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">← Subir Documentos</button></div>}
        </div>
    );

    // ── STEP 4: AI Usage ──
    const renderUsage = () => {
        const st = usageStats || getUsageStats();
        const modelInfo = getModelInfo();
        return (
            <div className="px-4 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"><Cpu className="w-5 h-5 text-white" /></div>
                    <div><h2 className="text-lg font-black text-gray-900">Uso de IA y Costos</h2><p className="text-xs text-gray-400">Modelo actual: {modelInfo.current}</p></div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Activity, label: 'Llamadas API', value: st.totalCalls, color: 'emerald' },
                        { icon: TrendingUp, label: 'Tokens Totales', value: st.totalTokens.toLocaleString(), color: 'blue' },
                        { icon: DollarSign, label: 'Costo Est. USD', value: `$${st.totalCostUSD.toFixed(4)}`, color: 'amber' },
                        { icon: Cpu, label: 'Promedio/Llamada', value: st.avgTokensPerCall.toLocaleString(), color: 'violet' },
                    ].map(({ icon: I, label, value, color }) => (
                        <div key={label} className="glass-card rounded-2xl p-5">
                            <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center mb-3`}><I className={`w-5 h-5 text-${color}-500`} /></div>
                            <p className="text-2xl font-black text-gray-900">{value}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Token breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-card rounded-2xl p-5">
                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">Desglose de Tokens</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Input (prompt)</span><span className="font-bold text-blue-600">{st.totalInputTokens.toLocaleString()}</span></div>
                            <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${st.totalTokens > 0 ? (st.totalInputTokens / st.totalTokens * 100) : 0}%` }} /></div>
                            <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Output (respuesta)</span><span className="font-bold text-emerald-600">{st.totalOutputTokens.toLocaleString()}</span></div>
                            <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${st.totalTokens > 0 ? (st.totalOutputTokens / st.totalTokens * 100) : 0}%` }} /></div>
                        </div>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">Modelos Disponibles</h4>
                        <div className="space-y-2">
                            {modelInfo.models.map(m => (
                                <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl border ${m.recommended ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100'} ${!m.available ? 'opacity-40' : ''}`}>
                                    <div><p className="text-sm font-bold text-gray-800">{m.name}{m.recommended && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">EN USO</span>}{!m.available && <span className="ml-2 text-[10px] bg-red-50 text-red-400 px-2 py-0.5 rounded-full font-bold">SIN KEY</span>}</p><p className="text-[10px] text-gray-400">{m.provider.toUpperCase()} · {m.speed} · {m.cost}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent history */}
                {st.history.length > 0 && (
                    <div className="glass-card rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">Historial Reciente</h4>
                            <button onClick={() => { clearUsageHistory(); setUsageStats(getUsageStats()); }} className="text-[10px] text-red-400 hover:text-red-600 font-bold">Limpiar</button>
                        </div>
                        <div className="overflow-x-auto max-h-[200px] overflow-y-auto custom-scrollbar">
                            <table className="min-w-full text-[11px]">
                                <thead className="bg-gray-50 sticky top-0"><tr><th className="px-3 py-2 text-left text-gray-500">Fecha</th><th className="px-3 py-2 text-left text-gray-500">Modelo</th><th className="px-3 py-2 text-right text-gray-500">Input</th><th className="px-3 py-2 text-right text-gray-500">Output</th><th className="px-3 py-2 text-right text-gray-500">Costo</th></tr></thead>
                                <tbody className="divide-y divide-gray-50">
                                    {st.history.slice(-20).reverse().map(e => (
                                        <tr key={e.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-1.5 text-gray-600">{new Date(e.timestamp).toLocaleString()}</td>
                                            <td className="px-3 py-1.5 font-mono text-gray-500">{e.model}</td>
                                            <td className="px-3 py-1.5 text-right text-blue-600">{e.inputTokens.toLocaleString()}</td>
                                            <td className="px-3 py-1.5 text-right text-emerald-600">{e.outputTokens.toLocaleString()}</td>
                                            <td className="px-3 py-1.5 text-right text-amber-600">${e.estimatedCostUSD.toFixed(6)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="glass-card rounded-2xl p-5 border-l-4 border-emerald-500">
                    <div className="flex items-start gap-3"><Info className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /><div>
                        <p className="font-bold text-gray-800 text-sm">¿Es el mejor modelo?</p>
                        <p className="text-xs text-gray-500 mt-1"><strong>Gemini 2.0 Flash</strong> es la mejor opción para extracción médica: ultra rápido ($0.10/1M input), soporta imágenes médicas, y tiene contexto de 1M tokens. Para documentos complejos de laboratorio con muchas tablas, podrías probar <strong>Gemini 1.5 Pro</strong> (más preciso pero 12x más caro). Para el volumen actual, Flash es la elección óptima.</p>
                    </div></div>
                </div>
            </div>
        );
    };

    // ── STEP: Verify (selección de datos para integrar) ──
    const renderVerify = () => {
        // Auto-select all params on first visit
        if (selectedForIntegration.size === 0 && allParams.length > 0) {
            const all = new Set(allParams.map((p, i) => `${i}-${p.parametro}`));
            setSelectedForIntegration(all);
        }
        const toggleParam = (key: string) => setSelectedForIntegration(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
        const selectAll = () => setSelectedForIntegration(new Set(allParams.map((p, i) => `${i}-${p.parametro}`)));
        const deselectAll = () => setSelectedForIntegration(new Set());

        return (
            <div className="px-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"><CheckSquare className="w-5 h-5 text-white" /></div>
                        <div><h2 className="text-lg font-black text-gray-900">Verificación de Datos</h2><p className="text-xs text-gray-400">{selectedForIntegration.size} de {allParams.length} seleccionados para integrar</p></div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={selectAll} className="text-xs font-bold text-emerald-600 hover:underline">✓ Todos</button>
                        <button onClick={deselectAll} className="text-xs font-bold text-gray-400 hover:underline">✗ Ninguno</button>
                    </div>
                </div>

                {allParams.length === 0 ? (
                    <div className="text-center py-12"><p className="text-gray-400">Procesa documentos primero.</p><button onClick={() => setStep('upload')} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">← Subir Documentos</button></div>
                ) : (
                    <div className="glass-card rounded-2xl p-5 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr><th className="px-3 py-2.5 text-left text-[10px] text-gray-500 uppercase w-10">✓</th><th className="px-3 py-2.5 text-left text-[10px] text-gray-500 uppercase">Cat.</th><th className="px-3 py-2.5 text-left text-[10px] text-gray-500 uppercase">Parámetro</th><th className="px-3 py-2.5 text-left text-[10px] text-gray-500 uppercase">Resultado</th><th className="px-3 py-2.5 text-left text-[10px] text-gray-500 uppercase">Unidad</th><th className="px-3 py-2.5 text-left text-[10px] text-gray-500 uppercase">Obs.</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {allParams.map((p, i) => {
                                    const key = `${i}-${p.parametro}`;
                                    const sel = selectedForIntegration.has(key);
                                    const obsClass = OBS_COLORS[(p.observacion || '').trim()] || '';
                                    return (
                                        <tr key={key} onClick={() => toggleParam(key)} className={`cursor-pointer transition-all ${sel ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'opacity-40 hover:opacity-70'}`}>
                                            <td className="px-3 py-2">{sel ? <CheckSquare className="w-4 h-4 text-emerald-500" /> : <Square className="w-4 h-4 text-gray-300" />}</td>
                                            <td className="px-3 py-2 text-[10px] text-gray-500">{p.categoria || '-'}</td>
                                            <td className="px-3 py-2 font-semibold text-gray-800 text-xs">{p.parametro}</td>
                                            <td className="px-3 py-2 font-black text-emerald-600 text-xs">{p.resultado}</td>
                                            <td className="px-3 py-2 text-xs text-gray-500">{p.unidad || '-'}</td>
                                            <td className="px-3 py-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${obsClass || 'text-gray-400'}`}>{p.observacion || '-'}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedForIntegration.size > 0 && (
                    <div className="flex justify-center">
                        <button onClick={() => { toast.success(`${selectedForIntegration.size} parámetros listos para integrar al expediente`); }} className="btn-premium px-8 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xl">
                            <Sparkles className="w-5 h-5" /> Confirmar Integración ({selectedForIntegration.size} datos)
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PremiumPageHeader title="MedExtract Pro" subtitle="Motor de extracción médica con inteligencia artificial — Gemini + OpenAI" icon={Brain} badge="GP MEDICAL HEALTH" actions={
                <div className="flex gap-2">
                    {stats.completed > 0 && <><button onClick={exportToCsv} className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 flex items-center gap-2"><Download className="w-3.5 h-3.5" /> CSV</button>
                        <button onClick={exportToMarkdown} className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> MD</button></>}
                </div>
            } />

            {/* Step info banner */}
            {STEP_INFO[step] && (
                <div className="mx-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/50 rounded-2xl flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
                    <div><p className="font-bold text-violet-800 text-sm">{STEP_INFO[step].title}</p><p className="text-xs text-violet-600 mt-1">{STEP_INFO[step].tip}</p></div>
                </div>
            )}

            {!geminiReady && (
                <div className="mx-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div><p className="font-bold text-amber-800 text-sm">API Key no configurada</p><p className="text-xs text-amber-600 mt-1">Agrega <code className="px-1 py-0.5 bg-amber-100 rounded font-mono">VITE_GOOGLE_API_KEY</code> en <code className="px-1 py-0.5 bg-amber-100 rounded font-mono">.env.local</code></p></div>
                </div>
            )}

            {renderStepNav()}

            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    {step === 'upload' && renderUpload()}
                    {step === 'results' && renderResults()}
                    {step === 'verify' && renderVerify()}
                    {step === 'charts' && renderCharts()}
                    {step === 'usage' && isSuperAdmin && renderUsage()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
