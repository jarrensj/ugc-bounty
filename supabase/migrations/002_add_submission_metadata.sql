-- Add metadata fields to submissions table
ALTER TABLE submissions 
ADD COLUMN title TEXT,
ADD COLUMN description TEXT,
ADD COLUMN cover_image_url TEXT,
ADD COLUMN author TEXT,
ADD COLUMN platform TEXT CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'other'));

-- Add index for platform queries
CREATE INDEX idx_submissions_platform ON submissions(platform);
