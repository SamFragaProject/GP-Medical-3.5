import React, { useState, useEffect } from 'react'
import {
    Database,
    Cpu,
    Wifi,
    RefreshCcw,
    Zap
} from 'lucide-react'
import { supabase, chatbot } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SystemHealthWidget() {
    const [health, setHealth] = useState({
        supabase: 'checking',
        ollama: 'checking',
        auth: 'checking',
        latency: 0
    })
    const [loading, setLoading] = useState(false)

    const checkHealth = async () => {
        setLoading(true)
        const start = Date.now()

        try {
            // 1. Supabase Check
            const { error: dbError } = await supabase.from('empresas').select('count', { count: 'exact', head: true })
            const supabaseStatus = dbError ? 'offline' : 'online'

            // 2. Ollama Check
            const ollamaState = await chatbot.verificarEstado()
            const ollamaStatus = ollamaState.disponible ? 'online' : 'offline'

            // 3. Auth Check
            const { data: { session } } = await supabase.auth.getSession()
            const authStatus = session ? 'authenticated' : 'no-session'

            setHealth({
                supabase: supabaseStatus,
                ollama: ollamaStatus,
                auth: authStatus,
                latency: Date.now() - start
            })
        } catch (e) {
            console.error('Health check failed', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkHealth()
    }, [])

    return (
        <Card className="border-0 shadow-2xl bg-slate-950 text-white rounded-3xl overflow-hidden border border-white/10 mb-8">
            <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 emerald-gradient rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                        Estado Vital del Sistema
                    </CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={checkHealth}
                    disabled={loading}
                    className="h-9 w-9 text-slate-500 hover:text-emerald-400 hover:bg-white/5 rounded-xl border border-white/5"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Supabase */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${health.supabase === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                <Database className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">Base de Datos</span>
                        </div>
                        {health.supabase === 'online' ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[10px]">OPERATIVO</Badge>
                        ) : (
                            <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black text-[10px]">ERROR</Badge>
                        )}
                    </div>

                    {/* Ollama */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${health.ollama === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                <Cpu className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">IA Local</span>
                        </div>
                        {health.ollama === 'online' ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[10px]">LISTO</Badge>
                        ) : (
                            <Badge className="bg-slate-800 text-slate-500 border border-slate-700 font-black text-[10px]">DORMIDO</Badge>
                        )}
                    </div>

                    {/* Network/Latency */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <Wifi className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">Latencia</span>
                                <p className="text-[10px] text-slate-500 font-black mt-0.5">{health.latency}ms RT</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                            <Zap size={12} className="text-blue-400 fill-blue-400" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">ESTABLE</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
