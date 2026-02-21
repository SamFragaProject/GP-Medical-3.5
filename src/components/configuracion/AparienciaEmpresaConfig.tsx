import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Palette, Upload, Loader2, Save } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { hexToHSL } from '@/utils/colors'

export function AparienciaEmpresaConfig() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)

    const empresaId = user?.empresa?.id || user?.empresa_id

    const [logoUrl, setLogoUrl] = useState(user?.empresa?.logo_url || '')
    const [primaryColor, setPrimaryColor] = useState(user?.empresa?.configuracion?.theme?.primary || '#10b981')

    useEffect(() => {
        if (user?.empresa) {
            if (user.empresa.logo_url) setLogoUrl(user.empresa.logo_url)
            if (user.empresa.configuracion?.theme?.primary) setPrimaryColor(user.empresa.configuracion.theme.primary)
        }
    }, [user])

    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        const file = e.target.files[0]

        setLoading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${empresaId}_logo_${Math.random()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('empresas_assets')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('empresas_assets')
                .getPublicUrl(fileName)

            setLogoUrl(publicUrl)
            toast.success('Logo subido correctamente. Recuerda guardar los cambios.')
        } catch (error: any) {
            toast.error('Error al subir logo: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!empresaId) return;

        setLoading(true)
        try {
            // Obtener configuracion actual
            const { data: empresa } = await supabase
                .from('empresas')
                .select('configuracion')
                .eq('id', empresaId)
                .single();

            const currentConfig = empresa?.configuracion || {};

            // Update the theme info
            const newConfig = {
                ...currentConfig,
                theme: {
                    ...currentConfig.theme,
                    primary: primaryColor,
                    primary_hsl: hexToHSL(primaryColor)
                }
            }

            const { error } = await supabase
                .from('empresas')
                .update({
                    logo_url: logoUrl,
                    configuracion: newConfig
                })
                .eq('id', empresaId)

            if (error) throw error

            toast.success('Configuración de apariencia guardada.')

            // Reflejamos cambios en root inmediatamente
            document.documentElement.style.setProperty('--primary', hexToHSL(primaryColor));
            document.documentElement.style.setProperty('--emerald-accent', primaryColor);

            setTimeout(() => {
                window.location.reload(); // Recargar para actualizar Session Context
            }, 1500)
        } catch (error: any) {
            toast.error('Error al guardar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-emerald-500" />
                    Marca y Apariencia
                </CardTitle>
                <CardDescription>
                    Personaliza el logotipo y el color primario (degradados) de la plataforma para tu empresa.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* LOGO */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-900">Logotipo de la Empresa</label>
                    <div className="flex items-center gap-6">
                        <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center relative overflow-hidden group">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                            ) : (
                                <span className="text-xs text-slate-400 font-medium text-center px-4">Sin Logotipo</span>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <label className="cursor-pointer">
                                    <Upload className="w-6 h-6 text-white" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} disabled={loading} />
                                </label>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <p className="text-sm text-slate-500">
                                Sube un logotipo en formato PNG o JPG, preferiblemente con fondo transparente y proporciones rectangulares.
                            </p>
                            <Button variant="outline" size="sm" className="relative cursor-pointer">
                                <span>Seleccionar Archivo</span>
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUploadLogo} disabled={loading} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* COLORS */}
                <div className="space-y-3 pt-6 border-t border-slate-100">
                    <label className="text-sm font-semibold text-slate-900">Color Primario</label>
                    <p className="text-sm text-slate-500 mb-2">
                        Este color se utilizará como base para los botones, enlaces, degradados y elementos resaltados del entorno.
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-lg shadow-inner cursor-pointer" style={{ backgroundColor: primaryColor }}></div>
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                        </div>
                        <Input
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-32 uppercase font-mono"
                        />
                    </div>

                    <div className="mt-4 p-4 rounded-xl" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${primaryColor}88)` }}>
                        <p className="text-white font-bold text-center drop-shadow-md">
                            Vista Previa del Degradado
                        </p>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="pt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={loading} className="w-40 bg-slate-900 text-white hover:bg-slate-800">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar Cambios
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
