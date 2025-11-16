-- Migration: Add image_url column to receipts table
-- This allows storing the original receipt photo alongside digitized data

-- Add image_url column to receipts table
ALTER TABLE receipts
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN receipts.image_url IS 'Base64 encoded image or URL of the original receipt photo';
