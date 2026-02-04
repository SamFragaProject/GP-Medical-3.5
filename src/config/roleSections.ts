// Secciones por rol y metadatos de navegación reutilizables
// ACTUALIZADO: Ahora usa la configuración centralizada de roleConfig.ts
import { UserRole } from '@/types/auth'
import { getNavigationForRole } from './roleConfig'

export type Section = {
  title: string
  path: string
  resource: string
  icon: React.ElementType
  gradient?: string
  badge?: string | number
}

// Mantener compatibilidad con código existente - SaaS Multi-Tenant
export const ROLE_SECTIONS: Record<UserRole, Section[]> = {
  // Nivel Plataforma
  super_admin: getNavigationForRole('super_admin'),
  admin_saas: getNavigationForRole('admin_saas'),
  contador_saas: getNavigationForRole('contador_saas'),
  // Nivel Empresa
  admin_empresa: getNavigationForRole('admin_empresa'),
  medico: getNavigationForRole('medico'),
  enfermera: getNavigationForRole('enfermera'),
  recepcion: getNavigationForRole('recepcion'),
  asistente: getNavigationForRole('asistente'),
  paciente: getNavigationForRole('paciente')
}

export function getSectionsForRole(role: UserRole) {
  return getNavigationForRole(role)
}
