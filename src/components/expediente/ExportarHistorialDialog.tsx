/**
 * ExportarHistorialDialog — Exportar historial con filtros previos
 */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Download, Filter, FileText, Calendar, CheckCircle,
    Stethoscope, Shield, Briefcase, Activity, X, Loader2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'

interface ExportFilter {
    includeAPNP: boolean
    includeAHF: boolean
    includeHistoriaOcupacional: boolean
    includeExploracionFisica: boolean
    includeConsentimientos: boolean
    includeNotasMedicas: boolean
    includeEventosClinicos: boolean
    fechaDesde: string
    fechaHasta: string
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    pacienteNombre: string
    onExport: (filters: ExportFilter) => void
}

const SECTIONS = [
    { key: 'includeAPNP', label: 'APNP', desc: 'Antecedentes Personales No Patológicos', icon: Activity, color: 'emerald' },
    { key: 'includeAHF', label: 'AHF', desc: 'Antecedentes Heredofamiliares', icon: Shield, color: 'blue' },
    { key: 'includeHistoriaOcupacional', label: 'Historia Ocupacional', desc: 'Empresas, riesgos, exposiciones', icon: Briefcase, color: 'amber' },
    { key: 'includeExploracionFisica', label: 'Exploración Física', desc: 'Signos vitales, IMC, neuro, musculoesquelético', icon: Stethoscope, color: 'purple' },
    { key: 'includeConsentimientos', label: 'Consentimientos', desc: 'Consentimientos informados con firma digital', icon: FileText, color: 'cyan' },
    { key: 'includeNotasMedicas', label: 'Notas Médicas', desc: 'Notas versionadas con auditoría legal', icon: FileText, color: 'indigo' },
    { key: 'includeEventosClinicos', label: 'Línea de Tiempo', desc: 'Eventos clínicos cronológicos', icon: Calendar, color: 'rose' },
] as const

const COLOR_MAP: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
}

export function ExportarHistorialDialog({ open, onOpenChange, pacienteNombre, onExport }: Props) {
    const [exporting, setExporting] = useState(false)
    const [filters, setFilters] = useState<ExportFilter>({
        includeAPNP: true,
        includeAHF: true,
        includeHistoriaOcupacional: true,
        includeExploracionFisica: true,
        includeConsentimientos: true,
        includeNotasMedicas: true,
        includeEventosClinicos: true,
        fechaDesde: '',
        fechaHasta: '',
    })

    const toggleFilter = (key: string) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key as keyof ExportFilter] }))
    }

    const selectAll = () => {
        setFilters(prev => ({
            ...prev,
            includeAPNP: true, includeAHF: true, includeHistoriaOcupacional: true,
            includeExploracionFisica: true, includeConsentimientos: true,
            includeNotasMedicas: true, includeEventosClinicos: true,
        }))
    }

    const deselectAll = () => {
        setFilters(prev => ({
            ...prev,
            includeAPNP: false, includeAHF: false, includeHistoriaOcupacional: false,
            includeExploracionFisica: false, includeConsentimientos: false,
            includeNotasMedicas: false, includeEventosClinicos: false,
        }))
    }

    const selectedCount = SECTIONS.filter(s => filters[s.key as keyof ExportFilter]).length

    const handleExport = async () => {
        setExporting(true)
        try {
            await new Promise(r => setTimeout(r, 800)) // Simulate processing
            onExport(filters)
            toast.success('Historial exportado correctamente')
            onOpenChange(false)
        } catch {
            toast.error('Error al exportar')
        } finally {
            setExporting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                            <Download className="w-5 h-5" /> Exportar Historial Clínico
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-white/60 mt-1">
                        Paciente: <span className="font-bold text-white/90">{pacienteNombre}</span>
                    </p>
                </div>

                <div className="p-5 space-y-4">
                    {/* Date Range */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            <Filter className="w-3 h-3 inline mr-1" /> Rango de fechas (opcional)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Desde</label>
                                <input
                                    type="date"
                                    value={filters.fechaDesde}
                                    onChange={e => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Hasta</label>
                                <input
                                    type="date"
                                    value={filters.fechaHasta}
                                    onChange={e => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Section Filters */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Secciones a incluir ({selectedCount}/{SECTIONS.length})
                            </p>
                            <div className="flex gap-2">
                                <button onClick={selectAll} className="text-[10px] font-bold text-emerald-600 hover:underline">Todas</button>
                                <button onClick={deselectAll} className="text-[10px] font-bold text-slate-400 hover:underline">Ninguna</button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            {SECTIONS.map(section => {
                                const isSelected = filters[section.key as keyof ExportFilter] as boolean
                                const Icon = section.icon
                                return (
                                    <motion.button
                                        key={section.key}
                                        onClick={() => toggleFilter(section.key)}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected
                                                ? COLOR_MAP[section.color]
                                                : 'bg-slate-50 border-slate-100 text-slate-400'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                                            }`}>
                                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                        </div>
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-bold">{section.label}</span>
                                            <span className="text-[10px] ml-2 opacity-60">{section.desc}</span>
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="p-5 pt-0">
                    <div className="flex gap-3 w-full">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={selectedCount === 0 || exporting}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
                        >
                            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {exporting ? 'Exportando...' : 'Exportar JSON'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
