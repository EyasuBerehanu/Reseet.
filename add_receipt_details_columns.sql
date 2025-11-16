-- Migration: Add discount, tip, and payment_method columns to receipts table
-- This allows storing additional receipt details for better expense tracking

-- Add discount column to receipts table
ALTER TABLE receipts
ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2);

-- Add tip column to receipts table
ALTER TABLE receipts
ADD COLUMN IF NOT EXISTS tip NUMERIC(10, 2);

-- Add payment_method column to receipts table
ALTER TABLE receipts
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add comments to describe the columns
COMMENT ON COLUMN receipts.discount IS 'Discount or coupon amount applied to the receipt';
COMMENT ON COLUMN receipts.tip IS 'Tip, gratuity, or service charge amount';
COMMENT ON COLUMN receipts.payment_method IS 'Payment method used (e.g., Cash, Credit Card, Debit Card)';
