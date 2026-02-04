/**
 * Chatbot V2 - Widget Simplificado para Pruebas
 * Funciona de forma independiente sin dependencias complejas
 */
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import './ChatbotWidget.css';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: '¡Hola! Soy el asistente virtual V2 de GPMedical. ¿En qué puedo ayudarte?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simular respuesta del asistente
    setTimeout(() => {
      const responses = [
        'Entiendo. ¿Necesitas ayuda con algo específico del sistema?',
        'Puedo ayudarte con información sobre pacientes, citas o reportes.',
        '¿Te gustaría que busque información en la base de datos?',
        'Estoy aquí para asistirte con cualquier consulta médica o administrativa.',
        '¿Necesitas generar algún reporte o consultar historiales?',
      ];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        content: '¡Hola! Soy el asistente virtual V2 de GPMedical. ¿En qué puedo ayudarte?',
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="chatbot-v2-widget">
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'chatbot-v2-toggle',
          isOpen && 'chatbot-v2-toggle--active'
        )}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            <span className="chatbot-v2-badge">V2</span>
          </div>
        )}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="chatbot-v2-window">
          {/* Header */}
          <div className="chatbot-v2-header">
            <div className="flex items-center gap-3">
              <div className="chatbot-v2-avatar">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="chatbot-v2-title">Asistente V2</h3>
                <p className="chatbot-v2-subtitle">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Nueva versión
                </p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="chatbot-v2-clear"
              title="Limpiar conversación"
            >
              Limpiar
            </button>
          </div>

          {/* Mensajes */}
          <div className="chatbot-v2-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'chatbot-v2-message',
                  message.role === 'user' 
                    ? 'chatbot-v2-message--user' 
                    : 'chatbot-v2-message--assistant'
                )}
              >
                <div className="chatbot-v2-message-avatar">
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className="chatbot-v2-message-content">
                  <p>{message.content}</p>
                  <span className="chatbot-v2-message-time">
                    {message.timestamp.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chatbot-v2-message chatbot-v2-message--assistant">
                <div className="chatbot-v2-message-avatar">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="chatbot-v2-message-content">
                  <div className="chatbot-v2-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-v2-input-area">
            <div className="chatbot-v2-input-container">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="chatbot-v2-input"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  'chatbot-v2-send',
                  input.trim() && !isLoading && 'chatbot-v2-send--active'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="chatbot-v2-footer">
              GPMedical V2 • Modo prueba
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
