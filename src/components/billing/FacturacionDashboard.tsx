import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    FileCheck,
    FileWarning,
    Clock,
    TrendingUp,
    MoreHorizontal,
    Download,
    Eye,
    XCircle
} from 'lucide-react'
import { billingService } from '@/services/billingService'
import { useAuth } from '@/contexts/AuthContext'
import { CFDI } from '@/types/facturacion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function FacturacionDashboard() {
    const { user } = useAuth()
    const [facturas, setFacturas] = React.useState<CFDI[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        if (user?.empresa_id) {
            loadFacturas()
        }
    }, [user?.empresa_id])

    const loadFacturas = async () => {
        try {
            const data = await billingService.getFacturas(user!.empresa_id)
            setFacturas(data)
        } catch (error) {
            console.error('Error loading facturas:', error)
        } finally {
            setLoading(false)
        }
    }

    const stats = [
        { label: 'Facturado Mes', value: '$45,200', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Timbradas', value: facturas.filter(f => f.estado === 'timbrada').length, icon: FileCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Pendientes', value: facturas.filter(f => f.estado === 'borrador').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Canceladas', value: facturas.filter(f => f.estado === 'cancelada').length, icon: FileWarning, color: 'text-rose-500', bg: 'bg-rose-50' },
    ]

    const statusColors: Record<string, string> = {
        timbrada: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        borrador: 'bg-amber-100 text-amber-700 border-amber-200',
        cancelada: 'bg-rose-100 text-rose-700 border-rose-200',
    }

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-xl font-bold text-slate-800 mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Invoices Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-semibold">Facturas Recientes</CardTitle>
                    <Button variant="outline" size="sm">Ver todas</Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr className="text-left text-slate-500 font-medium">
                                    <th className="p-3">Folio / UUID</th>
                                    <th className="p-3">Cliente</th>
                                    <th className="p-3">Fecha</th>
                                    <th className="p-3 text-right">Total</th>
                                    <th className="p-3">Estado</th>
                                    <th className="p-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="h-12 bg-slate-50/50"></td>
                                        </tr>
                                    ))
                                ) : facturas.length > 0 ? (
                                    facturas.map(f => (
                                        <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3">
                                                <div className="font-medium text-slate-700">
                                                    {f.serie}{f.folio || 'S/N'}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                                                    {f.uuid_sat || 'No timbrada'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium text-slate-700">{f.cliente?.razon_social}</div>
                                                <div className="text-xs text-slate-500">{f.cliente?.rfc}</div>
                                            </td>
                                            <td className="p-3 text-slate-500">
                                                {new Date(f.fecha_emision).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-right font-semibold text-slate-800">
                                                ${f.total.toLocaleString()}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline" className={`capitalize ${statusColors[f.estado]}`}>
                                                    {f.estado}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem className="gap-2">
                                                            <Eye className="h-4 w-4" /> Ver Detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2">
                                                            <Download className="h-4 w-4" /> Bajar XML/PDF
                                                        </DropdownMenuItem>
                                                        {f.estado === 'timbrada' && (
                                                            <DropdownMenuItem className="gap-2 text-rose-600 focus:text-rose-600">
                                                                <XCircle className="h-4 w-4" /> Cancelar
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            No hay facturas registradas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
