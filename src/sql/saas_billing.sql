-- Tabla de Planes SaaS
CREATE TABLE IF NOT EXISTS public.saas_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL, -- Basic, Pro, Enterprise
    codigo TEXT UNIQUE NOT NULL, -- basic, pro, enterprise
    precio_mensual DECIMAL(10,2) NOT NULL,
    moneda TEXT DEFAULT 'MXN',
    features JSONB DEFAULT '{}'::jsonb, -- Lista de módulos incluidos
    limite_usuarios INTEGER,
    limite_almacenamiento_gb INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Suscripciones (Relación Empresa - Plan)
CREATE TABLE IF NOT EXISTS public.saas_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.saas_plans(id),
    stripe_subscription_id TEXT, -- ID externo de Stripe
    stripe_customer_id TEXT,
    estado TEXT DEFAULT 'active', -- active, past_due, canceled, trialing
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin_periodo TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar Planes por Defecto
INSERT INTO public.saas_plans (nombre, codigo, precio_mensual, features, limite_usuarios)
VALUES 
('Plan Básico', 'basic', 1499.00, '{"modulos": ["clinico", "citas"], "soporte": "email"}'::jsonb, 3),
('Plan Profesional', 'pro', 3999.00, '{"modulos": ["clinico", "citas", "nom035", "nom036"], "soporte": "prioritario"}'::jsonb, 10),
('Plan Enterprise', 'enterprise', 9999.00, '{"modulos": ["all"], "soporte": "dedicado"}'::jsonb, 9999)
ON CONFLICT (codigo) DO NOTHING;

-- RLS
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver planes disponibles" ON public.saas_plans FOR SELECT USING (true);
CREATE POLICY "Ver mi suscripcion" ON public.saas_subscriptions 
    FOR SELECT USING (empresa_id = (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()));
