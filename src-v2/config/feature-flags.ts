/**
 * 🎛️ SISTEMA DE FEATURE FLAGS - GPMedical V2
 * 
 * Control de activación de módulos mejorados.
 * Todos los flags inician en FALSE hasta que el módulo V2 esté listo.
 */

export const FEATURE_FLAGS = {
  // =====================================================
  // MÓDULOS PRINCIPALES V2
  // =====================================================
  
  /** Autenticación con refresh token y persistencia mejorada */
  useAuthV2: import.meta.env.VITE_USE_AUTH_V2 === 'true',
  
  /** Pacientes con conexión real a Supabase */
  usePacientesV2: import.meta.env.VITE_USE_PACIENTES_V2 === 'true',
  
  /** Agenda con notificaciones y validaciones */
  useAgendaV2: import.meta.env.VITE_USE_AGENDA_V2 === 'true',
  
  /** Inventario con alertas reales */
  useInventarioV2: import.meta.env.VITE_USE_INVENTARIO_V2 === 'true',
  
  /** Facturación con timbrado real */
  useFacturacionV2: import.meta.env.VITE_USE_FACTURACION_V2 === 'true',
  
  /** Chatbot con OpenAI real */
  useChatbotV2: import.meta.env.VITE_USE_CHATBOT_V2 === 'true',
  
  /** Reportes con datos reales */
  useReportesV2: import.meta.env.VITE_USE_REPORTES_V2 === 'true',

  // =====================================================
  // COMPONENTES UI V2
  // =====================================================
  
  /** Botones con loading states y confirmaciones */
  useButtonV2: import.meta.env.VITE_USE_BUTTON_V2 === 'true',
  
  /** Modales mejorados con animaciones */
  useModalV2: import.meta.env.VITE_USE_MODAL_V2 === 'true',
  
  /** Tablas con paginación y sorting */
  useTableV2: import.meta.env.VITE_USE_TABLE_V2 === 'true',
  
  /** Formularios con validación en tiempo real */
  useFormV2: import.meta.env.VITE_USE_FORM_V2 === 'true',

  // =====================================================
  // FEATURES ESPECÍFICAS
  // =====================================================
  
  /** Actualizaciones en tiempo real con Supabase Realtime */
  enableRealTime: import.meta.env.VITE_ENABLE_REALTIME === 'true',
  
  /** Sistema de notificaciones push/email */
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  
  /** Analytics y tracking de uso */
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  /** Modo debug para desarrollo */
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',

} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Verifica si un feature flag está activo
 */
export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag] ?? false;
}

/**
 * Verifica si todos los flags de un grupo están activos
 */
export function areAllEnabled(flags: FeatureFlag[]): boolean {
  return flags.every(flag => isEnabled(flag));
}

/**
 * Verifica si al menos un flag de un grupo está activo
 */
export function isAnyEnabled(flags: FeatureFlag[]): boolean {
  return flags.some(flag => isEnabled(flag));
}

/**
 * Obtiene el estado de todos los flags
 */
export function getFeatureFlagsStatus(): Record<FeatureFlag, boolean> {
  return { ...FEATURE_FLAGS };
}

/**
 * Lista de módulos críticos que deben estar listos para producción
 */
export const CRITICAL_MODULES: FeatureFlag[] = [
  'useAuthV2',
  'usePacientesV2',
];

/**
 * Verifica si todos los módulos críticos están activos
 */
export function areCriticalModulesReady(): boolean {
  return areAllEnabled(CRITICAL_MODULES);
}

/**
 * Obtiene lista de módulos activos
 */
export function getActiveModules(): FeatureFlag[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, value]) => value)
    .map(([key]) => key as FeatureFlag);
}

/**
 * Obtiene lista de módulos pendientes (desactivados)
 */
export function getPendingModules(): FeatureFlag[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, value]) => !value)
    .map(([key]) => key as FeatureFlag);
}
