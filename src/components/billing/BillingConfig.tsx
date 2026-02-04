import React from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Receipt,
    FileText,
    ShieldCheck,
    Zap,
    RefreshCcw,
    CheckCircle2,
    Clock,
    DollarSign,
    QrCode,
    Settings,
    Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function BillingConfig() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* SaaS Subscription Card */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden rounded-[2.5rem]">
                <CardContent className="p-12 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px] tracking-widest uppercase">
                                    Active Platform Plan
                                </Badge>
                                <span className="text-slate-400 text-xs font-medium">Since: Jan 2026</span>
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter mb-2 italic">Premium Grid Console</h2>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                Acceso total a salud ocupacional, IA Predictiva y <span className="text-emerald-400 font-bold">API Gateway</span>.
                            </p>
                        </div>
                        <div className="text-left md:text-right">
                            <div className="text-6xl font-black tracking-tight mb-2 tabular-nums italic">$5,999<span className="text-xl text-slate-400">/mo</span></div>
                            <Button className="bg-white text-slate-900 font-black hover:bg-slate-100 rounded-2xl h-12 px-8 uppercase text-[10px] tracking-widest transition-all">
                                Manage via Stripe Portals
                            </Button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 relative z-10">
                        {[
                            { icon: CreditCard, label: 'Payment Method', val: 'Visa **** 4421', status: 'DEFAULT' },
                            { icon: Clock, label: 'Next Renewal', val: 'Feb 28, 2026', status: 'AUTO-RENEW' },
                            { icon: ShieldCheck, label: 'Data Security', val: 'AES-256 SYNC', status: 'VERIFIED' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
                                <stat.icon className="w-6 h-6 text-emerald-400 mb-4" />
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
                                <div className="text-lg font-bold text-white mb-2">{stat.val}</div>
                                <Badge variant="outline" className="border-white/20 text-white text-[9px] font-black">{stat.status}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Invoicing Settings Group */}
            <div className="grid md:grid-cols-[1.5fr_1fr] gap-8">
                {/* Tax Information (Mexico Focus) */}
                <Card className="border-slate-200 shadow-xl rounded-[3rem] p-4 bg-white">
                    <CardHeader className="p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                <Receipt className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Configuración Fiscal GPMedical</CardTitle>
                                <CardDescription className="font-medium">Datos necesarios para la emisión automática de tus facturas SAT 4.0</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-10 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">RFC del Emisor</label>
                                <div className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 flex items-center font-bold text-slate-900 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                                    GPMD260128M12
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Régimen Fiscal</label>
                                <div className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 flex items-center font-bold text-slate-900">
                                    601 - General de Ley Personas Morales
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Razón Social</label>
                            <div className="h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 flex items-center font-bold text-slate-900">
                                GPMEDICAL SOLUTIONS MÉXICO S.A. DE C.V.
                            </div>
                        </div>

                        <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                                    <QrCode className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-emerald-900 tracking-tight">Constancia de Situación Fiscal</div>
                                    <div className="text-xs text-emerald-700/70 font-medium">Validación automática mediante OCR de Inteligencia Artificial</div>
                                </div>
                            </div>
                            <Button className="bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-100 rounded-xl px-6 font-bold shadow-sm">
                                Actualizar CSF
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Automation & Insights */}
                <Card className="border-slate-200 shadow-xl rounded-[3rem] overflow-hidden flex flex-col bg-white">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Automatización</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 flex-1">
                        <div className="space-y-6">
                            {[
                                { title: 'Facturación Automática', desc: 'Emisión de CFDI vía Facturapi al confirmar pago en Stripe.', icon: Zap, active: true },
                                { title: 'Webhooks de Notificación', desc: 'Envío automático de XML/PDF al correo administrativo.', icon: RefreshCcw, active: true },
                                { title: 'Reporte Mensual SAT', desc: 'Consolidado de ingresos para conciliación contable.', icon: FileText, active: false }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-900 text-sm tracking-tight">{item.title}</span>
                                            <Badge className={item.active ? 'bg-emerald-100 text-emerald-700 border-none' : 'bg-slate-100 text-slate-400 border-none'}>
                                                {item.active ? 'ON' : 'OFF'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-8 border-t border-slate-50 text-center">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 italic italic">Stripe Webhook Node: v2.4.0</div>
                            <Button variant="outline" className="w-full h-12 rounded-xl text-slate-600 border-slate-200 font-bold hover:bg-slate-50 uppercase text-[10px] tracking-widest">
                                Validar Webhooks
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
