-- EJE 05: Recursos Humanos Avanzado
-- Fecha: 26 Enero 2026

-- 1. Tabla de Empleados (Extension de Profile o Independiente con Link)
-- Decisión: Tabla independiente vinculada a profile (opcional) para datos sensibles laborales
CREATE TABLE IF NOT EXISTS public.rrhh_empleados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.profiles(id), -- Puede ser NULL si el empleado no usa el sistema
    
    -- Datos Personales
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email_personal TEXT,
    telefono TEXT,
    direccion TEXT,
    
    -- Datos Laborales
    fecha_ingreso DATE NOT NULL,
    puesto TEXT NOT NULL,
    departamento TEXT,
    tipo_contrato TEXT, -- 'indeterminado', 'determinado', 'prueba'
    
    -- Datos Fiscales / Pago
    rfc TEXT,
    curp TEXT,
    nss TEXT, -- Seguridad Social
    salario_diario DECIMAL(10,2) DEFAULT 0,
    cuenta_bancaria TEXT,
    banco TEXT,
    
    estado TEXT DEFAULT 'activo', -- activo, baja, permiso
    fecha_baja DATE,
    motivo_baja TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Vacaciones y Ausencias
CREATE TABLE IF NOT EXISTS public.rrhh_vacaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    empleado_id UUID REFERENCES public.rrhh_empleados(id) ON DELETE CASCADE,
    
    tipo TEXT NOT NULL, -- 'vacaciones', 'incapacidad', 'permiso_sin_goce', 'permiso_con_goce'
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_tomados INTEGER NOT NULL,
    
    estado TEXT DEFAULT 'pendiente', -- pendiente, aprobado, rechazado
    observaciones TEXT,
    aprobado_por UUID REFERENCES public.profiles(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Nómina (Cabecera)
CREATE TABLE IF NOT EXISTS public.rrhh_nomina (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    fecha_pago DATE,
    
    titulo TEXT, -- "Quincena 1 Enero 2026"
    estado TEXT DEFAULT 'borrador', -- borrador, timbrada, pagada, cancelada
    
    total_percepciones DECIMAL(12,2) DEFAULT 0,
    total_deducciones DECIMAL(12,2) DEFAULT 0,
    total_pagado DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Detalle de Nómina (Por Empleado)
CREATE TABLE IF NOT EXISTS public.rrhh_nomina_detalles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomina_id UUID REFERENCES public.rrhh_nomina(id) ON DELETE CASCADE,
    empleado_id UUID REFERENCES public.rrhh_empleados(id),
    
    dias_trabajados INTEGER DEFAULT 15,
    salario_base DECIMAL(10,2),
    
    -- Totales Desglosados
    total_percepciones DECIMAL(10,2) DEFAULT 0,
    total_deducciones DECIMAL(10,2) DEFAULT 0,
    neto_pagar DECIMAL(10,2) DEFAULT 0,
    
    -- JSON para guardar el desglose exacto en ese momento (snapshot)
    desglose_json JSONB DEFAULT '{}', -- { "bono_puntualidad": 500, "isr": 1200, "imss": 400 }
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.rrhh_empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rrhh_vacaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rrhh_nomina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rrhh_nomina_detalles ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for Admin access)
create policy "Ver empleados empresa" on public.rrhh_empleados for all using (
    empresa_id = (select empresa_id from public.profiles where id = auth.uid())
);

create policy "Ver vacaciones empresa" on public.rrhh_vacaciones for all using (
    empresa_id = (select empresa_id from public.profiles where id = auth.uid())
);

create policy "Ver nomina empresa" on public.rrhh_nomina for all using (
    empresa_id = (select empresa_id from public.profiles where id = auth.uid())
);

create policy "Ver nomina detalles empresa" on public.rrhh_nomina_detalles for all using (
    exists (select 1 from public.rrhh_nomina n where n.id = rrhh_nomina_detalles.nomina_id and n.empresa_id = (select empresa_id from public.profiles where id = auth.uid()))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rrhh_empleados_empresa ON public.rrhh_empleados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rrhh_vacaciones_empleado ON public.rrhh_vacaciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_rrhh_nomina_empresa ON public.rrhh_nomina(empresa_id);
