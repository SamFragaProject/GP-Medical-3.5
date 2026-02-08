# 📋 Dictamen Engine Specialist - GPMedical ERP Pro

## 🎯 Misión

Construir el **Sistema de Dictámenes Médico-Laborales** con reglas de negocio, restricciones codificadas, recomendaciones y firma electrónica.

---

## 📋 Entregables

### 1. Schema de Dictámenes

```sql
-- Tabla principal de dictámenes
CREATE TABLE dictamenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    episodio_id UUID REFERENCES episodios(id),
    paciente_id UUID REFERENCES pacientes(id),
    empresa_id UUID REFERENCES empresas(id),
    consulta_id UUID REFERENCES consultas(id),
    
    -- Folio único del dictamen
    folio VARCHAR(50) UNIQUE, -- AUTO: DIC-2026-00001
    
    -- Tipo de dictamen
    tipo_dictamen VARCHAR(50) NOT NULL, 
    -- 'apto', 'apto_restricciones', 'no_apto_temporal', 'no_apto_definitivo'
    
    -- Si es apto con restricciones
    restricciones JSONB, -- array de objetos {codigo, descripcion, temporal}
    
    -- Recomendaciones
    recomendaciones_medicas TEXT[],
    recomendaciones_epp TEXT[],
    observaciones TEXT,
    
    -- Vigencia
    vigencia_meses INTEGER DEFAULT 12,
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE,
    
    -- Médico responsable
    medico_id UUID REFERENCES usuarios(id),
    medico_nombre VARCHAR(200),
    medico_cedula VARCHAR(50),
    medico_especialidad VARCHAR(100),
    
    -- Firma digital
    firma_digital_url TEXT,
    firma_digital_hash TEXT, -- para verificación
    sello_digital_url TEXT,
    
    -- QR de verificación
    qr_verificacion_url TEXT,
    qr_codigo VARCHAR(100) UNIQUE,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'borrador', -- 'borrador', 'firmado', 'cancelado'
    
    -- PDF oficial
    pdf_url TEXT,
    
    -- Auditoría
    created_by UUID REFERENCES usuarios(id),
    updated_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    firmado_at TIMESTAMP
);

-- Trigger para generar folio automático
CREATE OR REPLACE FUNCTION generar_folio_dictamen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.folio := 'DIC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('folio_dictamen_seq')::TEXT, 5, '0');
    NEW.qr_codigo := encode(gen_random_bytes(16), 'hex');
    NEW.fecha_vencimiento := NEW.fecha_emision + (NEW.vigencia_meses || ' months')::INTERVAL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_folio_dictamen
BEFORE INSERT ON dictamenes
FOR EACH ROW
EXECUTE FUNCTION generar_folio_dictamen();
```

### 2. Catálogo de Restricciones

```sql
-- Catálogo de restricciones médico-laborales
CREATE TABLE catalogo_restricciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(100),
    
    -- Si es temporal o permanente
    es_temporal BOOLEAN DEFAULT TRUE,
    duracion_default_meses INTEGER, -- si es temporal
    
    -- Justificación médica
    justificacion TEXT,
    cie10_relacionados TEXT[],
    
    -- Puestos donde aplica
    aplica_a_todos BOOLEAN DEFAULT TRUE,
    puestos_especificos UUID[], -- si solo aplica a ciertos puestos
    
    -- Requiere revisión
    requiere_revision BOOLEAN DEFAULT FALSE,
    frecuencia_revision_meses INTEGER,
    
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar restricciones comunes
INSERT INTO catalogo_restricciones (codigo, descripcion, categoria, es_temporal) VALUES
('RES-001', 'No trabajar en alturas mayores a 1.8 metros', 'Alturas', FALSE),
('RES-002', 'No operar maquinaria pesada (montacargas, grúas)', 'Maquinaria', FALSE),
('RES-003', 'No exponerse a ruido mayor a 85 dB', 'Ruido', FALSE),
('RES-004', 'No realizar trabajo en espacios confinados', 'Espacios confinados', FALSE),
('RES-005', 'No manipular sustancias químicas sin EPP especializado', 'Químicos', FALSE),
('RES-006', 'No realizar trabajo que requiera agudeza visual perfecta', 'Visual', FALSE),
('RES-007', 'No realizar manipulación de cargas mayores a 15 kg', 'Cargas', FALSE),
('RES-008', 'No exponerse a vibración en manos/brazos', 'Vibración', FALSE),
('RES-009', 'Trabajo solo en horario diurno (no turnos nocturnos)', 'Horario', FALSE),
('RES-010', 'No conducir vehículos de la empresa', 'Conducción', FALSE),
('RES-011', 'Uso obligatorio de lentes correctivos durante la jornada', 'EPP', FALSE),
('RES-012', 'Uso obligatorio de protectores auditivos', 'EPP', FALSE),
('RES-013', 'Descansos auditivos cada 2 horas (15 min)', 'Descansos', TRUE),
('RES-014', 'No exponerse a temperaturas extremas', 'Térmico', FALSE),
('RES-015', 'Trabajo solo en áreas ventiladas', 'Ventilación', FALSE);
```

### 3. Restricciones por Puesto

```sql
-- Restricciones específicas por puesto
CREATE TABLE restricciones_puesto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    puesto_id UUID REFERENCES puestos(id),
    restriccion_id UUID REFERENCES catalogo_restricciones(id),
    
    -- Si es crítica (no negociable)
    es_critica BOOLEAN DEFAULT TRUE,
    
    -- Observaciones específicas
    observaciones TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ejemplos
-- Puesto: Operador montacargas
-- Restricciones críticas: visión, audición, equilibrio

-- Puesto: Electricista
-- Restricciones críticas: visión, reflejos, no convulsiones
```

### 4. Recomendaciones de EPP

```sql
CREATE TABLE catalogo_epp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    
    -- Norma aplicable
    norma VARCHAR(50), -- NOM-017-STPS, etc.
    
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO catalogo_epp (codigo, nombre, descripcion, categoria, norma) VALUES
('EPP-001', 'Casco de seguridad', 'Protección contra impactos', 'Cabeza', 'NOM-017-STPS'),
('EPP-002', 'Gafas de seguridad', 'Protección ocular', 'Ojos', 'NOM-017-STPS'),
('EPP-003', 'Tapones auditivos', 'Reducción de ruido 15-30 dB', 'Oídos', 'NOM-017-STPS'),
('EPP-004', 'Protectores auditivos de copa', 'Reducción de ruido 20-35 dB', 'Oídos', 'NOM-017-STPS'),
('EPP-005', 'Guantes de cuero', 'Protección contra cortes y abrasiones', 'Manos', 'NOM-017-STPS'),
('EPP-006', 'Guantes de nitrilo', 'Protección química', 'Manos', 'NOM-017-STPS'),
('EPP-007', 'Botas de seguridad punta de acero', 'Protección contra impactos', 'Pies', 'NOM-017-STPS'),
('EPP-008', 'Arnés de seguridad', 'Protección contra caídas', 'Cuerpo', 'NOM-004-STPS'),
('EPP-009', 'Mascarilla N95', 'Protección respiratoria', 'Respiración', 'NOM-116-STPS'),
('EPP-010', 'Respirador con filtros', 'Protección respiratoria especializada', 'Respiración', 'NOM-116-STPS'),
('EPP-011', 'Overol', 'Protección corporal general', 'Cuerpo', 'NOM-017-STPS'),
('EPP-012', 'Chaleco reflectivo', 'Alta visibilidad', 'Cuerpo', 'NOM-017-STPS'),
('EPP-013', 'Protector facial', 'Protección cara completa', 'Cara', 'NOM-017-STPS');
```

### 5. Validación de Dictamen

```sql
-- Función para validar si se puede emitir dictamen
CREATE OR REPLACE FUNCTION validar_dictamen(
    p_episodio_id UUID,
    p_tipo_dictamen VARCHAR,
    p_restricciones JSONB DEFAULT NULL
)
RETURNS TABLE (
    es_valido BOOLEAN,
    errores TEXT[]
) AS $$
DECLARE
    v_episodio RECORD;
    v_errores TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Obtener episodio
    SELECT * INTO v_episodio FROM episodios WHERE id = p_episodio_id;
    
    -- Validar que episodio existe
    IF v_episodio IS NULL THEN
        RETURN QUERY SELECT FALSE, ARRAY['Episodio no encontrado']::TEXT[];
        RETURN;
    END IF;
    
    -- Validar que está en estado correcto
    IF v_episodio.estado != 'integracion' THEN
        v_errores := array_append(v_errores, 
            'El episodio debe estar en estado "integracion". Estado actual: ' || v_episodio.estado);
    END IF;
    
    -- Validar estudios completos
    IF v_episodio.requiere_audiometria AND NOT v_episodio.audiometria_completada THEN
        v_errores := array_append(v_errores, 'Falta audiometría');
    END IF;
    
    IF v_episodio.requiere_espirometria AND NOT v_episodio.espirometria_completada THEN
        v_errores := array_append(v_errores, 'Falta espirometría');
    END IF;
    
    IF v_episodio.requiere_rx AND NOT v_episodio.rx_completada THEN
        v_errores := array_append(v_errores, 'Falta Rayos X');
    END IF;
    
    IF v_episodio.requiere_laboratorio AND NOT v_episodio.laboratorio_completado THEN
        v_errores := array_append(v_errores, 'Falta laboratorio');
    END IF;
    
    -- Validar tipo de dictamen
    IF p_tipo_dictamen = 'apto' THEN
        -- No debe tener hallazgos significativos
        -- Esto se valida en el frontend/backend
        NULL;
    END IF;
    
    IF p_tipo_dictamen = 'apto_restricciones' THEN
        -- Debe tener al menos una restricción
        IF p_restricciones IS NULL OR jsonb_array_length(p_restricciones) = 0 THEN
            v_errores := array_append(v_errores, 
                'Para dictamen "apto con restricciones" debe especificar al menos una restricción');
        END IF;
    END IF;
    
    IF p_tipo_dictamen = 'no_apto_temporal' THEN
        -- Debe tener justificación médica
        NULL; -- Se valida en frontend
    END IF;
    
    IF array_length(v_errores, 1) > 0 THEN
        RETURN QUERY SELECT FALSE, v_errores;
    ELSE
        RETURN QUERY SELECT TRUE, ARRAY[]::TEXT[];
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 🖥️ Componentes React

### Páginas a Crear

1. **DictamenForm.tsx**
   - Formulario completo de dictamen
   - Selector de tipo (apto/restricciones/no apto)
   - Multi-select de restricciones
   - Multi-select de recomendaciones
   - Editor de observaciones
   - Preview de dictamen

2. **FirmaDictamen.tsx**
   - Área de firma digital
   - Validación de cédula profesional
   - Confirmación de firma
   - QR de verificación

3. **DictamenPDF.tsx**
   - Vista previa del PDF oficial
   - Campos del dictamen formateados
   - Firmas y sellos
   - QR de verificación

4. **DictamenVerify.tsx**
   - Página pública de verificación
   - Input del QR o folio
   - Muestra datos del dictamen
   - Valida autenticidad

5. **HistorialDictamenes.tsx**
   - Lista de dictámenes del paciente
   - Filtros por vigencia
   - Descarga de PDFs

### Componentes de Dictamen

1. **TipoDictamenSelector.tsx**
   - Cards seleccionables
   - Apto (verde)
   - Apto con restricciones (amarillo)
   - No apto temporal (rojo)
   - Descripción de cada uno

2. **RestriccionesSelector.tsx**
   - Lista de restricciones del catálogo
   - Checkbox por cada una
   - Filtro por categoría
   - Búsqueda

3. **RecomendacionesSelector.tsx**
   - EPP recomendado
   - Recomendaciones médicas
   - Templates comunes

4. **VigenciaCalculator.tsx**
   - Input de meses
   - Cálculo automático de fecha vencimiento
   - Alerta si es menor a lo recomendado

---

## 🔄 Servicios

### dictamenService.ts

```typescript
export const dictamenService = {
    // CRUD
    async create(data: CreateDictamenDTO): Promise<Dictamen>
    async getById(id: string): Promise<Dictamen | null>
    async getByEpisodio(episodioId: string): Promise<Dictamen | null>
    async update(id: string, data: UpdateDictamenDTO): Promise<Dictamen>
    
    // Validaciones
    async validar(data: ValidarDictamenDTO): Promise<ValidacionResult>
    async puedeEmitir(episodioId: string): Promise<boolean>
    
    // Firma
    async firmar(id: string, firmaData: FirmaData): Promise<Dictamen>
    async verificarFirma(id: string): Promise<boolean>
    
    // Catálogos
    async getRestricciones(): Promise<Restriccion[]>
    async getRestriccionesPorPuesto(puestoId: string): Promise<Restriccion[]>
    async getEPP(): Promise<EPP[]>
    
    // Verificación pública
    async verificarPorQR(codigo: string): Promise<DictamenPublicInfo | null>
    async verificarPorFolio(folio: string): Promise<DictamenPublicInfo | null>
    
    // PDF
    async generarPDF(id: string): Promise<Blob>
    async getPDFUrl(id: string): Promise<string>
    
    // Historial
    async getByPaciente(pacienteId: string): Promise<Dictamen[]>
    async getVigentesByEmpresa(empresaId: string): Promise<Dictamen[]>
    async getPorVencer(dias: number): Promise<Dictamen[]>
}
```

---

## 📄 Formato del Dictamen PDF

El dictamen PDF debe incluir:

1. **Encabezado**
   - Logo de la clínica
   - Folio del dictamen
   - Fecha de emisión
   - QR de verificación

2. **Datos del Paciente**
   - Nombre completo
   - RFC
   - CURP
   - Edad, sexo

3. **Datos de la Empresa**
   - Nombre de la empresa
   - Puesto del trabajador
   - Área/Departamento

4. **Tipo de Evaluación**
   - Preempleo / Periódico / Retorno / Egreso
   - Fecha de la evaluación

5. **Resultado**
   - APTO / APTO CON RESTRICCIONES / NO APTO TEMPORAL
   - Con letras grandes y color

6. **Restricciones** (si aplica)
   - Lista numerada
   - Duración de cada una

7. **Recomendaciones**
   - EPP específico
   - Recomendaciones médicas
   - Medidas preventivas

8. **Vigencia**
   - Fecha de emisión
   - Fecha de vencimiento
   - Período de validez

9. **Médico Responsable**
   - Nombre completo
   - Cédula profesional
   - Especialidad
   - Firma digital
   - Sello digital

10. **Pie de página**
    - Leyendas legales
    - Información de contacto
    - Aviso de confidencialidad

---

## ✅ Checklist de Completado

### Database
- [ ] Tabla dictamenes creada
- [ ] Tabla catalogo_restricciones creada
- [ ] Tabla restricciones_puesto creada
- [ ] Tabla catalogo_epp creada
- [ ] Funciones de validación creadas
- [ ] Triggers para folio automático

### Frontend
- [ ] Componente DictamenForm
- [ ] Componente FirmaDictamen
- [ ] Componente DictamenPDF
- [ ] Componente DictamenVerify
- [ ] Componente HistorialDictamenes

### Servicios
- [ ] dictamenService.ts

### Seguridad
- [ ] Firma digital implementada
- [ ] QR de verificación funcional
- [ ] PDF con protección

---

**Reportar a:** ERP Pro Coordinator  
**Dependencias:** Clinical Core, Workflow Engine  
**Bloquea a:** Executive Dashboard (necesita datos de dictámenes)
