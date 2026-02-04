import React from 'react'
import { ClipboardCheck, Search, Filter, Download } from 'lucide-react'

export default function LogsView() {
    const logs = [
        { id: 1, action: 'Inicio de sesión', user: 'Super Admin', ip: '192.168.1.1', date: '2023-06-12 09:00:00', status: 'success' },
        { id: 2, action: 'Creación de usuario', user: 'Super Admin', target: 'Dr. House', date: '2023-06-12 09:15:23', status: 'success' },
        { id: 3, action: 'Intento fallido login', user: 'unknown', ip: '203.0.113.42', date: '2023-06-12 09:20:11', status: 'danger' },
        { id: 4, action: 'Actualización roles', user: 'Super Admin', target: 'Enfermería', date: '2023-06-12 10:05:45', status: 'warning' },
        { id: 5, action: 'Consulta expediente', user: 'Dr. Mike', target: 'Paciente #1234', date: '2023-06-12 11:30:00', status: 'success' },
    ]

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Logs del Sistema</h1>
                    <p className="text-gray-500">Auditoría y registro de actividades críticas</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por usuario, acción, IP..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm">Filtros</span>
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Fecha/Hora</th>
                                <th className="px-6 py-3">Usuario</th>
                                <th className="px-6 py-3">Acción</th>
                                <th className="px-6 py-3">Detalle/IP</th>
                                <th className="px-6 py-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{log.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{log.user}</td>
                                    <td className="px-6 py-4 text-gray-700">{log.action}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {log.target && <span className="mr-2 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{log.target}</span>}
                                        <span className="text-xs font-mono text-gray-400">{log.ip}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.status === 'success' ? 'bg-green-100 text-green-800' :
                                                log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {log.status === 'success' && 'Exitoso'}
                                            {log.status === 'warning' && 'Advertencia'}
                                            {log.status === 'danger' && 'Fallo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
