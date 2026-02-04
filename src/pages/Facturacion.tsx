import React from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    FileText,
    Settings,
    Users,
    Plus,
    BarChart3,
    Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'

// Componentes
import {
    FacturacionDashboard,
    ClientesFiscales,
    ConfiguracionFiscal,
    NuevaFactura
} from '@/components/billing'

export default function Facturacion() {
    const [activeTab, setActiveTab] = React.useState('dashboard')
    const [isNuevaFacturaOpen, setIsNuevaFacturaOpen] = React.useState(false)

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="Facturación Electrónica 4.0"
                subtitle="Gestión avanzada de CFDI, clientes fiscales y cumplimiento tributario automatizado."
                icon={Receipt}
                badge="SAT CERTIFIED"
                actions={
                    <Button
                        variant="premium"
                        onClick={() => setIsNuevaFacturaOpen(true)}
                        className="h-11 px-8 shadow-xl shadow-emerald-500/20 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-widest"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Factura
                    </Button>
                }
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white/40 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl w-full justify-start shadow-sm h-14">
                    <TabsTrigger value="dashboard" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="historial" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all gap-2">
                        <FileText className="h-4 w-4" />
                        Historial
                    </TabsTrigger>
                    <TabsTrigger value="clientes" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all gap-2">
                        <Users className="h-4 w-4" />
                        Clientes
                    </TabsTrigger>
                    <TabsTrigger value="configuracion" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all gap-2">
                        <Settings className="h-4 w-4" />
                        Configuración
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <FacturacionDashboard />
                </TabsContent>

                <TabsContent value="historial">
                    <div className="bg-white rounded-xl border p-8 text-center text-slate-500">
                        Historial detallado de facturas emitidas
                    </div>
                </TabsContent>

                <TabsContent value="clientes">
                    <ClientesFiscales />
                </TabsContent>

                <TabsContent value="configuracion">
                    <ConfiguracionFiscal />
                </TabsContent>
            </Tabs>

            <NuevaFactura
                open={isNuevaFacturaOpen}
                onClose={() => setIsNuevaFacturaOpen(false)}
            />
        </div>
    )
}
