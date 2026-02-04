// Hook personalizado para manejo de configuración del sistema
import { useState, useEffect, useCallback } from 'react'
import { SettingsState, Usuario, Rol, Empresa, Sede, ProtocoloMedico, ConfiguracionNotificaciones, ConfiguracionBackup, AuditLog, ConfiguracionChatbotIA, ConfiguracionFacturacion, ConfiguracionReportes, ConfiguracionSeguridad, ConfiguracionCumplimiento, ConfiguracionIntegraciones, ConfiguracionGeneral } from '@/types/configuracion'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'GPMedical_settings'

// Datos iniciales de ejemplo
const initialSettings: SettingsState = {
  usuario: [
    {
      id: '1',
      name: 'Dr. Carlos Mendoza',
      email: 'carlos.mendoza@GPMedical.com',
      role: 'Administrador',
      permissions: ['read', 'write', 'admin', 'delete'],
      lastLogin: new Date(),
      isActive: true,
      createdAt: new Date('2024-01-15'),
      phone: '+52 55 1234 5678',
      department: 'Medicina del Trabajo',
      position: 'Director Médico'
    },
    {
      id: '2',
      name: 'Dra. María González',
      email: 'maria.gonzalez@GPMedical.com',
      role: 'Médico',
      permissions: ['read', 'write'],
      lastLogin: new Date(Date.now() - 86400000),
      isActive: true,
      createdAt: new Date('2024-02-01'),
      phone: '+52 55 2345 6789',
      department: 'Medicina del Trabajo',
      position: 'Médico Especialista'
    },
    {
      id: '3',
      name: 'Ing. Roberto Silva',
      email: 'roberto.silva@GPMedical.com',
      role: 'Técnico',
      permissions: ['read'],
      lastLogin: new Date(Date.now() - 172800000),
      isActive: true,
      createdAt: new Date('2024-02-15'),
      phone: '+52 55 3456 7890',
      department: 'Evaluación Ergonómica',
      position: 'Técnico Ergonómico'
    }
  ],
  roles: [
    {
      id: '1',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      permissions: ['read', 'write', 'delete', 'admin', 'export', 'import'],
      isSystemRole: true,
      createdAt: new Date('2024-01-01'),
      userCount: 1
    },
    {
      id: '2',
      name: 'Médico',
      description: 'Acceso a módulos médicos',
      permissions: ['read', 'write', 'export'],
      isSystemRole: true,
      createdAt: new Date('2024-01-01'),
      userCount: 1
    },
    {
      id: '3',
      name: 'Técnico',
      description: 'Acceso limitado de lectura',
      permissions: ['read'],
      isSystemRole: true,
      createdAt: new Date('2024-01-01'),
      userCount: 1
    }
  ],
  empresa: {
    id: '1',
    name: 'GPMedical',
    legalName: 'GPMedical Sistemas Médicos S.A. de C.V.',
    rfc: 'MSM123456ABC',
    address: {
      street: 'Av. Insurgentes Sur',
      number: '1234',
      colony: 'Del Valle',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      zipCode: '03100'
    },
    phone: '+52 55 1234 5678',
    email: 'contacto@GPMedical.com',
    website: 'https://www.GPMedical.com',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  sedes: [
    {
      id: '1',
      name: 'Sede Principal',
      address: {
        street: 'Av. Insurgentes Sur',
        number: '1234',
        colony: 'Del Valle',
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'México',
        zipCode: '03100'
      },
      phone: '+52 55 1234 5678',
      manager: 'Dr. Carlos Mendoza',
      isMain: true,
      isActive: true,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Sucursal Norte',
      address: {
        street: 'Av. Universidad',
        number: '567',
        colony: 'Norte',
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'México',
        zipCode: '02800'
      },
      phone: '+52 55 5678 9012',
      manager: 'Dra. María González',
      isMain: false,
      isActive: true,
      createdAt: new Date('2024-02-01')
    }
  ],
  protocolos: [
    {
      id: '1',
      name: 'Examen Médico General',
      type: 'Medicina General',
      description: 'Evaluación médica completa para ingreso laboral',
      tests: [
        { id: '1', name: 'Presión arterial', category: 'Vitales', isRequired: true, normalRanges: '120/80 mmHg' },
        { id: '2', name: 'Peso y altura', category: 'Antropométrica', isRequired: true, normalRanges: 'IMC 18.5-24.9' },
        { id: '3', name: 'Vista', category: 'Oftalmológica', isRequired: true, normalRanges: '20/20' }
      ],
      price: 800,
      isActive: true,
      createdAt: new Date('2024-01-01')
    }
  ],
  notificaciones: {
    email: {
      isEnabled: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      username: 'noreply@GPMedical.com',
      password: '••••••••',
      fromEmail: 'noreply@GPMedical.com',
      fromName: 'GPMedical'
    },
    sms: {
      isEnabled: true,
      provider: 'Twilio',
      apiKey: '••••••••••••••',
      fromNumber: '+52 55 1234 5678'
    },
    push: {
      isEnabled: true,
      vapidKey: '••••••••••••••••••••••••••••••••••••••••'
    },
    alerts: {
      newAppointment: true,
      appointmentReminder: true,
      testResults: true,
      invoiceGenerated: true,
      systemUpdates: false
    }
  },
  backup: {
    autoBackup: true,
    frequency: 'daily',
    retentionDays: 30,
    lastBackup: new Date(Date.now() - 86400000),
    nextBackup: new Date(Date.now() + 86400000),
    backupLocation: '/backups/GPMedical',
    isActive: true
  },
  auditLogs: [],
  chatbotIA: {
    isEnabled: true,
    apiKey: '••••••••••••••••••••••••••••••••••••••••',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'Eres un asistente médico especializado en medicina del trabajo.',
    language: 'es',
    personality: 'Profesional y empático'
  },
  facturacion: {
    pac: {
      isEnabled: true,
      nombre: 'PAC Principal',
      usuario: 'pac01',
      password: '••••••••',
      testMode: false
    },
    impuestos: [
      { id: '1', name: 'IVA 16%', type: 'IVA', rate: 16, isActive: true },
      { id: '2', name: 'IVA 0%', type: 'IVA', rate: 0, isActive: true }
    ],
    metodosPago: [
      { id: '1', name: 'Efectivo', code: '01', isActive: true },
      { id: '2', name: 'Tarjeta de Crédito', code: '03', isActive: true },
      { id: '3', name: 'Transferencia', code: '02', isActive: true }
    ],
    conceptosFacturacion: [
      { id: '1', name: 'Consulta Médica', code: '62111200', description: 'Servicios de consulta médica general', unitPrice: 800, isActive: true },
      { id: '2', name: 'Examen Toxicológico', code: '85121800', description: 'Análisis toxicológico ocupacional', unitPrice: 1200, isActive: true }
    ]
  },
  reportes: {
    templates: [
      { id: '1', name: 'Reporte Mensual', type: 'Mensual', fields: ['fecha', 'pacientes', 'examenes', 'ingresos'], format: 'PDF', isActive: true, createdAt: new Date('2024-01-01') }
    ],
    defaultFormat: 'PDF',
    autoSchedule: false,
    scheduleTime: '08:00',
    emailRecipients: ['admin@GPMedical.com']
  },
  seguridad: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90
    },
    sessionPolicy: {
      timeoutMinutes: 60,
      maxConcurrentSessions: 3,
      allowRememberMe: true
    },
    ipWhitelist: [],
    twoFactorAuth: false
  },
  cumplimiento: {
    normatives: [
      { id: '1', name: 'NOM-006-STPS-2014', type: 'Federal', description: 'Manejo y almacenamiento de materiales peligrosos', complianceRequired: true, lastReview: new Date('2024-01-01'), nextReview: new Date('2024-12-31') }
    ],
    auditFrequency: 'quarterly',
    responsiblePerson: 'Dr. Carlos Mendoza',
    lastAudit: new Date('2024-01-15'),
    nextAudit: new Date('2024-04-15')
  },
  integraciones: {
    imss: {
      isEnabled: true,
      apiKey: '••••••••••••••••••••••••••••••••••••••••',
      endpoint: 'https://api.imss.gob.mx',
      testMode: false
    },
    issste: {
      isEnabled: false,
      apiKey: '',
      endpoint: 'https://api.issste.gob.mx',
      testMode: true
    },
    laboratorios: [
      { id: '1', name: 'Lab Clínico ABC', isEnabled: true, apiKey: '••••••••••••••••••', endpoint: 'https://lababc.com/api', testMode: false }
    ],
    externalServices: []
  },
  general: {
    language: 'es',
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    maintenanceMode: false
  }
}

export function useConfiguracion() {
  const [settings, setSettings] = useState<SettingsState>(initialSettings)
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date>(new Date())

  // Cargar configuración desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsedSettings = JSON.parse(saved)
        // Convertir strings de fecha a Date objects
        setSettings({
          ...parsedSettings,
          auditLogs: parsedSettings.auditLogs?.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp)
          })) || [],
          empresa: {
            ...parsedSettings.empresa,
            createdAt: new Date(parsedSettings.empresa.createdAt)
          },
          sedes: parsedSettings.sedes?.map((sede: any) => ({
            ...sede,
            createdAt: new Date(sede.createdAt)
          })) || [],
          protocolos: parsedSettings.protocolos?.map((protocolo: any) => ({
            ...protocolo,
            createdAt: new Date(protocolo.createdAt)
          })) || [],
          backup: {
            ...parsedSettings.backup,
            lastBackup: parsedSettings.backup.lastBackup ? new Date(parsedSettings.backup.lastBackup) : undefined,
            nextBackup: parsedSettings.backup.nextBackup ? new Date(parsedSettings.backup.nextBackup) : undefined
          },
          roles: parsedSettings.roles?.map((rol: any) => ({
            ...rol,
            createdAt: new Date(rol.createdAt)
          })) || [],
          usuario: parsedSettings.usuario?.map((usuario: any) => ({
            ...usuario,
            lastLogin: usuario.lastLogin ? new Date(usuario.lastLogin) : undefined,
            createdAt: new Date(usuario.createdAt)
          })) || [],
          reportes: {
            ...parsedSettings.reportes,
            templates: parsedSettings.reportes.templates?.map((template: any) => ({
              ...template,
              createdAt: new Date(template.createdAt)
            })) || []
          },
          cumplimiento: {
            ...parsedSettings.cumplimiento,
            normatives: parsedSettings.cumplimiento.normatives?.map((norm: any) => ({
              ...norm,
              lastReview: new Date(norm.lastReview),
              nextReview: new Date(norm.nextReview)
            })) || [],
            lastAudit: parsedSettings.cumplimiento.lastAudit ? new Date(parsedSettings.cumplimiento.lastAudit) : undefined,
            nextAudit: parsedSettings.cumplimiento.nextAudit ? new Date(parsedSettings.cumplimiento.nextAudit) : undefined
          }
        })
        setLastSync(new Date())
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Error al cargar la configuración')
    }
  }, [])

  // Guardar configuración en localStorage
  const saveSettings = useCallback((newSettings: Partial<SettingsState>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings))
      setSettings(updatedSettings)
      setLastSync(new Date())
      return true
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar la configuración')
      return false
    }
  }, [settings])

  // CRUD Usuarios
  const createUsuario = useCallback((usuario: Omit<Usuario, 'id' | 'createdAt'>) => {
    const newUsuario = {
      ...usuario,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    const updatedUsers = [...settings.usuario, newUsuario]
    saveSettings({ usuario: updatedUsers })
    addAuditLog('CREATE', 'Usuario', newUsuario.id, newUsuario)
    toast.success('Usuario creado exitosamente')
    return newUsuario
  }, [settings.usuario, saveSettings])

  const updateUsuario = useCallback((id: string, updates: Partial<Usuario>) => {
    const updatedUsers = settings.usuario.map(user => 
      user.id === id ? { ...user, ...updates } : user
    )
    saveSettings({ usuario: updatedUsers })
    addAuditLog('UPDATE', 'Usuario', id, updates)
    toast.success('Usuario actualizado exitosamente')
  }, [settings.usuario, saveSettings])

  const deleteUsuario = useCallback((id: string) => {
    const updatedUsers = settings.usuario.filter(user => user.id !== id)
    saveSettings({ usuario: updatedUsers })
    addAuditLog('DELETE', 'Usuario', id, { id })
    toast.success('Usuario eliminado exitosamente')
  }, [settings.usuario, saveSettings])

  // CRUD Roles
  const createRol = useCallback((rol: Omit<Rol, 'id' | 'createdAt'>) => {
    const newRol = {
      ...rol,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    const updatedRoles = [...settings.roles, newRol]
    saveSettings({ roles: updatedRoles })
    addAuditLog('CREATE', 'Rol', newRol.id, newRol)
    toast.success('Rol creado exitosamente')
    return newRol
  }, [settings.roles, saveSettings])

  const updateRol = useCallback((id: string, updates: Partial<Rol>) => {
    const updatedRoles = settings.roles.map(rol => 
      rol.id === id ? { ...rol, ...updates } : rol
    )
    saveSettings({ roles: updatedRoles })
    addAuditLog('UPDATE', 'Rol', id, updates)
    toast.success('Rol actualizado exitosamente')
  }, [settings.roles, saveSettings])

  const deleteRol = useCallback((id: string) => {
    const updatedRoles = settings.roles.filter(rol => rol.id !== id)
    saveSettings({ roles: updatedRoles })
    addAuditLog('DELETE', 'Rol', id, { id })
    toast.success('Rol eliminado exitosamente')
  }, [settings.roles, saveSettings])

  // Configuraciones específicas
  const updateEmpresa = useCallback((updates: Partial<Empresa>) => {
    const updatedEmpresa = { ...settings.empresa, ...updates }
    saveSettings({ empresa: updatedEmpresa })
    addAuditLog('UPDATE', 'Empresa', updatedEmpresa.id, updates)
    toast.success('Información de empresa actualizada')
  }, [settings.empresa, saveSettings])

  const updateGeneral = useCallback((updates: Partial<ConfiguracionGeneral>) => {
    const updatedGeneral = { ...settings.general, ...updates }
    saveSettings({ general: updatedGeneral })
    addAuditLog('UPDATE', 'Configuración General', 'general', updates)
    toast.success('Configuración general actualizada')
  }, [settings.general, saveSettings])

  const updateNotificaciones = useCallback((updates: Partial<ConfiguracionNotificaciones>) => {
    const updatedNotificaciones = { ...settings.notificaciones, ...updates }
    saveSettings({ notificaciones: updatedNotificaciones })
    addAuditLog('UPDATE', 'Configuración Notificaciones', 'notificaciones', updates)
    toast.success('Configuración de notificaciones actualizada')
  }, [settings.notificaciones, saveSettings])

  const updateBackup = useCallback((updates: Partial<ConfiguracionBackup>) => {
    const updatedBackup = { ...settings.backup, ...updates }
    saveSettings({ backup: updatedBackup })
    addAuditLog('UPDATE', 'Configuración Backup', 'backup', updates)
    toast.success('Configuración de backup actualizada')
  }, [settings.backup, saveSettings])

  const updateChatbotIA = useCallback((updates: Partial<ConfiguracionChatbotIA>) => {
    const updatedChatbot = { ...settings.chatbotIA, ...updates }
    saveSettings({ chatbotIA: updatedChatbot })
    addAuditLog('UPDATE', 'Configuración Chatbot IA', 'chatbotIA', updates)
    toast.success('Configuración de IA actualizada')
  }, [settings.chatbotIA, saveSettings])

  // Audit Log
  const addAuditLog = useCallback((action: string, resource: string, resourceId: string, details: Record<string, any>) => {
    const auditLog: AuditLog = {
      id: Date.now().toString(),
      userId: 'current-user', // Esto vendría del contexto de autenticación
      userName: 'Usuario Actual',
      action,
      resource,
      details,
      ipAddress: '192.168.1.1', // Esto vendría del navegador
      userAgent: navigator.userAgent,
      timestamp: new Date()
    }
    const updatedAuditLogs = [auditLog, ...settings.auditLogs].slice(0, 1000) // Mantener solo los últimos 1000
    saveSettings({ auditLogs: updatedAuditLogs })
  }, [settings.auditLogs, saveSettings])

  // Backup manual
  const performBackup = useCallback(() => {
    try {
      const backupData = {
        settings,
        timestamp: new Date(),
        version: '1.0'
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `GPMedical-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      const nextBackup = new Date()
      nextBackup.setDate(nextBackup.getDate() + (settings.backup.frequency === 'daily' ? 1 : settings.backup.frequency === 'weekly' ? 7 : 30))
      
      updateBackup({ 
        lastBackup: new Date(), 
        nextBackup 
      })
      
      addAuditLog('BACKUP', 'Sistema', 'all', { timestamp: new Date() })
      toast.success('Backup realizado exitosamente')
    } catch (error) {
      console.error('Error performing backup:', error)
      toast.error('Error al realizar el backup')
    }
  }, [settings, updateBackup, addAuditLog])

  // Importar configuración
  const importSettings = useCallback((importData: any) => {
    try {
      setSettings(importData)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importData))
      addAuditLog('IMPORT', 'Configuración', 'all', { timestamp: new Date() })
      toast.success('Configuración importada exitosamente')
      return true
    } catch (error) {
      console.error('Error importing settings:', error)
      toast.error('Error al importar la configuración')
      return false
    }
  }, [addAuditLog])

  // Exportar configuración
  const exportSettings = useCallback(() => {
    try {
      const exportData = {
        ...settings,
        auditLogs: settings.auditLogs.slice(0, 100), // Limitar audit logs en exportación
        exportDate: new Date(),
        version: '1.0'
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `GPMedical-config-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      addAuditLog('EXPORT', 'Configuración', 'all', { timestamp: new Date() })
      toast.success('Configuración exportada exitosamente')
    } catch (error) {
      console.error('Error exporting settings:', error)
      toast.error('Error al exportar la configuración')
    }
  }, [settings, addAuditLog])

  // Restablecer a valores por defecto
  const resetToDefaults = useCallback(() => {
    try {
      setSettings(initialSettings)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSettings))
      addAuditLog('RESET', 'Configuración', 'all', { timestamp: new Date() })
      toast.success('Configuración restablecida a valores por defecto')
    } catch (error) {
      console.error('Error resetting settings:', error)
      toast.error('Error al restablecer la configuración')
    }
  }, [addAuditLog])

  return {
    settings,
    loading,
    lastSync,
    // Usuarios
    createUsuario,
    updateUsuario,
    deleteUsuario,
    // Roles
    createRol,
    updateRol,
    deleteRol,
    // Configuraciones
    updateEmpresa,
    updateGeneral,
    updateNotificaciones,
    updateBackup,
    updateChatbotIA,
    // Utilidades
    performBackup,
    importSettings,
    exportSettings,
    resetToDefaults,
    addAuditLog
  }
}
