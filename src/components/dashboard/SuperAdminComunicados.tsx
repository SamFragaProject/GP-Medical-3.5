import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, User, Building2, Upload, File, Plus, Search, Trash2, Edit, AlertCircle, RefreshCw, Database, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { comunicadosService, type Comunicado } from '@/services/comunicadosService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function SuperAdminComunicados() {
    const [comunicados, setComunicados] = useState<Comunicado[]>([])
    const [loading, setLoading] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [titulo, setTitulo] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [tipo, setTipo] = useState<Comunicado['tipo']>('info')
    const [archivo, setArchivo] = useState<File | null>(null)
    const [empresaId, setEmpresaId] = useState<string>('') // vacio = global
    const [isActive, setIsActive] = useState(true)

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await comunicadosService.getAll()
            setComunicados(data)
        } catch (err) {
            console.error('Error cargando comunicados:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setArchivo(e.target.files[0])
        }
    }

    const resetForm = () => {
        setTitulo('')
        setMensaje('')
        setTipo('info')
        setArchivo(null)
        setEmpresaId('')
        setIsActive(true)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!titulo || !mensaje) {
            toast.error("El título y mensaje son obligatorios")
            return
        }

        setIsSubmitting(true)
        try {
            await comunicadosService.create({
                titulo,
                mensaje,
                tipo,
                empresa_id: empresaId || null,
                is_active: isActive,
                autor_id: 'default' // Supabase Auth UID gets it automatically via defaults anyway or we pass it
            }, archivo || undefined)

            toast.success("Comunicado publicado exitosamente")
            setIsFormOpen(false)
            resetForm()
            loadData()
        } catch (err) {
            toast.error("Error al publicar comunicado")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleStatus = async (item: Comunicado) => {
        try {
            await comunicadosService.update(item.id, { is_active: !item.is_active })
            toast.success(item.is_active ? "Comunicado ocultado" : "Comunicado activado")
            loadData()
        } catch (err) {
            toast.error("Error al actualizar estado")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que deseas eliminar permanentemente este comunicado?")) return
        try {
            await comunicadosService.delete(id)
            toast.success("Comunicado eliminado")
            loadData()
        } catch (err) {
            toast.error("Error al eliminar")
        }
    }

    const tipoConfig = {
        info: { color: 'blue', label: 'Info' },
        success: { color: 'green', label: 'Completado' },
        warning: { color: 'amber', label: 'Aviso Importante' },
        update: { color: 'purple', label: 'Actualización' },
        release: { color: 'emerald', label: 'Release Notes' },
    }

    return (
        <div className="space-y-6">
            {/* Facebook-style Composer */}
            <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200/60 mb-8">
                <AnimatePresence mode="wait">
                    {!isFormOpen ? (
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 cursor-text"
                            onClick={() => setIsFormOpen(true)}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-md">
                                <Building2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="flex-1 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 rounded-full px-5 py-3 text-sm text-slate-500 flex items-center justify-between">
                                <span>Publicar nuevo aviso, release o alerta...</span>
                                <div className="flex gap-2">
                                    <div className="p-1.5 rounded-full hover:bg-slate-200 transition-colors tooltip" title="Foto/Video">
                                        <File className="w-4 h-4 text-emerald-500" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <form onSubmit={handleCreate} className="space-y-5">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <Edit className="w-4 h-4 text-emerald-500" /> Crear Publicación Global
                                    </h3>
                                    <button type="button" onClick={() => { setIsFormOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-1 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                                        <Input
                                            placeholder="Ej: Nueva Actualización v3.5"
                                            value={titulo}
                                            onChange={e => setTitulo(e.target.value)}
                                            className="h-12 bg-slate-50 border-slate-200"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-1 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Mensaje (puede incluir saltos de línea)</label>
                                        <textarea
                                            placeholder="Detalles del comunicado..."
                                            value={mensaje}
                                            onChange={e => setMensaje(e.target.value)}
                                            rows={4}
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                                        <select
                                            value={tipo}
                                            onChange={(e) => setTipo(e.target.value as any)}
                                            className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium"
                                        >
                                            <option value="info">Información</option>
                                            <option value="warning">Aviso Importante (⚠️)</option>
                                            <option value="update">Actualización / Update</option>
                                            <option value="release">Nuevo Release (🚀)</option>
                                            <option value="success">Logro / Completado</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Audiencia (ID Empresa)</label>
                                        <Input
                                            placeholder="Dejar vacío para GLOBAL"
                                            value={empresaId}
                                            onChange={e => setEmpresaId(e.target.value)}
                                            className="h-12 bg-slate-50 border-slate-200"
                                        />
                                        <p className="text-[10px] text-slate-400">Si se deja vacío, todos los usuarios de cualquier empresa verán el mensaje en su dashboard.</p>
                                    </div>

                                    <div className="space-y-2 col-span-1 border-t border-slate-100 pt-5 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Archivo Adjunto Opcional (PDF, Imagen, etc)</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-10 gap-2 border-slate-300"
                                            >
                                                <Upload className="w-4 h-4" /> Seleccionar Archivo
                                            </Button>
                                            {archivo && (
                                                <span className="text-sm text-slate-600 font-medium flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-emerald-500" /> {archivo.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => { setIsFormOpen(false); resetForm() }}
                                        className="px-6 rounded-xl"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg text-white font-bold"
                                    >
                                        {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Publicar'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Listado */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                    </div>
                ) : comunicados.length === 0 ? (
                    <div className="p-16 text-center">
                        <Database className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-slate-700">Sin Comunicados</h4>
                        <p className="text-slate-400">Aún no has publicado ningún aviso o lanzamiento.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                <th className="p-4 pl-6">Estado</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Título</th>
                                <th className="p-4">Audiencia</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Archivo</th>
                                <th className="p-4 pr-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comunicados.map(c => {
                                const cfg = tipoConfig[c.tipo]
                                return (
                                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6">
                                            <button
                                                onClick={() => handleToggleStatus(c)}
                                                className={`w-10 h-6 rounded-full relative transition-colors ${c.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${c.is_active ? 'left-5' : 'left-1'}`} />
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className={`bg-${cfg.color}-50 text-${cfg.color}-600 border-${cfg.color}-200 capitalize text-[10px]`}>
                                                {cfg.label}
                                            </Badge>
                                        </td>
                                        <td className="p-4 font-bold text-slate-800 text-sm max-w-[200px] truncate" title={c.titulo}>
                                            {c.titulo}
                                        </td>
                                        <td className="p-4">
                                            {c.empresa_id ? (
                                                <Badge className="bg-slate-100 text-slate-600 font-normal">Empresa Específica</Badge>
                                            ) : (
                                                <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200">✨ GLOBAL</Badge>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                                            {format(new Date(c.created_at), "d MMM, yy", { locale: es })}
                                        </td>
                                        <td className="p-4">
                                            {c.archivo_url && (
                                                <a href={c.archivo_url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1">
                                                    <FileText className="w-3 h-3" /> Ver Adjunto
                                                </a>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="hover:bg-red-50 hover:text-red-500 text-slate-400 h-8 w-8 p-0">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div >
    )
}
