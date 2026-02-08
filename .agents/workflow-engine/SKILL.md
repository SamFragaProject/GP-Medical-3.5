# ⚙️ Workflow Engine Architect - GPMedical ERP Pro

## 🎯 Misión

Construir el **Motor de Flujos** que gestione episodios de atención y campañas masivas con pipelines visuales, reglas de bloqueo y next best actions.

---

## 📋 Entregables

### 1. Episodio de Atención (Pipeline Completo)

#### Database Schema

```sql
-- Tabla principal de episodios
CREATE TABLE episodios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    paciente_id UUID REFERENCES pacientes(id),
    empresa_id UUID REFERENCES empresas(id),
    sede_id UUID REFERENCES sedes(id),
    campana_id UUID REFERENCES campanas(id),
    
    -- Identificación
    folio VARCHAR(50) UNIQUE, -- AUTO-GENERADO: EMP-001-2026
    
    -- Tipo de evaluación
    tipo VARCHAR(50) NOT NULL, -- 'preempleo', 'periodico', 'retorno', 'egreso', 'reubicacion'
    
    -- Pipeline de estados
    estado VARCHAR(50) DEFAULT 'registrado',
    -- estados: registrado, triage, evaluaciones, labs, imagen, integracion, dictamen, cerrado
    
    -- Fechas de cada etapa
    fecha_registro TIMESTAMP DEFAULT NOW(),
    fecha_triage TIMESTAMP,
    fecha_evaluaciones TIMESTAMP,
    fecha_labs TIMESTAMP,
    fecha_imagen TIMESTAMP,
    fecha_integracion TIMESTAMP,
    fecha_dictamen TIMESTAMP,
    fecha_cierre TIMESTAMP,
    
    -- SLA
    fecha_limite DATE, -- calculado según tipo y SLA del contrato
    
    -- Responsables
    medico_responsable_id UUID REFERENCES usuarios(id),
    enfermera_asignada_id UUID REFERENCES usuarios(id),
    
    -- Estado de completitud
    porcentaje_completado INTEGER DEFAULT 0,
    
    -- Flags de estudios requeridos
    requiere_audiometria BOOLEAN DEFAULT FALSE,
    requiere_espirometria BOOLEAN DEFAULT FALSE,
    requiere_rx BOOLEAN DEFAULT FALSE,
    requiere_laboratorio BOOLEAN DEFAULT FALSE,
    requiere_ecg BOOLEAN DEFAULT FALSE,
    requiere_vision BOOLEAN DEFAULT FALSE,
    
    -- Flags de estudios completados
    audiometria_completada BOOLEAN DEFAULT FALSE,
    espirometria_completada BOOLEAN DEFAULT FALSE,
    rx_completada BOOLEAN DEFAULT FALSE,
    laboratorio_completado BOOLEAN DEFAULT FALSE,
    ecg_completado BOOLEAN DEFAULT FALSE,
    vision_completada BOOLEAN DEFAULT FALSE,
    
    -- Consentimientos
    consentimientos_completos BOOLEAN DEFAULT FALSE,
    
    -- Dictamen
    dictamen_emitido BOOLEAN DEFAULT FALSE,
    dictamen_id UUID REFERENCES dictamenes(id),
    
    -- Auditoría
    created_by UUID REFERENCES usuarios(id),
    updated_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Función para generar folio automático
CREATE OR REPLACE FUNCTION generar_folio_episodio()
RETURNS TRIGGER AS $$
BEGIN
    NEW.folio := 'EP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('folio_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_folio_episodio
BEFORE INSERT ON episodios
FOR EACH ROW
EXECUTE FUNCTION generar_folio_episodio();
```

#### Reglas de Estudios por Tipo

```sql
CREATE TABLE reglas_estudios_tipo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    tipo_evaluacion VARCHAR(50), -- 'preempleo', 'periodico', 'retorno', 'egreso'
    
    -- Riesgos del puesto que activan estudios
    riesgo_ruido BOOLEAN DEFAULT FALSE,
    riesgo_respirable BOOLEAN DEFAULT FALSE,
    riesgo_altura BOOLEAN DEFAULT FALSE,
    riesgo_confinado BOOLEAN DEFAULT FALSE,
    riesgo_quimico BOOLEAN DEFAULT FALSE,
    riesgo_carga BOOLEAN DEFAULT FALSE,
    riesgo_visual BOOLEAN DEFAULT FALSE,
    
    -- Estudios requeridos
    requiere_audiometria BOOLEAN DEFAULT FALSE,
    requiere_espirometria BOOLEAN DEFAULT FALSE,
    requiere_rx_torax BOOLEAN DEFAULT FALSE,
    requiere_rx_columna BOOLEAN DEFAULT FALSE,
    requiere_laboratorio_basico BOOLEAN DEFAULT FALSE,
    requiere_laboratorio_completo BOOLEAN DEFAULT FALSE,
    requiere_ecg BOOLEAN DEFAULT FALSE,
    requiere_agudeza_visual BOOLEAN DEFAULT FALSE,
    requiere_ishihara BOOLEAN DEFAULT FALSE,
    requiere_electrolitos BOOLEAN DEFAULT FALSE,
    
    -- Edad que activa estudios adicionales
    edad_activa_extras INTEGER DEFAULT 40,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar reglas
INSERT INTO reglas_estudios_tipo (tipo_evaluacion, riesgo_ruido, requiere_audiometria) VALUES
('preempleo', TRUE, TRUE),
('periodico', TRUE, TRUE),
('periodico', TRUE, TRUE); -- si hay cambio en audiometría previa
```

#### Reglas de Bloqueo

```sql
-- Función para verificar si se puede cerrar episodio
CREATE OR REPLACE FUNCTION puede_cerrar_episodio(episodio_uuid UUID)
RETURNS TABLE (
    puede_cerrar BOOLEAN,
    mensaje TEXT,
    faltantes TEXT[]
) AS $$
DECLARE
    v_episodio RECORD;
    faltantes_arr TEXT[] := ARRAY[]::TEXT[];
BEGIN
    SELECT * INTO v_episodio FROM episodios WHERE id = episodio_uuid;
    
    -- Verificar estudios requeridos
    IF v_episodio.requiere_audiometria AND NOT v_episodio.audiometria_completada THEN
        faltantes_arr := array_append(faltantes_arr, 'Audiometría');
    END IF;
    
    IF v_episodio.requiere_espirometria AND NOT v_episodio.espirometria_completada THEN
        faltantes_arr := array_append(faltantes_arr, 'Espirometría');
    END IF;
    
    IF v_episodio.requiere_rx AND NOT v_episodio.rx_completada THEN
        faltantes_arr := array_append(faltantes_arr, 'Rayos X');
    END IF;
    
    IF v_episodio.requiere_laboratorio AND NOT v_episodio.laboratorio_completado THEN
        faltantes_arr := array_append(faltantes_arr, 'Laboratorio');
    END IF;
    
    IF v_episodio.requiere_ecg AND NOT v_episodio.ecg_completado THEN
        faltantes_arr := array_append(faltantes_arr, 'ECG');
    END IF;
    
    IF v_episodio.requiere_vision AND NOT v_episodio.vision_completada THEN
        faltantes_arr := array_append(faltantes_arr, 'Agudeza Visual');
    END IF;
    
    -- Verificar consentimientos
    IF NOT v_episodio.consentimientos_completos THEN
        faltantes_arr := array_append(faltantes_arr, 'Consentimientos informados');
    END IF;
    
    -- Verificar dictamen
    IF NOT v_episodio.dictamen_emitido THEN
        faltantes_arr := array_append(faltantes_arr, 'Dictamen médico');
    END IF;
    
    IF array_length(faltantes_arr, 1) > 0 THEN
        RETURN QUERY SELECT FALSE, 
            'No se puede cerrar el episodio. Faltan: ' || array_to_string(faltantes_arr, ', '),
            faltantes_arr;
    ELSE
        RETURN QUERY SELECT TRUE, 'Episodio listo para cerrar', ARRAY[]::TEXT[];
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### 2. Campañas Masivas

```sql
CREATE TABLE campanas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    empresa_id UUID REFERENCES empresas(id),
    
    -- Información general
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(50), -- 'preempleo_masivo', 'periodico_anual', 'retorno_colectivo'
    descripcion TEXT,
    
    -- Fechas
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    fecha_cierre DATE,
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'planeacion', -- 'planeacion', 'activa', 'pausada', 'cerrada'
    
    -- Metas
    meta_headcount INTEGER,
    real_headcount INTEGER DEFAULT 0,
    
    -- Configuración
    sedes_incluidas UUID[], -- array de sede_ids
    tipo_evaluacion VARCHAR(50), -- 'preempleo', 'periodico', etc.
    
    -- Responsable
    responsable_id UUID REFERENCES usuarios(id),
    
    -- Métricas calculadas
    total_evaluados INTEGER DEFAULT 0,
    total_aptos INTEGER DEFAULT 0,
    total_restricciones INTEGER DEFAULT 0,
    total_no_aptos INTEGER DEFAULT 0,
    total_pendientes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Carga Masiva de Padrón

```sql
CREATE TABLE campanas_padron_temp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campana_id UUID REFERENCES campanas(id),
    
    -- Datos del empleado (desde Excel/CSV)
    numero_empleado VARCHAR(50),
    nombre VARCHAR(200),
    apellido_paterno VARCHAR(200),
    apellido_materno VARCHAR(200),
    rfc VARCHAR(13),
    curp VARCHAR(18),
    email VARCHAR(200),
    telefono VARCHAR(20),
    
    -- Datos laborales
    puesto VARCHAR(200),
    departamento VARCHAR(200),
    area VARCHAR(200),
    sede VARCHAR(200),
    fecha_ingreso DATE,
    
    -- Estado de importación
    estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'procesado', 'error'
    error_mensaje TEXT,
    
    -- Relación creada
    paciente_id UUID REFERENCES pacientes(id),
    episodio_id UUID REFERENCES episodios(id),
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Next Best Action

```sql
-- Función para determinar siguiente acción
CREATE OR REPLACE FUNCTION next_best_action(episodio_uuid UUID)
RETURNS TABLE (
    accion VARCHAR(100),
    descripcion TEXT,
    prioridad VARCHAR(20), -- 'alta', 'media', 'baja'
    tiempo_estimado INTEGER -- minutos
) AS $$
DECLARE
    v_episodio RECORD;
BEGIN
    SELECT * INTO v_episodio FROM episodios WHERE id = episodio_uuid;
    
    -- Si está en registro, ir a triage
    IF v_episodio.estado = 'registrado' THEN
        RETURN QUERY SELECT 
            'triage'::VARCHAR(100),
            'Realizar triage inicial: signos vitales y antecedentes'::TEXT,
            'alta'::VARCHAR(20),
            15::INTEGER;
        RETURN;
    END IF;
    
    -- Si falta audiometría requerida
    IF v_episodio.requiere_audiometria AND NOT v_episodio.audiometria_completada THEN
        RETURN QUERY SELECT 
            'audiometria'::VARCHAR(100),
            'Realizar audiometría (programada en cabina)'::TEXT,
            'alta'::VARCHAR(20),
            20::INTEGER;
        RETURN;
    END IF;
    
    -- Si falta espirometría requerida
    IF v_episodio.requiere_espirometria AND NOT v_episodio.espirometria_completada THEN
        RETURN QUERY SELECT 
            'espirometria'::VARCHAR(100),
            'Realizar espirometría'::TEXT,
            'alta'::VARCHAR(20),
            15::INTEGER;
        RETURN;
    END IF;
    
    -- Si faltan estudios de imagen
    IF v_episodio.requiere_rx AND NOT v_episodio.rx_completada THEN
        RETURN QUERY SELECT 
            'rayos_x'::VARCHAR(100),
            'Realizar RX de tórax'::TEXT,
            'alta'::VARCHAR(20),
            15::INTEGER;
        RETURN;
    END IF;
    
    -- Si falta laboratorio
    IF v_episodio.requiere_laboratorio AND NOT v_episodio.laboratorio_completado THEN
        RETURN QUERY SELECT 
            'laboratorio'::VARCHAR(100),
            'Tomar muestras para laboratorio'::TEXT,
            'media'::VARCHAR(20),
            10::INTEGER;
        RETURN;
    END IF;
    
    -- Si todo está completo, ir a dictamen
    IF v_episodio.estado = 'integracion' THEN
        RETURN QUERY SELECT 
            'dictamen'::VARCHAR(100),
            'Emitir dictamen médico ocupacional'::TEXT,
            'alta'::VARCHAR(20),
            10::INTEGER;
        RETURN;
    END IF;
    
    -- Default
    RETURN QUERY SELECT 
        'consulta'::VARCHAR(100),
        'Continuar con consulta médica'::TEXT,
        'media'::VARCHAR(20),
        30::INTEGER;
END;
$$ LANGUAGE plpgsql;
```

---

## 🖥️ Componentes React

### Páginas a Crear

1. **EpisodioDetail.tsx**
   - Vista completa del episodio
   - Pipeline visual
   - Timeline de actividades
   - Acciones disponibles

2. **PipelineVisual.tsx**
   - Componente visual del pipeline
   - Pasos: Registro → Triage → Evaluaciones → Labs → Imagen → Integración → Dictamen → Cerrado
   - Colores por estado
   - Acciones en cada paso

3. **CampanasList.tsx**
   - Lista de campañas
   - Filtros por estado, empresa
   - Métricas rápidas

4. **CampanaDetail.tsx**
   - Dashboard de campaña
   - Padrón de empleados
   - Progreso
   - Upload de Excel

5. **CargaMasiva.tsx**
   - Upload de archivo
   - Preview de datos
   - Validación
   - Procesamiento

### Componentes de Workflow

1. **PipelineStep.tsx**
   - Paso individual del pipeline
   - Icono, título, estado
   - Acciones disponibles

2. **NextActionCard.tsx**
   - Muestra la siguiente acción recomendada
   - Prioridad
   - Tiempo estimado
   - Botón de acción

3. **BloqueoAlert.tsx**
   - Muestra por qué no se puede avanzar
   - Lista de faltantes
   - Acciones para completar

4. **CampanaProgress.tsx**
   - Barra de progreso de campaña
   - Estadísticas

---

## 🔄 Servicios

### episodioService.ts

```typescript
export const episodioService = {
    // CRUD básico
    async create(data: CreateEpisodioDTO): Promise<Episodio>
    async getById(id: string): Promise<Episodio | null>
    async update(id: string, data: UpdateEpisodioDTO): Promise<Episodio>
    
    // Pipeline
    async avanzarPaso(id: string, nuevoEstado: EpisodioEstado): Promise<void>
    async retrocederPaso(id: string): Promise<void>
    
    // Reglas
    async verificarBloqueos(id: string): Promise<BloqueoResult>
    async puedeCerrar(id: string): Promise<boolean>
    
    // Next best action
    async getNextAction(id: string): Promise<NextAction>
    
    // Estudios
    async marcarEstudioCompleto(id: string, tipoEstudio: string): Promise<void>
    
    // Búsqueda
    async getByEmpresa(empresaId: string): Promise<Episodio[]>
    async getByCampana(campanaId: string): Promise<Episodio[]>
    async getByPaciente(pacienteId: string): Promise<Episodio[]>
    
    // Estadísticas
    async getStats(): Promise<EpisodioStats>
}
```

### campanaService.ts

```typescript
export const campanaService = {
    // CRUD
    async create(data: CreateCampanaDTO): Promise<Campana>
    async getById(id: string): Promise<Campana | null>
    async update(id: string, data: UpdateCampanaDTO): Promise<Campana>
    
    // Carga masiva
    async uploadPadron(campanaId: string, file: File): Promise<UploadResult>
    async procesarPadron(campanaId: string): Promise<ProcesoResult>
    
    // Padrón
    async getPadron(campanaId: string): Promise<PadronItem[]>
    async getPadronStats(campanaId: string): Promise<PadronStats>
    
    // Progreso
    async actualizarProgreso(campanaId: string): Promise<void>
    
    // Reportes
    async getReporte(campanaId: string): Promise<CampanaReport>
}
```

---

## 🎨 UI/UX Pipeline Visual

```tsx
// Ejemplo de cómo debe verse el pipeline
<PipelineVisual 
  estadoActual="evaluaciones"
  pasos={[
    { id: 'registrado', label: 'Registro', icon: UserPlus, completado: true },
    { id: 'triage', label: 'Triage', icon: Stethoscope, completado: true },
    { id: 'evaluaciones', label: 'Evaluaciones', icon: Clipboard, completado: false, actual: true },
    { id: 'labs', label: 'Laboratorio', icon: Flask, completado: false },
    { id: 'imagen', label: 'Imagen', icon: XRay, completado: false },
    { id: 'integracion', label: 'Integración', icon: Brain, completado: false },
    { id: 'dictamen', label: 'Dictamen', icon: FileCheck, completado: false },
    { id: 'cerrado', label: 'Cerrado', icon: CheckCircle, completado: false }
  ]}
/>
```

---

## ✅ Checklist de Completado

### Database
- [ ] Tabla episodios creada
- [ ] Tabla campanas creada
- [ ] Tabla campanas_padron_temp creada
- [ ] Funciones SQL creadas (puede_cerrar_episodio, next_best_action)
- [ ] Triggers para folio automático
- [ ] Políticas RLS configuradas

### Frontend
- [ ] Componente EpisodioDetail
- [ ] Componente PipelineVisual
- [ ] Componente CampanasList
- [ ] Componente CampanaDetail
- [ ] Componente CargaMasiva

### Servicios
- [ ] episodioService.ts
- [ ] campanaService.ts

### Integración
- [ ] Funciona con Clinical Core
- [ ] Funciona con Dictamen Engine
- [ ] Actualización de estados en tiempo real

---

**Reportar a:** ERP Pro Coordinator  
**Dependencias:** Clinical Core (para crear episodios desde expedientes)  
**Bloquea a:** Dictamen Engine (necesita episodios completos)
