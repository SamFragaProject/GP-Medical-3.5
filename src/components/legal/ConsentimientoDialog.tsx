import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SignaturePad } from '@/components/shared/SignaturePad';
import { consentService } from '@/services/consentService';
import { Shield, FileText, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ConsentimientoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    pacienteId: string;
    pacienteNombre: string;
    empresaId: string;
    procedimiento: string;
    onSuccess?: (id: string) => void;
}

export function ConsentimientoDialog({
    isOpen,
    onClose,
    pacienteId,
    pacienteNombre,
    empresaId,
    procedimiento,
    onSuccess
}: ConsentimientoDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1: Reading, 2: Signing

    const handleSaveSignature = async (signatureDataUrl: string) => {
        try {
            setIsSubmitting(true);

            // 1. Convert DataURL to Blob
            const response = await fetch(signatureDataUrl);
            const blob = await response.blob();

            // 2. Upload to Storage
            const publicUrl = await consentService.uploadSignature(pacienteId, blob);

            // 3. Save Record to Database
            const result = await consentService.createConsent({
                empresa_id: empresaId,
                paciente_id: pacienteId,
                procedimiento: procedimiento,
                paciente_firmado: true,
                paciente_fecha_firma: new Date().toISOString(),
                documento_url: publicUrl,
                fecha_consentimiento: new Date().toISOString()
            });

            toast.success('Consentimiento firmado y guardado digitalmente');
            if (onSuccess) onSuccess(result.id);
            onClose();
        } catch (error) {
            console.error('Error saving consent:', error);
            toast.error('No se pudo guardar el consentimiento');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#020617] border-white/10 text-white p-0 overflow-hidden rounded-[2rem]">
                <div className="bg-emerald-500/10 border-b border-white/10 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
                            Consentimiento <span className="text-emerald-400">Informado</span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                            Protocolo Digital de Captura de Firma
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                                <Info className="text-emerald-400 w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">
                                    Paciente: <span className="text-emerald-400">{pacienteNombre}</span>
                                    <br />
                                    Procedimiento: <span className="text-emerald-400">{procedimiento}</span>
                                </p>
                            </div>

                            <ScrollArea className="h-64 rounded-xl border border-white/5 bg-black/40 p-6 text-slate-300 font-light leading-relaxed">
                                <h3 className="text-white font-black uppercase text-xs mb-4 tracking-widest underline decoration-emerald-500/50">Términos del Acuerdo</h3>
                                <p className="mb-4 text-sm">
                                    Por medio de la presente, yo, <strong className="text-white">{pacienteNombre}</strong>, autorizo de manera libre, voluntaria y consciente a GPMedical y al personal médico a cargo, para realizar el procedimiento de <strong className="text-white">{procedimiento}</strong>.
                                </p>
                                <p className="mb-4 text-sm">
                                    Se me han explicado claramente los beneficios esperados, así como los riesgos potenciales asociados, incluyendo pero no limitados a molestias locales o reacciones adversas menores. Entiendo que puedo retirar mi consentimiento en cualquier momento antes de la realización del mismo.
                                </p>
                                <p className="mb-4 text-sm">
                                    Asimismo, otorgo mi consentimiento para que mis datos personales y clínicos sean procesados bajo los protocolos de seguridad descritos en el Aviso de Privacidad de la institución, cumpliendo con la NOM-024-SSA3-2012.
                                </p>
                                <p className="text-[10px] text-slate-500 italic">
                                    Esta firma digital tiene plena validez legal conforme a la Ley de Firma Electrónica Avanzada vigente en territorio nacional.
                                </p>
                            </ScrollArea>

                            <div className="flex gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    className="flex-1 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => setStep(2)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px]"
                                >
                                    Continuar a Firma
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-6">
                                <FileText className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <h3 className="text-lg font-bold">Firma Digital Registrada</h3>
                                <p className="text-slate-400 text-xs">Por favor firme dentro del recuadro punteado</p>
                            </div>

                            <div className="bg-white p-2 rounded-2xl">
                                <SignaturePad
                                    onSave={handleSaveSignature}
                                    onClear={() => { }}
                                />
                            </div>

                            <Button
                                variant="link"
                                onClick={() => setStep(1)}
                                className="w-full text-slate-500 hover:text-emerald-400"
                            >
                                Volver a leer los términos
                            </Button>
                        </div>
                    )}
                </div>

                {isSubmitting && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                        <p className="text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando Firma...</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
