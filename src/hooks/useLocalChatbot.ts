import { useState, useCallback, useRef } from 'react';
import ollamaService from '../services/ollamaService';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
    duration_ms?: number;
}

interface UseLocalChatbotOptions {
    onError?: (error: string) => void;
    context?: string;
    model?: string;
}

export function useLocalChatbot(options: UseLocalChatbotOptions = {}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOllamaAvailable, setIsOllamaAvailable] = useState<boolean | null>(null);
    const [lastModel, setLastModel] = useState<string | null>(null);
    const messagesRef = useRef<Message[]>([]);

    // Verificar disponibilidad de Ollama
    const checkAvailability = useCallback(async () => {
        const available = await ollamaService.isOllamaAvailable();
        setIsOllamaAvailable(available);
        return available;
    }, []);

    // Enviar mensaje
    const sendMessage = useCallback(async (userMessage: string) => {
        if (!userMessage.trim() || isLoading) return;

        // Agregar mensaje del usuario
        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };

        // Placeholder para respuesta
        const assistantPlaceholder: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isLoading: true
        };

        setMessages(prev => {
            const newMessages = [...prev, userMsg, assistantPlaceholder];
            messagesRef.current = newMessages;
            return newMessages;
        });
        setIsLoading(true);

        try {
            // Preparar historial para contexto
            const history = messagesRef.current
                .filter(m => !m.isLoading)
                .slice(-10) // Últimos 10 mensajes
                .map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                }));

            // Agregar nuevo mensaje del usuario al historial
            history.push({ role: 'user', content: userMessage });

            // Chat con historial
            const response = await ollamaService.chatWithHistory(history, {
                context: options.context,
                model: options.model
            });

            // Actualizar respuesta
            setMessages(prev => {
                const updated = prev.map(m => {
                    if (m.id === assistantPlaceholder.id) {
                        return {
                            ...m,
                            content: response.success
                                ? response.response!
                                : `Error: ${response.error}`,
                            isLoading: false,
                            duration_ms: response.duration_ms
                        };
                    }
                    return m;
                });
                messagesRef.current = updated;
                return updated;
            });

            if (response.model_used) {
                setLastModel(response.model_used);
            }

            if (!response.success && options.onError) {
                options.onError(response.error || 'Error desconocido');
            }

        } catch (error) {
            setMessages(prev => prev.map(m => {
                if (m.id === assistantPlaceholder.id) {
                    return {
                        ...m,
                        content: `Error: ${error instanceof Error ? error.message : 'Error de conexión'}`,
                        isLoading: false
                    };
                }
                return m;
            }));
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, options]);

    // Limpiar historial
    const clearMessages = useCallback(() => {
        setMessages([]);
        messagesRef.current = [];
    }, []);

    // Obtener modelos disponibles
    const getModels = useCallback(async () => {
        return await ollamaService.getInstalledModels();
    }, []);

    return {
        messages,
        isLoading,
        isOllamaAvailable,
        lastModel,
        sendMessage,
        clearMessages,
        checkAvailability,
        getModels
    };
}

export default useLocalChatbot;
