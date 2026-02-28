-- Migration for Smart Onboarding Hub
-- Create documentos_expediente table for JSONB open extraction

CREATE TABLE IF NOT EXISTS public.documentos_expediente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL, -- 'radiografia', 'laboratorio', 'espirometria', etc.
    archivo_url TEXT,
    archivo_nombre TEXT,
    tipo_mime TEXT,
    tamano_bytes BIGINT,
    datos_extraidos JSONB, -- Open schema for the new app data
    fecha_documento DATE,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documentos_expediente ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable ALL for authenticated users on documentos_expediente" ON "public"."documentos_expediente"
AS PERMISSIVE FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_documentos_expediente_updated_at ON public.documentos_expediente;

CREATE TRIGGER trigger_update_documentos_expediente_updated_at
BEFORE UPDATE ON public.documentos_expediente
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
