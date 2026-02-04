/**
 * 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO
 * 
 * Validación y tipado de variables de entorno
 */

export const ENV = {
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  
  // App
  APP_NAME: import.meta.env.VITE_APP_NAME || 'MediFlow',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '3.5.2',
  NODE_ENV: import.meta.env.MODE as 'development' | 'production' | 'test',
  
  // Features
  DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
} as const;

/**
 * Valida que todas las variables requeridas estén presentes
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];
  
  const missing = required.filter(
    key => !import.meta.env[key]
  );
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Verifica si estamos en desarrollo
 */
export const isDevelopment = ENV.NODE_ENV === 'development';

/**
 * Verifica si estamos en producción
 */
export const isProduction = ENV.NODE_ENV === 'production';

/**
 * Verifica si estamos en test
 */
export const isTest = ENV.NODE_ENV === 'test';
