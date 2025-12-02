CREATE TABLE occupational_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    exam_type VARCHAR(100) NOT NULL,
    exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
    results JSONB,
    diagnosis TEXT,
    recommendations TEXT,
    next_exam_date DATE,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);