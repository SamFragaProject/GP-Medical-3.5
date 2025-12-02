import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    Grid,
    Title,
    Badge,
    Flex,
    ProgressBar,
    Text,
    Button
} from '@tremor/react';
import {
    Shield,
    Search,
    UserCog,
    LogOut,
    Server,
    Database,
    AlertCircle,
    CheckCircle,
    MoreVertical,
    Lock,
    Eye,
    Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { QuickStats } from './widgets/QuickStats';
import { UpcomingAppointments } from './widgets/UpcomingAppointments';
import { ActivityFeed } from './widgets/ActivityFeed';

// Mock Users Data
const MOCK_USERS = [
    { id: '1', nombre: 'Dr. Alejandro Ramírez', email: 'alejandro@mediflow.com', rol: 'medico', empresa: 'Hospital Central', status: 'active' },
    { id: '2', nombre: 'Ana García', email: 'ana.garcia@techcorp.com', rol: 'paciente', empresa: 'TechCorp', status: 'active' },
    { id: '3', nombre: 'Admin TechCorp', email: 'admin@techcorp.com', rol: 'admin_empresa', empresa: 'TechCorp', status: 'active' },
    { id: '4', nombre: 'Dra. María López', email: 'maria@mediflow.com', rol: 'medico', empresa: 'Clínica Norte', status: 'away' },
    { id: '5', nombre: 'Carlos Ruiz', email: 'carlos@constructora.com', rol: 'paciente', empresa: 'Constructora XYZ', status: 'inactive' },
];

export function SuperAdminView() {
    const { user, impersonateUser, isImpersonating, stopImpersonation } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('all');

    const filteredUsers = MOCK_USERS.filter(u =>
        (u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedRole === 'all' || u.rol === selectedRole)
    );

    const handleImpersonate = (targetUser: any) => {
        if (confirm(`¿Estás seguro de que deseas iniciar sesión como ${targetUser.nombre}?`)) {
            // En un caso real, necesitaríamos el objeto User completo. Aquí simulamos uno básico.
            const userToImpersonate: any = {
                id: targetUser.id,
                email: targetUser.email,
                nombre: targetUser.nombre,
                apellido_paterno: '', // Mock
                rol: targetUser.rol as UserRole,
                empresa_id: 'mock-empresa-id',
            };
            impersonateUser(userToImpersonate);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
            {/* Premium Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge icon={Shield} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                Super Admin Control Panel
                            </Badge>
                            {isImpersonating && (
                                <Badge icon={UserCog} color="amber" className="animate-pulse">
                                    Modo Impersonación Activo
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                            Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{user?.nombre}</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Gestión centralizada del ecosistema GPMedical
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {isImpersonating ? (
                            <Button
                                onClick={stopImpersonation}
                                color="red"
                                icon={LogOut}
                                className="shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all"
                            >
                                Detener Impersonación
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="secondary" icon={Database}>Backup</Button>
                                <Button variant="primary" icon={Server}>Logs del Sistema</Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Widgets */}
            <QuickStats />

            {/* Main Content Grid */}
            <Grid numItems={1} numItemsLg={3} className="gap-8">
                {/* Left Column: User Management & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Feed Widget */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <UpcomingAppointments />
                        <ActivityFeed />
                    </div>

                    {/* User Management Section */}
                    <Card className="ring-0 shadow-lg border-none">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <Title className="text-xl font-bold text-slate-800">Gestión de Usuarios</Title>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar usuario..."
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="all">Todos los roles</option>
                                    <option value="medico">Médicos</option>
                                    <option value="paciente">Pacientes</option>
                                    <option value="admin_empresa">Admins Empresa</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left py-3 px-4 text-slate-500 font-medium text-sm">Usuario</th>
                                        <th className="text-left py-3 px-4 text-slate-500 font-medium text-sm">Rol</th>
                                        <th className="text-left py-3 px-4 text-slate-500 font-medium text-sm">Empresa</th>
                                        <th className="text-left py-3 px-4 text-slate-500 font-medium text-sm">Estado</th>
                                        <th className="text-right py-3 px-4 text-slate-500 font-medium text-sm">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                                        {u.nombre.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{u.nombre}</p>
                                                        <p className="text-xs text-slate-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    color={
                                                        u.rol === 'medico' ? 'blue' :
                                                            u.rol === 'admin_empresa' ? 'purple' :
                                                                'emerald'
                                                    }
                                                    size="xs"
                                                >
                                                    {u.rol.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-600">{u.empresa}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' :
                                                        u.status === 'away' ? 'bg-amber-500' : 'bg-slate-300'
                                                        }`} />
                                                    <span className="text-sm text-slate-600 capitalize">{u.status}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleImpersonate(u)}
                                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                        title="Impersonar Usuario"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors">
                                                        <Lock size={18} />
                                                    </button>
                                                    <button className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Right Column: System Health & Notifications */}
                <div className="space-y-6">
                    <Card className="ring-0 shadow-lg border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                        <Title className="text-white mb-6">Estado de Infraestructura</Title>
                        <div className="space-y-6">
                            <div>
                                <Flex className="mb-2">
                                    <Text className="text-slate-300">Uso de CPU</Text>
                                    <Text className="text-white font-bold">45%</Text>
                                </Flex>
                                <ProgressBar value={45} color="blue" className="bg-slate-700" />
                            </div>
                            <div>
                                <Flex className="mb-2">
                                    <Text className="text-slate-300">Memoria RAM</Text>
                                    <Text className="text-white font-bold">62%</Text>
                                </Flex>
                                <ProgressBar value={62} color="purple" className="bg-slate-700" />
                            </div>
                            <div>
                                <Flex className="mb-2">
                                    <Text className="text-slate-300">Almacenamiento</Text>
                                    <Text className="text-white font-bold">28%</Text>
                                </Flex>
                                <ProgressBar value={28} color="emerald" className="bg-slate-700" />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-700">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle className="text-emerald-400" size={20} />
                                <span className="font-medium">Base de Datos Operativa</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="text-emerald-400" size={20} />
                                <span className="font-medium">Backups Sincronizados</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="ring-0 shadow-lg border-none">
                        <Title className="mb-4">Alertas del Sistema</Title>
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold text-amber-900 text-sm">Intento de acceso inusual</h4>
                                    <p className="text-amber-700 text-xs mt-1">IP desconocida detectada en cuenta admin_empresa</p>
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                                <Activity className="text-blue-600 shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm">Actualización programada</h4>
                                    <p className="text-blue-700 text-xs mt-1">Mantenimiento preventivo en 2 días</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </Grid>
        </div>
    );
}
