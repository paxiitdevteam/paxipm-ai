-- Migration script to add budget and currency fields to projects table
-- Run this if you have an existing database without budget fields

-- Add budget and currency columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS budgeted_amount DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS spent_amount DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'USD';

-- Update existing projects with default values
UPDATE projects 
SET budgeted_amount = 0.00, 
    spent_amount = 0.00, 
    currency_code = 'USD'
WHERE budgeted_amount IS NULL OR spent_amount IS NULL OR currency_code IS NULL;

