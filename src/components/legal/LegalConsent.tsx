import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface LegalConsentProps {
    onAccept: (version: string) => void
    onCancel: () => void
    type: 'privacy' | 'informed'
}

export function LegalConsent({ onAccept, onCancel, type }: LegalConsentProps) {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
    const [accepted, setAccepted] = useState(false)

    const content = {
        privacy: {
            title: 'Aviso de Privacidad Integral',
            version: 'v1.2-2026',
            text: `GPMedical Health Systems (en adelante "El Prestador") con domicilio en Ciudad de México, es responsable del tratamiento de sus datos personales y sensibles...
      
      FINALIDADES: 
      1. Integración de Expediente Clínico Electrónico (NOM-024-SSA3-2012).
      2. Seguimiento de salud ocupacional y dictámenes médicos.
      3. Análisis estadístico anonimizado para la mejora de programas de prevención.
      
      DERECHOS ARCO: Usted podrá ejercer sus derechos de Acceso, Rectificación, Cancelación u Oposición enviando un correo a privacidad@gpmedical.mx.
      
      TRANSFERENCIA: Sus datos solo serán compartidos con su empresa empleadora para fines estrictamente laborales y de seguridad social, bajo protocolos de encriptación.`
        },
        informed: {
            title: 'Consentimiento Informado para Pruebas Médicas',
            version: 'v1.0-2026',
            text: `Yo, mediante la aceptación de este documento, manifiesto mi voluntad libre y espontánea de someterme a las evaluaciones médicas ocupacionales...
      
      DECLARO:
      1. He sido informado sobre la naturaleza y propósito de las pruebas.
      2. Entiendo que los resultados serán utilizados para determinar mi aptitud laboral.
      3. Autorizo el uso de herramientas de Inteligencia Artificial para el apoyo en la detección de hallazgos clínicos, entendiendo que el diagnóstico final será validado por un médico humano.
      4. Acepto que mi información sea resguardada de forma digital bajo los estándares de seguridad vigentes.`
        }
    }[type]

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            setHasScrolledToBottom(true)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${type === 'privacy' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {type === 'privacy' ? <Shield size={20} /> : <FileText size={20} />}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">{content.title}</h3>
                    <Badge variant="outline" className="text-[10px]">{content.version}</Badge>
                </div>
            </div>

            <ScrollArea
                className="h-[250px] w-full rounded-md border p-4 bg-slate-50/50"
                onScrollCapture={handleScroll}
            >
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {content.text}
                    <div className="mt-8 p-4 bg-white/80 rounded-lg border border-dashed border-slate-300 text-xs text-center">
                        Fin del documento legal.
                    </div>
                </div>
            </ScrollArea>

            {!hasScrolledToBottom && (
                <p className="text-[10px] text-amber-600 flex items-center gap-1 animate-pulse">
                    <AlertCircle size={12} /> Favor de leer el documento completo para continuar.
                </p>
            )}

            <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                    id="terms"
                    checked={accepted}
                    onCheckedChange={(checked) => setAccepted(checked as boolean)}
                    disabled={!hasScrolledToBottom}
                />
                <div className="grid gap-1.5 leading-none">
                    <label
                        htmlFor="terms"
                        className={`text-sm font-medium leading-none cursor-pointer ${!hasScrolledToBottom ? 'opacity-50' : ''}`}
                    >
                        He leído y acepto los términos y condiciones de este documento.
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onCancel} size="sm">Cancelar</Button>
                <Button
                    onClick={() => onAccept(content.version)}
                    disabled={!accepted || !hasScrolledToBottom}
                    size="sm"
                    className={type === 'privacy' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                >
                    Confirmar Aceptación
                </Button>
            </div>
        </div>
    )
}
