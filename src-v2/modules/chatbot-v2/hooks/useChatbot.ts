/**
 * 🪝 HOOK DE CHATBOT V2
 */

import { useState, useCallback, useRef } from 'react';
import { chatbotService, type ChatbotResponse } from '../services/chatbotService';
import { useAuthContext } from '../../auth-v2/components/AuthProvider';

export interface MensajeUI {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sugerencias?: string[];
  acciones?: any[];
}

export function useChatbot() {
  const { user } = useAuthContext();
  const empresaId = user?.empresaId;
  const [mensajes, setMensajes] = useState<MensajeUI[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! 👋 Soy MediBot, tu asistente virtual de MediFlow. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
      sugerencias: ['Ver pacientes', 'Crear cita', 'Ver inventario', 'Ayuda'],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversacionId, setConversacionId] = useState<string | undefined>();
  const [estaAbierto, setEstaAbierto] = useState(false);

  // Ref para scroll automático
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Enviar mensaje
   */
  const enviarMensaje = useCallback(
    async (contenido: string, contexto?: { paginaActual?: string }) => {
      if (!contenido.trim()) return;

      // Agregar mensaje del usuario
      const mensajeUsuario: MensajeUI = {
        id: Date.now().toString(),
        role: 'user',
        content: contenido,
        timestamp: new Date(),
      };

      setMensajes((prev) => [...prev, mensajeUsuario]);
      setIsLoading(true);

      try {
        // Obtener respuesta del chatbot
        const respuesta = await chatbotService.enviarMensaje(
          contenido,
          conversacionId,
          {
            ...contexto,
            usuarioRol: user?.rol,
            empresaId,
          }
        );

        // Guardar ID de conversación
        if (!conversacionId) {
          // La conversación se crea en el servicio
        }

        // Agregar respuesta del asistente
        const mensajeAsistente: MensajeUI = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: respuesta.mensaje,
          timestamp: new Date(),
          sugerencias: respuesta.sugerencias,
          acciones: respuesta.acciones,
        };

        setMensajes((prev) => [...prev, mensajeAsistente]);
      } catch (error) {
        // Mensaje de error
        const mensajeError: MensajeUI = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?',
          timestamp: new Date(),
        };

        setMensajes((prev) => [...prev, mensajeError]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversacionId, empresaId, user?.rol]
  );

  /**
   * Abrir/cerrar chatbot
   */
  const toggle = useCallback(() => {
    setEstaAbierto((prev) => !prev);
  }, []);

  const abrir = useCallback(() => {
    setEstaAbierto(true);
  }, []);

  const cerrar = useCallback(() => {
    setEstaAbierto(false);
  }, []);

  /**
   * Limpiar conversación
   */
  const limpiar = useCallback(() => {
    setMensajes([
      {
        id: 'welcome',
        role: 'assistant',
        content: '¡Hola! 👋 Soy MediBot, tu asistente virtual de MediFlow. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(),
        sugerencias: ['Ver pacientes', 'Crear cita', 'Ver inventario', 'Ayuda'],
      },
    ]);
    setConversacionId(undefined);
  }, []);

  return {
    mensajes,
    isLoading,
    estaAbierto,
    enviarMensaje,
    toggle,
    abrir,
    cerrar,
    limpiar,
    mensajesEndRef,
  };
}
