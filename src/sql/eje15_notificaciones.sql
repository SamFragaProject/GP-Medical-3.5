-- EJE 15: Notificaciones Inteligentes

CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL para notificaciones generales de empresa? Por ahora forzamos usuario o empresa.
    
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
    leida BOOLEAN DEFAULT false,
    link TEXT, -- Opcional: URL interna para redirigir
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Ver mis notificaciones" ON public.notificaciones FOR ALL USING (
    (usuario_id = auth.uid()) OR 
    (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) AND usuario_id IS NULL)
);

-- Indices
CREATE INDEX idx_notificaciones_usuario ON public.notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_empresa ON public.notificaciones(empresa_id);
CREATE INDEX idx_notificaciones_leida ON public.notificaciones(leida);
