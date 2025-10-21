-- Add logo_url and company_name columns to bounties table
ALTER TABLE bounties 
ADD COLUMN logo_url TEXT,
ADD COLUMN company_name TEXT;

-- Create index for better query performance on company_name
CREATE INDEX idx_bounties_company_name ON bounties(company_name);
