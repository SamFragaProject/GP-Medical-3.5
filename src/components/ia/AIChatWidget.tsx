import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, MessageSquare, X, Send, User, Loader2, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { aiService, ChatMessage } from '@/services/aiService';

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: 'Hola, soy el asistente predictivo GPMedical. ¿Qué información clínica necesitas analizar?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await aiService.sendMessageToChat([...messages, userMsg]);
            const aiMsg: ChatMessage = { role: 'assistant', content: responseText };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Atención: No he podido enlazar con el motor neural. Verifique su conexión.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        className="relative"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            className="h-16 w-16 rounded-2xl shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white p-0 flex items-center justify-center border border-white/20"
                        >
                            <Sparkles className="h-7 w-7 animate-pulse text-white" />
                        </Button>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 100 }}
                        className="origin-bottom-right"
                    >
                        <Card className="w-[400px] h-[550px] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-none overflow-hidden rounded-[2rem] bg-white/95 backdrop-blur-md">
                            <CardHeader className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-5 flex flex-row items-center justify-between shrink-0 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                        <Bot className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold tracking-tight">MOTOR NEURAL IA</CardTitle>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></div>
                                            <span className="text-[10px] text-blue-100 font-bold uppercase tracking-widest">En Línea // v3.5-Turbo</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-white/20 h-8 w-8 rounded-lg relative z-10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/50">
                                <div className="h-full p-5 overflow-y-auto space-y-4 custom-scrollbar">
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={idx}
                                            className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                                        >
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm
                                                ${msg.role === 'user' ? 'bg-white border-emerald-100' : 'bg-gradient-to-br from-emerald-600 to-teal-700 border-none'}`}>
                                                {msg.role === 'user' ? <User className="h-4 w-4 text-emerald-600" /> : <Activity className="h-4 w-4 text-white" />}
                                            </div>
                                            <div
                                                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                                                    ${msg.role === 'user'
                                                        ? 'bg-emerald-600 text-white rounded-tr-none'
                                                        : 'bg-white text-slate-700 border border-slate-200/60 rounded-tl-none font-medium'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 self-start max-w-[85%]">
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shrink-0">
                                                <Bot className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200/60 shadow-sm flex items-center gap-2">
                                                <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando...</span>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </CardContent>

                            <CardFooter className="p-4 bg-white border-t border-slate-100 shrink-0">
                                <form
                                    className="flex w-full gap-2"
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                >
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Consultar motor de inteligencia..."
                                        className="rounded-xl flex-1 bg-slate-50 border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 h-11 text-sm font-medium"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || !input.trim()}
                                        className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-lg shadow-emerald-500/20"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                                <div className="mt-3 flex items-center justify-center gap-2 opacity-30">
                                    <ShieldCheck className="h-3 w-3" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Analizador Encriptado</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
