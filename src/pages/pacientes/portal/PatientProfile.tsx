import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, LogOut, Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function PatientProfile() {
    const { user, logout } = useAuth();

    return (
        <div className="p-6 space-y-8">
            {/* Header Perfil */}
            <div className="flex flex-col items-center gap-4 py-6">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>PX</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h1 className="text-2xl font-black text-slate-900">
                        {user ? `${user.nombre} ${user.apellido_paterno}` : 'Usuario'}
                    </h1>
                    <p className="text-slate-500">{user?.email || 'Paciente'}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full px-6">
                    Editar Perfil
                </Button>
            </div>

            {/* Secciones */}
            <div className="space-y-6">
                <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
                    {[
                        { icon: User, label: 'Datos Personales' },
                        { icon: Shield, label: 'Seguridad y Privacidad' },
                    ].map((item, i) => (
                        <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-slate-700">{item.label}</span>
                            </div>
                            <span className="text-slate-300">›</span>
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Notificaciones</h3>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Bell className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-slate-700 text-sm">Recordatorios de Citas</p>
                                <p className="text-xs text-slate-400">Push y Correo</p>
                            </div>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-14 rounded-2xl"
                    onClick={() => logout()}
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Cerrar Sesión
                </Button>
            </div>

            <p className="text-center text-xs text-slate-300 py-4">
                Versión 1.0.0 • GPMedical App
            </p>
        </div>
    );
}
