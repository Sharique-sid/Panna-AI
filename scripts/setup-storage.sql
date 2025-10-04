-- Create storage bucket for note images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'note-images',
  'note-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage bucket
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'note-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view all images" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'note-images');

CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'note-images');

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'note-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );








