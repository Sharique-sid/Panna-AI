-- Fix RLS policies for storage bucket
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create corrected RLS policies for the storage bucket
CREATE POLICY "Users can upload images to note-images bucket" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'note-images'
  );

CREATE POLICY "Anyone can view images from note-images bucket" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'note-images');

CREATE POLICY "Users can delete their own images from note-images bucket" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'note-images'
  );








