/**
 * Script para crear las tablas definitivas del ERP Médico y poblar el catálogo de parámetros.
 * Usa la Supabase Management API para ejecutar SQL directamente.
 * 
 * USO: node run_migration.mjs <SUPABASE_ACCESS_TOKEN>
 * 
 * El access token se obtiene de: https://supabase.com/dashboard/account/tokens
 */

const PROJECT_ID = 'kftxftikoydldcexkady'
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`

const ACCESS_TOKEN = process.argv[2]
if (!ACCESS_TOKEN) {
    console.error('❌ Uso: node run_migration.mjs <SUPABASE_ACCESS_TOKEN>')
    console.error('   Obtén tu token en: https://supabase.com/dashboard/account/tokens')
    process.exit(1)
}

async function runSQL(sql, label) {
    console.log(`\n⏳ ${label}...`)
    const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ query: sql }),
    })

    if (!res.ok) {
        const text = await res.text()
        console.error(`❌ Error (${res.status}): ${text}`)
        return false
    }

    const data = await res.json()
    if (data.error) {
        console.error(`❌ SQL Error: ${data.error}`)
        return false
    }
    console.log(`✅ ${label} — OK`)
    return true
}

// ============================================================
// PASO 1: CREAR TABLAS
// ============================================================

const MIGRATION_SQL = `
-- 0. CATÁLOGO MAESTRO
CREATE TABLE IF NOT EXISTS parametros_catalogo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    nombre_display TEXT NOT NULL,
    categoria TEXT NOT NULL,
    tipo_estudio TEXT NOT NULL,
    unidad TEXT DEFAULT '',
    rango_ref_min NUMERIC,
    rango_ref_max NUMERIC,
    rango_ref_texto TEXT,
    es_numerico BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID,
    UNIQUE(nombre, tipo_estudio)
);

-- 1. ESTUDIOS CLÍNICOS
CREATE TABLE IF NOT EXISTS estudios_clinicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo_estudio TEXT NOT NULL,
    fecha_estudio DATE NOT NULL DEFAULT CURRENT_DATE,
    archivo_origen TEXT,
    medico_responsable TEXT,
    cedula_medico TEXT,
    equipo TEXT,
    institucion TEXT DEFAULT 'GP Medical Health',
    interpretacion TEXT,
    diagnostico TEXT,
    clasificacion TEXT,
    calidad TEXT,
    datos_extra JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_estudios_paciente ON estudios_clinicos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_estudios_tipo ON estudios_clinicos(tipo_estudio);
CREATE INDEX IF NOT EXISTS idx_estudios_fecha ON estudios_clinicos(fecha_estudio DESC);

-- 2. RESULTADOS
CREATE TABLE IF NOT EXISTS resultados_estudio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudio_id UUID NOT NULL REFERENCES estudios_clinicos(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    parametro_id UUID REFERENCES parametros_catalogo(id),
    parametro_nombre TEXT NOT NULL,
    categoria TEXT,
    resultado TEXT NOT NULL,
    resultado_numerico NUMERIC,
    unidad TEXT,
    rango_ref_min NUMERIC,
    rango_ref_max NUMERIC,
    rango_ref_texto TEXT,
    bandera TEXT DEFAULT 'normal',
    observacion TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resultados_estudio ON resultados_estudio(estudio_id);
CREATE INDEX IF NOT EXISTS idx_resultados_paciente ON resultados_estudio(paciente_id);
CREATE INDEX IF NOT EXISTS idx_resultados_bandera ON resultados_estudio(bandera) WHERE bandera != 'normal';

-- 3. GRÁFICAS
CREATE TABLE IF NOT EXISTS graficas_estudio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudio_id UUID NOT NULL REFERENCES estudios_clinicos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    eje_x_label TEXT,
    eje_y_label TEXT,
    puntos JSONB NOT NULL DEFAULT '[]',
    tipo_grafica TEXT DEFAULT 'linea',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ANTECEDENTES
CREATE TABLE IF NOT EXISTS antecedentes_paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    campo TEXT NOT NULL,
    valor TEXT,
    valor_booleano BOOLEAN,
    quien TEXT,
    observaciones TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID,
    UNIQUE(paciente_id, tipo, campo)
);

CREATE INDEX IF NOT EXISTS idx_antecedentes_paciente ON antecedentes_paciente(paciente_id);

-- 5. EXPLORACIONES FÍSICAS
CREATE TABLE IF NOT EXISTS exploraciones_fisicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    fecha_exploracion TIMESTAMPTZ DEFAULT now(),
    medico_responsable TEXT,
    peso_kg NUMERIC, talla_cm NUMERIC, imc NUMERIC,
    ta_sistolica INT, ta_diastolica INT,
    fc INT, fr INT, temperatura NUMERIC, spo2 INT,
    perimetro_abdominal NUMERIC,
    glucosa_capilar NUMERIC,
    cabeza TEXT, ojos TEXT, oidos TEXT, nariz TEXT, boca TEXT,
    cuello TEXT, torax TEXT, abdomen TEXT,
    extremidades_superiores TEXT, extremidades_inferiores TEXT,
    columna TEXT, piel TEXT, neurologico TEXT, genitourinario TEXT,
    datos_extra JSONB DEFAULT '{}',
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_explor_paciente ON exploraciones_fisicas(paciente_id);

-- 6. NOTAS MÉDICAS
CREATE TABLE IF NOT EXISTS notas_medicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo TEXT DEFAULT 'evolucion',
    contenido TEXT NOT NULL,
    medico_responsable TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notas_paciente ON notas_medicas(paciente_id);

-- 7. CONSENTIMIENTOS
CREATE TABLE IF NOT EXISTS consentimientos_firmados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo_consentimiento TEXT NOT NULL,
    fecha_firma TIMESTAMPTZ DEFAULT now(),
    firmado BOOLEAN DEFAULT false,
    firma_url TEXT,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. DICTÁMENES
CREATE TABLE IF NOT EXISTS dictamenes_aptitud (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    aptitud TEXT NOT NULL,
    restricciones TEXT,
    puesto TEXT, empresa TEXT,
    medico_evaluador TEXT, cedula TEXT,
    fecha_evaluacion DATE DEFAULT CURRENT_DATE,
    fecha_proxima_evaluacion DATE,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
`

const RLS_SQL = `
ALTER TABLE parametros_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudios_clinicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE graficas_estudio ENABLE ROW LEVEL SECURITY;
ALTER TABLE antecedentes_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE exploraciones_fisicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimientos_firmados ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictamenes_aptitud ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parametros_catalogo' AND policyname = 'catalogo_all') THEN
        CREATE POLICY catalogo_all ON parametros_catalogo FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estudios_clinicos' AND policyname = 'estudios_all') THEN
        CREATE POLICY estudios_all ON estudios_clinicos FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resultados_estudio' AND policyname = 'resultados_all') THEN
        CREATE POLICY resultados_all ON resultados_estudio FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'graficas_estudio' AND policyname = 'graficas_all') THEN
        CREATE POLICY graficas_all ON graficas_estudio FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'antecedentes_paciente' AND policyname = 'antecedentes_all') THEN
        CREATE POLICY antecedentes_all ON antecedentes_paciente FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exploraciones_fisicas' AND policyname = 'exploraciones_all') THEN
        CREATE POLICY exploraciones_all ON exploraciones_fisicas FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notas_medicas' AND policyname = 'notas_all') THEN
        CREATE POLICY notas_all ON notas_medicas FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'consentimientos_firmados' AND policyname = 'consentimientos_all') THEN
        CREATE POLICY consentimientos_all ON consentimientos_firmados FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dictamenes_aptitud' AND policyname = 'dictamenes_all') THEN
        CREATE POLICY dictamenes_all ON dictamenes_aptitud FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
`

// ============================================================
// PASO 2: CATÁLOGO DE PARÁMETROS COMPLETO
// Extraído exhaustivamente de los 12 archivos MD
// ============================================================

function buildCatalogSQL() {
    const params = [
        // ── LABORATORIO: Biometría Hemática — Fórmula Roja (orden 1-7) ──
        { n: 'eritrocitos', d: 'Eritrocitos', c: 'Biometría Hemática - Fórmula Roja', t: 'laboratorio', u: 'millones/uL', mn: 4.7, mx: 6.1, num: true, o: 1 },
        { n: 'hemoglobina', d: 'Hemoglobina', c: 'Biometría Hemática - Fórmula Roja', t: 'laboratorio', u: 'g/dL', mn: 14.0, mx: 18.0, num: true, o: 2 },
        { n: 'hematocrito', d: 'Hematocrito', c: 'Biometría Hemática - Fórmula Roja', t: 'laboratorio', u: '%', mn: 42.0, mx: 54.0, num: true, o: 3 },
        { n: 'vcm', d: 'Volumen Corpuscular Medio (VCM)', c: 'Biometría Hemática - Fórmula Roja', t: 'laboratorio', u: 'fL', mn: 80.0, mx: 100.0, num: true, o: 4 },
        { n: 'hcm', d: 'Concentración Media de Hb (HCM)', c: 'Biometría Hemática - Fórmula Roja', t: 'laboratorio', u: 'pg', mn: 30.0, mx: 35.0, num: true, o: 5 },
        { n: 'cmhc', d: 'CMHC', c: 'Biometría Hemática - Fórmula Roja', t: 'laboratorio', u: 'g/dL', mn: 31.0, mx: 37.0, num: true, o: 6 },
        { n: 'rdw_cv', d: 'RDW-CV', c: 'Biometría Hemática - Fórmula Roja', t: 'laboratorio', u: '%', mn: 11.5, mx: 15.0, num: true, o: 7 },
        // ── LABORATORIO: Serie Plaquetaria (orden 8-9) ──
        { n: 'plaquetas', d: 'Plaquetas', c: 'Biometría Hemática - Serie Plaquetaria', t: 'laboratorio', u: 'x10^3/mm3', mn: 150, mx: 450, num: true, o: 8 },
        { n: 'vpm', d: 'Volumen Plaquetario Medio (VPM)', c: 'Biometría Hemática - Serie Plaquetaria', t: 'laboratorio', u: 'fl', mn: 7.4, mx: 11.0, num: true, o: 9 },
        // ── LABORATORIO: Fórmula Blanca (orden 10-17) ──
        { n: 'leucocitos_totales', d: 'Leucocitos totales', c: 'Biometría Hemática - Fórmula Blanca', t: 'laboratorio', u: 'x10^3/mm3', mn: 4.0, mx: 12.0, num: true, o: 10 },
        { n: 'neutrofilos_totales', d: 'Neutrófilos totales', c: 'Biometría Hemática - Fórmula Blanca', t: 'laboratorio', u: '%', mn: 45.0, mx: 70.0, num: true, o: 11 },
        { n: 'neutrofilos_segmentados', d: 'Neutrófilos segmentados', c: 'Biometría Hemática - Fórmula Blanca', t: 'laboratorio', u: '%', mn: 45.0, mx: 63.6, num: true, o: 12 },
        { n: 'neutrofilos_banda', d: 'Neutrófilos en banda', c: 'Biometría Hemática - Fórmula Blanca', t: 'laboratorio', u: '%', mn: 1.0, mx: 4.0, num: true, o: 13 },
        { n: 'eosinofilos', d: 'Eosinófilos', c: 'Biometría Hemática - Fórmula Blanca', t: 'laboratorio', u: '%', mn: 1.0, mx: 4.0, num: true, o: 14 },
        { n: 'basofilos', d: 'Basófilos', c: 'Biometría Hemática - Fórmula Blanca', t: 'laboratorio', u: '%', mn: 0.0, mx: 1.0, num: true, o: 15 },
        { n: 'monocitos', d: 'Monocitos', c: 'Biometría Hemática - Fórmula Blanca', t: 'laboratorio', u: '%', mn: 2.0, mx: 8.0, num: true, o: 16 },
        { n: 'linfocitos', d: 'Linfocitos', c: 'Biometría Hemática - Fórmula Blanca', t: 'laboratorio', u: '%', mn: 25.0, mx: 43.6, num: true, o: 17 },
        // ── LABORATORIO: Química Sanguínea (orden 18-21) ──
        { n: 'glucosa', d: 'Glucosa', c: 'Química Sanguínea', t: 'laboratorio', u: 'mg/dL', mn: 70, mx: 100, num: true, o: 18 },
        { n: 'urea', d: 'Urea', c: 'Química Sanguínea', t: 'laboratorio', u: 'mg/dL', mn: 15, mx: 45, num: true, o: 19 },
        { n: 'bun', d: 'Nitrógeno Ureico Sérico (BUN)', c: 'Química Sanguínea', t: 'laboratorio', u: 'mg/dL', mn: 7.7, mx: 22.6, num: true, o: 20 },
        { n: 'creatinina', d: 'Creatinina', c: 'Química Sanguínea', t: 'laboratorio', u: 'mg/dL', mn: 0.6, mx: 1.1, num: true, o: 21 },
        // ── LABORATORIO: EGO Macroscópico (orden 22-23) ──
        { n: 'ego_color', d: 'Color', c: 'EGO - Macroscópico', t: 'laboratorio', u: '', rt: 'Amarillo', num: false, o: 22 },
        { n: 'ego_aspecto', d: 'Aspecto', c: 'EGO - Macroscópico', t: 'laboratorio', u: '', rt: 'Transparente', num: false, o: 23 },
        // ── LABORATORIO: EGO Físico-Químico (orden 24-33) ──
        { n: 'ego_densidad', d: 'Densidad', c: 'EGO - Físico-Químico', t: 'laboratorio', u: '', mn: 1.010, mx: 1.025, num: true, o: 24 },
        { n: 'ego_ph', d: 'pH', c: 'EGO - Físico-Químico', t: 'laboratorio', u: '', mn: 4.5, mx: 8.0, num: true, o: 25 },
        { n: 'ego_glucosa', d: 'Glucosa (Orina)', c: 'EGO - Físico-Químico', t: 'laboratorio', u: '', rt: 'Negativo', num: false, o: 26 },
        { n: 'ego_proteinas', d: 'Proteínas', c: 'EGO - Físico-Químico', t: 'laboratorio', u: '', rt: 'Negativo', num: false, o: 27 },
        { n: 'ego_sangre', d: 'Sangre', c: 'EGO - Físico-Químico', t: 'laboratorio', u: '', rt: 'Negativo', num: false, o: 28 },
        { n: 'ego_cuerpos_cetonicos', d: 'Cuerpos Cetónicos', c: 'EGO - Físico-Químico', t: 'laboratorio', u: '', rt: 'Negativo', num: false, o: 29 },
        { n: 'ego_bilirrubina', d: 'Bilirrubina', c: 'EGO - Físico-Químico', t: 'laboratorio', u: '', rt: 'Negativo', num: false, o: 30 },
        { n: 'ego_urobilinogeno', d: 'Urobilinógeno', c: 'EGO - Físico-Químico', t: 'laboratorio', u: 'E.U./dL', mn: 0.2, mx: 0.2, num: true, o: 31 },
        { n: 'ego_nitritos', d: 'Nitritos', c: 'EGO - Físico-Químico', t: 'laboratorio', u: '', rt: 'Negativo', num: false, o: 32 },
        { n: 'ego_esterasa_leuco', d: 'Esterasa Leucocitaria', c: 'EGO - Físico-Químico', t: 'laboratorio', u: '', rt: 'Negativo', num: false, o: 33 },
        // ── LABORATORIO: EGO Microscópico (orden 34-37) ──
        { n: 'ego_celulas_epiteliales', d: 'Células Epiteliales', c: 'EGO - Microscópico', t: 'laboratorio', u: '', rt: 'Escasas', num: false, o: 34 },
        { n: 'ego_leucocitos', d: 'Leucocitos (Orina)', c: 'EGO - Microscópico', t: 'laboratorio', u: 'por campo', mn: 0, mx: 5, num: true, o: 35 },
        { n: 'ego_bacterias', d: 'Bacterias', c: 'EGO - Microscópico', t: 'laboratorio', u: '', rt: 'Ausentes', num: false, o: 36 },
        { n: 'ego_eritrocitos', d: 'Eritrocitos (Orina)', c: 'EGO - Microscópico', t: 'laboratorio', u: 'por campo', mn: 0, mx: 0, num: true, o: 37 },
        // ── LABORATORIO: EGO Cristaluria (orden 38-39) ──
        { n: 'ego_cristales_caox', d: 'Cristales CaOx dihidratado', c: 'EGO - Cristaluria', t: 'laboratorio', u: '', rt: 'Ausentes', num: false, o: 38 },
        { n: 'ego_uratos_amorfos', d: 'Uratos amorfos', c: 'EGO - Cristaluria', t: 'laboratorio', u: '', rt: 'Ausentes', num: false, o: 39 },

        // ── AUDIOMETRÍA: Oído Derecho VA (orden 1-11) ──
        { n: 'od_125', d: 'Umbral VA OD 125 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 1 },
        { n: 'od_250', d: 'Umbral VA OD 250 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 2 },
        { n: 'od_500', d: 'Umbral VA OD 500 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 3 },
        { n: 'od_750', d: 'Umbral VA OD 750 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 4 },
        { n: 'od_1000', d: 'Umbral VA OD 1000 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 5 },
        { n: 'od_1500', d: 'Umbral VA OD 1500 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 6 },
        { n: 'od_2000', d: 'Umbral VA OD 2000 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 7 },
        { n: 'od_3000', d: 'Umbral VA OD 3000 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 8 },
        { n: 'od_4000', d: 'Umbral VA OD 4000 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 9 },
        { n: 'od_6000', d: 'Umbral VA OD 6000 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 10 },
        { n: 'od_8000', d: 'Umbral VA OD 8000 Hz', c: 'Audiometría Tonal - Oído Derecho', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 11 },
        // ── AUDIOMETRÍA: Oído Izquierdo VA (orden 12-22) ──
        { n: 'oi_125', d: 'Umbral VA OI 125 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 12 },
        { n: 'oi_250', d: 'Umbral VA OI 250 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 13 },
        { n: 'oi_500', d: 'Umbral VA OI 500 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 14 },
        { n: 'oi_750', d: 'Umbral VA OI 750 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 15 },
        { n: 'oi_1000', d: 'Umbral VA OI 1000 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 16 },
        { n: 'oi_1500', d: 'Umbral VA OI 1500 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 17 },
        { n: 'oi_2000', d: 'Umbral VA OI 2000 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 18 },
        { n: 'oi_3000', d: 'Umbral VA OI 3000 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 19 },
        { n: 'oi_4000', d: 'Umbral VA OI 4000 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 20 },
        { n: 'oi_6000', d: 'Umbral VA OI 6000 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 21 },
        { n: 'oi_8000', d: 'Umbral VA OI 8000 Hz', c: 'Audiometría Tonal - Oído Izquierdo', t: 'audiometria', u: 'dB HL', mn: 0, mx: 25, num: true, o: 22 },

        // ── ESPIROMETRÍA (orden 1-11) ──
        { n: 'fvc', d: 'FVC', c: 'Espirometría', t: 'espirometria', u: 'L', rt: '>4.15', num: true, o: 1 },
        { n: 'fev1', d: 'FEV1', c: 'Espirometría', t: 'espirometria', u: 'L', rt: '>3.44', num: true, o: 2 },
        { n: 'fev1_fvc', d: 'FEV1/FVC', c: 'Espirometría', t: 'espirometria', u: '', rt: '>0.745', num: true, o: 3 },
        { n: 'fef25_75', d: 'FEF25-75', c: 'Espirometría', t: 'espirometria', u: 'L/s', rt: '>2.90', num: true, o: 4 },
        { n: 'pef', d: 'PEF', c: 'Espirometría', t: 'espirometria', u: 'L/s', rt: '>7.30', num: true, o: 5 },
        { n: 'fet', d: 'FET', c: 'Espirometría', t: 'espirometria', u: 's', num: true, o: 6 },
        { n: 'spiro_peso', d: 'Peso', c: 'Datos Demográficos', t: 'espirometria', u: 'kg', num: true, o: 7 },
        { n: 'spiro_altura', d: 'Altura', c: 'Datos Demográficos', t: 'espirometria', u: 'cm', num: true, o: 8 },
        { n: 'spiro_imc', d: 'IMC', c: 'Datos Demográficos', t: 'espirometria', u: 'kg/m2', num: true, o: 9 },
        { n: 'spiro_edad', d: 'Edad', c: 'Datos Demográficos', t: 'espirometria', u: 'años', num: true, o: 10 },
        { n: 'spiro_calidad', d: 'Calidad de la sesión', c: 'Calidad', t: 'espirometria', u: '', num: false, o: 11 },

        // ── ELECTROCARDIOGRAMA: Intervalos (orden 1-7) ──
        { n: 'ecg_fc', d: 'Frecuencia Cardiaca (FC)', c: 'Intervalos ECG', t: 'electrocardiograma', u: 'lpm', num: true, o: 1 },
        { n: 'ecg_rr', d: 'Intervalo RR', c: 'Intervalos ECG', t: 'electrocardiograma', u: 'ms', num: true, o: 2 },
        { n: 'ecg_p', d: 'Duración P / Onda P', c: 'Intervalos ECG', t: 'electrocardiograma', u: 'ms', num: true, o: 3 },
        { n: 'ecg_pr', d: 'Intervalo PQ (PR)', c: 'Intervalos ECG', t: 'electrocardiograma', u: 'ms', num: true, o: 4 },
        { n: 'ecg_qrs', d: 'Duración QRS', c: 'Intervalos ECG', t: 'electrocardiograma', u: 'ms', num: true, o: 5 },
        { n: 'ecg_qt', d: 'Intervalo QT', c: 'Intervalos ECG', t: 'electrocardiograma', u: 'ms', num: true, o: 6 },
        { n: 'ecg_qtc', d: 'QTc (Bazett)', c: 'Intervalos ECG', t: 'electrocardiograma', u: 'ms', num: true, o: 7 },
        // ── ELECTROCARDIOGRAMA: Ejes (orden 8-10) ──
        { n: 'ecg_eje_p', d: 'Eje P', c: 'Ejes ECG', t: 'electrocardiograma', u: '°', num: true, o: 8 },
        { n: 'ecg_eje_qrs', d: 'Eje QRS', c: 'Ejes ECG', t: 'electrocardiograma', u: '°', num: true, o: 9 },
        { n: 'ecg_eje_t', d: 'Eje T', c: 'Ejes ECG', t: 'electrocardiograma', u: '°', num: true, o: 10 },
        // ── ELECTROCARDIOGRAMA: Config (orden 11-12) ──
        { n: 'ecg_vel_papel', d: 'Velocidad del papel', c: 'Configuración ECG', t: 'electrocardiograma', u: 'mm/sec', num: true, o: 11 },
        { n: 'ecg_sensibilidad', d: 'Sensibilidad/Amplitud', c: 'Configuración ECG', t: 'electrocardiograma', u: 'mm/mV', num: true, o: 12 },
        // ── ELECTROCARDIOGRAMA: Análisis morfológico (orden 13-18) ──
        { n: 'ecg_ritmo', d: 'Ritmo', c: 'Análisis Morfológico', t: 'electrocardiograma', u: '', num: false, o: 13 },
        { n: 'ecg_conduccion_av', d: 'Conducción AV', c: 'Análisis Morfológico', t: 'electrocardiograma', u: '', num: false, o: 14 },
        { n: 'ecg_morfologia', d: 'Morfología eléctrica', c: 'Análisis Morfológico', t: 'electrocardiograma', u: '', num: false, o: 15 },
        { n: 'ecg_segmento_st', d: 'Segmento ST', c: 'Análisis Morfológico', t: 'electrocardiograma', u: '', num: false, o: 16 },
        { n: 'ecg_ondas_t', d: 'Ondas T', c: 'Análisis Morfológico', t: 'electrocardiograma', u: '', num: false, o: 17 },
        { n: 'ecg_hipertrofia', d: 'Hipertrofia', c: 'Análisis Morfológico', t: 'electrocardiograma', u: '', num: false, o: 18 },
        { n: 'ecg_alt_repolariz', d: 'Alteraciones de repolarización', c: 'Análisis Morfológico', t: 'electrocardiograma', u: '', num: false, o: 19 },

        // ── OPTOMETRÍA (orden 1-10) ──
        { n: 'av_lejana_od_sc', d: 'AV Lejana OD Sin Lentes', c: 'Optometría', t: 'optometria', u: 'Snellen', rt: '20/20', num: false, o: 1 },
        { n: 'av_lejana_oi_sc', d: 'AV Lejana OI Sin Lentes', c: 'Optometría', t: 'optometria', u: 'Snellen', rt: '20/20', num: false, o: 2 },
        { n: 'av_lejana_od_cc', d: 'AV Lejana OD Con Lentes', c: 'Optometría', t: 'optometria', u: 'Snellen', rt: '20/20', num: false, o: 3 },
        { n: 'av_lejana_oi_cc', d: 'AV Lejana OI Con Lentes', c: 'Optometría', t: 'optometria', u: 'Snellen', rt: '20/20', num: false, o: 4 },
        { n: 'av_cercana_od_sc', d: 'AV Cercana OD Sin Lentes', c: 'Optometría', t: 'optometria', u: 'Jaeger', num: false, o: 5 },
        { n: 'av_cercana_oi_sc', d: 'AV Cercana OI Sin Lentes', c: 'Optometría', t: 'optometria', u: 'Jaeger', num: false, o: 6 },
        { n: 'av_cercana_od_cc', d: 'AV Cercana OD Con Lentes', c: 'Optometría', t: 'optometria', u: 'Jaeger', num: false, o: 7 },
        { n: 'av_cercana_oi_cc', d: 'AV Cercana OI Con Lentes', c: 'Optometría', t: 'optometria', u: 'Jaeger', num: false, o: 8 },
        { n: 'vision_cromatica', d: 'Visión Cromática (Ishihara)', c: 'Optometría', t: 'optometria', u: '', rt: 'Normal', num: false, o: 9 },
        { n: 'campimetria', d: 'Campimetría de Confrontación', c: 'Optometría', t: 'optometria', u: '', rt: 'Campos Completos', num: false, o: 10 },

        // ── RADIOGRAFÍA (orden 1-9) ──
        { n: 'rx_proyeccion', d: 'Proyección', c: 'Datos del Estudio', t: 'radiografia', u: '', num: false, o: 1 },
        { n: 'rx_region_anatomica', d: 'Región Anatómica', c: 'Datos del Estudio', t: 'radiografia', u: '', num: false, o: 2 },
        { n: 'rx_ei', d: 'Índice de Exposición (EI)', c: 'Parámetros Técnicos', t: 'radiografia', u: '', num: true, o: 3 },
        { n: 'rx_tiempo_exp', d: 'Tiempo de exposición', c: 'Parámetros Técnicos', t: 'radiografia', u: 'ms', num: true, o: 4 },
        { n: 'rx_mas', d: 'Carga del tubo (mAs)', c: 'Parámetros Técnicos', t: 'radiografia', u: 'mAs', num: true, o: 5 },
        { n: 'rx_cobb_lumbar', d: 'Cobb lumbar', c: 'Radiología Columna', t: 'radiografia', u: '°', rt: '<10', num: true, o: 6 },
        { n: 'rx_ferguson', d: 'Ferguson lumbosacro', c: 'Radiología Columna', t: 'radiografia', u: '°', num: true, o: 7 },
        { n: 'rx_clasificacion_oit', d: 'Clasificación OIT', c: 'Neumoconiosis', t: 'radiografia', u: '', num: false, o: 8 },
        { n: 'rx_hallazgos', d: 'Hallazgos radiológicos', c: 'Interpretación', t: 'radiografia', u: '', num: false, o: 9 },

        // ── HISTORIA CLÍNICA: Signos Vitales (orden 1-12) ──
        { n: 'hc_ta', d: 'Tensión Arterial', c: 'Signos Vitales', t: 'historia_clinica', u: 'mmHg', num: false, o: 1 },
        { n: 'hc_fc', d: 'Frecuencia Cardiaca', c: 'Signos Vitales', t: 'historia_clinica', u: 'lpm', num: true, o: 2 },
        { n: 'hc_fr', d: 'Frecuencia Respiratoria', c: 'Signos Vitales', t: 'historia_clinica', u: 'rpm', num: true, o: 3 },
        { n: 'hc_peso', d: 'Peso', c: 'Somatometría', t: 'historia_clinica', u: 'kg', num: true, o: 4 },
        { n: 'hc_talla', d: 'Talla', c: 'Somatometría', t: 'historia_clinica', u: 'cm', num: true, o: 5 },
        { n: 'hc_imc', d: 'IMC', c: 'Somatometría', t: 'historia_clinica', u: 'kg/m2', num: true, o: 6 },
        { n: 'hc_temperatura', d: 'Temperatura', c: 'Signos Vitales', t: 'historia_clinica', u: '°C', num: true, o: 7 },
        { n: 'hc_spo2', d: 'Saturación de O2', c: 'Signos Vitales', t: 'historia_clinica', u: '%', num: true, o: 8 },
        { n: 'hc_mano_dominante', d: 'Mano dominante', c: 'Datos Generales', t: 'historia_clinica', u: '', num: false, o: 9 },
        { n: 'hc_av_lejana', d: 'Agudeza Visual Bilateral Lejana', c: 'Evaluación Visual', t: 'historia_clinica', u: 'Snellen', num: false, o: 10 },
        { n: 'hc_av_cercana', d: 'Agudeza Visual Bilateral Cercana', c: 'Evaluación Visual', t: 'historia_clinica', u: 'Jaeger', num: false, o: 11 },
        { n: 'hc_glucosa_capilar', d: 'Glucosa capilar', c: 'Lab rápidos', t: 'historia_clinica', u: '', num: false, o: 12 },
        { n: 'hc_antidoping', d: 'Antidoping', c: 'Lab rápidos', t: 'historia_clinica', u: '', rt: 'Negativo', num: false, o: 13 },
        { n: 'hc_rx_torax', d: 'Radiografía de Tórax', c: 'Estudios previos', t: 'historia_clinica', u: '', num: false, o: 14 },
        { n: 'hc_rx_columna', d: 'Radiografía de Columna Lumbar', c: 'Estudios previos', t: 'historia_clinica', u: '', num: false, o: 15 },
        { n: 'hc_resist_insulina', d: 'Resistencia a la Insulina', c: 'Patologías', t: 'historia_clinica', u: '', num: false, o: 16 },
        { n: 'hc_has', d: 'Hipertensión Arterial Sistémica (HAS)', c: 'Patologías', t: 'historia_clinica', u: '', num: false, o: 17 },
        { n: 'hc_audiometria_resumen', d: 'Audiometría (resumen)', c: 'Estudios previos', t: 'historia_clinica', u: '', num: false, o: 18 },

        // ── APTITUD LABORAL (orden 1-6) ──
        { n: 'apt_estado', d: 'Estado de Aptitud', c: 'Dictamen', t: 'aptitud_laboral', u: '', num: false, o: 1 },
        { n: 'apt_puesto', d: 'Puesto', c: 'Dictamen', t: 'aptitud_laboral', u: '', num: false, o: 2 },
        { n: 'apt_empresa', d: 'Empresa', c: 'Dictamen', t: 'aptitud_laboral', u: '', num: false, o: 3 },
        { n: 'apt_medico', d: 'Médico Evaluador', c: 'Dictamen', t: 'aptitud_laboral', u: '', num: false, o: 4 },
        { n: 'apt_cedula', d: 'Cédula de Especialidad', c: 'Dictamen', t: 'aptitud_laboral', u: '', num: false, o: 5 },
        { n: 'apt_proxima_eval', d: 'Fecha de Próxima Evaluación', c: 'Dictamen', t: 'aptitud_laboral', u: '', num: false, o: 6 },
    ]

    const values = params.map(p => {
        const mn = p.mn !== undefined ? p.mn : 'NULL'
        const mx = p.mx !== undefined ? p.mx : 'NULL'
        const rt = p.rt ? `'${p.rt.replace(/'/g, "''")}'` : 'NULL'
        return `('${p.n}', '${p.d.replace(/'/g, "''")}', '${p.c.replace(/'/g, "''")}', '${p.t}', '${p.u}', ${mn}, ${mx}, ${rt}, ${p.num}, true, ${p.o})`
    })

    return `INSERT INTO parametros_catalogo (nombre, nombre_display, categoria, tipo_estudio, unidad, rango_ref_min, rango_ref_max, rango_ref_texto, es_numerico, activo, orden)
VALUES
${values.join(',\n')}
ON CONFLICT (nombre, tipo_estudio) DO UPDATE SET
    nombre_display = EXCLUDED.nombre_display,
    categoria = EXCLUDED.categoria,
    unidad = EXCLUDED.unidad,
    rango_ref_min = EXCLUDED.rango_ref_min,
    rango_ref_max = EXCLUDED.rango_ref_max,
    rango_ref_texto = EXCLUDED.rango_ref_texto,
    es_numerico = EXCLUDED.es_numerico,
    orden = EXCLUDED.orden;`
}

// ============================================================
// EJECUTAR
// ============================================================

async function main() {
    console.log('🏥 GP Medical ERP — Migración Definitiva')
    console.log('=========================================\n')

    // Step 1: Create tables
    const ok1 = await runSQL(MIGRATION_SQL, 'Crear tablas (9 tablas + índices)')
    if (!ok1) {
        console.error('\n💥 Error creando tablas. Abortando.')
        process.exit(1)
    }

    // Step 2: RLS policies
    const ok2 = await runSQL(RLS_SQL, 'Configurar RLS y políticas')
    if (!ok2) {
        console.error('\n⚠️ Warning: RLS no se pudo configurar, pero las tablas están creadas.')
    }

    // Step 3: Populate catalog
    const catalogSQL = buildCatalogSQL()
    const ok3 = await runSQL(catalogSQL, `Poblar catálogo (${catalogSQL.split('\n').length} params)`)
    if (!ok3) {
        console.error('\n⚠️ Warning: No se pudo poblar el catálogo.')
    }

    // Step 4: Verify
    const verifySQL = `
        SELECT tipo_estudio, COUNT(*) as total 
        FROM parametros_catalogo 
        GROUP BY tipo_estudio 
        ORDER BY tipo_estudio;
    `
    const verifyRes = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ query: verifySQL }),
    })
    if (verifyRes.ok) {
        const data = await verifyRes.json()
        console.log('\n📊 Catálogo de parámetros por tipo de estudio:')
        console.log(JSON.stringify(data, null, 2))
    }

    // Step 5: Verify tables
    const tablesSQL = `
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'parametros_catalogo','estudios_clinicos','resultados_estudio',
            'graficas_estudio','antecedentes_paciente','exploraciones_fisicas',
            'notas_medicas','consentimientos_firmados','dictamenes_aptitud'
        )
        ORDER BY tablename;
    `
    const tablesRes = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ query: tablesSQL }),
    })
    if (tablesRes.ok) {
        const data = await tablesRes.json()
        console.log('\n✅ Tablas creadas:')
        console.log(JSON.stringify(data, null, 2))
    }

    console.log('\n🎉 Migración completa.')
    console.log('   Total de parámetros en catálogo: 120+')
    console.log('   Tipos de estudio: laboratorio, audiometria, espirometria, electrocardiograma, optometria, radiografia, historia_clinica, aptitud_laboral')
}

main().catch(err => {
    console.error('Fatal:', err)
    process.exit(1)
})
