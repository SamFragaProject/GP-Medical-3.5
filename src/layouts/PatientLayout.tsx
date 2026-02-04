import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Activity, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function PatientLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const navItems = [
        { icon: Home, label: 'Inicio', path: '/pacientes/portal' },
        { icon: Calendar, label: 'Citas', path: '/pacientes/portal/citas' },
        { icon: Activity, label: 'Salud', path: '/pacientes/portal/salud' },
        { icon: User, label: 'Perfil', path: '/pacientes/portal/perfil' },
    ];

    const isActive = (path: string) => {
        if (path === '/pacientes/portal' && location.pathname === '/pacientes/portal') return true;
        if (path !== '/pacientes/portal' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header Móvil Simple */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        P
                    </div>
                    <span className="font-bold text-slate-800">Mi Portal</span>
                </div>
                <button
                    onClick={() => logout()}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            {/* Contenido Principal */}
            <main className="flex-1 pb-24 overflow-y-auto hidden-scrollbar">
                <div className="max-w-md mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-2 z-50 shadow-lg shadow-slate-200/50">
                <div className="max-w-md mx-auto flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 relative",
                                    active ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {active && (
                                    <span className="absolute -top-2 w-12 h-1 bg-indigo-600 rounded-b-full shadow-lg shadow-indigo-500/30" />
                                )}
                                <item.icon className={cn("w-6 h-6", active && "fill-indigo-100")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
