/**
 * PacientesHub - Módulo de Gestión de Pacientes
 * 
 * Vista principal para gestionar pacientes con:
 * - Lista completa con búsqueda y filtros
 * - Alta individual (Wizard paso a paso)
 * - Carga masiva (CSV/Excel)
 * - Vista de perfil unificado del paciente
 * - Exportación de historial
 */
import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Search, Plus, Upload, Download, Filter,
    ChevronRight, Eye, Edit, Trash2, MoreHorizontal,
    Building2, Briefcase, Phone, Mail, Calendar,
    CheckCircle, AlertTriangle, Clock, XCircle,
    UserPlus, FileSpreadsheet, RefreshCw, SlidersHorizontal,
    Heart, Shield, Activity, TrendingUp, Loader2,
    ArrowUpDown, ChevronDown, X, FileText, Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader'
import { usePacientes } from '@/hooks/usePacientes'
import { useAuth } from '@/contexts/AuthContext'
import { Paciente } from '@/services/dataService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// Componentes internos
import SmartOnboardingHub from '@/components/pacientes/SmartOnboardingHub'
import ImportarExpedienteWizard from '@/pages/pacientes/ImportarExpedienteWizard'


// =============================================
// TIPOS Y CONSTANTES
// =============================================
type ViewMode = 'list' | 'wizard' | 'import'
type SortField = 'nombre' | 'fecha' | 'empresa' | 'puesto'
type SortDir = 'asc' | 'desc'

const GENERO_COLORS: Record<string, string> = {
    masculino: 'from-blue-500 to-indigo-600',
    femenino: 'from-pink-500 to-rose-600',
    otro: 'from-purple-500 to-violet-600',
}

// Normaliza riesgos_ocupacionales a un array de strings
// Soporta ambos formatos: array de strings O objeto anidado con categorías
const normalizeRiesgos = (riesgos: any): string[] => {
    if (!riesgos) return []
    if (Array.isArray(riesgos)) return riesgos
    // Si es un objeto con subcategorías (formato demo), extraer las etiquetas activas
    const labels: string[] = []
    const categoryLabels: Record<string, string> = {
        fisicos: 'Físicos', quimicos: 'Químicos', ergonomicos: 'Ergonómicos',
        biologicos: 'Biológicos', psicosociales: 'Psicosociales',
        electricos: 'Eléctricos', mecanicos: 'Mecánicos', locativos: 'Locativos',
    }
    for (const [cat, items] of Object.entries(riesgos)) {
        if (typeof items === 'object' && items !== null) {
            const hasActive = Object.values(items as Record<string, boolean>).some(v => v === true)
            if (hasActive) labels.push(categoryLabels[cat] || cat)
        }
    }
    return labels
}

// Semáforo clínico: evalúa nivel de riesgo del paciente
const getSemaforClinico = (paciente: any): { nivel: string; color: string; bgColor: string; borderColor: string; label: string; icon: string } => {
    const riesgos = normalizeRiesgos(paciente.riesgos_ocupacionales).length;
    const estatus = paciente.estatus;
    const edad = paciente.fecha_nacimiento ? calcularEdad(paciente.fecha_nacimiento) : 0;
    const sinDictamen = !(paciente as any).ultimo_dictamen;

    // Crítico: baja, múltiples riesgos, sin dictamen y mayor a 50
    if (estatus === 'baja' || riesgos >= 3 || (sinDictamen && edad > 50 && riesgos > 0)) {
        return { nivel: 'critico', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', label: 'Crítico', icon: '🔴' };
    }
    // Alerta: riesgos moderados, inactivo, sin dictamen
    if (riesgos >= 1 || estatus === 'inactivo' || (sinDictamen && edad > 40)) {
        return { nivel: 'alerta', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', label: 'Alerta', icon: '🟡' };
    }
    // Normal
    return { nivel: 'normal', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', label: 'Normal', icon: '🟢' };
};

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function PacientesHub() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { pacientes, loading, createPaciente, refresh } = usePacientes()

    // Estado
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortField, setSortField] = useState<SortField>('nombre')
    const [sortDir, setSortDir] = useState<SortDir>('asc')
    const [filtroGenero, setFiltroGenero] = useState<string>('all')
    const [filtroEstatus, setFiltroEstatus] = useState<string>('all')
    const [showFilters, setShowFilters] = useState(false)

    // Stats
    const stats = useMemo(() => ({
        total: pacientes.length,
        activos: pacientes.filter(p => p.estatus === 'activo').length,
        masculino: pacientes.filter(p => p.genero === 'masculino').length,
        femenino: pacientes.filter(p => p.genero === 'femenino').length,
        sinEmail: pacientes.filter(p => !p.email).length,
        nuevosHoy: pacientes.filter(p => {
            const today = new Date().toISOString().split('T')[0]
            return p.created_at?.startsWith(today)
        }).length,
    }), [pacientes])

    // Filtrar y ordenar
    const pacientesFiltrados = useMemo(() => {
        let result = [...pacientes]

        // Búsqueda
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            result = result.filter(p =>
                `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''} ${p.curp || ''} ${p.email || ''} ${p.numero_empleado || ''}`
                    .toLowerCase().includes(q)
            )
        }

        // Filtros
        if (filtroGenero !== 'all') result = result.filter(p => p.genero === filtroGenero)
        if (filtroEstatus !== 'all') result = result.filter(p => p.estatus === filtroEstatus)

        // Ordenar
        result.sort((a, b) => {
            let cmp = 0
            switch (sortField) {
                case 'nombre':
                    cmp = `${a.apellido_paterno} ${a.nombre}`.localeCompare(`${b.apellido_paterno} ${b.nombre}`)
                    break
                case 'fecha':
                    cmp = (a.created_at || '').localeCompare(b.created_at || '')
                    break
                case 'empresa':
                    cmp = (a.empresa_nombre || '').localeCompare(b.empresa_nombre || '')
                    break
                case 'puesto':
                    cmp = (a.puesto || '').localeCompare(b.puesto || '')
                    break
            }
            return sortDir === 'asc' ? cmp : -cmp
        })

        return result
    }, [pacientes, searchQuery, sortField, sortDir, filtroGenero, filtroEstatus])

    // Handlers
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('asc')
        }
    }

    const [savedPacienteId, setSavedPacienteId] = useState<string | null>(null)
    const [savedPacienteObj, setSavedPacienteObj] = useState<any>(null)

    const handleWizardComplete = async (formData: any) => {
        const dg = formData.datosGenerales || {};

        // Map ClinicalHistoryFormData → paciente table
        const pacienteData: Record<string, any> = {
            nombre: dg.nombres || '',
            apellido_paterno: (dg.apellidos || '').split(' ')[0] || '',
            apellido_materno: (dg.apellidos || '').split(' ').slice(1).join(' ') || '',
            fecha_nacimiento: dg.fechaNacimiento || null,
            genero: dg.sexo === 'M' ? 'masculino' : dg.sexo === 'F' ? 'femenino' : null,
            telefono: dg.telefono || null,
            lugar_nacimiento: dg.lugarNacimiento || null,
            empresa_nombre: dg.nombreEmpresa || null,
            estatus: 'activo',
            historia_clinica_json: JSON.stringify(formData),
        };

        const ec = dg.estadoCivil || {};
        const estadoCivil = ec.casado ? 'Casado(a)' : ec.soltero ? 'Soltero(a)' : ec.viudo ? 'Viudo(a)' : ec.divorciado ? 'Divorciado(a)' : ec.unionLibre ? 'Unión Libre' : null;
        if (estadoCivil) pacienteData.estado_civil = estadoCivil;

        const rl = formData.riesgoLaboral || {};
        if (rl.puesto) pacienteData.puesto_trabajo = rl.puesto;

        const nuevoPaciente = await createPaciente(pacienteData);
        if (nuevoPaciente && nuevoPaciente.id) {
            setSavedPacienteId(nuevoPaciente.id);
            setSavedPacienteObj(nuevoPaciente);
        } else {
            throw new Error('No se pudo crear el paciente');
        }
    }

    const handleWizardCancel = () => {
        if (savedPacienteId && savedPacienteObj) {
            navigate(`/pacientes/${savedPacienteId}/perfil`, { state: { paciente: savedPacienteObj } })
        } else {
            setViewMode('list')
        }
    }

    const openProfile = (paciente: Paciente) => {
        navigate(`/pacientes/${paciente.id}/perfil`, { state: { paciente } })
    }

    // =============================================
    // RENDER: WIZARD o IMPORT
    // =============================================
    if (viewMode === 'import') {
        return (
            <motion.div
                key="import"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="py-6"
            >
                <ImportarExpedienteWizard
                    onComplete={(_data, existingId) => {
                        if (existingId) {
                            navigate(`/pacientes/${existingId}/perfil`)
                        } else {
                            refresh()
                            setViewMode('list')
                        }
                    }}
                    onCancel={() => setViewMode('list')}
                    empresaId={user?.empresa_id}
                />
            </motion.div>
        )
    }

    if (viewMode === 'wizard') {
        return (
            <motion.div
                key="wizard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-[calc(100vh-4rem)]"
            >
                <SmartOnboardingHub
                    onComplete={handleWizardComplete}
                    onCancel={handleWizardCancel}
                    savedPacienteId={savedPacienteId}
                />
            </motion.div>
        )
    }



    // =============================================
    // RENDER: LISTA PRINCIPAL
    // =============================================
    return (
        <>
            <PremiumPageHeader
                title="Gestión de Pacientes"
                subtitle="Registro, consulta y exportación del expediente completo de cada paciente"
                icon={Users}
                badge={`${stats.total} registrados`}
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setViewMode('import')}
                            variant="outline"
                            className="h-11 px-5 rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest gap-2 backdrop-blur-sm"
                        >
                            <Upload className="w-4 h-4" />
                            Subir Archivos
                        </Button>
                        <Button
                            onClick={() => setViewMode('wizard')}
                            className="h-11 px-6 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            Nuevo Paciente
                        </Button>
                    </div>
                }
            />

            <div className="space-y-6 pb-12">

                {/* ── STATS STRIP ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Total', value: stats.total, icon: Users, gradient: 'from-slate-700 to-slate-900', glow: '' },
                        { label: 'Activos', value: stats.activos, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20' },
                        { label: 'Masculino', value: stats.masculino, icon: Users, gradient: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20' },
                        { label: 'Femenino', value: stats.femenino, icon: Heart, gradient: 'from-pink-500 to-rose-600', glow: 'shadow-pink-500/20' },
                        { label: 'Sin Email', value: stats.sinEmail, icon: AlertTriangle, gradient: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
                        { label: 'Nuevos Hoy', value: stats.nuevosHoy, icon: TrendingUp, gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-4 text-white shadow-lg ${stat.glow}`}
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <stat.icon className="w-5 h-5 mb-2 opacity-70" />
                            <p className="text-2xl font-black">{stat.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* ── BARRA DE BÚSQUEDA Y FILTROS ── */}
                <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-3 items-center">
                            {/* Search */}
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar por nombre, CURP, email, #empleado..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-slate-50 border-slate-200 h-11 rounded-xl"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                    </button>
                                )}
                            </div>

                            {/* Filter toggle */}
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`h-11 rounded-xl px-4 gap-2 ${showFilters ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : ''}`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filtros
                                {(filtroGenero !== 'all' || filtroEstatus !== 'all') && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                )}
                            </Button>

                            {/* Refresh */}
                            <Button variant="outline" onClick={refresh} className="h-11 rounded-xl px-4" disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>

                            {/* Results count */}
                            <Badge variant="outline" className="h-11 px-4 rounded-xl text-sm font-bold whitespace-nowrap">
                                {pacientesFiltrados.length} de {pacientes.length}
                            </Badge>
                        </div>

                        {/* Filter Chips */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex flex-wrap gap-3 pt-4 border-t mt-4 border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Género</p>
                                            <div className="flex gap-1.5">
                                                {[
                                                    { value: 'all', label: 'Todos' },
                                                    { value: 'masculino', label: 'Masculino' },
                                                    { value: 'femenino', label: 'Femenino' },
                                                ].map(opt => (
                                                    <Button
                                                        key={opt.value}
                                                        size="sm"
                                                        variant={filtroGenero === opt.value ? 'default' : 'outline'}
                                                        className="h-8 rounded-lg text-xs"
                                                        onClick={() => setFiltroGenero(opt.value)}
                                                    >
                                                        {opt.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Estatus</p>
                                            <div className="flex gap-1.5">
                                                {[
                                                    { value: 'all', label: 'Todos' },
                                                    { value: 'activo', label: 'Activo' },
                                                    { value: 'inactivo', label: 'Inactivo' },
                                                    { value: 'baja', label: 'Baja' },
                                                ].map(opt => (
                                                    <Button
                                                        key={opt.value}
                                                        size="sm"
                                                        variant={filtroEstatus === opt.value ? 'default' : 'outline'}
                                                        className="h-8 rounded-lg text-xs"
                                                        onClick={() => setFiltroEstatus(opt.value)}
                                                    >
                                                        {opt.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {(filtroGenero !== 'all' || filtroEstatus !== 'all') && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 text-xs text-rose-500 hover:text-rose-700 self-end"
                                                onClick={() => { setFiltroGenero('all'); setFiltroEstatus('all') }}
                                            >
                                                <X className="w-3 h-3 mr-1" /> Limpiar filtros
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* ── TABLA DE PACIENTES ── */}
                <Card className="border-0 shadow-xl bg-white overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            <span className="ml-3 text-slate-500 font-medium">Cargando pacientes...</span>
                        </div>
                    ) : pacientesFiltrados.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <Users className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-2">
                                {searchQuery ? 'Sin resultados' : 'No hay pacientes registrados'}
                            </h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                {searchQuery
                                    ? `No se encontraron coincidencias para "${searchQuery}"`
                                    : 'Comienza registrando pacientes de forma manual o mediante carga masiva'}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button onClick={() => setViewMode('wizard')} className="bg-emerald-600 hover:bg-emerald-700 font-bold hidden sm:flex">
                                    <UserPlus className="w-5 h-5 mr-4" /> Smart Onboarding (Alta)
                                </Button>
                                {/* Botón flotante para mobile */}
                                <Button onClick={() => setViewMode('wizard')} className="sm:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-emerald-600 hover:bg-emerald-700 z-50">
                                    <UserPlus className="w-6 h-6" />
                                </Button>

                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/80 border-b border-slate-100">
                                    <tr>
                                        {[
                                            { field: 'nombre' as SortField, label: 'Paciente', width: '' },
                                            { field: 'nombre' as any, label: 'Semáforo', width: '' },
                                            { field: 'empresa' as SortField, label: 'Empresa / Sede', width: '' },
                                            { field: 'puesto' as SortField, label: 'Puesto', width: '' },
                                            { field: 'puesto' as any, label: 'Riesgos', width: 'hidden md:table-cell' },
                                            { field: 'fecha' as SortField, label: 'Registro', width: 'hidden lg:table-cell' },
                                        ].map(col => (
                                            <th
                                                key={col.field}
                                                onClick={() => handleSort(col.field)}
                                                className={`text-left p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none hover:text-emerald-600 transition-colors ${col.width}`}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {col.label}
                                                    <ArrowUpDown className={`w-3 h-3 ${sortField === col.field ? 'text-emerald-500' : 'text-slate-300'}`} />
                                                </div>
                                            </th>
                                        ))}
                                        <th className="text-left p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            Contacto
                                        </th>
                                        <th className="text-center p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {pacientesFiltrados.map((paciente, idx) => {
                                        const gradient = GENERO_COLORS[paciente.genero || ''] || 'from-slate-400 to-slate-600'
                                        const initials = `${(paciente.nombre || '')[0] || ''}${(paciente.apellido_paterno || '')[0] || ''}`.toUpperCase()
                                        const edad = paciente.fecha_nacimiento ? calcularEdad(paciente.fecha_nacimiento) : null

                                        return (
                                            <motion.tr
                                                key={paciente.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                                                className="group hover:bg-emerald-50/50 transition-colors cursor-pointer"
                                                onClick={() => openProfile(paciente)}
                                            >
                                                {/* Paciente */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-11 w-11 border-2 border-white shadow-md">
                                                            <AvatarImage src={paciente.foto_url || undefined} />
                                                            <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-sm font-bold`}>
                                                                {initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors text-sm">
                                                                {paciente.apellido_paterno} {paciente.apellido_materno || ''}, {paciente.nombre}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                                {paciente.curp && <span className="font-mono text-[10px]">{paciente.curp.substring(0, 10)}...</span>}
                                                                {edad && <span>• {edad} años</span>}
                                                                {paciente.genero && (
                                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-slate-200">
                                                                        {paciente.genero === 'masculino' ? '♂' : paciente.genero === 'femenino' ? '♀' : '⚧'}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Semáforo Clínico */}
                                                <td className="p-4">
                                                    {(() => {
                                                        const semaforo = getSemaforClinico(paciente);
                                                        return (
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${semaforo.bgColor} ${semaforo.borderColor}`}>
                                                                <span className="text-xs leading-none">{semaforo.icon}</span>
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${semaforo.color}`}>
                                                                    {semaforo.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>

                                                {/* Empresa */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-700">{paciente.empresa_nombre || '—'}</p>
                                                            {paciente.sede_nombre && (
                                                                <p className="text-xs text-slate-400">{paciente.sede_nombre}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Puesto */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                        <span className="text-sm text-slate-600">{paciente.puesto || '—'}</span>
                                                    </div>
                                                </td>

                                                {/* Riesgos */}
                                                <td className="p-4 hidden md:table-cell">
                                                    {(() => {
                                                        const riesgosArr = normalizeRiesgos(paciente.riesgos_ocupacionales)
                                                        return (
                                                            <div className="flex flex-wrap gap-1">
                                                                {riesgosArr.slice(0, 2).map((r: string, i: number) => (
                                                                    <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] uppercase tracking-tighter px-1">
                                                                        {r}
                                                                    </Badge>
                                                                ))}
                                                                {riesgosArr.length > 2 && (
                                                                    <span className="text-[9px] text-slate-400">+{riesgosArr.length - 2}</span>
                                                                )}
                                                                {riesgosArr.length === 0 && (
                                                                    <span className="text-xs text-slate-300">—</span>
                                                                )}
                                                            </div>
                                                        )
                                                    })()}
                                                </td>

                                                {/* Registro */}
                                                <td className="p-4 hidden lg:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                        <span className="text-sm text-slate-500">
                                                            {paciente.created_at ? new Date(paciente.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Contacto */}
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        {paciente.email && (
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                <Mail className="w-3 h-3" />
                                                                <span className="truncate max-w-[140px]">{paciente.email}</span>
                                                            </div>
                                                        )}
                                                        {paciente.telefono && (
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                <Phone className="w-3 h-3" />
                                                                <span>{paciente.telefono}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Acciones */}
                                                <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
                                                            onClick={() => openProfile(paciente)}
                                                            title="Ver perfil"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                                                            onClick={() => navigate(`/pacientes/${paciente.id}/expediente`, { state: { paciente } })}
                                                            title="Expediente clínico"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {/* Pagination hint */}
                            {pacientesFiltrados.length > 50 && (
                                <div className="p-4 text-center border-t border-slate-100">
                                    <p className="text-xs text-slate-400">
                                        Mostrando {Math.min(pacientesFiltrados.length, 100)} de {pacientesFiltrados.length} pacientes
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </>
    )
}

// =============================================
// HELPERS
// =============================================
function calcularEdad(fechaNac: string): number {
    const birth = new Date(fechaNac)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}
