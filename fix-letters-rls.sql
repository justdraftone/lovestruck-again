-- Fix RLS policies for letters table
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read letters" ON letters;
DROP POLICY IF EXISTS "Anyone can create letters" ON letters;

-- Make sure RLS is enabled
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- Create policies that allow anyone to read and insert
CREATE POLICY "Anyone can read letters"
  ON letters FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create letters"
  ON letters FOR INSERT
  WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'letters';
