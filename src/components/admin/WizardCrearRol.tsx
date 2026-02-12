/**
 * Wizard para Crear Roles Personalizados
 * 
 * Este componente permite al Super Admin crear roles de forma visual,
 * paso a paso, como un instalador de plugin de WordPress.
 * 
 * Pasos:
 * 1. Información básica del rol (nombre, descripción, color)
 * 2. Selección de módulos visibles
 * 3. Permisos detallados por módulo
 * 4. Resumen y confirmación
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Crown,
    ArrowRight,
    ArrowLeft,
    Check,
    X,
    Sparkles,
    Shield,
    Eye,
    Plus,
    Edit,
    Trash2,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Building2,
    Users,
    Calendar,
    FileText,
    Stethoscope,
    Package,
    CreditCard,
    BarChart3,
    Settings,
    Briefcase,
    Activity,
    Pill,
    ClipboardCheck,
    Microscope,
    Heart,
    UserCheck,
    Monitor
} from 'lucide-react'
import {
    obtenerTodosLosModulos,
    crearRolPersonalizado,
    actualizarRol,
    ModuloSistema,
    NuevoRol,
    RolPersonalizado
} from '@/services/permisosService'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

// =============================================
// TIPOS
// =============================================

interface PermisoModuloLocal {
    modulo_codigo: string
    modulo_nombre: string
    modulo_icono: string
    modulo_gradiente: string
    seleccionado: boolean
    puede_ver: boolean
    puede_crear: boolean
    puede_editar: boolean
    puede_borrar: boolean
    puede_exportar: boolean
    puede_ver_todos: boolean
    puede_aprobar: boolean
    puede_firmar: boolean
    puede_imprimir: boolean
}

interface WizardState {
    paso: number
    nombre: string
    descripcion: string
    color: string
    icono: string
    nivel_jerarquia: number
    empresa_id?: string
    permisos: PermisoModuloLocal[]
}

// =============================================
// CONSTANTES
// =============================================

const COLORES_DISPONIBLES = [
    { valor: '#f59e0b', nombre: 'Naranja' },
    { valor: '#3b82f6', nombre: 'Azul' },
    { valor: '#10b981', nombre: 'Verde' },
    { valor: '#8b5cf6', nombre: 'Violeta' },
    { valor: '#ec4899', nombre: 'Rosa' },
    { valor: '#6366f1', nombre: 'Índigo' },
    { valor: '#14b8a6', nombre: 'Teal' },
    { valor: '#ef4444', nombre: 'Rojo' }
]

const ICONOS_DISPONIBLES = [
    { valor: 'Users', icono: Users },
    { valor: 'UserCheck', icono: UserCheck },
    { valor: 'Stethoscope', icono: Stethoscope },
    { valor: 'Heart', icono: Heart },
    { valor: 'Shield', icono: Shield },
    { valor: 'Briefcase', icono: Briefcase },
    { valor: 'Building2', icono: Building2 },
    { valor: 'Crown', icono: Crown }
]

// Mapa de iconos para renderizar
const ICONO_MAP: Record<string, any> = {
    Building2, Users, Calendar, FileText, Stethoscope, Package, CreditCard,
    BarChart3, Settings, Briefcase, Activity, Pill, ClipboardCheck, Microscope,
    Heart, UserCheck, Crown, Shield, Sparkles, Eye, AlertCircle
}

// =============================================
// COMPONENTES DE CADA PASO
// =============================================

interface PasoProps {
    state: WizardState
    setState: React.Dispatch<React.SetStateAction<WizardState>>
    modulos: ModuloSistema[]
}

/**
 * Paso 1: Información Básica
 */
function PasoInformacionBasica({ state, setState }: PasoProps) {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20 mb-6 group transition-transform hover:scale-105">
                    <Crown className="w-10 h-10 text-white group-hover:rotate-12 transition-transform" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Configuración de Identidad
                </h2>
                <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                    Define los atributos visuales y funcionales del nuevo perfil operativo.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre del Rol */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Nombre del Perfil / Rol *
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                            <Shield className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={state.nombre}
                            onChange={(e) => setState(s => ({ ...s, nombre: e.target.value }))}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                            placeholder="Ej: Especialista de Seguridad Industrial..."
                        />
                    </div>
                </div>

                {/* Descripción */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Descripción de Responsabilidades
                    </label>
                    <textarea
                        value={state.descripcion}
                        onChange={(e) => setState(s => ({ ...s, descripcion: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm resize-none"
                        placeholder="Describe el alcance de este rol dentro de la organización..."
                    />
                </div>

                {/* Color Seleccionado */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Identificador Cromático
                    </label>
                    <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        {COLORES_DISPONIBLES.map(color => (
                            <button
                                key={color.valor}
                                onClick={() => setState(s => ({ ...s, color: color.valor }))}
                                className={`aspect-square rounded-xl transition-all duration-300 relative group
                                    ${state.color === color.valor
                                        ? 'ring-4 ring-offset-2 ring-blue-500 scale-110 rotate-3'
                                        : 'hover:scale-105'
                                    }`}
                                style={{ backgroundColor: color.valor }}
                            >
                                {state.color === color.valor && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Iconografía */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Representación Visual
                    </label>
                    <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        {ICONOS_DISPONIBLES.map(({ valor, icono: Icono }) => (
                            <button
                                key={valor}
                                onClick={() => setState(s => ({ ...s, icono: valor }))}
                                className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-300
                                    ${state.icono === valor
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110 -rotate-3'
                                        : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                <Icono className="w-6 h-6" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nivel de Jerarquía */}
                <div className="col-span-1 md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                            Nivel de Capacidad Jerárquica
                        </label>
                        <Badge variant="outline" className="bg-blue-600 text-white border-none px-3 font-mono">
                            NIVEL {state.nivel_jerarquia}
                        </Badge>
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="9"
                        value={state.nivel_jerarquia}
                        onChange={(e) => setState(s => ({ ...s, nivel_jerarquia: parseInt(e.target.value) }))}
                        className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-indigo-600 transition-all"
                    />
                    <div className="flex justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter mt-3 px-1">
                        <span className="flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Superior (Admin)</span>
                        <span>Equivalencia Funcional</span>
                        <span className="flex items-center gap-1">Operativo (Base) <ArrowRight className="w-3 h-3" /></span>
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Paso 2: Selección de Módulos
 * Organizado por los 13 pilares del ERP (misma estructura que el sidebar)
 */

// Agrupación de módulos por los pilares del ERP — coincide con el sidebar
const WIZARD_SECTIONS: { key: string; label: string; color: string; dotColor: string; modules: string[] }[] = [
    {
        key: 'medicina', label: 'Medicina', color: 'emerald', dotColor: 'bg-emerald-400',
        modules: ['dashboard', 'pacientes', 'estudios_medicos', 'prescripcion', 'incapacidades', 'dictamenes']
    },
    {
        key: 'diagnostico', label: 'Diagnóstico', color: 'cyan', dotColor: 'bg-cyan-400',
        modules: ['rayos_x', 'espirometria', 'vision', 'resultados']
    },
    {
        key: 'operaciones', label: 'Operaciones', color: 'purple', dotColor: 'bg-purple-400',
        modules: ['episodios', 'campanias', 'agenda', 'citas', 'alertas']
    },
    {
        key: 'finanzas', label: 'Finanzas', color: 'blue', dotColor: 'bg-blue-400',
        modules: ['facturacion', 'cotizaciones', 'cxc', 'inventario', 'tienda']
    },
    {
        key: 'cumplimiento', label: 'Cumplimiento', color: 'amber', dotColor: 'bg-amber-400',
        modules: ['normatividad', 'nom011', 'evaluaciones', 'matriz_riesgos', 'programa_anual', 'certificaciones']
    },
    {
        key: 'analisis', label: 'Análisis e Inteligencia', color: 'violet', dotColor: 'bg-violet-400',
        modules: ['reportes', 'ia', 'rrhh']
    },
    {
        key: 'admin', label: 'Administración SaaS', color: 'slate', dotColor: 'bg-slate-400',
        modules: ['empresas', 'usuarios', 'roles_permisos', 'sedes', 'medicos', 'configuracion', 'sistema', 'suscripcion', 'logs']
    }
]

function PasoSeleccionModulos({ state, setState, modulos }: PasoProps) {
    const toggleModulo = (codigo: string) => {
        setState(s => ({
            ...s,
            permisos: s.permisos.map(p =>
                p.modulo_codigo === codigo
                    ? { ...p, seleccionado: !p.seleccionado, puede_ver: !p.seleccionado }
                    : p
            )
        }))
    }

    const toggleSeccion = (moduleCodes: string[], seleccionar: boolean) => {
        setState(s => ({
            ...s,
            permisos: s.permisos.map(p =>
                moduleCodes.includes(p.modulo_codigo)
                    ? {
                        ...p,
                        seleccionado: seleccionar,
                        puede_ver: seleccionar,
                        ...(!seleccionar ? { puede_crear: false, puede_editar: false, puede_borrar: false, puede_exportar: false, puede_ver_todos: false } : {})
                    }
                    : p
            )
        }))
    }

    const seleccionarTodos = () => {
        setState(s => ({
            ...s,
            permisos: s.permisos.map(p => ({ ...p, seleccionado: true, puede_ver: true }))
        }))
    }

    const deseleccionarTodos = () => {
        setState(s => ({
            ...s,
            permisos: s.permisos.map(p => ({
                ...p,
                seleccionado: false,
                puede_ver: false,
                puede_crear: false,
                puede_editar: false,
                puede_borrar: false,
                puede_exportar: false,
                puede_ver_todos: false
            }))
        }))
    }

    // Agrupar permisos para cada sección del wizard
    const seccionesConModulos = WIZARD_SECTIONS.map(section => {
        const permisosSeccion = section.modules
            .map(code => state.permisos.find(p => p.modulo_codigo === code))
            .filter(Boolean) as PermisoModuloLocal[]
        const seleccionados = permisosSeccion.filter(p => p.seleccionado).length
        return { ...section, permisos: permisosSeccion, seleccionados }
    }).filter(s => s.permisos.length > 0)

    const totalSeleccionados = state.permisos.filter(p => p.seleccionado).length

    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl shadow-cyan-500/20 mb-6 transition-transform hover:scale-110 duration-500">
                    <Monitor className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Arquitectura de Accesos
                </h2>
                <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                    Define los módulos que integrarán el espacio de trabajo de este perfil.
                </p>
            </div>

            {/* Acciones globales + contador */}
            <div className="flex items-center justify-between">
                <div className="flex gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <button
                        onClick={seleccionarTodos}
                        className="px-4 py-2 text-[10px] font-bold text-emerald-700 bg-white shadow-sm border border-emerald-100 rounded-lg hover:bg-emerald-50 transition-all uppercase tracking-widest"
                    >
                        Habilitar Todo
                    </button>
                    <button
                        onClick={deseleccionarTodos}
                        className="px-4 py-2 text-[10px] font-bold text-slate-400 bg-white shadow-sm border border-slate-100 rounded-lg hover:bg-slate-50 transition-all uppercase tracking-widest"
                    >
                        Reiniciar
                    </button>
                </div>
                <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-xs font-bold text-blue-700">{totalSeleccionados}</span>
                    <span className="text-xs text-blue-500 ml-1">módulos activos</span>
                </div>
            </div>

            {/* Secciones alineadas con los pilares del ERP */}
            <div className="space-y-8">
                {seccionesConModulos.map(section => {
                    const todosSeleccionados = section.seleccionados === section.permisos.length
                    const algunosSeleccionados = section.seleccionados > 0 && !todosSeleccionados

                    return (
                        <div key={section.key} className="space-y-4">
                            {/* Header de sección con toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full ${section.dotColor}`}></div>
                                    <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">
                                        {section.label}
                                    </h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${section.seleccionados > 0
                                        ? `bg-${section.color}-100 text-${section.color}-700`
                                        : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {section.seleccionados}/{section.permisos.length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => toggleSeccion(
                                        section.modules,
                                        !todosSeleccionados
                                    )}
                                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${todosSeleccionados
                                        ? 'text-rose-500 hover:bg-rose-50 border border-rose-100'
                                        : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-100'
                                        }`}
                                >
                                    {todosSeleccionados ? 'Quitar Todos' : algunosSeleccionados ? 'Completar' : 'Activar Todos'}
                                </button>
                            </div>

                            {/* Grid de módulos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {section.permisos.map(permiso => {
                                    const IconoModulo = ICONO_MAP[permiso.modulo_icono] || FileText

                                    return (
                                        <button
                                            key={permiso.modulo_codigo}
                                            onClick={() => toggleModulo(permiso.modulo_codigo)}
                                            className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden
                                                ${permiso.seleccionado
                                                    ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10'
                                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="relative flex items-center gap-3 z-10">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110
                                                    bg-gradient-to-br ${permiso.modulo_gradiente}`}>
                                                    <IconoModulo className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold text-sm transition-colors ${permiso.seleccionado ? 'text-blue-700' : 'text-slate-700'}`}>
                                                        {permiso.modulo_nombre}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                        {permiso.seleccionado ? '● Activo' : '○ Inactivo'}
                                                    </p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all
                                                    ${permiso.seleccionado ? 'bg-blue-600 scale-100' : 'bg-slate-100 scale-75 opacity-0 group-hover:opacity-50'}`}>
                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/**
 * Paso 3: Permisos Detallados
 * Tabla agrupada por pilares del ERP
 */
function PasoPermisosDetallados({ state, setState }: PasoProps) {
    const modulosSeleccionados = state.permisos.filter(p => p.seleccionado)

    const togglePermiso = (codigo: string, permiso: keyof PermisoModuloLocal) => {
        setState(s => ({
            ...s,
            permisos: s.permisos.map(p =>
                p.modulo_codigo === codigo
                    ? { ...p, [permiso]: !p[permiso as keyof typeof p] }
                    : p
            )
        }))
    }

    const aplicarPreset = (preset: 'solo_ver' | 'ver_crear' | 'completo') => {
        setState(s => ({
            ...s,
            permisos: s.permisos.map(p => {
                if (!p.seleccionado) return p

                switch (preset) {
                    case 'solo_ver':
                        return { ...p, puede_ver: true, puede_crear: false, puede_editar: false, puede_borrar: false, puede_exportar: false }
                    case 'ver_crear':
                        return { ...p, puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: false, puede_exportar: false }
                    case 'completo':
                        return { ...p, puede_ver: true, puede_crear: true, puede_editar: true, puede_borrar: true, puede_exportar: true, puede_ver_todos: true }
                    default:
                        return p
                }
            })
        }))
    }

    // Agrupar módulos seleccionados por sección
    const seccionesConPermisos = WIZARD_SECTIONS.map(section => {
        const permisos = section.modules
            .map(code => modulosSeleccionados.find(p => p.modulo_codigo === code))
            .filter(Boolean) as PermisoModuloLocal[]
        return { ...section, permisos }
    }).filter(s => s.permisos.length > 0)

    if (modulosSeleccionados.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Sin Configuración Pendiente
                </h3>
                <p className="text-slate-500 max-w-sm">
                    No has seleccionado ningún módulo. Regresa al paso anterior para habilitar funciones.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-orange-500/20 mb-6">
                    <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Matriz de Privilegios
                </h2>
                <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                    Ajusta con precisión las capacidades de acción para cada módulo activo.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                <button
                    onClick={() => aplicarPreset('solo_ver')}
                    className="px-5 py-2.5 text-xs font-bold text-blue-700 bg-blue-50/50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all uppercase tracking-widest"
                >
                    Nivel Lectura
                </button>
                <button
                    onClick={() => aplicarPreset('ver_crear')}
                    className="px-5 py-2.5 text-xs font-bold text-amber-700 bg-amber-50/50 border border-amber-100 rounded-2xl hover:bg-amber-100 transition-all uppercase tracking-widest"
                >
                    Nivel Operativo
                </button>
                <button
                    onClick={() => aplicarPreset('completo')}
                    className="px-5 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50/50 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition-all uppercase tracking-widest"
                >
                    Acceso Administrativo
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Módulo</th>
                                <th className="px-4 py-4 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Ver</th>
                                <th className="px-4 py-4 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Crear</th>
                                <th className="px-4 py-4 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Edit</th>
                                <th className="px-4 py-4 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Borrar</th>
                                <th className="px-4 py-4 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">XLS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {seccionesConPermisos.map(section => (
                                <React.Fragment key={section.key}>
                                    {/* Fila de header de sección */}
                                    <tr className="bg-slate-50/80">
                                        <td colSpan={6} className="px-6 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-1.5 w-1.5 rounded-full ${section.dotColor}`}></div>
                                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">
                                                    {section.label}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">
                                                    ({section.permisos.length})
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Filas de módulos */}
                                    {section.permisos.map(permiso => {
                                        const IconoModulo = ICONO_MAP[permiso.modulo_icono] || FileText
                                        return (
                                            <tr key={permiso.modulo_codigo} className="group hover:bg-slate-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${permiso.modulo_gradiente} shadow-sm transition-transform group-hover:scale-110`}>
                                                            <IconoModulo className="w-4 h-4 text-white" />
                                                        </div>
                                                        <span className="font-bold text-slate-700 text-sm">
                                                            {permiso.modulo_nombre}
                                                        </span>
                                                    </div>
                                                </td>
                                                {(['puede_ver', 'puede_crear', 'puede_editar', 'puede_borrar', 'puede_exportar'] as const).map(campo => (
                                                    <td key={campo} className="px-4 py-4 text-center">
                                                        <button
                                                            onClick={() => togglePermiso(permiso.modulo_codigo, campo)}
                                                            className={`w-9 h-9 rounded-xl transition-all duration-300 flex items-center justify-center mx-auto
                                                                ${permiso[campo]
                                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 rotate-0'
                                                                    : 'bg-slate-50 text-slate-300 hover:text-slate-400 hover:bg-slate-100 -rotate-3'
                                                                }`}
                                                        >
                                                            {permiso[campo] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4 opacity-30" />}
                                                        </button>
                                                    </td>
                                                ))}
                                            </tr>
                                        )
                                    })}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

/**
 * Paso 4: Resumen y Confirmación
 */
function PasoResumen({ state }: { state: WizardState }) {
    const IconoRol = ICONO_MAP[state.icono] || Users
    const modulosSeleccionados = state.permisos.filter(p => p.seleccionado)

    const puedeCrearEn = modulosSeleccionados.filter(p => p.puede_crear).map(p => p.modulo_nombre)
    const puedeEditarEn = modulosSeleccionados.filter(p => p.puede_editar).map(p => p.modulo_nombre)
    const puedeBorrarEn = modulosSeleccionados.filter(p => p.puede_borrar).map(p => p.modulo_nombre)

    return (
        <div className="space-y-8">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 mb-6">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Resumen Ejecutivo
                </h2>
                <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                    Verifica la configuración final del perfil antes de su despliegue operativo.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20" style={{ backgroundColor: state.color }}>
                            <IconoRol className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Nombre del Perfil</p>
                            <h4 className="font-bold text-slate-800 text-lg leading-tight">{state.nombre}</h4>
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 italic">"{state.descripcion}"</p>
                </div>

                <div className="p-6 rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between h-full">
                        <div>
                            <p className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-1">Impacto Jerárquico</p>
                            <h4 className="text-4xl font-extrabold">NIVEL {state.nivel_jerarquia}</h4>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Monitor className="w-4 h-4" /> Alcance del Perfil
                    </h4>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold">
                        {modulosSeleccionados.length} Módulos Activos
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {puedeCrearEn.length > 0 && (
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <Plus className="w-4 h-4" />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-widest mb-1">Facultad de Creación</h5>
                                <p className="text-xs text-emerald-700/80 font-medium leading-relaxed">{puedeCrearEn.join(', ')}</p>
                            </div>
                        </div>
                    )}

                    {puedeEditarEn.length > 0 && (
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <Edit className="w-4 h-4" />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-extrabold text-amber-800 uppercase tracking-widest mb-1">Capacidad de Edición</h5>
                                <p className="text-xs text-amber-700/80 font-medium leading-relaxed">{puedeEditarEn.join(', ')}</p>
                            </div>
                        </div>
                    )}

                    {puedeBorrarEn.length > 0 && (
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50">
                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <Trash2 className="w-4 h-4" />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-extrabold text-rose-800 uppercase tracking-widest mb-1">Privilegios de Borrado</h5>
                                <p className="text-xs text-rose-700/80 font-medium leading-relaxed font-bold">{puedeBorrarEn.join(', ')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

interface WizardCrearRolProps {
    onClose: () => void
    onCreado: () => void
    empresaId?: string
    rolInitial?: RolPersonalizado
}

export default function WizardCrearRol({ onClose, onCreado, empresaId, rolInitial }: WizardCrearRolProps) {
    const { user } = useAuth()
    const [modulos, setModulos] = useState<ModuloSistema[]>([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [state, setState] = useState<WizardState>({
        paso: 1,
        nombre: rolInitial?.nombre || '',
        descripcion: rolInitial?.descripcion || '',
        color: rolInitial?.color || '#3b82f6',
        icono: rolInitial?.icono || 'Users',
        nivel_jerarquia: rolInitial?.nivel_jerarquia || 5,
        empresa_id: empresaId || rolInitial?.empresa_id || undefined,
        permisos: []
    })

    // Cargar módulos al iniciar
    useEffect(() => {
        const cargar = async () => {
            setLoading(true)
            try {
                const modulosCargados = await obtenerTodosLosModulos()
                setModulos(modulosCargados)

                // Inicializar permisos
                setState(s => ({
                    ...s,
                    permisos: modulosCargados.map(m => {
                        const permisoExistente = rolInitial?.permisos.find(p => p.modulo_codigo === m.codigo)

                        return {
                            modulo_codigo: m.codigo,
                            modulo_nombre: m.nombre,
                            modulo_icono: m.icono,
                            modulo_gradiente: m.gradiente,
                            seleccionado: !!permisoExistente,
                            puede_ver: permisoExistente?.puede_ver || false,
                            puede_crear: permisoExistente?.puede_crear || false,
                            puede_editar: permisoExistente?.puede_editar || false,
                            puede_borrar: permisoExistente?.puede_borrar || false,
                            puede_exportar: permisoExistente?.puede_exportar || false,
                            puede_ver_todos: permisoExistente?.puede_ver_todos || false,
                            puede_aprobar: permisoExistente?.puede_aprobar || false,
                            puede_firmar: permisoExistente?.puede_firmar || false,
                            puede_imprimir: permisoExistente?.puede_imprimir || false
                        }
                    })
                }))
            } catch (err) {
                setError('Error al cargar módulos')
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [rolInitial])

    // Validación por paso
    const puedeAvanzar = () => {
        switch (state.paso) {
            case 1:
                return state.nombre.trim().length >= 3
            case 2:
                return state.permisos.some(p => p.seleccionado)
            case 3:
                return true
            default:
                return true
        }
    }

    // Navegar entre pasos
    const siguiente = () => {
        if (state.paso < 4 && puedeAvanzar()) {
            setState(s => ({ ...s, paso: s.paso + 1 }))
        }
    }

    const anterior = () => {
        if (state.paso > 1) {
            setState(s => ({ ...s, paso: s.paso - 1 }))
        }
    }

    // Crear o actualizar el rol
    const guardarRol = async () => {
        setGuardando(true)
        setError(null)

        try {
            const datosRol: NuevoRol = {
                nombre: state.nombre,
                descripcion: state.descripcion,
                color: state.color,
                icono: state.icono,
                nivel_jerarquia: state.nivel_jerarquia,
                empresa_id: state.empresa_id,
                permisos: state.permisos
                    .filter(p => p.seleccionado)
                    .map(p => ({
                        modulo_codigo: p.modulo_codigo,
                        puede_ver: p.puede_ver,
                        puede_crear: p.puede_crear,
                        puede_editar: p.puede_editar,
                        puede_borrar: p.puede_borrar,
                        puede_exportar: p.puede_exportar,
                        puede_ver_todos: p.puede_ver_todos,
                        puede_aprobar: p.puede_aprobar,
                        puede_firmar: p.puede_firmar,
                        puede_imprimir: p.puede_imprimir
                    }))
            }

            let resultado;
            if (rolInitial) {
                resultado = await actualizarRol(rolInitial.id, datosRol)
            } else {
                resultado = await crearRolPersonalizado(datosRol)
            }

            if (resultado.success) {
                toast.success(rolInitial ? 'Perfil actualizado con éxito' : 'Nuevo perfil desplegado con éxito')
                onCreado()
                onClose()
            } else {
                setError(resultado.error || 'Error al procesar el rol')
            }
        } catch (err) {
            setError('Error inesperado al guardar el rol')
        } finally {
            setGuardando(false)
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-2xl mx-4">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/50 flex flex-col"
            >
                {/* Header con indicador de trayectoria operativa */}
                <div className="px-10 py-8 border-b border-slate-100 flex flex-col gap-6 bg-gradient-to-b from-white to-slate-50/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <span className="w-2 h-8 bg-blue-600 rounded-full shadow-sm"></span>
                                Generador de Perfiles GPMedical
                            </h1>
                            <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-[0.3em] mt-1 ml-5">
                                Protocolo Operativo v3.5
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-md transition-all duration-300"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Track con diseño de alta fidelidad */}
                    <div className="relative flex items-center justify-between px-2 pt-2">
                        {/* Background line */}
                        <div className="absolute top-[1.35rem] left-6 right-6 h-0.5 bg-slate-200"></div>

                        {[
                            { step: 1, label: 'Identidad', icon: Users },
                            { step: 2, label: 'Privilegios', icon: Shield },
                            { step: 3, label: 'Protocolo', icon: FileText },
                            { step: 4, label: 'Despliegue', icon: Sparkles }
                        ].map(({ step, label, icon: Icon }) => (
                            <div key={step} className="relative z-10 flex flex-col items-center gap-2 group">
                                <div
                                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 shadow-lg
                                        ${state.paso === step
                                            ? 'bg-blue-600 text-white scale-110 shadow-blue-500/30 ring-4 ring-blue-50'
                                            : state.paso > step
                                                ? 'bg-emerald-500 text-white scale-95 shadow-emerald-500/20'
                                                : 'bg-white text-slate-300 border border-slate-200'
                                        }`}
                                >
                                    {state.paso > step ? <Check className="w-5 h-5 stroke-[3]" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={`text-[10px] font-extrabold uppercase tracking-widest transition-colors duration-300
                                    ${state.paso === step ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contenido Dinámico con Scroll Premium */}
                <div className="flex-1 overflow-y-auto px-10 py-10 custom-scrollbar bg-white/40">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={state.paso}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="max-w-3xl mx-auto"
                        >
                            {state.paso === 1 && <PasoInformacionBasica state={state} setState={setState} modulos={modulos} />}
                            {state.paso === 2 && <PasoSeleccionModulos state={state} setState={setState} modulos={modulos} />}
                            {state.paso === 3 && <PasoPermisosDetallados state={state} setState={setState} modulos={modulos} />}
                            {state.paso === 4 && <PasoResumen state={state} />}
                        </motion.div>
                    </AnimatePresence>

                    {/* Alerta de Error integrada en el diseño */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 max-w-3xl mx-auto"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                        </motion.div>
                    )}
                </div>

                {/* Footer inmersivo con acciones contextuales */}
                <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm flex items-center justify-between">
                    <button
                        onClick={state.paso === 1 ? onClose : anterior}
                        className="px-8 py-4 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all hover:bg-white active:scale-95"
                    >
                        {state.paso === 1 ? 'Abortar Configuración' : (
                            <span className="flex items-center gap-3">
                                <ArrowLeft className="w-4 h-4" /> Fase Anterior
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-4">
                        {state.paso < 4 ? (
                            <button
                                onClick={siguiente}
                                disabled={!puedeAvanzar()}
                                className="px-10 py-4 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-3 active:scale-95"
                            >
                                Siguiente Fase <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={guardarRol}
                                disabled={guardando}
                                className="px-10 py-4 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-30 transition-all flex items-center gap-3 active:scale-95"
                            >
                                {guardando ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Finalizando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" /> Confirmar Despliegue
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
