# Sistema de Jerarquías SaaS para MediFlow

## Resumen Ejecutivo

Se ha implementado un sistema completo de jerarquías SaaS para MediFlow que permite la gestión escalable de usuarios con diferentes niveles de permisos y responsabilidades. El sistema está diseñado para soportar múltiples empresas, departamentos y clínicas con un control granular de accesos.

## Arquitectura del Sistema

### Jerarquía de Usuarios

El sistema implementa una jerarquía de 5 niveles (0-5):

```
Nivel 5: Super Administrador
├── Nivel 4: Administrador de Empresa
    ├── Nivel 3: Médicos (Especialista, Trabajo)
        ├── Nivel 2: Personal Técnico (Enfermera, Audiometrista, Psicólogo, Ergonómico)
            ├── Nivel 1: Personal Administrativo (Recepcionista)
                └── Nivel 0: Pacientes
```

### Roles Definidos

1. **Super Administrador (Nivel 5)**
   - Acceso total al sistema
   - Gestión de todas las empresas
   - Configuración del sistema global
   - Auditoría completa

2. **Administrador de Empresa (Nivel 4)**
   - Gestión completa de su empresa
   - Administración de usuarios hasta nivel médico
   - Configuraciones empresariales
   - Reportes ejecutivos

3. **Médico Especialista (Nivel 3)**
   - Gestión de pacientes y expedientes
   - Realización de exámenes especializados
   - Supervisión de personal técnico
   - Acceso a todas las clínicas del departamento

4. **Médico del Trabajo (Nivel 3)**
   - Medicina ocupacional
   - Exámenes pre-ocupacionales y periódicos
   - Gestión de casos laborales
   - Supervisión de técnicos

5. **Personal Técnico (Nivel 2)**
   - **Enfermera**: Cuidados de enfermería, apoyo médico
   - **Audiometrista**: Pruebas audiométricas
   - **Psicólogo Laboral**: Evaluaciones psicológicas
   - **Técnico Ergonómico**: Evaluaciones ergonómicas

6. **Personal Administrativo (Nivel 1)**
   - **Recepcionista**: Gestión de citas, atención al paciente

7. **Paciente (Nivel 0)**
   - Acceso solo a sus propios datos
   - Portal del paciente
   - Gestión de citas propias

## Implementación Técnica

### Tipos TypeScript

El sistema está construido con tipos TypeScript robustos en `/src/types/saas.ts`:

- `SaaSUser`: Usuario con jerarquía y permisos
- `SaaSEnterprise`: Información empresarial
- `GranularPermission`: Permisos granulares por recurso
- `Department`: Departamentos organizacionales
- `Clinic`: Clínicas/sedes

### Middleware de Permisos

**Archivo**: `/src/lib/permissionMiddleware.ts`

Funcionalidades principales:
- Verificación de permisos granulares
- Control de jerarquía
- Permisos por empresa, departamento y clínica
- Condiciones avanzadas de permisos

### Contexto de Autenticación SaaS

**Archivo**: `/src/contexts/SaaSAuthContext.tsx`

Características:
- Gestión de sesiones SaaS
- Generación automática de permisos por jerarquía
- Control de acceso por empresa
- Hooks especializados para verificación de permisos

### Componentes de Gestión

1. **SaaSUserManagement** (`/src/components/configuracion/SaaSUserManagement.tsx`)
   - Gestión de usuarios con jerarquías
   - Interfaz visual por niveles
   - Control granular de permisos

2. **SaaSAdminPanel** (`/src/components/configuracion/SaaSAdminPanel.tsx`)
   - Dashboard ejecutivo
   - Métricas por jerarquía
   - Vista general del sistema

3. **PermissionGate** (`/src/components/auth/PermissionGate.tsx`)
   - Control de acceso en componentes
   - HOCs para protección de rutas
   - Validaciones contextuales

## Funcionalidades por Rol

### Super Administrador
- ✅ Gestión de todas las empresas
- ✅ Configuración global del sistema
- ✅ Acceso a auditoría completa
- ✅ Gestión de todos los usuarios
- ✅ Configuraciones de seguridad

### Administrador de Empresa
- ✅ Gestión de usuarios de su empresa
- ✅ Configuraciones empresariales
- ✅ Reportes ejecutivos
- ✅ Gestión de departamentos y clínicas
- ✅ Configuración de facturación

### Médicos
- ✅ Gestión de expedientes médicos
- ✅ Realización de exámenes
- ✅ Gestión de citas
- ✅ Supervisión de personal técnico
- ✅ Generación de reportes médicos

### Personal Técnico
- ✅ Registro de datos médicos básicos
- ✅ Realización de pruebas específicas
- ✅ Actualización de expedientes
- ✅ Gestión de citas de apoyo

### Personal Administrativo
- ✅ Gestión de citas
- ✅ Registro de pacientes
- ✅ Coordinación de servicios
- ✅ Información básica del sistema

### Pacientes
- ✅ Vista de sus propios expedientes
- ✅ Gestión de sus citas
- ✅ Información personal
- ✅ Portal de auto-servicio

## Base de Datos y Estructura

### Empresa
```typescript
interface SaaSEnterprise {
  id: string
  name: string
  subscription: SubscriptionPlan
  settings: EnterpriseSettings
  metadata: EnterpriseMetadata
}
```

### Usuario
```typescript
interface SaaSUser {
  id: string
  email: string
  hierarchy: UserHierarchy
  enterpriseId: string
  departmentId?: string
  clinicId?: string
  reportsTo?: string
  permissions: GranularPermission[]
  status: 'active' | 'inactive' | 'suspended' | 'pending'
}
```

### Departamento
```typescript
interface Department {
  id: string
  name: string
  enterpriseId: string
  manager: string
  clinics: string[]
  users: string[]
}
```

## Permisos Granulares

### Recursos Controlados
- `users`: Gestión de usuarios
- `patients`: Expedientes de pacientes
- `appointments`: Citas médicas
- `examinations`: Exámenes médicos
- `reports`: Reportes y documentos
- `billing`: Facturación
- `inventory`: Inventario
- `settings`: Configuraciones
- `audits`: Auditorías

### Acciones por Recurso
- `read`: Lectura
- `create`: Creación
- `update`: Actualización
- `delete`: Eliminación
- `export`: Exportación
- `import`: Importación
- `admin`: Administración

## Seguridad y Cumplimiento

### Control de Acceso
- Validación de jerarquía en cada operación
- Verificación de pertenencia a empresa
- Control de departamento y clínica
- Auditoría de todas las acciones

### Auditoría
- Log completo de acciones por usuario
- Trazabilidad de cambios
- Registro de accesos
- Alertas de seguridad

### Políticas de Seguridad
- Autenticación multifactor (preparado)
- Sesiones con timeout configurable
- Políticas de contraseñas
- Whitelist de IPs (preparado)

## Integración en la Aplicación

### Configuración Principal
- Nuevo panel "SaaS" en Configuración
- Gestión avanzada de usuarios
- Dashboard ejecutivo

### Control de Acceso en Componentes
```typescript
// Ejemplo de uso
<PermissionGate hierarchy="admin_empresa">
  <AdminPanel />
</PermissionGate>

// Verificación programática
const { canManageUser } = useSaaSPermissions()
if (canManageUser(targetUserId)) {
  // Permitir acción
}
```

### Hooks de Permisos
```typescript
const { 
  hasPermission, 
  hasRole, 
  getUserHierarchy,
  canManageUser 
} = useSaaSPermissions()
```

## Usuarios Demo Incluidos

### Credenciales de Prueba
1. **superadmin@demo.mx** / demo123 (Super Admin)
2. **admin.empresa@demo.mx** / demo123 (Admin Empresa)
3. **medico.especialista@demo.mx** / demo123 (Médico Especialista)
4. **medico.trabajo@demo.mx** / demo123 (Médico Trabajo)
5. **enfermera@demo.mx** / demo123 (Enfermera)
6. **audiometrista@demo.mx** / demo123 (Audiometrista)
7. **recepcion@demo.mx** / demo123 (Recepcionista)
8. **paciente@demo.mx** / demo123 (Paciente)

## Beneficios del Sistema

### Escalabilidad
- Soporte para múltiples empresas
- Estructura departamental flexible
- Clínicas múltiples por departamento
- Crecimiento ilimitado de usuarios

### Seguridad
- Control granular de permisos
- Auditoría completa
- Separación de datos por empresa
- Jerarquía de acceso

### Usabilidad
- Interfaz adaptativa por rol
- Permisos automáticos por jerarquía
- Gestión simplificada de usuarios
- Dashboard personalizado

### Cumplimiento
- Trazabilidad completa
- Políticas configurables
- Auditorías regulares
- Reportes de cumplimiento

## Próximos Pasos

### Mejoras Futuras
1. **Integración con API REST completa**
2. **Notificaciones en tiempo real**
3. **Reportes avanzados por jerarquía**
4. **Integración con sistemas externos (IMSS, ISSSTE)**
5. **Inteligencia artificial para asignación automática**
6. **Dashboard móvil optimizado**

### Expansiones Planificadas
- **Multi-tenant completo**
- **Integración con sistemas de RRHH**
- **Gestión de certificaciones médicas**
- **Sistema de facturación electrónica**
- **Teleconsulta integrada**

## Conclusión

El sistema de jerarquías SaaS de MediFlow proporciona una base sólida para el crecimiento escalable del sistema, manteniendo la seguridad y el cumplimiento normativo. La implementación modular permite futuras expansiones y adaptaciones según las necesidades del negocio.

---

**Desarrollado por**: MiniMax Agent  
**Versión**: 1.0.0  
**Fecha**: Noviembre 2024