CREATE TABLE permisos_rol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hierarchy TEXT NOT NULL,
    permission_key TEXT NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);