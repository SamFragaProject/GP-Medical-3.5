import React, { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Eraser, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SignaturePadProps {
    onSave: (signatureDataUrl: string) => void;
    onClear: () => void;
}

export function SignaturePad({ onSave, onClear }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => {
        sigCanvas.current?.clear();
        onClear();
    };

    const save = () => {
        if (sigCanvas.current) {
            if (sigCanvas.current.isEmpty()) {
                return;
            }
            const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="navy"
                    canvasProps={{
                        className: "w-full h-48 cursor-crosshair",
                        style: { width: '100%', height: '192px' }
                    }}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clear}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Borrar"
                    >
                        <Eraser size={16} />
                    </Button>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Firma del Trabajador</p>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={clear}
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    <X className="w-4 h-4 mr-2" /> Limpiar
                </Button>
                <Button
                    onClick={save}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                    <Check className="w-4 h-4 mr-2" /> Guardar Firma
                </Button>
            </div>

            <p className="text-[10px] text-slate-500 text-center px-4 italic">
                Al firmar en este recuadro, el paciente acepta los términos y condiciones del consentimiento informado y aviso de privacidad anteriormente leídos.
            </p>
        </div>
    )
}
