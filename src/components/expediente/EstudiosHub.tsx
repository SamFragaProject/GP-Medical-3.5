/**
 * EstudiosHub — Hub de sub-tabs para todos los tipos de estudio clínico
 *
 * Sub-navi premium con iconos para:
 * Labs, Audiometría, Espirometría, ECG, Rayos X, Optometría, Odontograma
 */
import React, { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FlaskConical, Ear, Wind, Heart, Bone, Eye, Loader2,
    Smile
} from 'lucide-react'

// Lazy-load each study tab
const LaboratorioTab = React.lazy(() => import('@/components/expediente/LaboratorioTab'))
const AudiometriaTab = React.lazy(() => import('@/components/expediente/AudiometriaTab'))
const EspirometriaTab = React.lazy(() => import('@/components/expediente/EspirometriaTab'))
const ElectrocardiogramaTab = React.lazy(() => import('@/components/expediente/ElectrocardiogramaTab'))
const RayosXTab = React.lazy(() => import('@/components/expediente/RayosXTab'))
const EstudiosVisualesTab = React.lazy(() => import('@/components/expediente/EstudiosVisualesTab'))
const OdontogramaTab = React.lazy(() => import('@/components/expediente/OdontogramaTab'))

const STUDY_TABS = [
    { id: 'lab', label: 'Laboratorios', icon: FlaskConical, color: 'emerald' },
    { id: 'audio', label: 'Audiometría', icon: Ear, color: 'violet' },
    { id: 'espiro', label: 'Espirometría', icon: Wind, color: 'sky' },
    { id: 'ecg', label: 'ECG', icon: Heart, color: 'rose' },
    { id: 'rx', label: 'Rayos X', icon: Bone, color: 'amber' },
    { id: 'visual', label: 'Optometría', icon: Eye, color: 'blue' },
    { id: 'odonto', label: 'Odontograma', icon: Smile, color: 'teal' },
] as const

const COLOR_MAP: Record<string, { active: string; hover: string; dot: string }> = {
    emerald: { active: 'bg-emerald-50 border-emerald-300 text-emerald-700', hover: 'hover:bg-emerald-50/50', dot: 'bg-emerald-500' },
    violet: { active: 'bg-violet-50 border-violet-300 text-violet-700', hover: 'hover:bg-violet-50/50', dot: 'bg-violet-500' },
    sky: { active: 'bg-sky-50 border-sky-300 text-sky-700', hover: 'hover:bg-sky-50/50', dot: 'bg-sky-500' },
    rose: { active: 'bg-rose-50 border-rose-300 text-rose-700', hover: 'hover:bg-rose-50/50', dot: 'bg-rose-500' },
    amber: { active: 'bg-amber-50 border-amber-300 text-amber-700', hover: 'hover:bg-amber-50/50', dot: 'bg-amber-500' },
    blue: { active: 'bg-blue-50 border-blue-300 text-blue-700', hover: 'hover:bg-blue-50/50', dot: 'bg-blue-500' },
    teal: { active: 'bg-teal-50 border-teal-300 text-teal-700', hover: 'hover:bg-teal-50/50', dot: 'bg-teal-500' },
}

function TabLoader({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mr-2" />
            <span className="text-sm text-slate-400 font-semibold">{label}</span>
        </div>
    )
}

export default function EstudiosHub({ pacienteId, paciente }: { pacienteId: string; paciente?: any }) {
    const [activeStudy, setActiveStudy] = useState('lab')

    const renderContent = () => {
        switch (activeStudy) {
            case 'lab': return <Suspense fallback={<TabLoader label="Cargando laboratorios..." />}><LaboratorioTab pacienteId={pacienteId} /></Suspense>
            case 'audio': return <Suspense fallback={<TabLoader label="Cargando audiometría..." />}><AudiometriaTab pacienteId={pacienteId} /></Suspense>
            case 'espiro': return <Suspense fallback={<TabLoader label="Cargando espirometría..." />}><EspirometriaTab pacienteId={pacienteId} /></Suspense>
            case 'ecg': return <Suspense fallback={<TabLoader label="Cargando ECG..." />}><ElectrocardiogramaTab pacienteId={pacienteId} paciente={paciente} /></Suspense>
            case 'rx': return <Suspense fallback={<TabLoader label="Cargando rayos X..." />}><RayosXTab pacienteId={pacienteId} /></Suspense>
            case 'visual': return <Suspense fallback={<TabLoader label="Cargando optometría..." />}><EstudiosVisualesTab pacienteId={pacienteId} /></Suspense>
            case 'odonto': return <Suspense fallback={<TabLoader label="Cargando odontograma..." />}><OdontogramaTab /></Suspense>
            default: return null
        }
    }

    return (
        <div className="space-y-4">
            {/* Sub-navigation */}
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                {STUDY_TABS.map(tab => {
                    const isActive = activeStudy === tab.id
                    const colors = COLOR_MAP[tab.color]
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveStudy(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all
                                ${isActive
                                    ? `${colors.active} shadow-sm`
                                    : `border-transparent text-slate-500 ${colors.hover}`
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeStudy}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
