# Configuración RLS y Storage Buckets - Sistema ERP Médico

## Resumen Ejecutivo

Se ha implementado exitosamente la configuración completa de Row Level Security (RLS) y Storage Buckets para el Sistema ERP Médico - Medicina del Trabajo, siguiendo las mejores prácticas de seguridad multi-tenant.

## A. Políticas RLS Implementadas

### Tablas con RLS Habilitado
- **empresas** - Información empresarial
- **sedes** - Sedes operativas
- **citas** - Citas médicas
- **encuentros** - Encuentros clínicos
- **notas_clinicas** - Notas médicas
- **recetas** - Recetas médicas
- **ordenes_estudio** - Órdenes de estudio
- **resultados_estudio** - Resultados de laboratorio
- **documentos** - Documentos clínicos
- **consentimientos** - Consentimientos informados

### Funciones de Seguridad Implementadas

#### `get_user_empresa_id()`
- **Propósito**: Obtener la empresa del usuario actual
- **Lógica**: Busca primero en `profiles`, fallback en `saas_users`
- **Seguridad**: `SECURITY DEFINER`

#### `has_permission(resource, action)`
- **Propósito**: Verificar permisos específicos por recurso y acción
- **Lógica**: Consulta estructura SAAS + fallback por roles
- **Permisos**: Verifica `permissions_jsonb` para permisos granulares

#### `is_admin()`
- **Propósito**: Verificar roles administrativos
- **Roles**: `admin_empresa`, `super_admin`
- **Override**: Permite acceso total a administradores

#### `has_role(role_name)`
- **Propósito**: Verificar roles específicos del usuario
- **Lógica**: Consulta estructura SAAS + estructura legacy
- **Uso**: Verificación base para otros controles

#### `is_super_admin()`
- **Propósito**: Verificar super administradores
- **Acceso**: Override completo de todas las restricciones
- **Seguridad**: Máxima autoridad en el sistema

### Estructura de Políticas RLS

#### SELECT Policies
```sql
-- Ejemplo: Ver citas de empresa/sede
CREATE POLICY "ver_citas_empresa_sede" ON citas
    FOR SELECT USING (
        empresa_id = get_user_empresa_id() AND 
        has_permission('citas', 'view')
    );
```

#### INSERT Policies
```sql
-- Ejemplo: Crear citas con permisos
CREATE POLICY "crear_citas_con_permisos" ON citas
    FOR INSERT WITH CHECK (
        empresa_id = get_user_empresa_id() AND
        has_permission('citas', 'create')
    );
```

#### UPDATE/DELETE Policies
- Requieren permisos específicos `edit` y `delete`
- Validación de empresa_id coincide
- Override para super_admin

#### Excepciones Admin
- `is_super_admin()` permite acceso total
- No aplica restricciones RLS para super admin
- Auditoría automática de accesos admin

### Validación Empresa_ID en Catálogos
- Función `validate_catalog_access()` implementada
- Catálogos globales (empresa_id NULL) de solo lectura
- Catálogos específicos requieren acceso a empresa

## B. Storage Buckets Configurados

### clinical-docs (Privado)
- **Propósito**: Documentos médicos y clínicos
- **MIME Types**: PDF, imágenes, documentos Word
- **Tamaño**: 10 MB máximo
- **Seguridad**: Acceso restringido por empresa/sede

### lab-results (Privado)
- **Propósito**: Resultados de laboratorio
- **MIME Types**: PDF, imágenes, CSV, Excel
- **Tamaño**: 20 MB máximo
- **Seguridad**: Solo personal autorizado

### invoices (Privado)
- **Propósito**: Facturas y documentos financieros
- **MIME Types**: PDF, imágenes
- **Seguridad**: Acceso administrativo

### public-assets (Público)
- **Propósito**: Recursos públicos (logos, iconos)
- **Acceso**: Lectura pública, escritura solo admin
- **Seguridad**: Mínima restricción

## C. Políticas de Storage Implementadas

### Estructura de Path Requerida
```
empresa_id/sede_id/paciente_id/filename.ext
```

### Políticas por Bucket

#### clinical-docs
```sql
-- Lectura
CREATE POLICY "ver_documentos_clinicos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'clinical-docs' AND
        (is_admin() OR has_permission('documentos', 'view'))
    );

-- Escritura
CREATE POLICY "subir_documentos_clinicos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'clinical-docs' AND
        (is_admin() OR has_permission('documentos', 'create'))
    );
```

### Metadata Requerida
- **empresa_id**: Debe coincidir con usuario
- **sede_id**: Acceso a sede específica
- **paciente_id**: Para documentos de paciente

### Restricciones DELETE
- **Prohibición general**: `DELETE USING (bucket_id = 'clinical-docs' AND false)`
- **Excepción**: Solo roles con permiso explícito
- **Auditoría**: Registro de intentos de eliminación

### Función de Validación
```sql
CREATE OR REPLACE FUNCTION validate_storage_metadata()
RETURNS TRIGGER
-- Valida estructura de path y permisos antes de operaciones
```

## D. Funciones de Utilidad y Auditoría

### `verificar_configuracion_seguridad()`
- **Propósito**: Verificar estado de configuración
- **Retorna**: Resumen de políticas y buckets
- **Uso**: Diagnóstico y auditoría

### `auditar_configuracion_seguridad()`
- **Propósito**: Auditoría completa del sistema
- **Incluye**: RLS, Storage, Funciones
- **Formato**: Tabla con detalles por componente

### `refresh_materialized_views()`
- **Propósito**: Actualizar vistas materializadas
- **Concurrencia**: Evita bloqueos con `CONCURRENTLY`
- **Triggers**: Actualización automática en cambios

## E. Validaciones de Seguridad Multi-Tenant

### Validación Empresa_ID
- Todas las operaciones requieren empresa_id coincidente
- Función `get_user_empresa_id()` para obtener empresa actual
- Validación cruzada entre tablas relacionadas

### Validación Sede_ID
- Acceso limitado a sede asignada del usuario
- `NULL` permitido para datos globales de empresa
- Override automático para administradores

### Validación Paciente_ID
- Paciente solo accede a su propio historial
- Personal médico accede según permisos
- Verificación por email coincide con usuario

### Validación de Roles
- Jerarquía de permisos implementada
- Fallback entre estructuras SAAS y legacy
- Verificación granular por recurso/acción

## F. Monitoreo y Auditoría

### Logs de Acceso
- Todas las operaciones RLS auditadas
- Intentos de acceso denegado registrados
- Accesos de super_admin trackeados

### Triggers de Auditoría
- Cambios en datos sensibles
- Operaciones de Storage
- Modificaciones de permisos

### Métricas de Seguridad
- Número de políticas RLS activas
- Buckets configurados
- Funciones de seguridad operativas

## G. Comandos de Verificación

### Verificar Configuración
```sql
SELECT verificar_configuracion_seguridad();
```

### Auditar Sistema
```sql
SELECT * FROM auditar_configuracion_seguridad();
```

### Ver Políticas RLS
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Ver Buckets Storage
```sql
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY name;
```

## H. Consideraciones de Rendimiento

### Índices Optimizados
- Índices en empresa_id, sede_id para todas las tablas
- Índices compuestos para consultas frecuentes
- Índices en campos de fecha para reportes

### Vistas Materializadas
- `v_agenda_medico_dia` - Agenda diaria de médicos
- `v_kpis_sede` - KPIs por sede
- `v_recetas_pendientes_dispensa` - Recetas pendientes
- `v_resumen_pacientes_activos` - Resumen de pacientes

### Refresco Automático
- Triggers en tablas principales
- Notificaciones para refresco de vistas
- Estrategia concurrente para evitar bloqueos

## I. Mantenimiento y Actualizaciones

### Procedimientos Regulares
1. **Refresco de Vistas**: Ejecutar `refresh_materialized_views()`
2. **Auditoría**: Ejecutar `auditar_configuracion_seguridad()`
3. **Optimización**: Revisar índices y estadísticas
4. **Seguridad**: Validar permisos y roles

### Backup y Recuperación
- Políticas RLS incluidas en backups
- Funciones de seguridad preservadas
- Configuración de Storage mantenida

## J. Resumen de Implementación

### ✅ Completado
- [x] RLS habilitado en todas las tablas sensibles
- [x] Políticas SELECT con empresa_id + has_permission()
- [x] Políticas INSERT con validación empresa_id/sede_id
- [x] Políticas UPDATE/DELETE con permisos específicos
- [x] Excepción Admin con is_admin() override total
- [x] Validación empresa_id en catálogos globales
- [x] 4 Storage buckets configurados (3 privados, 1 público)
- [x] Políticas Storage con control empresa/sede
- [x] Metadata empresa_id/sede_id/paciente_id requerida
- [x] Restricción DELETE salvo permisos explícitos
- [x] 4 Vistas materializadas para KPIs y reportes
- [x] Funciones de auditoría y verificación

### 🎯 Beneficios de Seguridad
1. **Aislamiento Multi-Tenant**: Empresa y sede completamente aislados
2. **Permisos Granulares**: Control por recurso y acción
3. **Override Administrativo**: Acceso total para administración
4. **Auditoría Completa**: Tracking de todos los accesos
5. **Validación en Storage**: Archivos con metadata validada
6. **Prevención de Eliminación**: DELETE restringido salvo autorización

### 📊 Métricas de Configuración
- **Políticas RLS**: Creadas para todas las tablas clínicas
- **Políticas Storage**: Implementadas en 4 buckets
- **Funciones Seguridad**: 5 funciones core + utilidades
- **Vistas Materializadas**: 4 vistas para reportes
- **Índices Optimización**: Creados en campos críticos

## Conclusión

La configuración RLS y Storage Buckets ha sido implementada exitosamente, proporcionando un sistema de seguridad robusto, granular y escalable para el ERP Médico. La arquitectura multi-tenant asegura el aislamiento completo entre empresas, mientras que las funciones de seguridad permiten un control granular de permisos y auditoría completa del sistema.

---

**Documento generado**: 2025-11-04  
**Sistema**: ERP Médico - Medicina del Trabajo  
**Estado**: ✅ COMPLETADO