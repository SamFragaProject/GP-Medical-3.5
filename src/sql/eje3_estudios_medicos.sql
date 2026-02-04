-- EJE 3: Gestión Integral de Estudios Médicos

-- 1. Catálogo Maestro de Estudios
CREATE TABLE IF NOT EXISTS public.catalogo_estudios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE, -- Puede ser NULL si es catálogo global del sistema
    nombre TEXT NOT NULL, -- Ej: Biometría Hemática, Audiometría Tonal
    categoria TEXT NOT NULL, -- laboratorio, rayos_x, audiometria, espirometria, cardiologia, tomografia, otro
    codigo_interno TEXT, -- SKU o Código interno
    precio_publico DECIMAL(10,2),
    instrucciones_paciente TEXT, -- Ej: Ayuno 8 horas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- 2. Órdenes de Estudios (Solicitudes)
CREATE TABLE IF NOT EXISTS public.ordenes_estudios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    medico_id UUID REFERENCES public.profiles(id),
    
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    prioridad TEXT DEFAULT 'normal', -- normal, urgente
    estado TEXT DEFAULT 'pendiente', -- pendiente, en_proceso, completada, cancelada
    diagnostico_presuntivo TEXT,
    notas_clinicas TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Detalle de la Orden (Qué estudios incluye)
CREATE TABLE IF NOT EXISTS public.detalles_orden_estudios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orden_id UUID REFERENCES public.ordenes_estudios(id) ON DELETE CASCADE,
    estudio_id UUID REFERENCES public.catalogo_estudios(id),
    
    estado TEXT DEFAULT 'pendiente', -- pendiente, tomado, resultados_listos
    fecha_toma_muestra TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Resultados de Estudios
CREATE TABLE IF NOT EXISTS public.resultados_estudios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    detalle_orden_id UUID REFERENCES public.detalles_orden_estudios(id) ON DELETE CASCADE,
    
    -- Datos del Resultado
    tipo_resultado TEXT, -- estructurado, archivo, imagen
    valores_json JSONB DEFAULT '{}'::jsonb, -- Para guardar { hemoglobina: 14, plaquetas: 250000 }
    archivo_url TEXT, -- URL del PDF o DICOM
    
    interpretacion_texto TEXT, -- Interpretación del médico o radiólogo
    sugerencias_ia TEXT, -- Espacio para EJE 17 (Analítica Avanzada API)
    
    medico_interpreta_id UUID REFERENCES public.profiles(id),
    fecha_resultado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    conclusiones TEXT, -- Normal, Anormal, Requiere repetición
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.catalogo_estudios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_estudios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_orden_estudios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_estudios ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Empresa Aislada)
CREATE POLICY "Ver catalogo estudios" ON public.catalogo_estudios FOR SELECT USING (empresa_id IS NULL OR empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Gestionar ordenes empresa" ON public.ordenes_estudios FOR ALL USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Ver detalles orden" ON public.detalles_orden_estudios FOR ALL USING (EXISTS (SELECT 1 FROM public.ordenes_estudios WHERE id = detalles_orden_estudios.orden_id AND empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())));
CREATE POLICY "Gestionar resultados" ON public.resultados_estudios FOR ALL USING (EXISTS (SELECT 1 FROM public.detalles_orden_estudios d JOIN public.ordenes_estudios o ON d.orden_id = o.id WHERE d.id = resultados_estudios.detalle_orden_id AND o.empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())));
