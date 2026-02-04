-- EJE 6: Programa Anual de Salud Ocupacional

-- 1. Programa Anual (Cabecera)
CREATE TABLE IF NOT EXISTS public.programas_anuales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    anio INTEGER NOT NULL, -- Ej: 2025
    nombre TEXT NOT NULL, -- Ej: Programa de Salud 2025 - Planta Norte
    estado TEXT DEFAULT 'borrador', -- borrador, activo, cerrado
    presupuesto_asignado DECIMAL(12,2),
    avance_general DECIMAL(5,2) DEFAULT 0, -- Porcentaje calculado
    
    autorizado_por_id UUID REFERENCES public.profiles(id),
    fecha_autorizacion TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(empresa_id, anio)
);

-- 2. Actividades del Programa
CREATE TABLE IF NOT EXISTS public.actividades_programa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    programa_id UUID REFERENCES public.programas_anuales(id) ON DELETE CASCADE,
    
    nombre TEXT NOT NULL, -- Ej: Campaña de Audiometrías, Semana de Salud Visual
    tipo TEXT NOT NULL, -- examen_medico, campana_salud, capacitacion, simulacro, auditoria
    
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    
    -- Vinculación con Eje 5 (Riesgos)
    riesgo_asociado_id UUID REFERENCES public.catalogo_riesgos(id), 
    
    poblacion_objetivo TEXT, -- Ej: Todos, Soldadores, Administrativos
    meta_pacientes INTEGER, -- Cantidad esperada
    
    estado TEXT DEFAULT 'programada', -- programada, en_curso, realizada, cancelada
    responsable_id UUID REFERENCES public.profiles(id),
    
    costo_estimado DECIMAL(10,2),
    costo_real DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Participantes (Tracking de asistencia)
CREATE TABLE IF NOT EXISTS public.participantes_actividad (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actividad_id UUID REFERENCES public.actividades_programa(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    
    estado TEXT DEFAULT 'tbd', -- tbd, asistio, no_asistio, justificado
    fecha_asistencia TIMESTAMP WITH TIME ZONE,
    
    resultados_json JSONB, -- Resumen rápido del resultado si aplica
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.programas_anuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades_programa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participantes_actividad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver programas empresa" ON public.programas_anuales FOR ALL USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Gestionar actividades" ON public.actividades_programa FOR ALL USING (EXISTS (SELECT 1 FROM public.programas_anuales p WHERE p.id = actividades_programa.programa_id AND p.empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Gestionar participantes" ON public.participantes_actividad FOR ALL USING (EXISTS (SELECT 1 FROM public.actividades_programa a JOIN public.programas_anuales p ON a.programa_id = p.id WHERE a.id = participantes_actividad.actividad_id AND p.empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())));
