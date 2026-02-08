import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlaskConical, Plus, FileText, Download, Eye, AlertCircle, CheckCircle, Clock, Search, Filter, Activity, Zap, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { estudioService } from '@/services/expedienteService';
import type { EstudioParaclinico } from '@/types/expediente';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface EstudiosListProps {
    expedienteId: string;
}

export function EstudiosList({ expedienteId }: EstudiosListProps) {
    const [selectedEstudio, setSelectedEstudio] = useState<EstudioParaclinico | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: estudios, isLoading } = useQuery({
        queryKey: ['estudios', expedienteId],
        queryFn: () => estudioService.listByExpediente(expedienteId),
    });

    const handleView = (estudio: EstudioParaclinico) => {
        setSelectedEstudio(estudio);
        setIsViewModalOpen(true);
    };

    const getSemaforoColor = (semaforo?: string) => {
        switch (semaforo) {
            case 'verde': return 'bg-emerald-500';
            case 'amarillo': return 'bg-amber-500';
            case 'rojo': return 'bg-red-500';
            default: return 'bg-slate-300';
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'completo': return <Badge className="bg-emerald-100 text-emerald-700">Resultado Listo</Badge>;
            case 'pendiente': return <Badge className="bg-blue-100 text-blue-700">En Trámite</Badge>;
            case 'anormal': return <Badge className="bg-amber-100 text-amber-700">Hallazgos</Badge>;
            case 'critico': return <Badge className="bg-red-100 text-red-700">Crítico</Badge>;
            default: return <Badge variant="outline">{estado}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FlaskConical className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Estudios Paraclínicos</h3>
                        <p className="text-xs text-slate-500">Resultados de laboratorio, imagen y gabinete</p>
                    </div>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Solicitar Estudio
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : estudios?.length === 0 ? (
                    <Card className="col-span-full p-12 text-center border-dashed border-2">
                        <FlaskConical className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">Historial de estudios vacío</p>
                    </Card>
                ) : (
                    estudios?.map((estudio) => (
                        <Card key={estudio.id} className="group hover:shadow-xl transition-all cursor-pointer border-t-4 overflow-hidden"
                            style={{ borderTopColor: estudio.semaforo === 'verde' ? '#10b981' : estudio.semaforo === 'amarillo' ? '#f59e0b' : estudio.semaforo === 'rojo' ? '#ef4444' : '#cbd5e1' }}
                            onClick={() => handleView(estudio)}
                        >
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">{estudio.tipo}</span>
                                        <h4 className="font-bold text-slate-900 line-clamp-1">{estudio.subtipo || estudio.tipo}</h4>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${getSemaforoColor(estudio.semaforo)} shadow-sm`} />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(estudio.fecha_solicitud).toLocaleDateString()}
                                    </div>
                                    {getStatusBadge(estudio.estado)}
                                </div>

                                <div className="mt-6 pt-4 border-t flex justify-between items-center h-8">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <Activity className="w-3 h-3 text-slate-400" />
                                        <span className="text-[11px] text-slate-500 line-clamp-1">Por: {(estudio as any).medico_solicita?.nombre || 'Solicitud Externa'}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="group-hover:text-purple-600">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-purple-600" />
                            Resultado de {selectedEstudio?.subtipo || selectedEstudio?.tipo}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
                            <h5 className="font-bold text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Informe de Resultado
                            </h5>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                {selectedEstudio?.resultado || 'Esperando carga de resultados por parte del laboratorio.'}
                            </p>
                        </div>

                        {selectedEstudio?.archivo_url && (
                            <Button className="w-full bg-slate-900 hover:bg-black">
                                <Download className="w-4 h-4 mr-2" />
                                Descargar Documento (PDF/Imagen)
                            </Button>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                Solicitado: {selectedEstudio && new Date(selectedEstudio.fecha_solicitud).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3" />
                                Estado: {selectedEstudio?.estado}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
