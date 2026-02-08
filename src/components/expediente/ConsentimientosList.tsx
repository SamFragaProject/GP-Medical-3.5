import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Plus, FileText, CheckCircle, Clock, Eye, Download, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { consentService } from '@/services/expedienteService';
import { ConsentimientoForm } from './ConsentimientoForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConsentimientosListProps {
    expedienteId: string;
    pacienteId: string;
}

export function ConsentimientosList({ expedienteId, pacienteId }: ConsentimientosListProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedConsent, setSelectedConsent] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const { data: consentimientos, isLoading } = useQuery({
        queryKey: ['consentimientos', expedienteId],
        queryFn: () => consentService.listByExpediente(expedienteId),
    });

    const handleView = (consent: any) => {
        setSelectedConsent(consent);
        setIsViewModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Consentimientos Informados</h3>
                        <p className="text-xs text-slate-500">Documentos legales y autorizaciones firmadas</p>
                    </div>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Consentimiento
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : consentimientos?.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2">
                    <Shield className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No hay documentos firmados legalmente</p>
                    <Button variant="outline" onClick={() => setIsAddModalOpen(true)} className="mt-4">
                        Crear primer documento
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {consentimientos?.map((consent: any) => (
                        <Card key={consent.id} className="group hover:shadow-xl transition-all cursor-pointer border-t-4 border-t-indigo-500">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
                                        Firmado
                                    </Badge>
                                </div>

                                <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{consent.titulo}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                    <Clock className="w-3 h-3" />
                                    {new Date(consent.fecha_firma).toLocaleDateString()}
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="font-semibold">{consent.firmante_nombre}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 h-8 text-[11px] hover:bg-indigo-50 hover:text-indigo-700"
                                            onClick={() => handleView(consent)}
                                        >
                                            <Eye className="w-3.5 h-3.5 mr-1" /> Ver Firma
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Download className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal para Agregar */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-600" />
                            Nuevo Consentimiento Informado
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <ConsentimientoForm
                            expedienteId={expedienteId}
                            pacienteId={pacienteId}
                            onSuccess={() => setIsAddModalOpen(false)}
                            onCancel={() => setIsAddModalOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal para Ver */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Validación de Firma</DialogTitle>
                    </DialogHeader>
                    {selectedConsent && (
                        <div className="space-y-4 py-4 flex flex-col items-center">
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl w-full flex justify-center shadow-inner">
                                <img src={selectedConsent.firma_digital_data} alt="Firma Digital" className="max-h-[150px]" />
                            </div>
                            <div className="w-full space-y-2 bg-slate-50 p-4 rounded-2xl text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Firmante:</span>
                                    <span className="font-bold">{selectedConsent.firmante_nombre}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Parentesco:</span>
                                    <span className="font-bold">{selectedConsent.firmante_parentesco}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Fecha/Hora:</span>
                                    <span className="font-bold">{new Date(selectedConsent.fecha_firma).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Huella Digital (ID):</span>
                                    <span className="font-mono text-[9px] truncate ml-4">{selectedConsent.id}</span>
                                </div>
                            </div>
                            <Button onClick={() => setIsViewModalOpen(false)} className="w-full bg-slate-900">Cerrar</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
