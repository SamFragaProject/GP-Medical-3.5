# 🏥 Clinical Core Specialist - GPMedical ERP Pro

## 🎯 Misión

Construir el **Núcleo Clínico** completo del ERP Pro: expedientes electrónicos, historia laboral, exploraciones físicas, consentimientos, consultas y estudios paraclínicos.

---

## 📋 Entregables

### 1. Expediente Clínico Electrónico (ECE)

#### Database Schema (Supabase)

```sql
-- Tabla principal de expedientes
CREATE TABLE expedientes_clinicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES pacientes(id),
    empresa_id UUID REFERENCES empresas(id),
    sede_id UUID REFERENCES sedes(id),
    
    -- Apertura y cierre
    fecha_apertura DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_cierre DATE,
    
    -- Estado del expediente
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado', 'archivado')),
    
    -- Auditoría
    created_by UUID REFERENCES usuarios(id),
    updated_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### APNP - Antecedentes Personales No Patológicos

```sql
CREATE TABLE apnp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id),
    
    -- Hábitos
    tabaco BOOLEAN DEFAULT FALSE,
    tabaco_cantidad VARCHAR(50),
    tabaco_tiempo VARCHAR(50),
    
    alcohol BOOLEAN DEFAULT FALSE,
    alcohol_frecuencia VARCHAR(50),
    
    drogas BOOLEAN DEFAULT FALSE,
    drogas_tipo VARCHAR(200),
    
    -- Medicamentos
    medicamentos_habitual VARCHAR(500),
    
    -- Estilo de vida
    ejercicio_frecuencia VARCHAR(50),
    ejercicio_tipo VARCHAR(200),
    
    sueno_horas INTEGER,
    sueno_calidad VARCHAR(50),
    
    alimentacion_tipo VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### AHF - Antecedentes Heredofamiliares

```sql
CREATE TABLE ahf (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id),
    
    -- Padecimientos familiares
    diabetes BOOLEAN DEFAULT FALSE,
    diabetes_quien VARCHAR(200),
    
    hipertension BOOLEAN DEFAULT FALSE,
    hipertension_quien VARCHAR(200),
    
    cancer BOOLEAN DEFAULT FALSE,
    cancer_tipo VARCHAR(200),
    cancer_quien VARCHAR(200),
    
    cardiopatias BOOLEAN DEFAULT FALSE,
    cardiopatias_quien VARCHAR(200),
    
    enfermedades_mentales BOOLEAN DEFAULT FALSE,
    enfermedades_mentales_quien VARCHAR(200),
    
    otros TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Historia Ocupacional

```sql
CREATE TABLE historia_ocupacional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id),
    
    empresa_anterior VARCHAR(200),
    puesto VARCHAR(200),
    fecha_inicio DATE,
    fecha_fin DATE,
    
    -- Riesgos en ese puesto
    riesgos_fisicos TEXT,
    riesgos_quimicos TEXT,
    riesgos_biologicos TEXT,
    riesgos_ergonomicos TEXT,
    riesgos_psicosociales TEXT,
    
    exposiciones TEXT,
    epp_utilizado TEXT,
    
    accidentes_laborales TEXT,
    enfermedades_laborales TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Exploración Física Estructurada

```sql
CREATE TABLE exploracion_fisica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id),
    consulta_id UUID REFERENCES consultas(id),
    
    -- Signos Vitales
    fc INTEGER, -- frecuencia cardiaca
    fr INTEGER, -- frecuencia respiratoria
    ta_sistolica INTEGER,
    ta_diastolica INTEGER,
    temperatura DECIMAL(4,2),
    spo2 INTEGER,
    glucosa INTEGER,
    
    -- Antropometría
    peso_kg DECIMAL(5,2),
    talla_cm DECIMAL(5,2),
    imc DECIMAL(5,2),
    cintura_cm DECIMAL(5,2),
    cadera_cm DECIMAL(5,2),
    icc DECIMAL(4,2), -- índice cintura-cadera
    
    -- Exploración sistemática
    aspecto_general TEXT,
    piel TEXT,
    cabeza TEXT,
    ojos TEXT,
    oidos TEXT,
    nariz TEXT,
    boca TEXT,
    cuello TEXT,
    
    -- Tórax
    torax TEXT,
    pulmones TEXT,
    corazon TEXT,
    
    -- Abdomen
    abdomen TEXT,
    
    -- Extremidades
    extremidades_superiores TEXT,
    extremidades_inferiores TEXT,
    
    -- Neurológico
    neurologico TEXT,
    
    -- Mental
    estado_mental TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Consentimientos Informados

```sql
CREATE TABLE consentimientos_informados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id),
    paciente_id UUID REFERENCES pacientes(id),
    
    tipo VARCHAR(100), -- 'prestacion_servicios', 'manejo_datos', 'menores'
    
    -- Contenido
    contenido TEXT,
    version VARCHAR(10),
    
    -- Firma
    firmado BOOLEAN DEFAULT FALSE,
    fecha_firma TIMESTAMP,
    firma_digital_url TEXT,
    
    -- Datos del firmante
    firmante_nombre VARCHAR(200),
    firmante_parentesco VARCHAR(100), -- si aplica
    
    -- Testigo (opcional)
    testigo_nombre VARCHAR(200),
    testigo_firma_url TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Módulo de Consultas

```sql
CREATE TABLE consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id),
    episodio_id UUID REFERENCES episodios(id),
    paciente_id UUID REFERENCES pacientes(id),
    medico_id UUID REFERENCES usuarios(id),
    
    -- Tipo de consulta
    tipo VARCHAR(50), -- 'general', 'ocupacional'
    subtipo VARCHAR(50), -- 'ingreso', 'periodico', 'retorno', 'egreso', 'reubicacion'
    
    -- Motivo
    motivo_consulta TEXT,
    
    -- SOAP
    subjetivo TEXT,
    objetivo TEXT, -- referencia a exploracion_fisica
    analisis TEXT,
    plan_tratamiento TEXT,
    
    -- Diagnósticos
    diagnostico_principal VARCHAR(10), -- CIE-10
    diagnosticos_secundarios TEXT[], -- array de CIE-10
    
    -- Observaciones
    observaciones TEXT,
    
    fecha_consulta TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Catálogo CIE-10

```sql
CREATE TABLE catalogo_cie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    capitulo VARCHAR(100),
    grupo VARCHAR(100),
    es_favorito BOOLEAN DEFAULT FALSE,
    frecuencia_uso INTEGER DEFAULT 0
);

-- Insertar CIE-10 común en medicina laboral
INSERT INTO catalogo_cie (codigo, descripcion) VALUES
('Z02.0', 'Examen médico para admisión a instituciones educativas'),
('Z02.1', 'Examen médico para admisión a instituciones laborales'),
('Z02.2', 'Examen médico para admisión a instituciones penitenciarias'),
('Z02.3', 'Examen médico para adopción'),
('Z02.4', 'Examen médico para admisión a instituciones de tercera edad'),
('Z02.5', 'Examen médico para admisión a instituciones de salud mental'),
('Z02.6', 'Examen médico para fines de seguro'),
('Z02.7', 'Examen médico para fines de licencia de conducir'),
('Z02.8', 'Examen médico para otros fines administrativos'),
('Z02.9', 'Examen médico para fines no especificados');
```

### 5. Recetas Electrónicas

```sql
CREATE TABLE recetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID REFERENCES consultas(id),
    paciente_id UUID REFERENCES pacientes(id),
    medico_id UUID REFERENCES usuarios(id),
    
    -- Información general
    diagnostico VARCHAR(10), -- CIE-10
    indicaciones_generales TEXT,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'activa', -- 'activa', 'surtida_parcial', 'surtida_total', 'cancelada'
    
    -- Vigencia
    fecha_receta TIMESTAMP DEFAULT NOW(),
    fecha_vigencia DATE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recetas_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receta_id UUID REFERENCES recetas(id),
    
    -- Medicamento
    medicamento_nombre VARCHAR(200),
    presentacion VARCHAR(100),
    
    -- Dosis
    dosis VARCHAR(100),
    frecuencia VARCHAR(100),
    duracion VARCHAR(100),
    via_administracion VARCHAR(50),
    
    -- Cantidad
    cantidad_solicitada INTEGER,
    cantidad_surtida INTEGER DEFAULT 0,
    
    -- Indicaciones específicas
    indicaciones TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Estudios Paraclínicos

#### Schema General

```sql
CREATE TABLE estudios_paraclinicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes_clinicos(id),
    episodio_id UUID REFERENCES episodios(id),
    paciente_id UUID REFERENCES pacientes(id),
    
    tipo VARCHAR(50), -- 'audiometria', 'espirometria', 'ecg', 'rx', 'laboratorio', 'vision'
    
    -- Resultados
    resultado TEXT,
    interpretacion TEXT,
    observaciones TEXT,
    
    -- Archivo
    archivo_url TEXT,
    archivo_tipo VARCHAR(20), -- 'pdf', 'dicom', 'imagen'
    
    -- Interpretación médica
    medico_interpreta_id UUID REFERENCES usuarios(id),
    fecha_interpretacion TIMESTAMP,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'completo', 'anormal'
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Audiometría Específica

```sql
CREATE TABLE audiometrias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudio_id UUID REFERENCES estudios_paraclinicos(id),
    
    -- Oído Derecho (dB)
    od_500hz INTEGER,
    od_1000hz INTEGER,
    od_2000hz INTEGER,
    od_3000hz INTEGER,
    od_4000hz INTEGER,
    od_6000hz INTEGER,
    od_8000hz INTEGER,
    
    -- Oído Izquierdo (dB)
    oi_500hz INTEGER,
    oi_1000hz INTEGER,
    oi_2000hz INTEGER,
    oi_3000hz INTEGER,
    oi_4000hz INTEGER,
    oi_6000hz INTEGER,
    oi_8000hz INTEGER,
    
    -- Interpretación NOM-011
    semaforo_od VARCHAR(20), -- 'verde', 'amarillo', 'rojo'
    semaforo_oi VARCHAR(20),
    
    interpretacion_nom011 TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Espirometría Específica

```sql
CREATE TABLE espirometrias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudio_id UUID REFERENCES estudios_paraclinicos(id),
    
    -- Valores medidos
    fvc_litros DECIMAL(5,2),
    fvc_predicho INTEGER,
    fvc_porcentaje DECIMAL(5,2),
    
    fev1_litros DECIMAL(5,2),
    fev1_predicho INTEGER,
    fev1_porcentaje DECIMAL(5,2),
    
    fev1_fvc DECIMAL(4,2),
    
    pef DECIMAL(6,2),
    pef_predicho INTEGER,
    pef_porcentaje DECIMAL(5,2),
    
    -- Interpretación
    interpretacion VARCHAR(50), -- 'normal', 'restrictivo', 'obstructivo', 'mixto'
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Laboratorio

```sql
CREATE TABLE laboratorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudio_id UUID REFERENCES estudios_paraclinicos(id),
    
    grupo VARCHAR(100), -- 'hematologia', 'quimica', 'urianalisis'
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE laboratorios_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratorio_id UUID REFERENCES laboratorios(id),
    
    parametro VARCHAR(100),
    resultado VARCHAR(100),
    unidad VARCHAR(50),
    valor_referencia VARCHAR(100),
    
    -- Bandera
    bandera VARCHAR(20), -- 'normal', 'alto', 'bajo', 'critico'
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🖥️ Componentes React

### Páginas a Crear

1. **ExpedienteClinicoPro.tsx**
   - Vista completa del expediente
   - Tabs: General, APNP, AHF, Ocupacional, Exploraciones, Estudios

2. **ConsultaOcupacional.tsx**
   - Formulario SOAP
   - Selector de tipo (ingreso, periódico, etc.)
   - Plantillas por tipo
   - Buscador CIE-10

3. **RecetaElectronica.tsx**
   - Editor de recetas
   - Buscador de medicamentos
   - Preview de impresión

4. **ConsentimientoDigital.tsx**
   - Vista del consentimiento
   - Área de firma digital
   - PDF generado

5. **EstudiosParaclinicos.tsx**
   - Grid de estudios del paciente
   - Upload de archivos
   - Interpretación médica

### Servicios a Crear

1. **expedienteService.ts**
   - CRUD de expedientes
   - Historia completa

2. **consultaService.ts**
   - CRUD de consultas
   - Búsqueda CIE-10

3. **recetaService.ts**
   - CRUD de recetas
   - Control de dispensación

4. **consentimientoService.ts**
   - Gestión de consentimientos
   - Firma digital

5. **estudiosService.ts**
   - CRUD de estudios
   - Upload de archivos
   - Interpretaciones

---

## ✅ Checklist de Completado

### Database
- [ ] Todas las tablas creadas en Supabase
- [ ] Relaciones definidas
- [ ] Políticas RLS configuradas
- [ ] Índices creados

### Frontend
- [ ] Componente ExpedienteClinicoPro
- [ ] Componente ConsultaOcupacional
- [ ] Componente RecetaElectronica
- [ ] Componente ConsentimientoDigital
- [ ] Componente EstudiosParaclinicos

### Servicios
- [ ] expedienteService.ts
- [ ] consultaService.ts
- [ ] recetaService.ts
- [ ] consentimientoService.ts
- [ ] estudiosService.ts

### Tipos TypeScript
- [ ] types/expediente.ts
- [ ] types/consulta.ts
- [ ] types/receta.ts
- [ ] types/estudio.ts

### Integración
- [ ] Funciona con Workflow Engine
- [ ] Funciona con Dictamen Engine
- [ ] Datos persistentes en BD

---

**Reportar a:** ERP Pro Coordinator  
**Dependencias:** Ninguna (es el primer módulo)  
**Bloquea a:** Workflow Engine, Dictamen Engine
