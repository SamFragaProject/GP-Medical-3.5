import React, { useState, useEffect } from 'react';
import { electrocardiogramaService } from '@/services/electrocardiogramaService';
import { Electrocardiograma, CLASIFICACION_ECG_COLORS } from '@/types/electrocardiograma';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Loader2, Calendar, FileText, AlertTriangle, Download, Activity, Zap } from 'lucide-react';
import { printSeccionPDF } from '@/components/expediente/ExportarPDFPaciente';
import DocumentosAdjuntos from '@/components/expediente/DocumentosAdjuntos';
import SectionFileUpload from '@/components/expediente/SectionFileUpload';

export default function ElectrocardiogramaTab({ pacienteId, paciente }: { pacienteId: string; paciente?: any }) {
    const [estudios, setEstudios] = useState<Electrocardiograma[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pacienteId) return;
        loadECG();
    }, [pacienteId]);

    async function loadECG() {
        setLoading(true);
        try {
            const data = await electrocardiogramaService.listar({ paciente_id: pacienteId });
            setEstudios(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleExportPDF = (ecg: Electrocardiograma) => {
        const contenidoHTML = `
            <div class="section-title">Parámetros del Electrocardiograma</div>
            <div class="dense-row"><span class="dense-label">Fecha del Estudio</span><span class="dense-value">${new Date(ecg.fecha_estudio).toLocaleDateString('es-MX')}</span></div>
            <div class="dense-row"><span class="dense-label">Ritmo</span><span class="dense-value">${ecg.ritmo}</span></div>
            <div class="dense-row"><span class="dense-label">Frecuencia Cardíaca</span><span class="dense-value">${ecg.frecuencia_cardiaca} lpm</span></div>
            <div class="dense-row"><span class="dense-label">Eje QRS</span><span class="dense-value">${ecg.eje_qrs}°</span></div>
            <div class="dense-row"><span class="dense-label">Onda P</span><span class="dense-value">${ecg.onda_p || '—'}</span></div>
            <div class="dense-row"><span class="dense-label">Intervalo PR</span><span class="dense-value">${ecg.intervalo_pr} ms</span></div>
            <div class="dense-row"><span class="dense-label">Complejo QRS</span><span class="dense-value">${ecg.complejo_qrs} ms</span></div>
            <div class="dense-row"><span class="dense-label">Intervalo QT</span><span class="dense-value">${ecg.intervalo_qt} ms</span></div>
            <div class="dense-row"><span class="dense-label">Intervalo QTc</span><span class="dense-value ${ecg.intervalo_qtc > 450 ? 'alto' : ''}">${ecg.intervalo_qtc} ms</span></div>
            <div class="dense-row"><span class="dense-label">Segmento ST</span><span class="dense-value">${ecg.segmento_st || '—'}</span></div>
            <div class="dense-row"><span class="dense-label">Onda T</span><span class="dense-value">${ecg.onda_t || '—'}</span></div>
            <div class="dense-row"><span class="dense-label">Calidad</span><span class="dense-value">${ecg.calidad_prueba}</span></div>
            <div class="dense-row"><span class="dense-label">Clasificación</span><span class="dense-value" style="color:${ecg.clasificacion === 'normal' ? '#10b981' : '#ef4444'};font-weight:900">${(ecg.clasificacion || '').replace(/_/g, ' ').toUpperCase()}</span></div>
            ${ecg.hallazgos ? `
            <div class="section-title" style="margin-top:16px">Hallazgos</div>
            <div style="padding:10px; font-size:11px; color:#334155; line-height:1.6; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-top:4px;">${ecg.hallazgos}</div>
            ` : ''}
        `;

        printSeccionPDF({
            paciente: paciente || {},
            titulo: 'Electrocardiograma (ECG)',
            contenidoHTML,
            medico: ecg.realizado_por || '',
            interpretacion: ecg.interpretacion_medica || ecg.hallazgos || undefined,
        });
    };

    if (loading) {
        return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-rose-500 mb-2" />Cargando electrocardiogramas...</div>;
    }

    if (estudios.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <HeartPulse className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Sin electrocardiogramas</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-sm text-center mb-4">
                    No existen trazados de ECG registrados para este paciente.
                </p>
                <div className="max-w-sm mx-auto">
                    <SectionFileUpload pacienteId={pacienteId} tipoEstudio="ecg" onFileUploaded={() => loadECG()} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {estudios.map((ecg) => {
                const colores = CLASIFICACION_ECG_COLORS[ecg.clasificacion] || { bg: 'bg-slate-100', text: 'text-slate-700' };
                const isNormal = ecg.clasificacion === 'normal';

                return (
                    <Card key={ecg.id} className="border-slate-100 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                            {/* Header strip */}
                            <div className={`px-6 py-4 flex items-center justify-between ${isNormal ? 'bg-emerald-50' : 'bg-rose-50'} border-b`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isNormal ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                        <HeartPulse className={`w-5 h-5 ${isNormal ? 'text-emerald-600' : 'text-rose-600'}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Electrocardiograma — {ecg.ritmo}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <span className="text-xs text-slate-500 font-medium">{new Date(ecg.fecha_estudio).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <SectionFileUpload pacienteId={pacienteId} tipoEstudio="ecg" compact onFileUploaded={() => loadECG()} />
                                    <Badge className={`${colores.bg} ${colores.text} font-bold text-xs px-3 py-1`}>
                                        {ecg.clasificacion.replace(/_/g, ' ').toUpperCase()}
                                    </Badge>
                                    <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl" onClick={() => handleExportPDF(ecg)}>
                                        <Download className="w-3.5 h-3.5" /> PDF
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Parameters grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <ParamCard icon={Activity} label="FC" value={`${ecg.frecuencia_cardiaca} lpm`} color="rose" />
                                    <ParamCard icon={Zap} label="Eje QRS" value={`${ecg.eje_qrs}°`} color="blue" />
                                    <ParamCard icon={Activity} label="QTc" value={`${ecg.intervalo_qtc} ms`} color={ecg.intervalo_qtc > 450 ? 'amber' : 'emerald'} />
                                    <ParamCard icon={HeartPulse} label="Calidad" value={ecg.calidad_prueba} color="purple" />
                                </div>

                                {/* Detailed intervals */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                    <IntervalItem label="Onda P" value={ecg.onda_p} />
                                    <IntervalItem label="PR" value={`${ecg.intervalo_pr} ms`} />
                                    <IntervalItem label="QRS" value={`${ecg.complejo_qrs} ms`} />
                                    <IntervalItem label="QT" value={`${ecg.intervalo_qt} ms`} />
                                    <IntervalItem label="QTc" value={`${ecg.intervalo_qtc} ms`} warn={ecg.intervalo_qtc > 450} />
                                    <IntervalItem label="Segmento ST" value={ecg.segmento_st} />
                                    <IntervalItem label="Onda T" value={ecg.onda_t} />
                                    <IntervalItem label="Ritmo" value={ecg.ritmo} />
                                </div>

                                {/* Hallazgos e interpretación */}
                                {ecg.hallazgos && (
                                    <div className="bg-white border border-slate-100 rounded-xl p-4 mb-3">
                                        <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <FileText className="w-3.5 h-3.5" /> Hallazgos
                                        </h5>
                                        <p className="text-sm text-slate-700 leading-relaxed">{ecg.hallazgos}</p>
                                    </div>
                                )}

                                {ecg.interpretacion_medica && (
                                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                                        <h5 className="font-bold text-xs text-blue-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                            <AlertTriangle className="w-3.5 h-3.5" /> Interpretación Médica
                                        </h5>
                                        <p className="text-sm text-slate-700 leading-relaxed">{ecg.interpretacion_medica}</p>
                                    </div>
                                )}

                                {ecg.realizado_por && (
                                    <div className="mt-4 text-xs text-slate-400 font-medium text-right">
                                        Realizado por: <span className="text-slate-600 font-bold">{ecg.realizado_por}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Documentos adjuntos de electrocardiograma */}
            <DocumentosAdjuntos
                pacienteId={pacienteId}
                categoria="electrocardiograma"
                titulo="Documentos de ECG"
            />
        </div>
    );
}

function ParamCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
    const colorMap: Record<string, string> = {
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
    };
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-4 h-4 opacity-70" />
            <div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</div>
                <div className="font-black text-sm">{value}</div>
            </div>
        </div>
    );
}

function IntervalItem({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
    return (
        <div className="space-y-0.5">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
            <div className={`text-sm font-bold ${warn ? 'text-amber-600' : 'text-slate-800'}`}>{value}</div>
        </div>
    );
}
