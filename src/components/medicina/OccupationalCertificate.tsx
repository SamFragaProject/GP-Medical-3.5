import React from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, AlertTriangle, XCircle, Clock, MapPin, Phone, Mail, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface OccupationalCertificateProps {
    paciente: any
    empresa: any
    encuentro: any
    medico: any
    onClose?: () => void
}

export function OccupationalCertificate({ paciente, empresa, encuentro, medico, onClose }: OccupationalCertificateProps) {
    const handlePrint = () => {
        window.print()
    }

    const dictamenInfo = {
        apto: { label: 'APTO', color: 'emerald', icon: CheckCircle, desc: 'El trabajador no presenta alteraciones que limiten el desempeño de su puesto.' },
        restriccion: { label: 'APTO CON RESTRICCIÓN', color: 'amber', icon: AlertTriangle, desc: 'El trabajador presenta alteraciones que requieren ajustes o limitaciones temporales.' },
        no_apto: { label: 'NO APTO', color: 'rose', icon: XCircle, desc: 'El trabajador presenta condiciones que impiden el desempeño seguro de su puesto.' },
        pendiente: { label: 'PENDIENTE', color: 'slate', icon: Clock, desc: 'Se requieren estudios complementarios para emitir un dictamen final.' },
    }[encuentro.dictamen as 'apto' | 'restriccion' | 'no_apto' | 'pendiente'] || { label: 'PENDIENTE', color: 'slate', icon: Clock, desc: '' }

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 print:p-0 print:bg-white">
            {/* Botones de acción (ocultos en impresión) */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <Button variant="ghost" onClick={onClose} className="rounded-full">
                    Cerrar
                </Button>
                <Button onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 shadow-xl">
                    Imprimir Certificado (PDF)
                </Button>
            </div>

            {/* Certificado Real */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:max-w-full"
            >
                {/* Header con Branding */}
                <div className="bg-slate-900 p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                                    <Shield className="text-white w-7 h-7" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black tracking-tighter">GPMedical</h1>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-blue-400">Salud Ocupacional Premium</p>
                                </div>
                            </div>
                            <h2 className="text-4xl font-black mb-2 leading-tight">Certificado de Aptitud <br /><span className="text-blue-400">Médico Laboral</span></h2>
                            <div className="flex gap-4 text-xs text-slate-400 font-medium">
                                <span className="flex items-center gap-1"><MapPin size={12} /> Corporativo Global</span>
                                <span className="flex items-center gap-1"><Phone size={12} /> +52 (55) 1234-5678</span>
                                <span className="flex items-center gap-1"><Mail size={12} /> hse@gpmedical.mx</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block p-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                                <p className="text-[10px] uppercase font-black text-blue-400 mb-1">Folio de Certificado</p>
                                <p className="text-2xl font-mono font-bold tracking-tighter">#{encuentro.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-4">Fecha de Emisión: <br /> <span className="text-white font-bold">{new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
                        </div>
                    </div>
                </div>

                {/* Cuerpo del Certificado */}
                <div className="p-12 space-y-10">

                    {/* Datos del Trabajador */}
                    <section className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100 pb-2">Datos del Colaborador</h3>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 uppercase font-medium">Nombre Completo</p>
                                <p className="text-xl font-black text-slate-900">{paciente.nombres} {paciente.apellidos || (paciente.apellido_paterno + ' ' + (paciente.apellido_materno || ''))}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-medium">NSS / CURP</p>
                                    <p className="text-sm font-bold text-slate-700">{paciente.nss || 'N/A'} / {paciente.curp || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-medium">Edad / Género</p>
                                    <p className="text-sm font-bold text-slate-700">{paciente.edad || '32'} años / {paciente.genero}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100 pb-2">Información Laboral</h3>
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 uppercase font-medium">Empresa / Site</p>
                                <p className="text-lg font-black text-slate-800">{empresa.nombre} / {paciente.sede_nombre || 'Planta General'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-medium">Puesto / Área</p>
                                    <p className="text-sm font-bold text-slate-700">{paciente.puesto || 'Operador'} / {paciente.area || 'Producción'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-medium">Turno</p>
                                    <p className="text-sm font-bold text-slate-700">{paciente.turno || 'Matutino'}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Resultado del Dictamen - Impacto Visual Máximo */}
                    <section className={`p-8 rounded-[2rem] bg-${dictamenInfo.color}-50 border border-${dictamenInfo.color}-100 relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 p-4 text-${dictamenInfo.color}-200 opacity-20`}>
                            <Award size={120} />
                        </div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className={`w-20 h-20 rounded-3xl bg-${dictamenInfo.color}-500 text-white flex items-center justify-center shadow-lg shadow-${dictamenInfo.color}-500/20`}>
                                <dictamenInfo.icon size={40} />
                            </div>
                            <div>
                                <p className={`text-[10px] uppercase font-black text-${dictamenInfo.color}-600 tracking-[0.3em] mb-1`}>Resultado de Evaluación</p>
                                <h3 className={`text-4xl font-black text-${dictamenInfo.color}-900 tracking-tighter`}>{dictamenInfo.label}</h3>
                                <p className={`text-sm text-${dictamenInfo.color}-700 mt-2 font-medium max-w-lg`}>
                                    {dictamenInfo.desc}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Restricciones y Recomendaciones */}
                    <section className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-900">
                                <AlertTriangle size={14} className="text-amber-500" />
                                <h4 className="text-xs font-black uppercase tracking-widest">Restricciones Laborales</h4>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed min-h-[100px]">
                                {encuentro.restricciones || 'Sin restricciones detectadas para el desempeño habitual de sus funciones.'}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-900">
                                <CheckCircle size={14} className="text-emerald-500" />
                                <h4 className="text-xs font-black uppercase tracking-widest">Recomendaciones Preventivas</h4>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed min-h-[100px]">
                                {encuentro.recomendaciones_empresa || 'Continuar con el programa de vigilancia epidemiológica anual.'}
                            </div>
                        </div>
                    </section>

                    {/* Firmas y Sellos */}
                    <section className="pt-12 grid grid-cols-2 gap-16">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-64 border-b-2 border-slate-900 mb-4 h-24 flex items-end justify-center">
                                {/* Aquí iría la firma digital si existe */}
                            </div>
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Médico Examinador</p>
                            <p className="text-sm font-bold text-slate-900">{medico.nombre} {medico.apellido_paterno}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Cédula Prof: {medico.cedula || '12345678'} · Registro SSA</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-64 border-b-2 border-slate-900 mb-4 h-24 flex items-end justify-center">
                                {/* Espacio para sello de la empresa o firma del paciente */}
                            </div>
                            <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Recibido (RRHH / EHS)</p>
                            <p className="text-sm font-bold text-slate-900">Sello de Recepción</p>
                            <p className="text-[10px] text-slate-500 font-medium italic">Vigencia sugerida: 12 meses</p>
                        </div>
                    </section>
                </div>

                {/* Footer legal */}
                <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
                        Este documento cumple con los lineamientos de la NOM-004-SSA3-2012 y la NOM-030-STPS-2009.
                        La información contenida es de carácter confidencial y solo para fines de salud ocupacional.
                        Verifique la autenticidad escaneando el código QR oficial.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
