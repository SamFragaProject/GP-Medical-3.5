-- Migration: menu_items_simple
-- Created at: 1762189851

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

-- RLS Policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_menu_permissions ENABLE ROW LEVEL SECURITY;

-- Policies para menu_items
CREATE POLICY "Menu items are viewable by authenticated users" ON menu_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policies para user_menu_permissions  
CREATE POLICY "User permissions viewable by authenticated users" ON user_menu_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

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
    EXECUTE FUNCTION update_updated_at_column();;