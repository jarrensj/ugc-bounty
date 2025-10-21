-- Create storage bucket for bounty assets (logos, images, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bounty-assets', 'bounty-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload bounty assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bounty-assets');

-- Create policy to allow public read access
CREATE POLICY "Public can view bounty assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bounty-assets');

-- Create policy to allow users to update their own uploads
CREATE POLICY "Users can update their own bounty assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bounty-assets' AND auth.uid()::text = owner);

-- Create policy to allow users to delete their own uploads
CREATE POLICY "Users can delete their own bounty assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bounty-assets' AND auth.uid()::text = owner);
