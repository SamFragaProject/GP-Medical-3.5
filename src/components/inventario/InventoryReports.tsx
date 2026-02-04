import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Filter,
    Download
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { inventoryService } from '@/services/inventoryService'
import { MovimientoInventario, InventoryStats } from '@/types/inventory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function InventoryReports() {
    const { user } = useAuth()
    const [stats, setStats] = useState<InventoryStats | null>(null)
    const [movements, setMovements] = useState<MovimientoInventario[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.empresa_id) return

        const loadData = async () => {
            setLoading(true)
            try {
                const [s, m] = await Promise.all([
                    inventoryService.getStats(user.empresa_id),
                    inventoryService.getGlobalMovements(user.empresa_id)
                ])
                setStats(s)
                setMovements(m)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [user?.empresa_id])

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Valor Total Inventario</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">
                            {formatMoney(stats?.totalValue || 0)}
                        </h3>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg">
                        <DollarSign className="w-8 h-8 text-emerald-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Items Totales</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">
                            {stats?.totalItems || 0}
                        </h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Movimientos (Últ. 100)</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">
                            {movements.length}
                        </h3>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="kardex" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="kardex">Kardex de Movimientos</TabsTrigger>
                    <TabsTrigger value="valuation">Valoración Detallada</TabsTrigger>
                </TabsList>

                <TabsContent value="kardex" className="mt-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900">Historial de Movimientos</h3>
                            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                <Filter size={14} /> Filtros
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Producto</th>
                                        <th className="px-6 py-3">Tipo</th>
                                        <th className="px-6 py-3 text-right">Cantidad</th>
                                        <th className="px-6 py-3">Usuario</th>
                                        <th className="px-6 py-3">Ref/Obs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {movements.map((mov) => (
                                        <tr key={mov.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                {formatDate(mov.fecha_movimiento)}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {mov.item?.nombre_comercial || 'Producto Eliminado'}
                                                <span className="block text-xs text-gray-400">{mov.item?.sku}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${mov.tipo_movimiento.includes('entrada')
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                    {mov.tipo_movimiento.includes('entrada') ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownLeft size={12} className="mr-1" />}
                                                    {mov.tipo_movimiento.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${mov.tipo_movimiento.includes('entrada') ? 'text-emerald-600' : 'text-amber-600'
                                                }`}>
                                                {mov.tipo_movimiento.includes('entrada') ? '+' : '-'}{mov.cantidad}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {mov.usuario?.email || 'Sistema'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={mov.observaciones || ''}>
                                                {mov.observaciones || '-'}
                                                {mov.referencia_id && <span className="block text-xs text-indigo-500">Ref: {mov.referencia_id.slice(0, 8)}...</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {movements.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No hay movimientos registrados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="valuation">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <TrendingUp className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Próximamente</h3>
                        <p className="max-w-md mx-auto mt-2">
                            El reporte detallado de valoración de inventario (ABC Analysis) estará disponible en la próxima actualización.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
