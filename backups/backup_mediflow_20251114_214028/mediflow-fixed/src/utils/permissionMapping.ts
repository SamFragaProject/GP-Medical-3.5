// Mapeo de permisos del sistema complejo a permisos simples del sistema demo
export const PERMISSION_MAPPING: { [key: string]: string } = {
  // Pacientes
  'manage_patients': 'patients_manage',
  'view_medical_history': 'medical_view',
  
  // Exámenes
  'manage_exams': 'exams_manage',
  'view_exams': 'reports_view',
  
  // Facturación
  'manage_billing': 'billing_manage',
  'view_billing': 'billing_view',
  
  // Reportes
  'view_reports': 'reports_view',
  
  // Sistema
  'system_admin': 'enterprise_config',
  
  // Agenda
  'manage_agenda': 'agenda_manage',
  'view_agenda': 'scheduling_view',
  
  // Inventario
  'manage_inventory': 'inventory_manage',
  'view_inventory': 'inventory_view',
  
  // Users
  'users': 'enterprise_config'
}

// Convierte permisos complejos a permisos simples
export function mapComplexPermissionToSimple(complexPermission: string): string {
  return PERMISSION_MAPPING[complexPermission] || complexPermission
}