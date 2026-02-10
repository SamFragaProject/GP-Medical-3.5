-- =====================================================
-- GPMedical ERP Pro - Tablas Operativas Faltantes
-- Ejecutar en Supabase SQL Editor (una sola ejecución)
-- =====================================================
-- Tablas: cuentas_por_cobrar, pagos_cxc, cotizaciones,
--         campanias, padron_campania, ordenes_servicio,
--         espirometrias, estudios_visuales
-- =====================================================

-- Asegurarse que la función de trigger existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1. CUENTAS POR COBRAR (CxC)
-- =====================================================

CREATE TABLE IF NOT EXISTS cuentas_por_cobrar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    factura_id UUID,
    folio_factura VARCHAR(50),
    -- Cliente
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_rfc VARCHAR(13),
    -- Montos
    monto_original NUMERIC(12,2) NOT NULL DEFAULT 0,
    monto_pagado NUMERIC(12,2) NOT NULL DEFAULT 0,
    saldo_pendiente NUMERIC(12,2) NOT NULL DEFAULT 0,
    moneda VARCHAR(3) DEFAULT 'MXN',
    -- Estado
    estado VARCHAR(30) NOT NULL DEFAULT 'vigente'
        CHECK (estado IN ('vigente','vencida','pagada_parcial','pagada','cancelada','incobrable')),
    -- Fechas
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_ultimo_pago DATE,
    -- Aging
    dias_vencidos INTEGER DEFAULT 0,
    aging_bucket VARCHAR(10) DEFAULT '0-30',
    -- Notas
    notas TEXT,
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cxc_empresa ON cuentas_por_cobrar(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cxc_estado ON cuentas_por_cobrar(estado);
CREATE INDEX IF NOT EXISTS idx_cxc_vencimiento ON cuentas_por_cobrar(fecha_vencimiento);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_cxc_modtime ON cuentas_por_cobrar;
CREATE TRIGGER update_cxc_modtime BEFORE UPDATE ON cuentas_por_cobrar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. PAGOS CxC
-- =====================================================

CREATE TABLE IF NOT EXISTS pagos_cxc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuenta_id UUID NOT NULL REFERENCES cuentas_por_cobrar(id) ON DELETE CASCADE,
    monto NUMERIC(12,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL DEFAULT 'transferencia'
        CHECK (metodo_pago IN ('transferencia','efectivo','cheque','tarjeta','deposito','otro')),
    referencia VARCHAR(100),
    comprobante_url TEXT,
    -- Complemento CFDI
    complemento_cfdi BOOLEAN DEFAULT false,
    uuid_complemento VARCHAR(100),
    -- Notas
    notas TEXT,
    registrado_por UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_cxc_cuenta ON pagos_cxc(cuenta_id);

-- =====================================================
-- 3. COTIZACIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS cotizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    folio VARCHAR(30) NOT NULL,
    -- Cliente
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_rfc VARCHAR(13),
    cliente_email VARCHAR(255),
    cliente_telefono VARCHAR(20),
    contacto_nombre VARCHAR(255),
    -- Estado
    estado VARCHAR(30) NOT NULL DEFAULT 'borrador'
        CHECK (estado IN ('borrador','enviada','aceptada','rechazada','convertida','vencida')),
    -- Fechas
    fecha_emision DATE NOT NULL,
    fecha_vigencia DATE,
    fecha_aceptacion DATE,
    -- Montos
    conceptos JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12,2) DEFAULT 0,
    iva NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) DEFAULT 0,
    moneda VARCHAR(3) DEFAULT 'MXN',
    -- Relaciones
    campania_id UUID,
    factura_id UUID,
    -- Notas
    notas TEXT,
    terminos_condiciones TEXT,
    -- Tracking
    creado_por UUID,
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_empresa ON cotizaciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_folio ON cotizaciones(folio);

DROP TRIGGER IF EXISTS update_cotizaciones_modtime ON cotizaciones;
CREATE TRIGGER update_cotizaciones_modtime BEFORE UPDATE ON cotizaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. CAMPAÑAS MASIVAS
-- =====================================================

CREATE TABLE IF NOT EXISTS campanias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(30) NOT NULL DEFAULT 'periodico'
        CHECK (tipo IN ('preempleo','periodico','retorno','egreso','especial')),
    estado VARCHAR(30) NOT NULL DEFAULT 'borrador'
        CHECK (estado IN ('borrador','planificada','en_proceso','completada','cancelada')),
    -- Fechas
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    fecha_fin_real DATE,
    -- Servicios
    servicios JSONB DEFAULT '[]'::jsonb,
    -- Contacto
    contacto_nombre VARCHAR(255),
    contacto_email VARCHAR(255),
    contacto_telefono VARCHAR(20),
    -- Costos
    precio_por_trabajador NUMERIC(12,2),
    monto_total NUMERIC(12,2),
    -- Métricas
    total_trabajadores INTEGER DEFAULT 0,
    total_evaluados INTEGER DEFAULT 0,
    total_aptos INTEGER DEFAULT 0,
    total_restricciones INTEGER DEFAULT 0,
    total_no_aptos INTEGER DEFAULT 0,
    total_pendientes INTEGER DEFAULT 0,
    -- Tracking
    creado_por UUID,
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campanias_empresa ON campanias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_campanias_estado ON campanias(estado);

DROP TRIGGER IF EXISTS update_campanias_modtime ON campanias;
CREATE TRIGGER update_campanias_modtime BEFORE UPDATE ON campanias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. PADRÓN DE TRABAJADORES (por campaña)
-- =====================================================

CREATE TABLE IF NOT EXISTS padron_campania (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campania_id UUID NOT NULL REFERENCES campanias(id) ON DELETE CASCADE,
    -- Datos personales
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    numero_empleado VARCHAR(50),
    curp VARCHAR(18),
    nss VARCHAR(15),
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    puesto VARCHAR(100),
    area VARCHAR(100),
    antiguedad_anios NUMERIC(5,1),
    riesgo VARCHAR(30),
    -- Estado de evaluación
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','citado','en_proceso','evaluado','dictaminado','cerrado','no_presentado')),
    -- Resultados
    dictamen_resultado VARCHAR(30)
        CHECK (dictamen_resultado IS NULL OR dictamen_resultado IN ('apto','apto_restricciones','no_apto_temporal','no_apto_definitivo')),
    dictamen_observaciones TEXT,
    -- Relaciones
    paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
    episodio_id UUID,
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_padron_campania ON padron_campania(campania_id);
CREATE INDEX IF NOT EXISTS idx_padron_estado ON padron_campania(estado);

DROP TRIGGER IF EXISTS update_padron_modtime ON padron_campania;
CREATE TRIGGER update_padron_modtime BEFORE UPDATE ON padron_campania
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ÓRDENES DE SERVICIO
-- =====================================================

CREATE TABLE IF NOT EXISTS ordenes_servicio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio VARCHAR(30) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'empresa'
        CHECK (tipo IN ('interna','empresa','campania')),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    campania_id UUID REFERENCES campanias(id) ON DELETE SET NULL,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'borrador'
        CHECK (estado IN ('borrador','enviada','aceptada','en_proceso','completada','cancelada')),
    -- Datos de la orden
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_servicio DATE,
    fecha_entrega DATE,
    contacto_empresa VARCHAR(255),
    telefono_contacto VARCHAR(20),
    -- Servicios
    servicios JSONB DEFAULT '[]'::jsonb,
    total_servicios NUMERIC(12,2) DEFAULT 0,
    total_pacientes INTEGER DEFAULT 0,
    -- Tracking
    creado_por UUID,
    aprobado_por UUID,
    fecha_aprobacion TIMESTAMPTZ,
    notas_internas TEXT,
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_empresa ON ordenes_servicio(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_servicio(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_folio ON ordenes_servicio(folio);

DROP TRIGGER IF EXISTS update_ordenes_modtime ON ordenes_servicio;
CREATE TRIGGER update_ordenes_modtime BEFORE UPDATE ON ordenes_servicio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ESPIROMETRÍAS
-- =====================================================

CREATE TABLE IF NOT EXISTS espirometrias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    -- Datos del paciente al momento del estudio
    edad INTEGER,
    sexo VARCHAR(10),
    talla_cm NUMERIC(5,1),
    peso_kg NUMERIC(5,1),
    -- Valores medidos
    fvc NUMERIC(6,3),          -- Capacidad Vital Forzada (L)
    fev1 NUMERIC(6,3),         -- Vol. Espiratorio Forzado 1s (L)
    fev1_fvc NUMERIC(5,1),     -- Relación FEV1/FVC (%)
    pef NUMERIC(6,2),          -- Flujo Espiratorio Pico (L/s)
    fef_2575 NUMERIC(6,2),     -- Flujo Esp. Forzado 25-75% (L/s)
    -- Valores predichos
    fvc_predicho NUMERIC(6,3),
    fev1_predicho NUMERIC(6,3),
    fev1_fvc_predicho NUMERIC(5,1),
    -- Porcentajes del predicho
    fvc_porcentaje NUMERIC(5,1),
    fev1_porcentaje NUMERIC(5,1),
    -- Clasificación
    clasificacion VARCHAR(50),
    -- Calidad
    calidad_prueba VARCHAR(10),
    numero_intentos INTEGER,
    criterio_referencia VARCHAR(30) DEFAULT 'NHANES_III',
    -- Broncodilatador
    broncodilatador BOOLEAN DEFAULT false,
    respuesta_bd JSONB,
    -- Relaciones
    episodio_id UUID,
    campania_id UUID,
    -- Notas
    observaciones TEXT,
    realizado_por UUID,
    fecha_estudio DATE NOT NULL,
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_espiro_empresa ON espirometrias(empresa_id);
CREATE INDEX IF NOT EXISTS idx_espiro_paciente ON espirometrias(paciente_id);
CREATE INDEX IF NOT EXISTS idx_espiro_fecha ON espirometrias(fecha_estudio);

DROP TRIGGER IF EXISTS update_espiro_modtime ON espirometrias;
CREATE TRIGGER update_espiro_modtime BEFORE UPDATE ON espirometrias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ESTUDIOS VISUALES
-- =====================================================

CREATE TABLE IF NOT EXISTS estudios_visuales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    -- Agudeza visual (escala decimal 0.1-2.0)
    od_sin_correccion NUMERIC(3,1),  -- Ojo derecho sin corrección
    od_con_correccion NUMERIC(3,1),  -- Ojo derecho con corrección
    oi_sin_correccion NUMERIC(3,1),  -- Ojo izquierdo sin corrección
    oi_con_correccion NUMERIC(3,1),  -- Ojo izquierdo con corrección
    -- Ishihara (Daltonismo)
    ishihara_placas_total INTEGER DEFAULT 14,
    ishihara_placas_correctas INTEGER DEFAULT 14,
    ishihara_resultado VARCHAR(30) DEFAULT 'normal',
    -- Campimetría
    campimetria_realizada BOOLEAN DEFAULT false,
    -- Estereopsis
    estereopsis_segundos_arco INTEGER,
    estereopsis_normal BOOLEAN,
    -- Lentes
    usa_lentes BOOLEAN DEFAULT false,
    tipo_lentes VARCHAR(30),
    -- Clasificación y aptitud
    clasificacion VARCHAR(30),
    apto_para_puesto BOOLEAN DEFAULT true,
    restricciones JSONB DEFAULT '[]'::jsonb,
    -- Notas
    observaciones TEXT,
    referencia_oftalmologo BOOLEAN DEFAULT false,
    -- Relaciones
    episodio_id UUID,
    campania_id UUID,
    realizado_por UUID,
    fecha_estudio DATE NOT NULL,
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vision_empresa ON estudios_visuales(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vision_paciente ON estudios_visuales(paciente_id);
CREATE INDEX IF NOT EXISTS idx_vision_fecha ON estudios_visuales(fecha_estudio);

DROP TRIGGER IF EXISTS update_vision_modtime ON estudios_visuales;
CREATE TRIGGER update_vision_modtime BEFORE UPDATE ON estudios_visuales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. RLS POLICIES (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE cuentas_por_cobrar ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_cxc ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanias ENABLE ROW LEVEL SECURITY;
ALTER TABLE padron_campania ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE espirometrias ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudios_visuales ENABLE ROW LEVEL SECURITY;

-- Política permisiva temporal (para desarrollo)
-- En producción, filtrar por empresa_id del usuario
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'cuentas_por_cobrar', 'pagos_cxc', 'cotizaciones',
        'campanias', 'padron_campania', 'ordenes_servicio',
        'espirometrias', 'estudios_visuales'
    ]) LOOP
        -- SELECT policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'allow_select_' || t, t);
        EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (true)', 'allow_select_' || t, t);
        -- INSERT policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'allow_insert_' || t, t);
        EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (true)', 'allow_insert_' || t, t);
        -- UPDATE policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'allow_update_' || t, t);
        EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (true)', 'allow_update_' || t, t);
        -- DELETE policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'allow_delete_' || t, t);
        EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (true)', 'allow_delete_' || t, t);
    END LOOP;
END $$;

-- =====================================================
-- RESULTADO
-- =====================================================
SELECT '✅ Todas las tablas operativas creadas exitosamente' AS status;
