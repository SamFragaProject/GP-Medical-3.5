/**
 * 🔄 V2 ROUTE WRAPPER
 * 
 * Este componente envuelve las páginas principales y decide
 * si usar la versión V1 o V2 según los feature flags.
 */

import React from 'react';
import {
  Pacientes as PacientesRouter,
  Agenda as AgendaRouter,
  Inventario as InventarioRouter,
} from '../../src-v2/version-router';

// Páginas V1 originales
import { Pacientes as PacientesV1 } from '@/pages/Pacientes';
import { Agenda as AgendaV1 } from '@/pages/Agenda';
import InventoryPage from '@/pages/inventory/InventoryPage';

// Componentes V2
import { ChatbotWidget } from '../../src-v2/modules/chatbot-v2/components/ChatbotWidget';

interface V2WrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper que agrega el Chatbot V2 a todas las páginas
 */
export function V2Wrapper({ children }: V2WrapperProps) {
  return (
    <>
      {children}
      <ChatbotWidget />
    </>
  );
}

/**
 * Página de Pacientes (V1 o V2 según flag)
 */
export function PacientesPage() {
  // Usar el router que decide V1 vs V2
  return <PacientesRouter />;
}

/**
 * Página de Agenda (V1 o V2 según flag)
 */
export function AgendaPage() {
  return <AgendaRouter />;
}

/**
 * Página de Inventario (V1 o V2 según flag)
 */
export function InventarioPage() {
  return <InventarioRouter />;
}
