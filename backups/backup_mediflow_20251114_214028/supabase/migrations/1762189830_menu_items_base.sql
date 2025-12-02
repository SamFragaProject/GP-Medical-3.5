-- Migration: menu_items_base
-- Created at: 1762189830

-- Sistema básico de menús personalizados
-- Creado: 2025-11-04

-- Tabla principal de items de menú
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    href VARCHAR(500) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    category VARCHAR(100) DEFAULT 'principal',
    description TEXT,
    required_permission JSONB DEFAULT '{"resource": "dashboard", "action": "view", "level": "user"}',
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES menu_items(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de permisos de usuario específicos para menús
CREATE TABLE IF NOT EXISTS user_menu_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id),
    permission_type VARCHAR(20) DEFAULT 'read' CHECK (permission_type IN ('full', 'read', 'none')),
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_visible_active ON menu_items(is_visible, is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);

CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_user ON user_menu_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_menu_item ON user_menu_permissions(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_user_menu_permissions_active ON user_menu_permissions(is_active);

-- RLS Policies para menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_menu_permissions ENABLE ROW LEVEL SECURITY;

-- Policies para menu_items
CREATE POLICY "Menu items are viewable by authenticated users" ON menu_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Menu items are manageable by super_admin and admin_empresa" ON menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.hierarchy IN ('super_admin', 'admin_empresa')
        )
    );

-- Policies para user_menu_permissions
CREATE POLICY "User permissions viewable by own user" ON user_menu_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User permissions manageable by admins" ON user_menu_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.hierarchy IN ('super_admin', 'admin_empresa')
        )
    );

-- Función para aplicar plantilla de menú por jerarquía
CREATE OR REPLACE FUNCTION apply_menu_template(hierarchy_name text)
RETURNS void AS $$
DECLARE
    template_items JSONB;
    item JSONB;
    hierarchy_permissions JSONB;
BEGIN
    -- Templates por jerarquía
    CASE hierarchy_name
        WHEN 'super_admin' THEN
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1},
                {"name": "Panel SaaS", "href": "/configuracion?tab=saas_admin", "icon": "Crown", "category": "administracion", "sort_order": 90},
                {"name": "Usuarios", "href": "/usuarios", "icon": "Users", "category": "administracion", "sort_order": 91},
                {"name": "Sistema", "href": "/configuracion", "icon": "Settings", "category": "administracion", "sort_order": 92}
            ]'::jsonb;
            hierarchy_permissions := '["*"]'::jsonb;
        WHEN 'admin_empresa' THEN
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1},
                {"name": "Reportes", "href": "/reportes", "icon": "BarChart3", "category": "reportes", "sort_order": 20},
                {"name": "Configuración", "href": "/configuracion", "icon": "Settings", "category": "administracion", "sort_order": 80}
            ]'::jsonb;
            hierarchy_permissions := '["reports_view", "system_admin"]'::jsonb;
        WHEN 'medico_trabajo' THEN
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1},
                {"name": "Pacientes", "href": "/pacientes", "icon": "Users", "category": "medicina", "sort_order": 10},
                {"name": "Exámenes", "href": "/examenes", "icon": "Activity", "category": "medicina", "sort_order": 20},
                {"name": "Agenda", "href": "/agenda", "icon": "Calendar", "category": "medicina", "sort_order": 30}
            ]'::jsonb;
            hierarchy_permissions := '["patients_manage", "exams_manage", "agenda_manage"]'::jsonb;
        WHEN 'paciente' THEN
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1}
            ]'::jsonb;
            hierarchy_permissions := '["medical_view", "appointments_view"]'::jsonb;
        WHEN 'bot' THEN
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1},
                {"name": "Ayuda", "href": "/ayuda", "icon": "HelpCircle", "category": "soporte", "sort_order": 90}
            ]'::jsonb;
            hierarchy_permissions := '["help_center", "system_support"]'::jsonb;
        ELSE
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1}
            ]'::jsonb;
            hierarchy_permissions := '["dashboard_view"]'::jsonb;
    END CASE;

    -- Insertar items de la plantilla
    FOR item IN SELECT * FROM jsonb_array_elements(template_items)
    LOOP
        INSERT INTO menu_items (
            name, href, icon, category, sort_order, is_visible, is_active
        ) VALUES (
            (item->>'name'),
            (item->>'href'),
            (item->>'icon'),
            (item->>'category'),
            (item->>'sort_order')::integer,
            true,
            true
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insertar datos iniciales (items básicos del sistema)
INSERT INTO menu_items (name, href, icon, category, sort_order, is_visible, is_active) VALUES
('Dashboard', '/dashboard', 'Home', 'principal', 1, true, true),
('Pacientes', '/pacientes', 'Users', 'medicina', 10, true, true),
('Agenda', '/agenda', 'Calendar', 'medicina', 20, true, true),
('Exámenes', '/examenes', 'Activity', 'medicina', 30, true, true),
('IA & Análisis', '/ia', 'Brain', 'analisis', 40, true, true),
('Reportes', '/reportes', 'BarChart3', 'reportes', 50, true, true),
('Certificaciones', '/certificaciones', 'FileText', 'certificaciones', 60, true, true),
('Facturación', '/facturacion', 'CreditCard', 'administracion', 70, true, true),
('Tienda', '/tienda', 'ShoppingCart', 'tienda', 80, true, true),
('Inventario', '/inventario', 'Database', 'inventario', 85, true, true),
('Configuración', '/configuracion', 'Settings', 'administracion', 90, true, true),
('Ayuda', '/ayuda', 'HelpCircle', 'soporte', 95, true, true)
ON CONFLICT DO NOTHING;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_menu_permissions_updated_at ON user_menu_permissions;
CREATE TRIGGER update_user_menu_permissions_updated_at
    BEFORE UPDATE ON user_menu_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Aplicar plantillas iniciales para jerarquías existentes
SELECT apply_menu_template('super_admin');
SELECT apply_menu_template('medico_trabajo');
SELECT apply_menu_template('paciente');
SELECT apply_menu_template('bot');;