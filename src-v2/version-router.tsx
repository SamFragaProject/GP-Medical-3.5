/**
 * 🔄 VERSION ROUTER - Selector de versiones V1 vs V2
 */

import { FEATURE_FLAGS } from './config/feature-flags';

// =====================================================
// IMPORTS V1 (ORIGINALES - NO TOCAR)
// =====================================================

import { AuthProvider as AuthProviderV1, useAuth as useAuthV1 } from '@/contexts/AuthContext';
import { Pacientes as PacientesV1 } from '@/pages/Pacientes';
import { Agenda as AgendaV1 } from '@/pages/Agenda';
import InventarioV1 from '@/pages/Inventario';
import { Button as ButtonV1 } from '@/components/ui/button';

// =====================================================
// IMPORTS V2 (MEJORADOS)
// =====================================================

import { AuthProvider as AuthProviderV2 } from './modules/auth-v2/components/AuthProvider';
import { useAuth as useAuthV2 } from './modules/auth-v2/hooks/useAuth';
import { Pacientes as PacientesV2 } from './modules/pacientes-v2/components/Pacientes';
import { Agenda as AgendaV2 } from './modules/agenda-v2/components/Agenda';
import { Inventario as InventarioV2 } from './modules/inventario-v2/components/Inventario';
import { ButtonV2 } from './shared/components/ui/ButtonV2';
import { ChatbotWidget } from './modules/chatbot-v2/components/ChatbotWidget';

// =====================================================
// SELECTORES DE VERSIÓN
// =====================================================

export const AuthProvider = FEATURE_FLAGS.useAuthV2
  ? AuthProviderV2
  : AuthProviderV1;

export const useAuth = FEATURE_FLAGS.useAuthV2
  ? useAuthV2
  : useAuthV1;

export const Pacientes = FEATURE_FLAGS.usePacientesV2
  ? PacientesV2
  : PacientesV1;

export const Agenda = FEATURE_FLAGS.useAgendaV2
  ? AgendaV2
  : AgendaV1;

export const Inventario = FEATURE_FLAGS.useInventarioV2
  ? InventarioV2
  : InventarioV1;

export const Button = FEATURE_FLAGS.useButtonV2
  ? ButtonV2
  : ButtonV1;

export const Chatbot = FEATURE_FLAGS.useChatbotV2
  ? ChatbotWidget
  : () => null; // No hay chatbot V1

// =====================================================
// DEBUG
// =====================================================

export function logActiveVersions(): void {
  if (import.meta.env.MODE !== 'development') return;

  console.group('🎛️ Version Router - Módulos Activos');
  console.log('Auth:', FEATURE_FLAGS.useAuthV2 ? 'V2 ✅' : 'V1');
  console.log('Pacientes:', FEATURE_FLAGS.usePacientesV2 ? 'V2 ✅' : 'V1');
  console.log('Agenda:', FEATURE_FLAGS.useAgendaV2 ? 'V2 ✅' : 'V1');
  console.log('Inventario:', FEATURE_FLAGS.useInventarioV2 ? 'V2 ✅' : 'V1');
  console.log('Facturacion:', FEATURE_FLAGS.useFacturacionV2 ? 'V2 ✅' : 'V1');
  console.log('Chatbot:', FEATURE_FLAGS.useChatbotV2 ? 'V2 ✅' : 'V1');
  console.log('Reportes:', FEATURE_FLAGS.useReportesV2 ? 'V2 ✅' : 'V1');
  console.log('Button:', FEATURE_FLAGS.useButtonV2 ? 'V2 ✅' : 'V1');
  console.groupEnd();
}

if (import.meta.env.MODE === 'development') {
  setTimeout(logActiveVersions, 1000);
}
