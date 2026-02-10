import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Bot, X, Send, User, Sparkles,
    Brain, Zap, FileSearch, Stethoscope,
    ClipboardList, TrendingUp, Minimize2, Maximize2,
    ShieldCheck, Cpu, Wifi, WifiOff, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalChatbot } from '@/hooks/useLocalChatbot';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ElementType;
    prompt: string;
    color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'risk',
        label: 'Analizar Riesgo',
        icon: TrendingUp,
        prompt: 'Analiza los factores de riesgo ocupacional más comunes en una población de trabajadores industriales y dame una evaluación con recomendaciones preventivas basadas en NOM-030.',
        color: 'from-red-500 to-rose-600'
    },
    {
        id: 'protocol',
        label: 'Generar Protocolo',
        icon: ClipboardList,
        prompt: 'Genera un protocolo de estudios médicos ocupacionales para un puesto de trabajo en área de producción industrial con exposición a ruido, material particulado y manejo manual de cargas.',
        color: 'from-blue-500 to-indigo-600'
    },
    {
        id: 'diagnosis',
        label: 'Asistir Diagnóstico',
        icon: Stethoscope,
        prompt: 'Un trabajador de 42 años presenta dolor lumbar recurrente de 3 meses de evolución, con parestesias en miembro inferior derecho y limitación funcional. Trabaja en área de carga. ¿Cuál es el abordaje diagnóstico y la posible relación con el puesto?',
        color: 'from-emerald-500 to-teal-600'
    },
    {
        id: 'norm',
        label: 'Consultar NOM',
        icon: FileSearch,
        prompt: '¿Cuáles son los requisitos principales de la NOM-035-STPS-2018 para empresas con más de 50 trabajadores? ¿Qué documentación debo tener lista para una inspección de la STPS?',
        color: 'from-amber-500 to-orange-600'
    }
];

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [showQuickActions, setShowQuickActions] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isLoading,
        isOllamaAvailable,
        lastModel,
        sendMessage,
        clearMessages,
        checkAvailability
    } = useLocalChatbot({
        context: 'Eres GPMedical EX, el cerebro de IA de un ERP de medicina ocupacional. Respondes en español. Eres experto en salud laboral mexicana, NOMs de la STPS, ergonomía, audiología ocupacional, y epidemiología laboral.',
        onError: (err) => console.error('Ollama error:', err)
    });

    // Check Ollama availability on open
    useEffect(() => {
        if (isOpen) {
            checkAvailability();
        }
    }, [isOpen, checkAvailability]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (overrideMessage?: string) => {
        const message = overrideMessage || input;
        if (!message.trim() || isLoading) return;
        setInput('');
        setShowQuickActions(false);
        await sendMessage(message);
    };

    const handleQuickAction = (action: QuickAction) => {
        handleSend(action.prompt);
    };

    const formatMessage = (content: string) => {
        // Basic markdown formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    const getStatusLabel = () => {
        if (isOllamaAvailable === null) return { text: 'Verificando...', color: 'text-yellow-400', icon: Cpu };
        if (isOllamaAvailable) return { text: `Ollama GPU • ${lastModel || 'llama3.2'}`, color: 'text-emerald-400', icon: Wifi };
        return { text: 'Modo Offline', color: 'text-slate-400', icon: WifiOff };
    };

    const status = getStatusLabel();
    const StatusIcon = status.icon;

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className="relative group"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            className="h-16 w-16 rounded-2xl shadow-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white p-0 flex items-center justify-center border border-white/20 transition-all duration-300"
                        >
                            <Brain className="h-7 w-7 text-white" />
                        </Button>
                        <div className="absolute inset-0 rounded-2xl bg-violet-500/30 animate-ping opacity-30 pointer-events-none" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                            <Zap className="w-2.5 h-2.5 text-white" />
                        </div>
                        <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                            GPMedical EX — Motor Neural IA
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="origin-bottom-right"
                    >
                        <Card className={`${isExpanded ? 'w-[600px] h-[700px]' : 'w-[420px] h-[580px]'} flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.2)] border-none overflow-hidden rounded-[2rem] bg-white/98 backdrop-blur-xl transition-all duration-300`}>
                            {/* Header */}
                            <CardHeader className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white p-5 flex flex-row items-center justify-between shrink-0 relative overflow-hidden">
                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse" />
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                                </div>

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                                            <Brain className="h-5 w-5" />
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-purple-600 ${isOllamaAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-black tracking-tight">GPMedical EX</CardTitle>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <StatusIcon className={`h-2.5 w-2.5 ${status.color}`} />
                                            <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 relative z-10">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearMessages}
                                        className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8 rounded-lg"
                                        title="Limpiar conversación"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 rounded-lg"
                                    >
                                        {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                        className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 rounded-lg"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            {/* Messages */}
                            <CardContent className="flex-1 p-0 overflow-hidden bg-gradient-to-b from-slate-50/80 to-white">
                                <div className="h-full p-5 overflow-y-auto space-y-4 custom-scrollbar">
                                    {/* Welcome message if no messages */}
                                    {messages.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-3 self-start max-w-[88%]"
                                        >
                                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-sm">
                                                <Brain className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm bg-white text-slate-700 border border-slate-200/60 rounded-tl-sm font-medium">
                                                ¡Hola! Soy <strong>GPMedical EX</strong>, tu cerebro de IA para medicina ocupacional.
                                                {isOllamaAvailable
                                                    ? ' Estoy conectado a tu GPU local para respuestas rápidas y privadas. 🚀'
                                                    : ' Activa Ollama con `ollama serve` para respuestas con GPU local.'}
                                            </div>
                                        </motion.div>
                                    )}

                                    {messages.map((msg) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 5 }}
                                            animate={{ opacity: 1, x: 0, y: 0 }}
                                            key={msg.id}
                                            className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                                        >
                                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                                                ${msg.role === 'user'
                                                    ? 'bg-white border border-violet-100'
                                                    : 'bg-gradient-to-br from-violet-600 to-indigo-700 border-none'}`}
                                            >
                                                {msg.role === 'user'
                                                    ? <User className="h-4 w-4 text-violet-600" />
                                                    : <Brain className="h-4 w-4 text-white" />}
                                            </div>
                                            <div>
                                                <div
                                                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                                                        ${msg.role === 'user'
                                                            ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-tr-sm'
                                                            : 'bg-white text-slate-700 border border-slate-200/60 rounded-tl-sm font-medium'
                                                        }`}
                                                >
                                                    {msg.isLoading ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex gap-1">
                                                                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procesando...</span>
                                                        </div>
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                                                    )}
                                                </div>
                                                {/* Duration badge */}
                                                {msg.role === 'assistant' && msg.duration_ms && !msg.isLoading && (
                                                    <div className="flex items-center gap-1 mt-1 ml-1">
                                                        <Cpu className="w-2.5 h-2.5 text-slate-300" />
                                                        <span className="text-[9px] text-slate-400 font-medium">
                                                            {(msg.duration_ms / 1000).toFixed(1)}s
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Quick Actions */}
                                    {showQuickActions && !isLoading && messages.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="pt-2"
                                        >
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                                                Acciones Rápidas
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {QUICK_ACTIONS.map(action => {
                                                    const ActionIcon = action.icon;
                                                    return (
                                                        <motion.button
                                                            key={action.id}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleQuickAction(action)}
                                                            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-all text-left group"
                                                        >
                                                            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} shadow-sm`}>
                                                                <ActionIcon className="w-3.5 h-3.5 text-white" />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{action.label}</span>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={scrollRef} />
                                </div>
                            </CardContent>

                            {/* Footer */}
                            <CardFooter className="p-4 bg-white border-t border-slate-100/80 shrink-0">
                                <form
                                    className="flex w-full gap-2"
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                >
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={isOllamaAvailable ? "Consultar motor neural local..." : "Escribe tu consulta médica..."}
                                        className="rounded-xl flex-1 bg-slate-50 border-slate-200 focus:ring-violet-500/20 focus:border-violet-500 h-11 text-sm font-medium"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || !input.trim()}
                                        className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 shadow-lg shadow-violet-500/20"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                                <div className="mt-3 flex items-center justify-center gap-2 opacity-30 w-full">
                                    <ShieldCheck className="h-3 w-3" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                                        {isOllamaAvailable ? 'GPU LOCAL • DATOS PRIVADOS • HIPAA' : 'PROCESAMIENTO SEGURO'}
                                    </span>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
