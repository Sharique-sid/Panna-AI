-- Enable public editing for notes
-- This policy allows ANYONE (anon/guest) to UPDATE a note IF it is marked as public.

-- 1. Drop the policy if it exists (to avoid errors on re-run)
DROP POLICY IF EXISTS "Allow public editing of public notes" ON notes;

-- 2. Create the policy
CREATE POLICY "Allow public editing of public notes" ON notes
  FOR UPDATE 
  USING (is_public = TRUE);

-- 3. Ensure RLS is enabled (just in case)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
