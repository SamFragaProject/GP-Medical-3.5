/**
 * 🚀 APP V2 - Versión mejorada con React Query y módulos V2
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importar App original
import AppOriginal from './App';

// Importar Chatbot V2
import { ChatbotWidget } from '../src-v2/modules/chatbot-v2/components/ChatbotWidget';

// Importar AuthProvider
import { AuthProvider } from '../src-v2/modules/auth-v2/components/AuthProvider';

// Importar utilidad de logs y routers V2
import {
  logActiveVersions,
  //  Pacientes as PacientesRouter,
  Agenda as AgendaRouter,
  Inventario as InventarioRouter,
} from '../src-v2/version-router';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Log versiones activas en desarrollo
if (import.meta.env.DEV) {
  logActiveVersions();
}

function AppV2() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppOriginal />
        <ChatbotWidget />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AppV2;

