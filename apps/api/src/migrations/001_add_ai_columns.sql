-- Migration: Add AI form generation columns to forms table
-- Add ai_generated flag and generation_metadata to track AI-generated forms

ALTER TABLE forms ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS generation_metadata JSONB;

-- Create index for AI-generated forms
CREATE INDEX IF NOT EXISTS idx_forms_ai_generated ON forms(ai_generated, user_id, updated_at DESC);
