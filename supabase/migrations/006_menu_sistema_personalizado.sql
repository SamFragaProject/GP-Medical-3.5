-- Tablas para el sistema de menús personalizados
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

-- Tabla de permisos de menú por usuario (extensión de saas_user_permissions)
ALTER TABLE saas_user_permissions 
ADD COLUMN IF NOT EXISTS menu_item_id UUID REFERENCES menu_items(id),
ADD COLUMN IF NOT EXISTS permission_type VARCHAR(20) DEFAULT 'read' CHECK (permission_type IN ('full', 'read', 'none')),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '{}';

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_visible_active ON menu_items(is_visible, is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);

CREATE INDEX IF NOT EXISTS idx_saas_user_permissions_menu_item ON saas_user_permissions(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_saas_user_permissions_active ON saas_user_permissions(is_active);

-- RLS Policies para menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies para saas_user_permissions (extensión)
DROP POLICY IF EXISTS "User permissions viewable by own user" ON saas_user_permissions;
CREATE POLICY "User permissions viewable by own user" ON saas_user_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User permissions manageable by admins" ON saas_user_permissions
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
    menu_item_id UUID;
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
        WHEN 'admin_empresa' THEN
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1},
                {"name": "Reportes", "href": "/reportes", "icon": "BarChart3", "category": "reportes", "sort_order": 20},
                {"name": "Configuración", "href": "/configuracion", "icon": "Settings", "category": "administracion", "sort_order": 80}
            ]'::jsonb;
        WHEN 'medico_trabajo' THEN
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1},
                {"name": "Pacientes", "href": "/pacientes", "icon": "Users", "category": "medicina", "sort_order": 10},
                {"name": "Exámenes", "href": "/examenes", "icon": "Activity", "category": "medicina", "sort_order": 20},
                {"name": "Agenda", "href": "/agenda", "icon": "Calendar", "category": "medicina", "sort_order": 30}
            ]'::jsonb;
        WHEN 'paciente' THEN
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1}
            ]'::jsonb;
        WHEN 'bot' THEN
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1},
                {"name": "Ayuda", "href": "/ayuda", "icon": "HelpCircle", "category": "soporte", "sort_order": 90}
            ]'::jsonb;
        ELSE
            template_items := '[
                {"name": "Dashboard", "href": "/dashboard", "icon": "Home", "category": "principal", "sort_order": 1}
            ]'::jsonb;
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

-- Función para obtener menús del usuario
CREATE OR REPLACE FUNCTION get_user_menu_items(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    href VARCHAR(500),
    icon VARCHAR(100),
    category VARCHAR(100),
    sort_order INTEGER,
    has_children BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mi.id,
        mi.name,
        mi.href,
        mi.icon,
        mi.category,
        mi.sort_order,
        EXISTS(SELECT 1 FROM menu_items child WHERE child.parent_id = mi.id) as has_children
    FROM menu_items mi
    WHERE mi.is_visible = true 
    AND mi.is_active = true
    ORDER BY mi.sort_order ASC, mi.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
('Inventario', '/inventario', 'Database', 'inventario', 85, true, true)
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

-- Comentarios de documentación
COMMENT ON TABLE menu_items IS 'Tabla de configuración de items de menú del sistema';
COMMENT ON COLUMN menu_items.required_permission IS 'Permisos requeridos para ver este item (JSON: {resource, action, level})';
COMMENT ON COLUMN menu_items.parent_id IS 'ID del item padre para crear jerarquías de menú';
COMMENT ON COLUMN menu_items.metadata IS 'Metadatos adicionales del item (configuraciones específicas)';

COMMENT ON COLUMN saas_user_permissions.menu_item_id IS 'Referencia al item de menú (extensión de la tabla original)';
COMMENT ON COLUMN saas_user_permissions.permission_type IS 'Tipo de permiso: full (acceso completo), read (solo lectura), none (sin acceso)';
COMMENT ON COLUMN saas_user_permissions.conditions IS 'Condiciones adicionales para el permiso (JSON)';

-- Función de limpieza (para mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_expired_permissions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM saas_user_permissions 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Vista para estadísticas de uso de menús
CREATE OR REPLACE VIEW menu_usage_stats AS
SELECT 
    mi.id,
    mi.name,
    mi.category,
    mi.href,
    COUNT(sup.user_id) as total_users,
    COUNT(CASE WHEN sup.permission_type = 'full' THEN 1 END) as full_access_users,
    COUNT(CASE WHEN sup.permission_type = 'read' THEN 1 END) as read_only_users,
    COUNT(CASE WHEN sup.is_active = true THEN 1 END) as active_permissions
FROM menu_items mi
LEFT JOIN saas_user_permissions sup ON mi.id = sup.menu_item_id
GROUP BY mi.id, mi.name, mi.category, mi.href
ORDER BY total_users DESC;

COMMENT ON VIEW menu_usage_stats IS 'Estadísticas de uso de items de menú por usuario';

-- Script completado
SELECT 'Sistema de menús personalizados creado exitosamente' as status;