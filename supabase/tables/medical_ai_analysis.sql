CREATE TABLE medical_ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    ai_model_version VARCHAR(50),
    analysis_type VARCHAR(100) NOT NULL,
    input_data JSONB,
    ai_results JSONB,
    confidence_score DECIMAL(5,2),
    human_review_notes TEXT,
    final_diagnosis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);