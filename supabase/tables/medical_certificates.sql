CREATE TABLE medical_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    certificate_type VARCHAR(100) NOT NULL,
    certificate_number VARCHAR(50) UNIQUE,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    medical_finding TEXT,
    restrictions TEXT,
    issuer_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);