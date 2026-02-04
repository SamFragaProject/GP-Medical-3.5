// Tipos para el módulo de configuración del sistema
export interface Usuario {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  lastLogin?: Date
  isActive: boolean
  createdAt: Date
  avatar?: string
  phone?: string
  department?: string
  position?: string
}

export interface Rol {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystemRole: boolean
  createdAt: Date
  userCount: number
}

export interface Empresa {
  id: string
  name: string
  legalName: string
  rfc: string
  address: Address
  phone: string
  email: string
  website?: string
  logo?: string
  isActive: boolean
  createdAt: Date
}

export interface Sede {
  id: string
  name: string
  address: Address
  phone: string
  manager: string
  isMain: boolean
  isActive: boolean
  createdAt: Date
}

export interface Address {
  street: string
  number: string
  colony: string
  city: string
  state: string
  country: string
  zipCode: string
}

export interface ProtocoloMedico {
  id: string
  name: string
  type: string
  description: string
  tests: TestProtocolo[]
  price: number
  isActive: boolean
  createdAt: Date
}

export interface TestProtocolo {
  id: string
  name: string
  category: string
  isRequired: boolean
  description?: string
  normalRanges?: string
}

export interface ConfiguracionNotificaciones {
  email: EmailConfig
  sms: SmsConfig
  push: PushConfig
  alerts: AlertConfig
}

export interface EmailConfig {
  isEnabled: boolean
  smtpHost: string
  smtpPort: number
  username: string
  password: string
  fromEmail: string
  fromName: string
}

export interface SmsConfig {
  isEnabled: boolean
  provider: string
  apiKey: string
  fromNumber: string
}

export interface PushConfig {
  isEnabled: boolean
  vapidKey: string
}

export interface AlertConfig {
  newAppointment: boolean
  appointmentReminder: boolean
  testResults: boolean
  invoiceGenerated: boolean
  systemUpdates: boolean
}

export interface ConfiguracionBackup {
  autoBackup: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  retentionDays: number
  lastBackup?: Date
  nextBackup?: Date
  backupLocation: string
  isActive: boolean
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: Date
}

export interface ConfiguracionChatbotIA {
  isEnabled: boolean
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  language: string
  personality: string
}

export interface ConfiguracionFacturacion {
  pac: PacConfig
  impuestos: TaxConfig[]
  metodosPago: PaymentMethodConfig[]
  conceptosFacturacion: ConceptConfig[]
}

export interface PacConfig {
  isEnabled: boolean
  nombre: string
  usuario: string
  password: string
  testMode: boolean
}

export interface TaxConfig {
  id: string
  name: string
  type: 'IVA' | 'IEPS' | 'ISR'
  rate: number
  isActive: boolean
}

export interface PaymentMethodConfig {
  id: string
  name: string
  code: string
  isActive: boolean
}

export interface ConceptConfig {
  id: string
  name: string
  code: string
  description: string
  unitPrice: number
  isActive: boolean
}

export interface ConfiguracionReportes {
  templates: ReportTemplate[]
  defaultFormat: 'PDF' | 'Excel' | 'CSV'
  autoSchedule: boolean
  scheduleTime: string
  emailRecipients: string[]
}

export interface ReportTemplate {
  id: string
  name: string
  type: string
  fields: string[]
  format: string
  isActive: boolean
  createdAt: Date
}

export interface ConfiguracionSeguridad {
  passwordPolicy: PasswordPolicy
  sessionPolicy: SessionPolicy
  ipWhitelist: string[]
  twoFactorAuth: boolean
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAge: number
}

export interface SessionPolicy {
  timeoutMinutes: number
  maxConcurrentSessions: number
  allowRememberMe: boolean
}

export interface ConfiguracionCumplimiento {
  normatives: Normative[]
  auditFrequency: 'monthly' | 'quarterly' | 'yearly'
  responsiblePerson: string
  lastAudit?: Date
  nextAudit?: Date
}

export interface Normative {
  id: string
  name: string
  type: string
  description: string
  complianceRequired: boolean
  lastReview: Date
  nextReview: Date
}

export interface ConfiguracionIntegraciones {
  imss: ImssConfig
  issste: IsssteConfig
  laboratorios: LabConfig[]
  externalServices: ExternalServiceConfig[]
}

export interface ImssConfig {
  isEnabled: boolean
  apiKey: string
  endpoint: string
  testMode: boolean
}

export interface IsssteConfig {
  isEnabled: boolean
  apiKey: string
  endpoint: string
  testMode: boolean
}

export interface LabConfig {
  id: string
  name: string
  isEnabled: boolean
  apiKey: string
  endpoint: string
  testMode: boolean
}

export interface ExternalServiceConfig {
  id: string
  name: string
  isEnabled: boolean
  apiKey: string
  endpoint: string
  credentials: Record<string, string>
}

export interface ConfiguracionGeneral {
  language: string
  timezone: string
  currency: string
  dateFormat: string
  theme: string
  maintenanceMode: boolean
}

export interface SettingsState {
  usuario: Usuario[]
  roles: Rol[]
  empresa: Empresa
  sedes: Sede[]
  protocolos: ProtocoloMedico[]
  notificaciones: ConfiguracionNotificaciones
  backup: ConfiguracionBackup
  auditLogs: AuditLog[]
  chatbotIA: ConfiguracionChatbotIA
  facturacion: ConfiguracionFacturacion
  reportes: ConfiguracionReportes
  seguridad: ConfiguracionSeguridad
  cumplimiento: ConfiguracionCumplimiento
  integraciones: ConfiguracionIntegraciones
  general: ConfiguracionGeneral
}
