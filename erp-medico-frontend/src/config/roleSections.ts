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

// Mantener compatibilidad con código existente
export const ROLE_SECTIONS: Record<UserRole, Section[]> = {
  super_admin: getNavigationForRole('super_admin'),
  admin_empresa: getNavigationForRole('admin_empresa'),
  medico: getNavigationForRole('medico'),
  paciente: getNavigationForRole('paciente')
}

export function getSectionsForRole(role: UserRole) {
  return getNavigationForRole(role)
}
