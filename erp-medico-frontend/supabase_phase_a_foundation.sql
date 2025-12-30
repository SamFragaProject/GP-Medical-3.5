-- ============================================================
-- MediFlow ERP - Phase A: Foundation
-- Audit Trail + Domain Events + State Machine Support
-- ============================================================

-- 1. AUDIT LOG TABLE (Append-Only)
-- Tracks all significant actions in the system
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What was affected
  entity_type TEXT NOT NULL,           -- 'cita', 'paciente', 'factura', etc.
  entity_id UUID NOT NULL,             -- ID of the affected record
  action TEXT NOT NULL,                -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'TRANSITION'
  
  -- Who did it
  user_id UUID,                        -- References usuarios(id) if exists
  user_email TEXT,
  user_role TEXT,
  
  -- When and from where
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  
  -- What changed (for UPDATE actions)
  old_values JSONB,                    -- Previous state
  new_values JSONB,                    -- New state
  changes JSONB,                       -- Specific fields that changed
  
  -- Context (optional - only if these tables exist)
  empresa_id UUID,                     -- Optional reference
  sede_id UUID,                        -- Optional reference
  session_id TEXT,
  
  -- Metadata
  notes TEXT,                          -- Optional description
  
  -- Indexes for common queries
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_empresa ON audit_log(empresa_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- RLS: Append-only (no UPDATE, no DELETE)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can INSERT (logging)
CREATE POLICY "audit_insert_authenticated" ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Only Super Admin can read all logs
CREATE POLICY "audit_read_super_admin" ON audit_log
  FOR SELECT TO authenticated
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'super_admin'
  );

-- Users can read their own audit entries
CREATE POLICY "audit_read_own" ON audit_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin Empresa can read logs for their empresa
CREATE POLICY "audit_read_empresa_admin" ON audit_log
  FOR SELECT TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE id = auth.uid() AND rol = 'admin_empresa'
    )
  );

-- NO UPDATE OR DELETE POLICIES (immutable)

-- ============================================================
-- 2. DOMAIN EVENTS TABLE
-- For event-driven architecture (loose coupling between modules)
-- ============================================================

CREATE TABLE IF NOT EXISTS domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event identification
  event_type TEXT NOT NULL,            -- 'CITA_CONFIRMADA', 'CONSULTA_CERRADA', 'PAGO_RECIBIDO'
  aggregate_type TEXT NOT NULL,        -- 'cita', 'consulta', 'factura'
  aggregate_id UUID NOT NULL,          -- ID of the main entity
  
  -- Event data
  payload JSONB NOT NULL,              -- Full event data
  
  -- Processing status
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,                     -- Optional: user who created
  empresa_id UUID,                     -- Optional: tenant isolation
  
  -- Correlation for tracing
  correlation_id UUID,                 -- Links related events
  causation_id UUID                    -- Event that caused this event
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_domain_events_status ON domain_events(status) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_domain_events_type ON domain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate ON domain_events(aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_domain_events_created ON domain_events(created_at DESC);

-- RLS
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;

-- Insert: authenticated users
CREATE POLICY "events_insert_authenticated" ON domain_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Select: Super Admin sees all, others see their empresa
CREATE POLICY "events_read_super_admin" ON domain_events
  FOR SELECT TO authenticated
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "events_read_empresa" ON domain_events
  FOR SELECT TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Update: Only for processing status changes
CREATE POLICY "events_update_status" ON domain_events
  FOR UPDATE TO authenticated
  USING (status = 'PENDING' OR status = 'FAILED')
  WITH CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED'));

-- ============================================================
-- 3. STATE TRANSITIONS LOG
-- Specifically for tracking entity state changes
-- ============================================================

CREATE TABLE IF NOT EXISTS state_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What transitioned
  entity_type TEXT NOT NULL,           -- 'cita', 'consulta', 'factura'
  entity_id UUID NOT NULL,
  
  -- Transition details
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  
  -- Who/when
  transitioned_by UUID,                -- Optional: user reference
  transitioned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Context
  reason TEXT,                         -- Why the transition happened
  metadata JSONB,                      -- Additional context
  
  empresa_id UUID                      -- Optional: tenant isolation
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_state_transitions_entity ON state_transitions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_state_transitions_time ON state_transitions(transitioned_at DESC);

-- RLS
ALTER TABLE state_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transitions_insert_auth" ON state_transitions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "transitions_read_empresa" ON state_transitions
  FOR SELECT TO authenticated
  USING (
    empresa_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid())
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'super_admin'
  );

-- ============================================================
-- 4. HELPER FUNCTION: Log State Transition
-- ============================================================

CREATE OR REPLACE FUNCTION log_state_transition(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_from_state TEXT,
  p_to_state TEXT,
  p_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_transition_id UUID;
  v_user_id UUID;
  v_empresa_id UUID;
BEGIN
  -- Get current user info
  SELECT id, empresa_id INTO v_user_id, v_empresa_id
  FROM usuarios WHERE id = auth.uid();
  
  -- Insert transition
  INSERT INTO state_transitions (
    entity_type, entity_id, from_state, to_state,
    transitioned_by, reason, metadata, empresa_id
  ) VALUES (
    p_entity_type, p_entity_id, p_from_state, p_to_state,
    v_user_id, p_reason, p_metadata, v_empresa_id
  ) RETURNING id INTO v_transition_id;
  
  -- Also log to audit_log
  INSERT INTO audit_log (
    entity_type, entity_id, action, user_id, user_role, empresa_id,
    old_values, new_values
  ) VALUES (
    p_entity_type, p_entity_id, 'TRANSITION', v_user_id,
    (SELECT rol FROM usuarios WHERE id = v_user_id),
    v_empresa_id,
    jsonb_build_object('status', p_from_state),
    jsonb_build_object('status', p_to_state)
  );
  
  RETURN v_transition_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. HELPER FUNCTION: Emit Domain Event
-- ============================================================

CREATE OR REPLACE FUNCTION emit_domain_event(
  p_event_type TEXT,
  p_aggregate_type TEXT,
  p_aggregate_id UUID,
  p_payload JSONB,
  p_correlation_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_user_id UUID;
  v_empresa_id UUID;
BEGIN
  -- Get current user info
  SELECT id, empresa_id INTO v_user_id, v_empresa_id
  FROM usuarios WHERE id = auth.uid();
  
  -- Insert event
  INSERT INTO domain_events (
    event_type, aggregate_type, aggregate_id, payload,
    created_by, empresa_id, correlation_id
  ) VALUES (
    p_event_type, p_aggregate_type, p_aggregate_id, p_payload,
    v_user_id, v_empresa_id, p_correlation_id
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DONE! Run this script in your Supabase SQL Editor
-- ============================================================
