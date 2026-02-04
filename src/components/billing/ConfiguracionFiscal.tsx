import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { billingService } from '@/services/billingService'
import { EmisorConfig, CATALOGO_REGIMEN, RegimenFiscal } from '@/types/facturacion'
import { toast } from 'sonner'
import { Save, Building2, ShieldCheck, Key } from 'lucide-react'

export function ConfiguracionFiscal() {
    const { user } = useAuth()
    const [loading, setLoading] = React.useState(true)
    const [saving, setSaving] = React.useState(false)
    const [config, setConfig] = React.useState<Partial<EmisorConfig>>({
        rfc: '',
        razon_social: '',
        regimen_fiscal: '601',
        lugar_expedicion: '',
    })

    React.useEffect(() => {
        if (user?.empresa_id) {
            loadConfig()
        }
    }, [user?.empresa_id])

    const loadConfig = async () => {
        try {
            const data = await billingService.getEmisorConfig(user!.empresa_id)
            if (data) setConfig(data)
        } catch (error) {
            console.error('Error loading config:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.empresa_id) return

        setSaving(true)
        try {
            await billingService.saveEmisorConfig({
                ...config,
                empresa_id: user.empresa_id
            })
            toast.success('Configuración fiscal guardada')
        } catch (error) {
            toast.error('Error al guardar la configuración')
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Cargando configuración...</div>

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-emerald-500" />
                            Datos del Emisor
                        </CardTitle>
                        <CardDescription>Información fiscal de la empresa para CFDI 4.0</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>RFC *</Label>
                            <Input
                                value={config.rfc}
                                onChange={e => setConfig({ ...config, rfc: e.target.value })}
                                placeholder="XAXX010101000"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Razón Social *</Label>
                            <Input
                                value={config.razon_social}
                                onChange={e => setConfig({ ...config, razon_social: e.target.value })}
                                placeholder="Nombre completo como aparece en el SAT"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Régimen Fiscal *</Label>
                            <Select
                                value={config.regimen_fiscal}
                                onValueChange={val => setConfig({ ...config, regimen_fiscal: val as RegimenFiscal })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar régimen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(CATALOGO_REGIMEN).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{key} - {label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Código Postal (Lugar de Expedición) *</Label>
                            <Input
                                value={config.lugar_expedicion}
                                onChange={e => setConfig({ ...config, lugar_expedicion: e.target.value })}
                                placeholder="76000"
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            Certificados (CSD)
                        </CardTitle>
                        <CardDescription>Archivos para el timbrado de facturas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-sm">
                            <p className="font-semibold flex items-center gap-2 mb-1">
                                <Key className="h-4 w-4" /> Modo Demo Activo
                            </p>
                            Los archivos .cer y .key no son requeridos en el entorno de pruebas.
                            El sistema simulará el timbrado automáticamente.
                        </div>

                        <div className="space-y-2 opacity-50 pointer-events-none">
                            <Label>Archivo Certificado (.cer)</Label>
                            <Input type="file" disabled />
                        </div>
                        <div className="space-y-2 opacity-50 pointer-events-none">
                            <Label>Archivo Llave (.key)</Label>
                            <Input type="file" disabled />
                        </div>
                        <div className="space-y-2 opacity-50 pointer-events-none">
                            <Label>Clave Privada</Label>
                            <Input type="password" disabled placeholder="••••••••" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
            </div>
        </form>
    )
}
