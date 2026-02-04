import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Send, CheckCircle, AlertTriangle, Database, Activity, UserPlus, FileText, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

type WebhookEvent = {
    id: string;
    type: 'lab_result' | 'hr_update' | 'compliance_alert';
    source: string;
    payload: any;
    status: 'pending' | 'success' | 'failed';
    timestamp: string;
};

export default function WebhookSimulator() {
    const [events, setEvents] = useState<WebhookEvent[]>([]);
    const [simulating, setSimulating] = useState(false);

    const templates = [
        {
            id: 'lab_result',
            name: 'Resultado de Laboratorio (HL7)',
            icon: Activity,
            color: 'text-emerald-500 bg-emerald-50',
            source: 'Quest Diagnostics API',
            payload: {
                patientId: 'PX-2026-001',
                testCode: 'BHC-001',
                testName: 'Biometría Hemática',
                result: 'Normal',
                values: { hb: 14.5, hto: 42, wbc: 6500 },
                status: 'FINAL',
                doctor: 'Dr. Simulado'
            }
        },
        {
            id: 'hr_update',
            name: 'Alta de Empleado (SAP SuccessFactors)',
            icon: UserPlus,
            color: 'text-blue-500 bg-blue-50',
            source: 'SAP ERP v4',
            payload: {
                employeeId: 'EMP-9988',
                action: 'HIRE',
                firstName: 'Nuevo',
                lastName: 'Empleado',
                department: 'Operaciones',
                email: 'nuevo.empleado@empresa.com',
                startDate: '2026-02-01'
            }
        },
        {
            id: 'compliance_alert',
            name: 'Alerta Normativa (STPS)',
            icon: AlertTriangle,
            color: 'text-amber-500 bg-amber-50',
            source: 'Gobierno Digital',
            payload: {
                alertType: 'NOM-035-INSPECTION',
                severity: 'HIGH',
                deadline: '2026-03-15',
                message: 'Requiere validación de encuestas ATS',
                reference: 'FOLIO-STPS-2026-X99'
            }
        }
    ];

    const triggerWebhook = async (template: any) => {
        setSimulating(true);
        const newEvent: WebhookEvent = {
            id: Math.random().toString(36).substr(2, 9),
            type: template.id,
            source: template.source,
            payload: template.payload,
            status: 'pending',
            timestamp: new Date().toLocaleTimeString()
        };

        setEvents(prev => [newEvent, ...prev]);

        // Simular latencia de red
        setTimeout(() => {
            setEvents(prev => prev.map(e =>
                e.id === newEvent.id ? { ...e, status: 'success' } : e
            ));

            // Efectos secundarios simulados (Toasts)
            if (template.id === 'lab_result') {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <Activity className="h-10 w-10 text-emerald-500 bg-emerald-100 rounded-full p-2" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">Resultado Disponible</p>
                                    <p className="mt-1 text-sm text-gray-500">Biometría Hemática recibida de Quest Diagnostics.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ));
            } else if (template.id === 'hr_update') {
                toast.success('SAP: Nuevo empleado sincronizado exitosamente');
            } else {
                toast('Alerta de Gobierno recibida', { icon: '⚠️' });
            }

            setSimulating(false);
        }, 1500);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Network className="w-8 h-8 text-indigo-600" />
                        API Gateway & Webhook Simulator
                    </h1>
                    <p className="text-slate-500">Herramienta de desarrollo para simular y probar integraciones externas.</p>
                </div>
                <Badge variant="outline" className="px-4 py-2 bg-green-50 text-green-700 border-green-200 gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    System Online
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panel de Control (Izquierda) */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Server className="w-5 h-5 text-slate-400" />
                                Disparadores Disponibles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {templates.map(template => (
                                <div key={template.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`p-2 rounded-lg ${template.color}`}>
                                            <template.icon className="w-5 h-5" />
                                        </div>
                                        <Badge variant="secondary" className="text-[10px]">{template.source}</Badge>
                                    </div>
                                    <h3 className="font-bold text-slate-700 mb-1">{template.name}</h3>
                                    <p className="text-xs text-slate-400 mb-4">Simula un POST request al endpoint /api/v1/webhooks/{template.id}</p>
                                    <Button
                                        onClick={() => triggerWebhook(template)}
                                        disabled={simulating}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        {simulating ? 'Enviando...' : 'Disparar Evento'}
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Log de Eventos (Derecha) */}
                <div className="lg:col-span-2">
                    <Card className="h-full border-slate-200 shadow-sm flex flex-col">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Database className="w-5 h-5 text-slate-400" />
                                Live Traffic Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden">
                            {events.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                                    <Network className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Esperando tráfico entrante...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                                    <AnimatePresence>
                                        {events.map(event => (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        {event.status === 'success' ? (
                                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
                                                        )}
                                                        <span className="font-mono text-xs text-slate-400">{event.timestamp}</span>
                                                        <span className="font-bold text-slate-700 uppercase text-xs tracking-wider">{event.type}</span>
                                                    </div>
                                                    <Badge variant={event.status === 'success' ? 'default' : 'secondary'} className={event.status === 'success' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
                                                        {event.status === 'success' ? '200 OK' : 'PENDING'}
                                                    </Badge>
                                                </div>
                                                <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
                                                    <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
