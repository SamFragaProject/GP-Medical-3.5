/**
 * 🚀 GPMEDICAL V2 - EXPORTACIONES PRINCIPALES
 */

// Config
export { 
  FEATURE_FLAGS, 
  isEnabled, 
  areAllEnabled,
  isAnyEnabled,
  getFeatureFlagsStatus,
  areCriticalModulesReady,
  getActiveModules,
  getPendingModules,
  type FeatureFlag,
} from './config/feature-flags';

export { ENV, validateEnv, isDevelopment, isProduction, isTest } from './config/env';

// Auth V2
export { AuthProvider, useAuthContext, withAuth } from './modules/auth-v2';
export { useAuth } from './modules/auth-v2/hooks/useAuth';
export { authService } from './modules/auth-v2/services/authService';
export type {
  User, UserRole, Permission, AuthError, LoginCredentials,
} from './modules/auth-v2/types/auth.types';

// Pacientes V2
export { Pacientes, usePacientes, usePaciente, pacienteService } from './modules/pacientes-v2';
export type {
  Paciente, CreatePacienteInput, UpdatePacienteInput, PacienteStats,
} from './modules/pacientes-v2/types/paciente.types';

// Agenda V2
export { Agenda, useAgenda, agendaService } from './modules/agenda-v2';
export type {
  Cita, TipoCita, EstadoCita, CreateCitaInput, AgendaStats,
} from './modules/agenda-v2/types/agenda.types';

// Inventario V2
export { Inventario, useInventario, inventarioService } from './modules/inventario-v2';
export type {
  Producto, CreateProductoInput, UpdateStockInput, InventarioStats,
} from './modules/inventario-v2/types/inventario.types';

// Facturación V2
export { facturacionService } from './modules/facturacion-v2';
export type {
  Factura, ClienteFiscal, CreateFacturaInput, FacturaStats,
} from './modules/facturacion-v2/types/facturacion.types';

// Chatbot V2
export { ChatbotWidget, useChatbot, chatbotService } from './modules/chatbot-v2';
export type {
  Mensaje, Conversacion, ChatbotResponse,
} from './modules/chatbot-v2/services/chatbotService';

// Reportes V2
export { reportesService } from './modules/reportes-v2';
export type {
  Reporte, ResultadoReporte, DashboardStats, GraficaData,
} from './modules/reportes-v2/types/reportes.types';

// UI V2
export { ButtonV2, DeleteButton, SaveButton } from './shared/components/ui/ButtonV2';
export { 
  DialogV2, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent,
} from './shared/components/ui/DialogV2';

// Shared Hooks
export { useDebounce } from './shared/hooks/useDebounce';

// Version Router
export {
  AuthProvider as AuthProviderRouter,
  useAuth as useAuthRouter,
  Pacientes as PacientesRouter,
  Agenda as AgendaRouter,
  Inventario as InventarioRouter,
  Chatbot as ChatbotRouter,
  Button,
  logActiveVersions,
} from './version-router';
