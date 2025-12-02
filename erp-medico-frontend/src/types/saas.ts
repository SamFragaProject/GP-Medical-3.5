// Tipos para el sistema de jerarquías SaaS de MediFlow
export type UserHierarchy = 'super_admin' | 'admin_empresa' | 'medico_especialista' | 'medico_trabajo' | 'medico_industrial' | 'enfermera' | 'audiometrista' | 'psicologo_laboral' | 'tecnico_ergonomico' | 'recepcion' | 'paciente' | 'bot'
export type PermissionLevel = 'system' | 'enterprise' | 'department' | 'clinic' | 'user'
export type ResourceType = 'users' | 'patients' | 'appointments' | 'examinations' | 'reports' | 'billing' | 'inventory' | 'settings' | 'audits'

// Interfaces para jerarquías SaaS
export interface SaaSHierarchy {
  id: string
  parentId?: string
  children: string[]
  level: UserHierarchy
  enterpriseId: string
  departmentId?: string
  clinicId?: string
}

export interface SaaSEnterprise {
  id: string
  name: string
  legalName: string
  rfc: string
  domain: string
  subscription: SubscriptionPlan
  settings: EnterpriseSettings
  metadata: EnterpriseMetadata
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  type: 'basic' | 'professional' | 'enterprise' | 'custom'
  maxUsers: number
  maxPatients: number
  features: PlanFeature[]
  pricing: Pricing
  trialDays: number
  isActive: boolean
}

export interface PlanFeature {
  name: string
  enabled: boolean
  limits?: {
    quantity?: number
    frequency?: 'daily' | 'monthly' | 'unlimited'
  }
}

export interface Pricing {
  monthly: number
  annual: number
  currency: string
}

export interface EnterpriseSettings {
  allowUserRegistration: boolean
  maxDepartments: number
  maxClinicsPerDepartment: number
  customBranding: boolean
  apiAccess: boolean
  auditRetentionDays: number
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  complianceMode: boolean
}

export interface EnterpriseMetadata {
  industry: string
  employeeCount: number
  locations: number
  contactPerson: {
    name: string
    email: string
    phone: string
    position: string
  }
}

// Interfaces para permisos granulares
export interface GranularPermission {
  id: string
  resource: ResourceType
  action: PermissionAction
  level: PermissionLevel
  conditions?: PermissionCondition[]
  metadata?: Record<string, any>
}

export interface PermissionAction {
  read: boolean
  create: boolean
  update: boolean
  delete: boolean
  export: boolean
  import: boolean
  admin: boolean
}

export interface PermissionCondition {
  type: 'ownership' | 'department' | 'enterprise' | 'hierarchy' | 'custom'
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains'
  value: any
  field?: string
}

// Interfaces para roles SaaS
export interface SaaSRole {
  id: string
  name: string
  hierarchy: UserHierarchy
  enterpriseId?: string // null for system roles
  departmentId?: string
  description: string
  permissions: GranularPermission[]
  isSystemRole: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  usage: RoleUsage
}

export interface RoleUsage {
  userCount: number
  departmentCount: number
  clinicCount: number
}

// Interfaces para usuarios con jerarquía
export interface SaaSUser {
  id: string
  email: string
  name: string
  avatar?: string
  phone?: string
  hierarchy: UserHierarchy
  enterpriseId: string
  departmentId?: string
  clinicId?: string
  reportsTo?: string // User ID of supervisor
  permissions: GranularPermission[]
  preferences: UserPreferences
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  lastLogin?: Date
  loginCount: number
  createdAt: Date
  updatedAt: Date
  metadata: Record<string, any>
  password?: string // Solo para autenticación, no debe persistirse
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: NotificationPreferences
  dashboard: DashboardPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  appointmentReminders: boolean
  systemAlerts: boolean
  auditNotifications: boolean
}

export interface DashboardPreferences {
  widgets: DashboardWidget[]
  layout: 'grid' | 'list'
  refreshInterval: number
}

export interface DashboardWidget {
  id: string
  type: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  config: Record<string, any>
}

// Interfaces para auditoría SaaS
export interface SaaSAuditLog {
  id: string
  userId: string
  enterpriseId: string
  action: string
  resource: ResourceType
  resourceId?: string
  details: AuditDetails
  ipAddress: string
  userAgent: string
  sessionId: string
  hierarchy: UserHierarchy
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditDetails {
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  metadata?: Record<string, any>
  error?: string
  success: boolean
}

// Interfaces para departamentos y clínicas
export interface Department {
  id: string
  name: string
  enterpriseId: string
  manager: string
  description?: string
  settings: DepartmentSettings
  clinics: string[] // Clinic IDs
  users: string[] // User IDs
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DepartmentSettings {
  workingHours: WorkingHours[]
  specialties: string[]
  protocols: string[]
  complianceRequirements: string[]
}

export interface WorkingHours {
  dayOfWeek: number // 0-6, 0 = Sunday
  startTime: string // HH:mm
  endTime: string // HH:mm
  isWorking: boolean
}

export interface Address {
  street: string
  number: string
  colony: string
  city: string
  state: string
  country: string
  postalCode: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface Clinic {
  id: string
  name: string
  departmentId: string
  enterpriseId: string
  address: Address
  contact: ClinicContact
  settings: ClinicSettings
  capacity: {
    maxPatientsPerDay: number
    maxExaminationsPerDay: number
    workingHours: WorkingHours[]
  }
  staff: string[] // User IDs
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ClinicContact {
  phone: string
  email: string
  emergencyPhone?: string
}

export interface ClinicSettings {
  allowOnlineBooking: boolean
  requireApproval: boolean
  maxAdvanceBooking: number // days
  cancellationPolicy: string
  protocols: string[]
}

// Interfaces para el contexto de autenticación SaaS
export interface SaaSAuthContext {
  user: SaaSUser | null
  enterprise: SaaSEnterprise | null
  hierarchy: SaaSHierarchy | null
  loading: boolean
  permissions: GranularPermission[]
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  hasPermission: (resource: ResourceType, action: keyof PermissionAction, conditions?: PermissionCondition[]) => boolean
  hasRole: (hierarchy: UserHierarchy) => boolean
  canAccess: (resourceId: string, resourceType: ResourceType) => boolean
  getEnterpriseUsers: () => Promise<SaaSUser[]>
  createUser: (userData: Partial<SaaSUser>) => Promise<SaaSUser>
  updateUser: (userId: string, updates: Partial<SaaSUser>) => Promise<SaaSUser>
  deleteUser: (userId: string) => Promise<void>
}

// Interfaces para el middleware de permisos
export interface PermissionMiddleware {
  checkPermission: (user: SaaSUser, resource: ResourceType, action: keyof PermissionAction, context?: any) => boolean
  checkHierarchy: (user: SaaSUser, targetUser: SaaSUser) => boolean
  checkEnterprise: (user: SaaSUser, enterpriseId: string) => boolean
  checkDepartment: (user: SaaSUser, departmentId: string) => boolean
  checkClinic: (user: SaaSUser, clinicId: string) => boolean
  canManageUser: (manager: SaaSUser, employee: SaaSUser) => boolean
  canAccessResource: (user: SaaSUser, resourceType: ResourceType, resourceId?: string) => boolean
}

// Tipos para filtros y búsquedas
export interface UserFilter {
  hierarchy?: UserHierarchy[]
  enterpriseId?: string
  departmentId?: string
  clinicId?: string
  status?: ('active' | 'inactive' | 'suspended' | 'pending')[]
  search?: string
}

export interface PermissionFilter {
  resource?: ResourceType[]
  level?: PermissionLevel[]
  action?: string[]
}

// Utilidades
export const HIERARCHY_LEVELS: Record<UserHierarchy, number> = {
  super_admin: 5,
  admin_empresa: 4,
  medico_especialista: 3,
  medico_trabajo: 3,
  enfermera: 2,
  audiometrista: 2,
  psicologo_laboral: 2,
  tecnico_ergonomico: 2,
  recepcion: 1,
  paciente: 0,
  medico_industrial: 3,
  bot: 0
}

export const RESOURCE_PERMISSIONS: Record<ResourceType, PermissionAction> = {
  users: { read: true, create: true, update: true, delete: true, export: true, import: true, admin: true },
  patients: { read: true, create: true, update: true, delete: true, export: true, import: false, admin: false },
  appointments: { read: true, create: true, update: true, delete: true, export: true, import: false, admin: false },
  examinations: { read: true, create: true, update: true, delete: false, export: true, import: false, admin: false },
  reports: { read: true, create: true, update: false, delete: false, export: true, import: false, admin: false },
  billing: { read: true, create: true, update: true, delete: false, export: true, import: false, admin: false },
  inventory: { read: true, create: true, update: true, delete: true, export: true, import: false, admin: false },
  settings: { read: true, create: false, update: true, delete: false, export: false, import: false, admin: true },
  audits: { read: true, create: false, update: false, delete: false, export: true, import: false, admin: true }
}

// Constantes de la jerarquía
export const HIERARCHY_CONSTANTS = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_EMPRESA: 'admin_empresa',
  MEDICO_ESPECIALISTA: 'medico_especialista',
  MEDICO_TRABAJO: 'medico_trabajo',
  ENFERMERA: 'enfermera',
  AUDIOMETRISTA: 'audiometrista',
  PSICOLOGO_LABORAL: 'psicologo_laboral',
  TECNICO_ERGONOMICO: 'tecnico_ergonomico',
  RECEPCION: 'recepcion',
  PACIENTE: 'paciente',
  BOT: 'bot',
  MEDICO_INDUSTRIAL: 'medico_industrial'
} as const

// Interfaces para el sistema de menús personalizados
export interface NavigationItem {
  id: string
  name: string
  href: string
  icon: string // Nombre del ícono de Lucide React
  permission?: MenuPermission
  badge?: string
  children?: NavigationItem[]
  order?: number
  isActive?: boolean
  meta?: NavigationItemMeta
}

export interface MenuPermission {
  resource: ResourceType
  action: keyof PermissionAction
  level: PermissionLevel
  conditions?: PermissionCondition[]
}

export interface NavigationItemMeta {
  description?: string
  category?: string
  tags?: string[]
  external?: boolean
  target?: string
}

export interface MenuPermissionRecord {
  id: string
  user_id: string
  menu_item_id: string
  permission_type: 'full' | 'read' | 'none'
  granted_by: string
  granted_at: Date
  expires_at?: Date
  is_active: boolean
  conditions?: Record<string, any>
}

export interface MenuItemConfiguration {
  id: string
  name: string
  href: string
  icon: string
  category: string
  description?: string
  required_permission: MenuPermission
  sort_order: number
  is_visible: boolean
  is_active: boolean
  parent_id?: string
  metadata?: Record<string, any>
  created_at: Date
  updated_at: Date
}

// Tipos para la gestión de estado del frontend
export interface PermissionCacheState {
  permissions: string[]
  timestamp: number
  enterpriseId: string
  sedeId?: string
  hierarchy: UserHierarchy
  version: string
}

export interface UserSessionState {
  sessionId: string
  userId: string
  enterpriseId: string
  sedeId?: string
  loginTime: Date
  lastActivity: Date
  ipAddress?: string
  userAgent: string
  isActive: boolean
  permissions: string[]
}

export interface NavigationState {
  currentPath: string
  breadcrumbs: Array<{
    label: string
    href?: string
    isActive: boolean
  }>
  allowedRoutes: string[]
  deniedRoutes: Array<{
    path: string
    reason: string
  }>
}

export interface AccessControlConfig {
  sessionTimeout: number // minutos
  cacheDuration: number // minutos
  maxLoginAttempts: number
  enableAuditLogging: boolean
  enableRealTimeSync: boolean
  defaultRedirectPath: string
}

// Interfaces para integración completa del sistema
export interface SystemIntegrationState {
  permissions: PermissionCacheState
  session: UserSessionState
  navigation: NavigationState
  config: AccessControlConfig
  lastSync: Date
}

export interface AuditLogEntry {
  id: string
  userId: string
  enterpriseId: string
  sedeId?: string
  action: 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHECK' | 'UNAUTHORIZED_ACCESS_ATTEMPT' | 'ROUTE_ACCESS' | 'RESOURCE_ACCESS'
  resourceType?: string
  resourceId?: string
  actionType?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent: string
  timestamp: Date
  success: boolean
  errorMessage?: string
}