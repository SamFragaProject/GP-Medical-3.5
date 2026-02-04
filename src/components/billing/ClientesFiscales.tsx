import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, UserPlus, Mail, MapPin, Hash, Users } from 'lucide-react'
import { billingService } from '@/services/billingService'
import { useAuth } from '@/contexts/AuthContext'
import { ClienteFiscal } from '@/types/facturacion'
import { Badge } from '@/components/ui/badge'

export function ClientesFiscales() {
    const { user } = useAuth()
    const [clientes, setClientes] = React.useState<ClienteFiscal[]>([])
    const [loading, setLoading] = React.useState(true)
    const [busqueda, setBusqueda] = React.useState('')

    React.useEffect(() => {
        if (user?.empresa_id) {
            loadClientes()
        }
    }, [user?.empresa_id])

    const loadClientes = async () => {
        try {
            const data = await billingService.getClientes(user!.empresa_id)
            setClientes(data)
        } catch (error) {
            console.error('Error loading clientes:', error)
        } finally {
            setLoading(false)
        }
    }

    const filtered = clientes.filter(c =>
        c.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.rfc.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre o RFC..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Cliente Fiscal
                </Button>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="animate-pulse h-40 bg-slate-50 border-dashed" />
                    ))
                ) : filtered.length > 0 ? (
                    filtered.map(cliente => (
                        <Card key={cliente.id} className="hover:shadow-md transition-shadow group">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-slate-800 line-clamp-1">
                                        {cliente.razon_social}
                                    </h3>
                                    <Badge variant="outline" className="text-[10px] bg-slate-50">
                                        {cliente.regimen_fiscal}
                                    </Badge>
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="font-mono text-slate-700">{cliente.rfc}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>{cliente.email_envio}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>CP: {cliente.codigo_postal}</span>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-8 text-xs">Editar</Button>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-emerald-600">Facturar</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border-dashed border-2">
                        <Users className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-500">No se encontraron clientes fiscales</p>
                    </div>
                )}
            </div>
        </div>
    )
}
