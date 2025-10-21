-- Fix storage policies for Clerk authentication
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload bounty assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own bounty assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own bounty assets" ON storage.objects;

-- Create new policies that work with service role (admin client)
-- Allow service role to upload files
CREATE POLICY "Service role can upload bounty assets"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'bounty-assets');

-- Allow service role to update files
CREATE POLICY "Service role can update bounty assets"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'bounty-assets');

-- Allow service role to delete files
CREATE POLICY "Service role can delete bounty assets"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'bounty-assets');

-- Keep the public read policy as is
-- Public can view bounty assets (already exists)
