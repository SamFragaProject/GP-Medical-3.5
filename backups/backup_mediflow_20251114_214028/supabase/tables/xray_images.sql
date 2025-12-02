CREATE TABLE xray_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    exam_id UUID,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    radiologist_notes TEXT,
    ai_analysis JSONB,
    findings TEXT,
    recommendations TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);