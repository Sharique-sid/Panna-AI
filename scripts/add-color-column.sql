-- Add color column to notes table for Google Keep style theming
ALTER TABLE notes ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#ffffff';
