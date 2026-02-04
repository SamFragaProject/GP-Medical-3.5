import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Zap, ZapOff, Loader2 } from 'lucide-react'
import { chatbot } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function AIHealthIndicator() {
    const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')
    const [models, setModels] = useState<string[]>([])

    const checkStatus = async () => {
        setStatus('checking')
        try {
            const state = await chatbot.verificarEstado()
            if (state.disponible) {
                setStatus('online')
                setModels(state.modelos)
            } else {
                setStatus('offline')
            }
        } catch {
            setStatus('offline')
        }
    }

    useEffect(() => {
        checkStatus()
        const interval = setInterval(checkStatus, 30000) // Re-check every 30s
        return () => clearInterval(interval)
    }, [])

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center"
                    >
                        <div
                            onClick={checkStatus}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${status === 'online'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                    : status === 'offline'
                                        ? 'bg-amber-50 border-amber-100 text-amber-700'
                                        : 'bg-gray-50 border-gray-100 text-gray-400'
                                }`}
                        >
                            <div className="relative">
                                {status === 'checking' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : status === 'online' ? (
                                    <>
                                        <Zap size={14} className="fill-emerald-500" />
                                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    </>
                                ) : (
                                    <ZapOff size={14} />
                                )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">
                                {status === 'online' ? 'IA Active (CUDA)' : status === 'offline' ? 'IA Offline' : 'Checking IA'}
                            </span>
                        </div>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-64 p-3 font-sans">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-xs uppercase tracking-tight">Estado de Red Neuronal</p>
                            <Badge variant={status === 'online' ? 'success' : 'destructive'} className="text-[9px]">
                                {status.toUpperCase()}
                            </Badge>
                        </div>
                        {status === 'online' ? (
                            <>
                                <p className="text-xs text-slate-500">Motor local Ollama detectado con aceleración GPU habilitada.</p>
                                <div className="pt-1">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Modelos Disponibles:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {models.length > 0 ? models.slice(0, 3).map(m => (
                                            <span key={m} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-mono">
                                                {m}
                                            </span>
                                        )) : <span className="text-[9px] italic text-slate-400">Cargando modelos...</span>}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-slate-500">El asistente inteligente requiere que Ollama esté ejecutándose localmente. Ejecuta 'ollama serve' para activar.</p>
                        )}
                        <div className="pt-1 border-t border-slate-100">
                            <p className="text-[9px] text-slate-400 italic">Click para re-diagnosticar</p>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
