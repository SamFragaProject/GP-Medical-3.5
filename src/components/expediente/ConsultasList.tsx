import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stethoscope, Calendar, Plus, Eye, Edit2, Trash2, Clock, MapPin, User, FileText, Pill, Save, ChevronRight, Activity, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { consultaService } from '@/services/expedienteService';
import type { Consulta } from '@/types/expediente';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ConsultasListProps {
    expedienteId: string;
}

export function ConsultasList({ expedienteId }: ConsultasListProps) {
    const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: consultas, isLoading } = useQuery({
        queryKey: ['consultas', expedienteId],
        queryFn: () => consultaService.listByExpediente(expedienteId),
    });

    const handleView = (consulta: Consulta) => {
        setSelectedConsulta(consulta);
        setIsViewModalOpen(true);
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'completada': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completada</Badge>;
            case 'en_proceso': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">En Proceso</Badge>;
            case 'cancelada': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelada</Badge>;
            default: return <Badge variant="outline">{estado}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Historial de Consultas</h3>
                        <p className="text-xs text-slate-500">Registro cronológico de atenciones médicas</p>
                    </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Consulta
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : consultas?.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2">
                    <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No hay consultas registradas para este expediente</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {consultas?.map((consulta) => (
                        <Card key={consulta.id} className="group hover:shadow-md transition-all cursor-pointer" onClick={() => handleView(consulta)}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-50 flex flex-col items-center justify-center border text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            <span className="text-xs font-bold leading-none">{new Date(consulta.fecha_consulta).getDate()}</span>
                                            <span className="text-[10px] uppercase">{new Date(consulta.fecha_consulta).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900">{consulta.tipo === 'ocupacional' ? `Consulta ${consulta.subtipo || ''}` : 'Consulta General'}</h4>
                                                {getStatusBadge(consulta.estado)}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                                                {consulta.motivo_consulta || 'Sin motivo registrado'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:flex flex-col items-end">
                                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                Atendido por
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700">{consulta.medico?.nombre || 'Dr. Médico'}</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal de Detalle */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-slate-50 border-b">
                        <div className="flex justify-between items-start">
                            <div>
                                <DialogTitle className="text-xl">Detalle de Consulta</DialogTitle>
                                <p className="text-sm text-slate-500 mt-1">
                                    ID: {selectedConsulta?.id} | {selectedConsulta && new Date(selectedConsulta.fecha_consulta).toLocaleString()}
                                </p>
                            </div>
                            {selectedConsulta && getStatusBadge(selectedConsulta.estado)}
                        </div>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] p-6">
                        <div className="space-y-8">
                            {/* Encabezado */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-400 uppercase">Médico Tratante</Label>
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                                        {selectedConsulta?.medico?.nombre}
                                    </div>
                                    <p className="text-xs text-slate-500">{selectedConsulta?.medico?.especialidad || 'Medicina del Trabajo'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-slate-400 uppercase">Motivo de Consulta</Label>
                                    <div className="font-semibold text-slate-800">{selectedConsulta?.motivo_consulta}</div>
                                </div>
                            </div>

                            <Separator />

                            {/* SOAP */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs font-bold">S</div>
                                        <h5 className="font-bold text-sm">Subjetivo (Padecimiento Actual)</h5>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border">
                                        {selectedConsulta?.padecimiento_actual || 'No registrado'}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center text-emerald-600 text-xs font-bold">O</div>
                                        <h5 className="font-bold text-sm">Objetivo (Exploración)</h5>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border">
                                        {selectedConsulta?.objetivo || 'Revisión en expediente de exploración física'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center text-amber-600 text-xs font-bold">A</div>
                                        <h5 className="font-bold text-sm">Análisis y Diagnóstico</h5>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                                        <div className="flex items-start gap-2">
                                            <Activity className="w-4 h-4 text-amber-600 mt-0.5" />
                                            <div>
                                                <span className="font-bold text-sm block">Diagnóstico Principal:</span>
                                                <span className="text-sm">{selectedConsulta?.diagnostico_principal_desc || selectedConsulta?.diagnostico_principal}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center text-purple-600 text-xs font-bold">P</div>
                                        <h5 className="font-bold text-sm">Plan de Tratamiento</h5>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border">
                                        {selectedConsulta?.plan_tratamiento || 'No registrado'}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Recomendaciones */}
                            <div className="space-y-3">
                                <h5 className="font-bold text-sm flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    Recomendaciones Médicas
                                </h5>
                                <p className="text-sm text-slate-600 p-4 bg-emerald-50/30 rounded-lg border border-emerald-100 italic">
                                    "{selectedConsulta?.recomendaciones || 'Sin recomendaciones adicionales'}"
                                </p>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-6 bg-slate-50 border-t">
                        <div className="flex justify-between w-full items-center">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock className="w-3 h-3" />
                                Actualizado: {selectedConsulta && new Date(selectedConsulta.updated_at).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Pill className="w-4 h-4 mr-2" />
                                    Receta
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Printer className="w-4 h-4 mr-2" />
                                    Dictamen
                                </Button>
                                <Button size="sm" onClick={() => setIsViewModalOpen(false)}>Cerrar</Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
