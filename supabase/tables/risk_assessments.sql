CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    evaluator_id UUID NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    workplace_area VARCHAR(100),
    risk_factors JSONB,
    control_measures TEXT,
    priority_score INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);