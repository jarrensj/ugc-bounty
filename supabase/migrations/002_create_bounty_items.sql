-- Create bounty_items table for tracking submitted content
CREATE TABLE IF NOT EXISTS bounty_items (
  id BIGSERIAL PRIMARY KEY,
  bounty_id BIGINT NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  cover_image_url TEXT,
  author TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  platform TEXT CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_bounty_items_bounty_id ON bounty_items(bounty_id);
CREATE INDEX idx_bounty_items_user_id ON bounty_items(user_id);
CREATE INDEX idx_bounty_items_created_at ON bounty_items(created_at);

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_bounty_items_updated_at
  BEFORE UPDATE ON bounty_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
