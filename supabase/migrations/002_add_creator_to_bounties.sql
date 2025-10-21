-- Add creator_id column to bounties table
ALTER TABLE bounties 
ADD COLUMN creator_id TEXT;

-- Create index for better query performance
CREATE INDEX idx_bounties_creator_id ON bounties(creator_id);

-- Note: Existing bounties will have NULL creator_id, which is fine for legacy data

