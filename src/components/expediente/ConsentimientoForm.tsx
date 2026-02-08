import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Shield, Save, X, RotateCcw, CheckCircle, FileText, User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { consentService } from '@/services/expedienteService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ConsentimientoFormProps {
    expedienteId: string;
    pacienteId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const TIPO_CONSENTIMIENTO = [
    { id: 'atencion_medica', label: 'Consentimiento para Atención Médica' },
    { id: 'manejo_datos', label: 'Aviso de Privacidad y Manejo de Datos' },
    { id: 'examen_ingreso', label: 'Consentimiento para Examen Médico de Ingreso' },
    { id: 'examen_periodico', label: 'Consentimiento para Examen Médico Periódico' },
    { id: 'pruebas_toxicologicas', label: 'Consentimiento para Pruebas Toxicológicas' },
];

export function ConsentimientoForm({ expedienteId, pacienteId, onSuccess, onCancel }: ConsentimientoFormProps) {
    const sigPad = useRef<any>(null);
    const [tipo, setTipo] = useState<string>('');
    const [nombreFirmante, setNombreFirmante] = useState('');
    const [parentesco, setParentesco] = useState('Propio');
    const queryClient = useQueryClient();

    const clear = () => {
        sigPad.current?.clear();
    };

    const mutation = useMutation({
        mutationFn: (values: any) => consentService.create(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consentimientos', expedienteId] });
            toast.success('Consentimiento guardado correctamente');
            onSuccess();
        },
        onError: (error) => {
            toast.error('Error al guardar el consentimiento');
            console.error(error);
        }
    });

    const handleSave = () => {
        if (sigPad.current?.isEmpty()) {
            return toast.error('Debe proporcionar una firma');
        }
        if (!tipo) {
            return toast.error('Seleccione el tipo de consentimiento');
        }
        if (!nombreFirmante) {
            return toast.error('Ingrese el nombre del firmante');
        }

        const signatureData = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');

        mutation.mutate({
            expediente_id: expedienteId,
            paciente_id: pacienteId,
            tipo,
            titulo: TIPO_CONSENTIMIENTO.find(t => t.id === tipo)?.label,
            firmado: true,
            fecha_firma: new Date().toISOString(),
            firma_digital_data: signatureData,
            firmante_nombre: nombreFirmante,
            firmante_parentesco: parentesco,
            ip_firma: '127.0.0.1', // En producción obtener IP real
            user_agent: navigator.userAgent
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Tipo de Documento</Label>
                        <Select onValueChange={setTipo}>
                            <SelectTrigger className="rounded-xl border-slate-200">
                                <SelectValue placeholder="Seleccione documento..." />
                            </SelectTrigger>
                            <SelectContent>
                                {TIPO_CONSENTIMIENTO.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Nombre del Firmante</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Nombre completo..."
                                className="pl-10 rounded-xl"
                                value={nombreFirmante}
                                onChange={(e) => setNombreFirmante(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Parentesco / Relación</Label>
                        <Input
                            placeholder="Ej. Propio, Padre, Tutor..."
                            className="rounded-xl"
                            value={parentesco}
                            onChange={(e) => setParentesco(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase text-slate-500 flex items-center justify-between">
                        <span>Firma Digital Manuscríta</span>
                        <Button variant="ghost" size="sm" onClick={clear} className="h-6 text-[10px] text-slate-400 hover:text-red-500">
                            <RotateCcw className="w-3 h-3 mr-1" /> Limpiar
                        </Button>
                    </Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden h-[180px]">
                        <SignatureCanvas
                            ref={sigPad}
                            penColor='black'
                            canvasProps={{ width: 500, height: 180, className: 'sigCanvas w-full h-full cursor-crosshair' }}
                        />
                    </div>
                    <p className="text-[10px] text-center text-slate-400 italic">
                        Al firmar en este recuadro, el paciente acepta los términos del documento seleccionado.
                    </p>
                </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-blue-900">Validez Jurídica (NOM-024-SSA3)</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Este proceso de firma electrónica avanzada cumple con los estándares de integridad y autenticidad requeridos para el expediente clínico electrónico en México.
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700 min-w-[150px] shadow-lg shadow-emerald-200"
                    onClick={handleSave}
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? 'Guardando...' : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Consentimiento
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
