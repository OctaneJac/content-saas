-- Add script field to cards table if it doesn't exist
ALTER TABLE cards ADD COLUMN IF NOT EXISTS script TEXT;
