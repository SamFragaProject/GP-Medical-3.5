# 🧪 Flow Tester - GPMedical ERP

## Objetivo

Verificar que todos los flujos críticos del sistema funcionen correctamente end-to-end.

## Flujos Críticos a Probar

### 1. Flujo de Autenticación
**Rutas:** `/login` → `/dashboard`

**Pasos:**
1. [ ] Ir a página de login
2. [ ] Ingresar credenciales válidas
3. [ ] Verificar redirección al dashboard
4. [ ] Verificar que el token se guarde
5. [ ] Verificar que el rol se cargue correctamente
6. [ ] Probar logout

**Roles a probar:**
- [ ] Super Admin
- [ ] Admin
- [ ] Médico
- [ ] Recepción

### 2. Flujo de Pacientes
**Rutas:** `/pacientes` → `/historial/:id`

**Pasos:**
1. [ ] Ir a lista de pacientes
2. [ ] Crear nuevo paciente
3. [ ] Verificar que aparezca en la lista
4. [ ] Abrir expediente del paciente
5. [ ] Verificar que se cargue el historial
6. [ ] Editar información del paciente
7. [ ] Verificar cambios guardados

### 3. Flujo de Agenda
**Rutas:** `/agenda` → `/agenda/nueva`

**Pasos:**
1. [ ] Ir al calendario
2. [ ] Cambiar entre vistas (día/semana/mes)
3. [ ] Crear nueva cita
4. [ ] Seleccionar paciente
5. [ ] Seleccionar fecha y hora
6. [ ] Guardar cita
7. [ ] Verificar que aparezca en el calendario
8. [ ] Editar cita existente
9. [ ] Cancelar cita

### 4. Flujo de Exámenes Médicos
**Rutas:** `/examenes` → `/historial/:id`

**Pasos:**
1. [ ] Ir a exámenes ocupacionales
2. [ ] Seleccionar paciente
3. [ ] Crear nuevo examen (ST-7 o ST-9)
4. [ ] Llenar formulario de evaluación
5. [ ] Guardar examen
6. [ ] Verificar que aparezca en historial
7. [ ] Generar certificado de aptitud
8. [ ] Descargar/imprimir documento

### 5. Flujo de Facturación
**Rutas:** `/facturacion`

**Pasos:**
1. [ ] Ir a dashboard de facturación
2. [ ] Verificar estadísticas carguen
3. [ ] Crear nueva factura
4. [ ] Seleccionar cliente fiscal
5. [ ] Agregar conceptos
6. [ ] Calcular totales (subtotal, impuestos, total)
7. [ ] Guardar factura
8. [ ] Verificar lista de facturas
9. [ ] Marcar factura como pagada

### 6. Flujo de Inventario
**Rutas:** `/inventario`

**Pasos:**
1. [ ] Ver lista de productos
2. [ ] Crear nuevo producto
3. [ ] Establecer stock inicial
4. [ ] Registrar entrada de inventario
5. [ ] Registrar salida de inventario
6. [ ] Verificar que stock se actualice
7. [ ] Generar reporte de inventario

### 7. Flujo de Admin - Empresas
**Rutas:** `/admin/empresas`

**Pasos:**
1. [ ] Ir a gestión de empresas (Super Admin)
2. [ ] Crear nueva empresa
3. [ ] Verificar que aparezca en la lista
4. [ ] Editar empresa
5. [ ] Suspender/activar empresa
6. [ ] Verificar que los usuarios de esa empresa se vean afectados

### 8. Flujo de Admin - Usuarios
**Rutas:** `/admin/usuarios` o `/usuarios`

**Pasos:**
1. [ ] Ver lista de usuarios
2. [ ] Crear nuevo usuario
3. [ ] Asignar rol específico
4. [ ] Verificar que pueda hacer login
5. [ ] Verificar que sus permisos funcionen
6. [ ] Editar usuario
7. [ ] Desactivar usuario

### 9. Flujo de Admin - Roles
**Rutas:** `/admin/roles` o `/roles`

**Pasos:**
1. [ ] Ver roles existentes
2. [ ] Crear rol personalizado
3. [ ] Asignar permisos específicos
4. [ ] Asignar rol a usuario
5. [ ] Verificar que los permisos se apliquen

### 10. Flujo Completo Integrado
**Pasos:**
1. [ ] Crear paciente
2. [ ] Agendar cita para el paciente
3. [ ] Realizar examen médico
4. [ ] Generar factura por el examen
5. [ ] Marcar factura como pagada
6. [ ] Verificar todo en reportes

## Permisos por Rol a Verificar

### Super Admin
- [ ] Acceso a todas las empresas
- [ ] Crear/editar empresas
- [ ] Crear/editar usuarios de cualquier empresa
- [ ] Configuración del sistema

### Admin (de empresa)
- [ ] Solo ve su empresa
- [ ] Crear usuarios de su empresa
- [ ] Configurar sedes
- [ ] Ver reportes de su empresa

### Médico
- [ ] Ver pacientes asignados
- [ ] Crear/editar exámenes
- [ ] Ver historiales
- [ ] No puede ver facturación

### Recepción
- [ ] Ver agenda
- [ ] Crear/editar citas
- [ ] Ver pacientes
- [ ] No puede ver exámenes médicos detallados

### Contador
- [ ] Ver facturación
- [ ] Crear facturas
- [ ] Ver reportes financieros
- [ ] No puede ver historiales médicos

## Verificaciones Técnicas

### Console Errors
- [ ] No hay errores 404 en recursos
- [ ] No hay errores de JavaScript
- [ ] No hay warnings de React

### Network Requests
- [ ] Todas las llamadas a Supabase funcionan
- [ ] Las queries devuelven datos correctos
- [ ] Los errores de red se manejan correctamente

### Estado Global
- [ ] AuthContext mantiene sesión
- [ ] Los datos se refrescan correctamente
- [ ] Los estados de carga funcionan

### UI/UX
- [ ] Loading states visibles
- [ ] Error messages claros
- [ ] Toast notifications funcionan
- [ ] Responsive en móvil/tablet/desktop

## Herramientas de Testing

### Manual Testing
Navegar por la aplicación y verificar cada flujo.

### React Developer Tools
Verificar:
- Component tree
- Props correctos
- Estado de componentes

### Network Tab (DevTools)
Verificar:
- Requests a Supabase
- Status codes
- Response times
- Errores

### Console
Verificar:
- Sin errores rojos
- Warnings mínimos
- Logs informativos

## Reporte de Testing

Para cada flujo reportar:
```markdown
### Flujo: [Nombre]
**Estado:** ✅ Funcionando / ❌ Con errores

**Errores encontrados:**
1. [Descripción del error]
   - Severidad: [Alta/Media/Baja]
   - Solución propuesta: [Descripción]

**Notas:**
- [Observaciones adicionales]
```

## Criterios de Aceptación

- [ ] Todos los flujos críticos funcionan
- [ ] Todos los roles pueden hacer sus tareas
- [ ] No hay console errors
- [ ] La navegación es fluida
- [ ] Los datos persisten correctamente
- [ ] El sistema está listo para usuarios reales
