-- Create bounties table
CREATE TABLE IF NOT EXISTS bounties (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  total_bounty DECIMAL(10, 2) NOT NULL,
  rate_per_1k_views DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  claimed_bounty DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create submissions table for tracking user submissions
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  bounty_id BIGINT NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  earned_amount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  validation_explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table for storing additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  email TEXT,
  username TEXT,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_submissions_bounty_id ON submissions(bounty_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_bounties_created_at ON bounties(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to automatically update updated_at
CREATE TRIGGER update_bounties_updated_at
  BEFORE UPDATE ON bounties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial bounties data
INSERT INTO bounties (id, name, total_bounty, rate_per_1k_views, description, claimed_bounty) VALUES
  (1, 'Sushi Hat Challenge', 5000, 8, 'Make videos with this sushi hat and get views', 3200),
  (2, 'Gaming Setup Review', 3500, 5, 'Review our new gaming chair and show it in action during gameplay', 1800),
  (3, 'Fitness Tracker Unboxing', 2000, 10, 'Unbox and demonstrate our latest fitness tracker features', 450),
  (4, 'Coffee Maker Morning Routine', 4200, 6, 'Show off our coffee maker in your morning routine videos', 2900),
  (5, 'Tech Gadget Comparison', 6000, 12, 'Compare our wireless earbuds with competitors in various scenarios', 5100),
  (6, 'Travel Backpack Adventure', 3800, 7, 'Take our travel backpack on your adventures and showcase its features', 800)
ON CONFLICT (id) DO NOTHING;

-- Reset the sequence for bounties table
SELECT setval('bounties_id_seq', (SELECT MAX(id) FROM bounties));

