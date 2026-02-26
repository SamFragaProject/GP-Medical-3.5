import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, CheckCircle2, AlertCircle, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export function RelojChecador() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [location, setLocation] = useState<string>('Buscando señal GPS...');
    const [checkedIn, setCheckedIn] = useState<{ time: string, status: 'ontime' | 'late' } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Simulando obtención de GPS
        const timeout = setTimeout(() => {
            setLocation('Lat: 20.6754, Lng: -100.4125 (Sede Principal GP Medical)');
        }, 2500);
        return () => clearTimeout(timeout);
    }, []);

    const handleCheckIn = () => {
        setIsCheckingIn(true);

        // Simular llamada a API
        setTimeout(() => {
            setIsCheckingIn(false);
            const hour = currentTime.getHours();
            const isLate = hour >= 9; // Después de las 9:00 AM es retardo

            setCheckedIn({
                time: currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                status: isLate ? 'late' : 'ontime'
            });

            if (isLate) {
                toast.error('Ingreso con retardo registrado.');
            } else {
                toast.success('¡Ingreso a tiempo registrado con éxito!');
            }
        }, 1500);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Reloj App Principal */}
            <Card className="p-8 border-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden group">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/30 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-8">

                    {/* Header */}
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
                            <Clock className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold tracking-widest uppercase text-slate-200">Terminal Activa</span>
                        </div>
                        <h2 className="text-xl font-medium text-slate-400">
                            {currentTime.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h2>
                    </div>

                    {/* Digital Clock */}
                    <div className="font-black text-7xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 py-4">
                        {currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>

                    {/* GPS Status */}
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-400 bg-black/20 px-4 py-3 rounded-xl border border-white/5 w-full justify-center">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span className="truncate">{location}</span>
                    </div>

                    {/* Action Button */}
                    {!checkedIn ? (
                        <Button
                            onClick={handleCheckIn}
                            disabled={isCheckingIn || location.includes('Buscando')}
                            className="w-full h-20 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-lg font-black shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] border-0 transition-all duration-300 group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                            {isCheckingIn ? (
                                <span className="flex items-center gap-3 relative z-10">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verificando Biometría...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3 relative z-10">
                                    <Fingerprint className="w-6 h-6" />
                                    Registrar Ingreso
                                </span>
                            )}
                        </Button>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`w-full p-6 rounded-2xl border flex flex-col items-center gap-3 ${checkedIn.status === 'ontime'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                }`}
                        >
                            {checkedIn.status === 'ontime' ? (
                                <CheckCircle2 className="w-10 h-10" />
                            ) : (
                                <AlertCircle className="w-10 h-10" />
                            )}
                            <div>
                                <h3 className="font-bold text-lg text-white">
                                    {checkedIn.status === 'ontime' ? 'Ingreso a Tiempo' : 'Ingreso con Retardo'}
                                </h3>
                                <p className="text-sm opacity-80 font-medium">Registrado a las {checkedIn.time}</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </Card >

            {/* Panel lateral: Últimos registros / Políticas */}
            < div className="space-y-6" >
                <Card className="p-6 border-slate-200/60 shadow-sm rounded-3xl bg-white/50 backdrop-blur-md">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Historial de Hoy
                    </h3>
                    <div className="space-y-4">
                        {checkedIn ? (
                            <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${checkedIn.status === 'ontime' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">Ingreso</p>
                                        <p className="text-xs text-slate-500 font-medium">Sede Principal</p>
                                    </div>
                                </div>
                                <span className="font-black text-slate-700">{checkedIn.time}</span>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-sm font-bold text-slate-400">
                                Ningún registro de asistencia aún
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-6 border-emerald-100 shadow-sm rounded-3xl bg-emerald-50/50">
                    <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        Geocerca Activa
                    </h3>
                    <p className="text-xs font-medium text-emerald-700/80 leading-relaxed">
                        El sistema valida que te encuentres dentro del radio permitido de tu sede asignada (50mts). Los ingresos registrados fuera de este radio podrían marcarse como incidencias.
                    </p>
                </Card>
            </div >
        </div >
    );
}
