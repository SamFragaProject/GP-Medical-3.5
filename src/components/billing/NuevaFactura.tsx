import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { billingService } from '@/services/billingService'
import { pacService } from '@/services/pacService'
import {
    CFDI,
    ClienteFiscal,
    ConceptoFactura,
    MetodoPago,
    FormaPago,
    CATALOGO_USO_CFDI
} from '@/types/facturacion'
import { toast } from 'sonner'
import { Search, Plus, Trash2, Zap, FileText, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface NuevaFacturaProps {
    open: boolean
    onClose: () => void
}

import { useFacturacion } from '@/hooks/useFacturacion'

export function NuevaFactura({ open, onClose }: NuevaFacturaProps) {
    const { user } = useAuth()
    const { clientes, refresh: refreshFacturas } = useFacturacion()
    const [step, setStep] = React.useState(1)
    const [loading, setLoading] = React.useState(false)

    // Form State
    const [selectedCliente, setSelectedCliente] = React.useState<ClienteFiscal | null>(null)
    const [busquedaCliente, setBusquedaCliente] = React.useState('')
    const [conceptos, setConceptos] = React.useState<any[]>([
        { servicioId: '85121500', cantidad: 1, servicioNombre: 'Consulta Médica General', precioUnitario: 0, total: 0, descuento: 0, impuesto: 0 }
    ])

    const [metodoPago, setMetodoPago] = React.useState<MetodoPago>('PUE')
    const [formaPago, setFormaPago] = React.useState<FormaPago>('01')

    const subtotal = conceptos.reduce((acc, c) => acc + (c.cantidad * c.precioUnitario), 0)
    const iva = subtotal * 0.16 // Simplificado
    const total = subtotal + iva

    const handleAddConcepto = () => {
        setConceptos([...conceptos, { servicioId: '85121500', cantidad: 1, servicioNombre: '', precioUnitario: 0, total: 0, descuento: 0, impuesto: 0 }])
    }

    const handleRemoveConcepto = (index: number) => {
        setConceptos(conceptos.filter((_, i) => i !== index))
    }

    const handleConceptoChange = (index: number, field: string, value: any) => {
        const newConceptos = [...conceptos]
        newConceptos[index] = { ...newConceptos[index], [field]: value }
        if (field === 'cantidad' || field === 'precioUnitario') {
            newConceptos[index].total = newConceptos[index].cantidad * newConceptos[index].precioUnitario
        }
        setConceptos(newConceptos)
    }

    const handleStamp = async () => {
        if (!selectedCliente || !user?.empresa_id) return

        setLoading(true)
        try {
            // 1. Guardar Borrador
            const facturaData: any = {
                empresa_id: user.empresa_id,
                cliente_id: selectedCliente.id,
                metodo_pago: metodoPago,
                forma_pago: formaPago,
                subtotal,
                total,
                total_impuestos_trasladados: iva,
                fecha_emision: new Date().toISOString(),
                tipo_comprobante: 'I',
                moneda: 'MXN',
                tipo_cambio: 1,
            }

            const borrador = await billingService.createFacturaBorrador(facturaData, conceptos)

            // 2. Timbrar
            const result = await pacService.timbrarFactura({ ...borrador, cliente: selectedCliente })

            // 3. Actualizar Estado
            await (billingService as any).updateEstadoFactura(borrador.id, {
                estado: 'timbrada',
                uuid_sat: result.uuid,
                fecha_timbrado: result.fecha_timbrado,
                sello_sat: result.sello_sat,
                xml_completo: result.xml
            })

            toast.success('Factura timbrada exitosamente!')
            setStep(3) // Exito
        } catch (error) {
            toast.error('Error al procesar la factura')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setStep(1)
        setSelectedCliente(null)
        setConceptos([{ servicioId: '85121500', cantidad: 1, servicioNombre: 'Consulta Médica General', precioUnitario: 0, total: 0, descuento: 0, impuesto: 0 }])
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={reset}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-emerald-500" />
                        Generar Nueva Factura 4.0
                    </DialogTitle>
                    <DialogDescription>
                        Sigue los pasos para emitir el comprobante fiscal
                    </DialogDescription>
                </DialogHeader>

                {/* Stepper simple */}
                <div className="flex items-center gap-4 mb-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step === i ? 'bg-emerald-600 text-white' :
                                step > i ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
                            </div>
                            <span className={`text-xs font-medium ${step === i ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {i === 1 ? 'Cliente' : i === 2 ? 'Conceptos' : 'Resultado'}
                            </span>
                            {i < 3 && <div className="h-px w-8 bg-slate-200" />}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="space-y-4 py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar cliente por RFC o Nombre..."
                                className="pl-10"
                                value={busquedaCliente}
                                onChange={e => setBusquedaCliente(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            {clientes
                                .filter(c => c.razonSocial.toLowerCase().includes(busquedaCliente.toLowerCase()) || c.rfc.toLowerCase().includes(busquedaCliente.toLowerCase()))
                                .slice(0, 4)
                                .map(cliente => (
                                    <div
                                        key={cliente.id}
                                        onClick={() => setSelectedCliente(cliente)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors flex justify-between items-center ${selectedCliente?.id === cliente.id ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-700 text-sm">{cliente.razonSocial}</p>
                                            <p className="text-xs text-slate-500">{cliente.rfc} | CP: {cliente.direccion.cp}</p>
                                        </div>
                                        {selectedCliente?.id === cliente.id && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                                    </div>
                                ))}
                        </div>

                        {selectedCliente && (
                            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Datos Fiscales</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-[10px] text-slate-400">Uso CFDI</Label>
                                        <p className="font-medium">{CATALOGO_USO_CFDI[selectedCliente.usoCFDI] || selectedCliente.usoCFDI}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-slate-400">Régimen</Label>
                                        <p className="font-medium">{selectedCliente.regimenFiscal}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-slate-700">Conceptos / Servicios</h4>
                                <Button variant="outline" size="sm" onClick={handleAddConcepto} className="h-8">
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {conceptos.map((concepto, idx) => (
                                    <div key={idx} className="flex gap-2 items-start bg-slate-50 p-3 rounded-lg border group">
                                        <div className="flex-1 grid grid-cols-12 gap-2">
                                            <div className="col-span-8 space-y-1">
                                                <Label className="text-[10px]">Descripción</Label>
                                                <Input
                                                    value={concepto.servicioNombre}
                                                    onChange={e => handleConceptoChange(idx, 'servicioNombre', e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <Label className="text-[10px]">Cant.</Label>
                                                <Input
                                                    type="number"
                                                    value={concepto.cantidad}
                                                    onChange={e => handleConceptoChange(idx, 'cantidad', parseFloat(e.target.value))}
                                                    className="h-8 text-sm px-1 text-center"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <Label className="text-[10px]">Precio</Label>
                                                <Input
                                                    type="number"
                                                    value={concepto.precioUnitario}
                                                    onChange={e => handleConceptoChange(idx, 'precioUnitario', parseFloat(e.target.value))}
                                                    className="h-8 text-sm px-1"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-300 hover:text-rose-500 mt-5"
                                            onClick={() => handleRemoveConcepto(idx)}
                                            disabled={conceptos.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs">Método de Pago</Label>
                                    <Select value={metodoPago} onValueChange={v => setMetodoPago(v as MetodoPago)}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PUE">PUE - Pago en una sola exhibición</SelectItem>
                                            <SelectItem value="PPD">PPD - Pago en parcialidades o diferido</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs">Forma de Pago</Label>
                                    <Select value={formaPago} onValueChange={v => setFormaPago(v as FormaPago)}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="01">01 - Efectivo</SelectItem>
                                            <SelectItem value="03">03 - Transferencia</SelectItem>
                                            <SelectItem value="04">04 - Tarjeta de Crédito</SelectItem>
                                            <SelectItem value="28">28 - Tarjeta de Débito</SelectItem>
                                            <SelectItem value="99">99 - Por definir</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>IVA (16%)</span>
                                    <span>${iva.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-slate-700 pt-2">
                                    <span>Total</span>
                                    <span className="text-emerald-400">${total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="py-12 text-center space-y-6">
                        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">¡Facturado con Éxito!</h3>
                            <p className="text-slate-500">El CFDI ha sido generado y timbrado ante el SAT.</p>
                        </div>
                        <div className="flex justify-center gap-3">
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" /> Ver XML
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <FileText className="h-4 w-4" /> Bajar PDF
                            </Button>
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-6">
                    {step === 1 && (
                        <Button
                            disabled={!selectedCliente}
                            onClick={() => setStep(2)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Siguiente
                        </Button>
                    )}
                    {step === 2 && (
                        <div className="flex gap-2 w-full justify-between">
                            <Button variant="outline" onClick={() => setStep(1)}>Atrás</Button>
                            <Button
                                onClick={handleStamp}
                                disabled={loading || total === 0}
                                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                            >
                                <Zap className={`h-4 w-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
                                {loading ? 'Timbrando...' : 'Timbrar Factura Ahora'}
                            </Button>
                        </div>
                    )}
                    {step === 3 && (
                        <Button onClick={reset} className="w-full">Cerrar y Finalizar</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
