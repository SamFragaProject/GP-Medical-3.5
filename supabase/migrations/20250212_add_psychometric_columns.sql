-- Add category and duration_minutes columns to psychometric_tests table

ALTER TABLE psychometric_tests 
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('personalidad', 'aptitud', 'riesgo', 'clima'));

ALTER TABLE psychometric_tests 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 15;
