-- EJE 10: Prescripción Médica y Documentos Clínicos

-- 1. Cabecera de Recetas Médicas
CREATE TABLE IF NOT EXISTS public.recetas_medicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES public.profiles(id),
    
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Datos Clínicos Básicos (Snapshot al momento de la receta)
    diagnostico_principal TEXT,
    alergias_conocidas TEXT,
    peso_kg DECIMAL(5,2),
    talla_cm DECIMAL(5,2),
    
    -- Firma y Validez
    firma_digital_url TEXT, -- URL de la imagen de la firma o sello
    estado TEXT DEFAULT 'activa', -- activa, surtida, cancelada
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Detalle de Medicamentos en Receta
CREATE TABLE IF NOT EXISTS public.detalles_receta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receta_id UUID REFERENCES public.recetas_medicas(id) ON DELETE CASCADE,
    
    nombre_medicamento TEXT NOT NULL, -- Genérico o Comercial
    presentacion TEXT, -- Ej: Tabletas 500mg
    cantidad INTEGER NOT NULL, -- Ej: 2 (cajas)
    
    -- Posología
    dosis TEXT NOT NULL, -- Ej: Tomar 1 tableta
    frecuencia TEXT NOT NULL, -- Ej: Cada 8 horas
    duracion TEXT NOT NULL, -- Ej: Por 5 días
    via_administracion TEXT DEFAULT 'Oral',
    
    observaciones TEXT, -- Ej: Con alimentos
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Incapacidades Médicas (Licencias)
CREATE TABLE IF NOT EXISTS public.incapacidades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES public.profiles(id),
    
    folio_interno TEXT, -- Generado por el sistema o manual
    tipo_incapacidad TEXT NOT NULL, -- riesgo_trabajo, enfermedad_general, maternidad
    ramo_seguro TEXT, -- Ej: Enfermedad General
    
    fecha_inicio DATE NOT NULL,
    dias_autorizados INTEGER NOT NULL,
    fecha_fin DATE GENERATED ALWAYS AS (fecha_inicio + (dias_autorizados - 1) * INTERVAL '1 day') STORED,
    
    diagnostico_cie10 TEXT, -- Código CIE-10 si aplica
    descripcion_motivo TEXT,
    
    estado TEXT DEFAULT 'emitida', -- emitida, cancelada
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Certificados de Aptitud (Dictámenes)
CREATE TABLE IF NOT EXISTS public.certificados_aptitud (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES public.profiles(id),
    
    fecha_evaluacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    puesto_evaluado TEXT,
    
    dictamen TEXT NOT NULL, -- apto, apto_con_restricciones, no_apto, condicionado
    restricciones TEXT, -- Detalles si aplica
    vigencia_meses INTEGER DEFAULT 12,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.recetas_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_receta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incapacidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados_aptitud ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ver recetas empresa" ON public.recetas_medicas FOR ALL USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Ver detalles receta" ON public.detalles_receta FOR ALL USING (EXISTS (SELECT 1 FROM public.recetas_medicas r WHERE r.id = detalles_receta.receta_id AND r.empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Gestionar incapacidades" ON public.incapacidades FOR ALL USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Gestionar certificados" ON public.certificados_aptitud FOR ALL USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
