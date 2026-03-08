-- ============================================================
-- Panna.ai — Supabase RLS Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── notes table ──────────────────────────────────────────────

-- 1. Enable RLS on notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 2. Users can only SELECT their own notes (or public ones)
CREATE POLICY "notes_select_own"
  ON notes FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- 3. Users can only INSERT notes for themselves
CREATE POLICY "notes_insert_own"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can only UPDATE their own notes
CREATE POLICY "notes_update_own"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Users can only DELETE their own notes
CREATE POLICY "notes_delete_own"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);


-- ── user_preferences table ───────────────────────────────────

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preferences_select_own"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "preferences_insert_own"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "preferences_update_own"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── ai_interactions table ────────────────────────────────────

ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_interactions_select_own"
  ON ai_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ai_interactions_insert_own"
  ON ai_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ── Storage: avatars bucket ──────────────────────────────────
-- Run these AFTER creating the "avatars" bucket in Storage UI

-- Allow users to read avatars (public bucket)
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow users to upload/update only their own avatar folder
CREATE POLICY "avatars_user_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_user_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
