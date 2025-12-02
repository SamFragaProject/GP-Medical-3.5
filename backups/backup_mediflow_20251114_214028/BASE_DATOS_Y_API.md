# 🗄️ BASE DE DATOS Y APIs - MediFlow

**Fecha:** 11 de Noviembre de 2025  
**Versión:** 3.5.1  
**Backend:** Supabase (PostgreSQL 15)  

---

## 📋 TABLA DE CONTENIDO

1. [Esquema de Base de Datos](#esquema-de-base-de-datos)
2. [Tablas Principales](#tablas-principales)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [APIs y Edge Functions](#apis-y-edge-functions)
5. [Migraciones](#migraciones)
6. [Consultas Comunes](#consultas-comunes)

---

## 🗂️ ESQUEMA DE BASE DE DATOS

### Diagrama Entidad-Relación

```
┌──────────────┐
│   empresas   │
└──────┬───────┘
       │
       │ 1:N
       │
┌──────▼───────┐     1:N     ┌──────────────┐
│   usuarios   │──────────────│   pacientes  │
└──────┬───────┘              └──────┬───────┘
       │                             │
       │ 1:N                         │ 1:N
       │                             │
┌──────▼───────┐              ┌─────▼────────┐
│     citas    │              │   examenes   │
└──────────────┘              └──────────────┘
       │                             │
       │ 1:N                         │ 1:N
       │                             │
┌──────▼───────┐              ┌─────▼────────┐
│ notas_medicas│              │ resultados   │
└──────────────┘              └──────────────┘
```

---

## 📊 TABLAS PRINCIPALES

### Tabla: `empresas`
**Descripción:** Empresas clientes del sistema SaaS

```sql
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  razon_social TEXT,
  rfc TEXT UNIQUE,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  logo_url TEXT,
  
  -- Plan y suscripción
  plan TEXT DEFAULT 'basico' CHECK (plan IN ('basico', 'profesional', 'enterprise')),
  fecha_inicio_plan TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_fin_plan TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT true,
  
  -- Límites según plan
  max_usuarios INTEGER DEFAULT 5,
  max_pacientes INTEGER DEFAULT 100,
  max_sedes INTEGER DEFAULT 1,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_empresas_activo ON empresas(activo) WHERE activo = true;
CREATE INDEX idx_empresas_plan ON empresas(plan);
```

**Campos clave:**
- `plan`: Tipo de suscripción (básico, profesional, enterprise)
- `activo`: Estado de la empresa (activo/suspendido)
- `max_*`: Límites según el plan contratado

---

### Tabla: `usuarios`
**Descripción:** Usuarios del sistema con diferentes roles

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id),
  
  -- Datos personales
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  telefono TEXT,
  avatar_url TEXT,
  
  -- Rol y empresa
  rol TEXT NOT NULL CHECK (rol IN ('super_admin', 'admin_empresa', 'medico', 'paciente')),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id UUID REFERENCES sedes(id),
  
  -- Datos profesionales (para médicos)
  cedula_profesional TEXT,
  especialidad TEXT,
  universidad TEXT,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  email_verificado BOOLEAN DEFAULT false,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE UNIQUE INDEX idx_usuarios_cedula ON usuarios(cedula_profesional) WHERE cedula_profesional IS NOT NULL;
```

**Roles disponibles:**
- `super_admin`: Administrador global del sistema
- `admin_empresa`: Administrador de una empresa específica
- `medico`: Profesional médico
- `paciente`: Paciente/empleado

---

### Tabla: `sedes`
**Descripción:** Sucursales o sedes de una empresa

```sql
CREATE TABLE sedes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Datos de la sede
  nombre TEXT NOT NULL,
  codigo TEXT,
  direccion TEXT,
  ciudad TEXT,
  estado TEXT,
  codigo_postal TEXT,
  telefono TEXT,
  email TEXT,
  
  -- Responsable
  encargado_id UUID REFERENCES usuarios(id),
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sedes_empresa ON sedes(empresa_id) WHERE activo = true;
```

---

### Tabla: `pacientes`
**Descripción:** Pacientes/empleados registrados

```sql
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sede_id UUID REFERENCES sedes(id),
  
  -- Datos personales
  nombre TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  fecha_nacimiento DATE,
  sexo TEXT CHECK (sexo IN ('masculino', 'femenino', 'otro')),
  curp TEXT,
  rfc TEXT,
  nss TEXT,
  
  -- Contacto
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  ciudad TEXT,
  estado TEXT,
  codigo_postal TEXT,
  
  -- Contacto de emergencia
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_telefono TEXT,
  contacto_emergencia_parentesco TEXT,
  
  -- Datos laborales
  puesto TEXT,
  departamento TEXT,
  fecha_ingreso DATE,
  numero_empleado TEXT,
  turno TEXT,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Foto
  foto_url TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_pacientes_empresa ON pacientes(empresa_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pacientes_sede ON pacientes(sede_id);
CREATE INDEX idx_pacientes_nombre ON pacientes(nombre, apellido_paterno);
CREATE INDEX idx_pacientes_nss ON pacientes(nss) WHERE nss IS NOT NULL;
CREATE INDEX idx_pacientes_activo ON pacientes(activo) WHERE activo = true;
```

---

### Tabla: `citas`
**Descripción:** Agenda de citas médicas

```sql
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Participantes
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  medico_id UUID NOT NULL REFERENCES usuarios(id),
  
  -- Fecha y hora
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion_minutos INTEGER DEFAULT 30,
  
  -- Detalles
  tipo_cita TEXT CHECK (tipo_cita IN ('consulta', 'examen', 'seguimiento', 'urgencia')),
  motivo TEXT,
  notas TEXT,
  
  -- Estado
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio')),
  motivo_cancelacion TEXT,
  fecha_confirmacion TIMESTAMP WITH TIME ZONE,
  fecha_cancelacion TIMESTAMP WITH TIME ZONE,
  
  -- Notificaciones
  recordatorio_enviado BOOLEAN DEFAULT false,
  fecha_recordatorio TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_citas_empresa ON citas(empresa_id);
CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_citas_medico ON citas(medico_id);
CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_citas_estado ON citas(estado);
CREATE INDEX idx_citas_medico_fecha ON citas(medico_id, fecha) WHERE estado IN ('pendiente', 'confirmada');
```

---

### Tabla: `examenes`
**Descripción:** Exámenes médicos ocupacionales

```sql
CREATE TABLE examenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  medico_id UUID REFERENCES usuarios(id),
  cita_id UUID REFERENCES citas(id),
  
  -- Tipo de examen
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'periodico', 'egreso', 'reingreso', 'extraordinario')),
  subtipo TEXT, -- audiometria, espirometria, rayos_x, etc.
  
  -- Fecha
  fecha_programada DATE,
  fecha_realizado TIMESTAMP WITH TIME ZONE,
  
  -- Estado
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'cancelado')),
  
  -- Resultado
  resultado TEXT CHECK (resultado IN ('apto', 'apto_con_restricciones', 'no_apto', 'pendiente')),
  restricciones TEXT,
  observaciones TEXT,
  recomendaciones TEXT,
  
  -- Documentos
  url_resultado TEXT,
  url_certificado TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_examenes_empresa ON examenes(empresa_id);
CREATE INDEX idx_examenes_paciente ON examenes(paciente_id);
CREATE INDEX idx_examenes_tipo ON examenes(tipo);
CREATE INDEX idx_examenes_estado ON examenes(estado);
CREATE INDEX idx_examenes_fecha ON examenes(fecha_programada);
```

---

### Tabla: `evaluaciones_riesgo`
**Descripción:** Evaluaciones ergonómicas y de riesgo

```sql
CREATE TABLE evaluaciones_riesgo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id),
  evaluador_id UUID NOT NULL REFERENCES usuarios(id),
  
  -- Detalles
  tipo TEXT NOT NULL CHECK (tipo IN ('ergonomica', 'psicosocial', 'ambiental', 'integral')),
  puesto_evaluado TEXT,
  area TEXT,
  
  -- Fecha
  fecha_evaluacion DATE NOT NULL,
  
  -- Resultados
  nivel_riesgo TEXT CHECK (nivel_riesgo IN ('bajo', 'medio', 'alto', 'muy_alto')),
  puntaje_total DECIMAL(5,2),
  
  -- Hallazgos
  factores_riesgo JSONB, -- Array de factores identificados
  recomendaciones JSONB, -- Array de recomendaciones
  plan_accion JSONB, -- Acciones correctivas
  
  -- Seguimiento
  fecha_seguimiento DATE,
  estado_seguimiento TEXT,
  
  -- Documentos
  url_reporte TEXT,
  url_fotos TEXT[], -- Array de URLs de fotos
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_evaluaciones_empresa ON evaluaciones_riesgo(empresa_id);
CREATE INDEX idx_evaluaciones_paciente ON evaluaciones_riesgo(paciente_id);
CREATE INDEX idx_evaluaciones_nivel ON evaluaciones_riesgo(nivel_riesgo);
CREATE INDEX idx_evaluaciones_fecha ON evaluaciones_riesgo(fecha_evaluacion);
```

---

### Tabla: `prescripciones`
**Descripción:** Recetas médicas

```sql
CREATE TABLE prescripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  medico_id UUID NOT NULL REFERENCES usuarios(id),
  cita_id UUID REFERENCES citas(id),
  
  -- Detalles
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  diagnostico TEXT,
  indicaciones_generales TEXT,
  
  -- Medicamentos (JSONB para flexibilidad)
  medicamentos JSONB NOT NULL, -- [{nombre, dosis, frecuencia, duracion, via}]
  
  -- Estado
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'completada', 'cancelada')),
  
  -- Firma digital
  firmada BOOLEAN DEFAULT false,
  firma_digital TEXT,
  fecha_firma TIMESTAMP WITH TIME ZONE,
  
  -- Documentos
  url_receta_pdf TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_prescripciones_empresa ON prescripciones(empresa_id);
CREATE INDEX idx_prescripciones_paciente ON prescripciones(paciente_id);
CREATE INDEX idx_prescripciones_medico ON prescripciones(medico_id);
CREATE INDEX idx_prescripciones_fecha ON prescripciones(fecha);
```

---

### Tabla: `certificados`
**Descripción:** Certificados médicos

```sql
CREATE TABLE certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  medico_id UUID NOT NULL REFERENCES usuarios(id),
  examen_id UUID REFERENCES examenes(id),
  
  -- Tipo
  tipo TEXT NOT NULL CHECK (tipo IN ('aptitud', 'incapacidad', 'defuncion', 'otro')),
  numero_folio TEXT UNIQUE,
  
  -- Detalles
  fecha_expedicion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_vigencia DATE,
  diagnostico TEXT,
  resultado TEXT,
  observaciones TEXT,
  
  -- Firma digital
  firmado BOOLEAN DEFAULT false,
  firma_digital TEXT,
  codigo_verificacion TEXT UNIQUE,
  
  -- Documentos
  url_certificado_pdf TEXT,
  url_qr TEXT,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  fecha_revocacion TIMESTAMP WITH TIME ZONE,
  motivo_revocacion TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_certificados_empresa ON certificados(empresa_id);
CREATE INDEX idx_certificados_paciente ON certificados(paciente_id);
CREATE INDEX idx_certificados_codigo ON certificados(codigo_verificacion);
CREATE INDEX idx_certificados_folio ON certificados(numero_folio);
CREATE INDEX idx_certificados_activo ON certificados(activo) WHERE activo = true;
```

---

### Tabla: `facturas`
**Descripción:** Facturas electrónicas (CFDI 4.0)

```sql
CREATE TABLE facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Cliente
  cliente_nombre TEXT NOT NULL,
  cliente_rfc TEXT NOT NULL,
  cliente_email TEXT,
  
  -- Factura
  serie TEXT,
  folio TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Montos
  subtotal DECIMAL(12,2) NOT NULL,
  descuento DECIMAL(12,2) DEFAULT 0,
  iva DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  
  -- Conceptos (JSONB)
  conceptos JSONB NOT NULL, -- [{descripcion, cantidad, precio_unitario, importe}]
  
  -- CFDI
  uuid TEXT UNIQUE, -- UUID del SAT
  fecha_timbrado TIMESTAMP WITH TIME ZONE,
  cadena_original TEXT,
  sello_sat TEXT,
  url_xml TEXT,
  url_pdf TEXT,
  
  -- Estado
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'timbrada', 'cancelada', 'pagada')),
  fecha_cancelacion TIMESTAMP WITH TIME ZONE,
  motivo_cancelacion TEXT,
  
  -- Pago
  forma_pago TEXT, -- Efectivo, Transferencia, Tarjeta, etc.
  metodo_pago TEXT, -- PUE (pago en una sola exhibición), PPD (pago en parcialidades)
  fecha_pago TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_facturas_empresa ON facturas(empresa_id);
CREATE INDEX idx_facturas_uuid ON facturas(uuid);
CREATE INDEX idx_facturas_estado ON facturas(estado);
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE UNIQUE INDEX idx_facturas_serie_folio ON facturas(serie, folio);
```

---

### Tabla: `inventario`
**Descripción:** Productos médicos y medicamentos

```sql
CREATE TABLE inventario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Producto
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('medicamento', 'equipo_medico', 'consumible', 'suministro', 'reactivo')),
  categoria TEXT,
  
  -- Inventario
  stock_actual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  stock_maximo INTEGER DEFAULT 100,
  unidad_medida TEXT DEFAULT 'pieza',
  
  -- Ubicación
  ubicacion TEXT,
  lote TEXT,
  fecha_caducidad DATE,
  
  -- Precio
  precio_compra DECIMAL(10,2),
  precio_venta DECIMAL(10,2),
  
  -- Proveedor
  proveedor_id UUID REFERENCES proveedores(id),
  
  -- Control
  requiere_receta BOOLEAN DEFAULT false,
  requiere_refrigeracion BOOLEAN DEFAULT false,
  sustancia_controlada BOOLEAN DEFAULT false,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_inventario_empresa ON inventario(empresa_id) WHERE activo = true;
CREATE INDEX idx_inventario_tipo ON inventario(tipo);
CREATE INDEX idx_inventario_stock ON inventario(stock_actual);
CREATE INDEX idx_inventario_caducidad ON inventario(fecha_caducidad) WHERE fecha_caducidad IS NOT NULL;
CREATE INDEX idx_inventario_codigo ON inventario(codigo);
```

---

### Tabla: `audit_logs`
**Descripción:** Registro de auditoría

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  usuario_id UUID REFERENCES usuarios(id),
  
  -- Acción
  accion TEXT NOT NULL, -- CREATE, READ, UPDATE, DELETE
  tabla TEXT NOT NULL,
  registro_id UUID,
  
  -- Detalles
  datos_antes JSONB,
  datos_despues JSONB,
  
  -- Contexto
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_empresa ON audit_logs(empresa_id);
CREATE INDEX idx_audit_usuario ON audit_logs(usuario_id);
CREATE INDEX idx_audit_accion ON audit_logs(accion);
CREATE INDEX idx_audit_tabla ON audit_logs(tabla);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
```

---

## 🔒 ROW LEVEL SECURITY (RLS)

### Política Global: Aislamiento por Empresa

```sql
-- Habilitar RLS en todas las tablas multi-tenant
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE examenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Función helper para obtener empresa_id del usuario
CREATE OR REPLACE FUNCTION get_user_empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Política: Usuarios solo ven datos de su empresa
CREATE POLICY "Usuarios ven solo su empresa"
ON pacientes FOR SELECT
USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Usuarios insertan en su empresa"
ON pacientes FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id());

CREATE POLICY "Usuarios actualizan en su empresa"
ON pacientes FOR UPDATE
USING (empresa_id = get_user_empresa_id())
WITH CHECK (empresa_id = get_user_empresa_id());
```

### Políticas Específicas por Rol

```sql
-- Super Admin: Acceso total
CREATE POLICY "Super Admin acceso total"
ON empresas FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'super_admin'
  )
);

-- Médicos: Solo sus pacientes
CREATE POLICY "Medicos ven sus pacientes"
ON citas FOR SELECT
USING (
  medico_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol IN ('super_admin', 'admin_empresa')
  )
);

-- Pacientes: Solo sus propios datos
CREATE POLICY "Pacientes ven solo sus datos"
ON examenes FOR SELECT
USING (
  paciente_id IN (
    SELECT id FROM pacientes WHERE email = auth.email()
  )
);
```

---

## 🌐 APIs Y EDGE FUNCTIONS

### API de Autenticación

```typescript
// Edge Function: validate-session
export async function validateSession(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Obtener datos completos del usuario
  const { data: userData } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
  
  return new Response(JSON.stringify(userData), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### API de Chatbot (Planeada)

```typescript
// Edge Function: chatbot-message
export async function processChatbotMessage(request: Request) {
  const { mensaje, conversacion_id } = await request.json()
  
  // Procesar con OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Eres un asistente médico especializado en medicina del trabajo'
      },
      {
        role: 'user',
        content: mensaje
      }
    ]
  })
  
  // Guardar en BD
  await supabase.from('mensajes_chatbot').insert({
    conversacion_id,
    mensaje,
    respuesta: response.choices[0].message.content,
    sentiment: analyzeSentiment(mensaje)
  })
  
  return new Response(JSON.stringify({
    respuesta: response.choices[0].message.content
  }))
}
```

### API de Análisis Predictivo

```typescript
// Edge Function: analyze-risk
export async function analyzeRisk(request: Request) {
  const { paciente_id, tipo_analisis } = await request.json()
  
  // Obtener histórico del paciente
  const historial = await getPatientHistory(paciente_id)
  
  // Calcular score de riesgo
  const riskScore = calculateRiskScore(historial)
  
  // Generar recomendaciones
  const recomendaciones = generateRecommendations(riskScore, historial)
  
  return new Response(JSON.stringify({
    score: riskScore,
    nivel: riskScore > 0.7 ? 'alto' : 'medio',
    recomendaciones
  }))
}
```

---

## 🔄 MIGRACIONES

### Estructura de Migraciones

```
supabase/migrations/
├── 00000000000000_initial_schema.sql      # Esquema inicial
├── 00000000000001_add_usuarios.sql        # Tabla usuarios
├── 00000000000002_add_pacientes.sql       # Tabla pacientes
├── 00000000000003_add_citas.sql           # Tabla citas
├── 00000000000004_add_examenes.sql        # Tabla exámenes
├── 00000000000005_add_rls_policies.sql    # Políticas RLS
└── 00000000000006_add_indexes.sql         # Índices optimizados
```

### Ejemplo de Migración

```sql
-- Migration: add_facturas.sql
-- Descripción: Agregar tabla de facturas con soporte CFDI 4.0

BEGIN;

CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  -- ... resto de columnas
);

-- Índices
CREATE INDEX idx_facturas_empresa ON facturas(empresa_id);
CREATE INDEX idx_facturas_uuid ON facturas(uuid);

-- RLS
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven facturas de su empresa"
ON facturas FOR SELECT
USING (empresa_id = get_user_empresa_id());

COMMIT;
```

---

## 🔍 CONSULTAS COMUNES

### Obtener Pacientes con Exámenes Vencidos

```sql
SELECT 
  p.id,
  p.nombre,
  p.apellido_paterno,
  p.puesto,
  MAX(e.fecha_realizado) as ultimo_examen,
  NOW() - MAX(e.fecha_realizado) as dias_desde_examen
FROM pacientes p
LEFT JOIN examenes e ON e.paciente_id = p.id AND e.tipo = 'periodico'
WHERE p.empresa_id = '...'
  AND p.activo = true
GROUP BY p.id
HAVING MAX(e.fecha_realizado) < NOW() - INTERVAL '1 year'
  OR MAX(e.fecha_realizado) IS NULL
ORDER BY dias_desde_examen DESC;
```

### Dashboard: Estadísticas del Día

```sql
SELECT 
  COUNT(DISTINCT c.id) as total_citas,
  COUNT(DISTINCT c.id) FILTER (WHERE c.estado = 'completada') as citas_completadas,
  COUNT(DISTINCT e.id) as examenes_realizados,
  COUNT(DISTINCT p.id) FILTER (WHERE p.created_at >= CURRENT_DATE) as nuevos_pacientes
FROM citas c
LEFT JOIN examenes e ON e.cita_id = c.id
LEFT JOIN pacientes p ON p.id = c.paciente_id
WHERE c.empresa_id = '...'
  AND c.fecha >= CURRENT_DATE
  AND c.fecha < CURRENT_DATE + INTERVAL '1 day';
```

### Reporte de Facturación Mensual

```sql
SELECT 
  DATE_TRUNC('month', fecha) as mes,
  COUNT(*) as total_facturas,
  SUM(total) as ingresos_totales,
  SUM(total) FILTER (WHERE estado = 'pagada') as ingresos_cobrados,
  SUM(total) FILTER (WHERE estado = 'pendiente') as por_cobrar
FROM facturas
WHERE empresa_id = '...'
  AND fecha >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY mes
ORDER BY mes DESC;
```

### Inventario: Productos por Caducar

```sql
SELECT 
  id,
  nombre,
  lote,
  fecha_caducidad,
  stock_actual,
  fecha_caducidad - CURRENT_DATE as dias_para_caducar
FROM inventario
WHERE empresa_id = '...'
  AND activo = true
  AND fecha_caducidad IS NOT NULL
  AND fecha_caducidad <= CURRENT_DATE + INTERVAL '3 months'
ORDER BY fecha_caducidad ASC;
```

---

## 📊 VISTAS ÚTILES

### Vista: Dashboard Médico

```sql
CREATE OR REPLACE VIEW vista_dashboard_medico AS
SELECT 
  u.id as medico_id,
  u.nombre as medico_nombre,
  COUNT(DISTINCT c.id) as total_citas,
  COUNT(DISTINCT c.id) FILTER (WHERE c.fecha >= CURRENT_DATE) as citas_hoy,
  COUNT(DISTINCT e.id) as examenes_realizados,
  COUNT(DISTINCT p.id) as total_pacientes
FROM usuarios u
LEFT JOIN citas c ON c.medico_id = u.id
LEFT JOIN examenes e ON e.medico_id = u.id
LEFT JOIN pacientes p ON p.id = c.paciente_id
WHERE u.rol = 'medico'
GROUP BY u.id, u.nombre;
```

---

## 🔧 FUNCIONES ÚTILES

### Función: Calcular Edad

```sql
CREATE OR REPLACE FUNCTION calcular_edad(fecha_nacimiento DATE)
RETURNS INTEGER AS $$
  SELECT DATE_PART('year', AGE(fecha_nacimiento))::INTEGER;
$$ LANGUAGE SQL IMMUTABLE;

-- Uso
SELECT nombre, calcular_edad(fecha_nacimiento) as edad
FROM pacientes;
```

### Función: Generar Folio

```sql
CREATE OR REPLACE FUNCTION generar_folio(prefijo TEXT)
RETURNS TEXT AS $$
DECLARE
  nuevo_folio TEXT;
  contador INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(folio FROM LENGTH(prefijo) + 1) AS INTEGER)), 0) + 1
  INTO contador
  FROM facturas
  WHERE serie = prefijo;
  
  nuevo_folio := prefijo || LPAD(contador::TEXT, 6, '0');
  RETURN nuevo_folio;
END;
$$ LANGUAGE plpgsql;

-- Uso
SELECT generar_folio('FAC'); -- Retorna: FAC000001
```

---

## 🎯 MEJORES PRÁCTICAS

### ✅ DO
- Siempre usar transacciones para operaciones múltiples
- Implementar índices en columnas de búsqueda frecuente
- Usar JSONB para datos flexibles (medicamentos, factores_riesgo)
- Habilitar RLS en todas las tablas multi-tenant
- Usar soft deletes (deleted_at) en lugar de DELETE

### ❌ DON'T
- No hardcodear UUIDs en queries
- No hacer SELECT * en producción
- No omitir WHERE empresa_id en queries multi-tenant
- No almacenar contraseñas sin hash
- No exponer datos sensibles en logs

---

**Última actualización:** 11 de Noviembre de 2025  
**Total Tablas:** 20+  
**Total Índices:** 100+
