-- Supabase Schema for LoveStruck Quiz App
-- Run this SQL in your Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Create rooms table for couples remote mode
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  partner1_name TEXT NOT NULL,
  partner1_id TEXT NOT NULL,
  partner2_name TEXT,
  partner2_id TEXT,
  current_question INTEGER DEFAULT 0,
  current_turn INTEGER DEFAULT 1 CHECK (current_turn IN (1, 2)),
  partner1_answers JSONB DEFAULT '{}'::jsonb,
  partner2_answers JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by code
CREATE INDEX IF NOT EXISTS rooms_code_idx ON rooms(code);

-- Create index for faster lookups by status
CREATE INDEX IF NOT EXISTS rooms_status_idx ON rooms(status);

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read rooms" ON rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON rooms;
DROP POLICY IF EXISTS "Anyone can update rooms" ON rooms;
DROP POLICY IF EXISTS "Anyone can delete rooms" ON rooms;

-- Policy: Anyone can read any room (needed for joining)
CREATE POLICY "Anyone can read rooms"
  ON rooms FOR SELECT
  USING (true);

-- Policy: Anyone can create a room
CREATE POLICY "Anyone can create rooms"
  ON rooms FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update a room (needed for answering questions)
CREATE POLICY "Anyone can update rooms"
  ON rooms FOR UPDATE
  USING (true);

-- Policy: Anyone can delete old rooms (optional, for cleanup)
CREATE POLICY "Anyone can delete rooms"
  ON rooms FOR DELETE
  USING (true);

-- Optional: Create a function to auto-delete old rooms after 24 hours
CREATE OR REPLACE FUNCTION delete_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Optional: You can set up a cron job in Supabase to run this daily
-- Go to Database > Cron Jobs in your Supabase dashboard and add:
-- SELECT delete_old_rooms();

-- Create visits table for admin dashboard analytics
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  event_type TEXT DEFAULT 'page_visit',
  metadata JSONB DEFAULT '{}'::jsonb,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by date
CREATE INDEX IF NOT EXISTS visits_created_at_idx ON visits(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert visits (for tracking)
CREATE POLICY "Anyone can insert visits"
  ON visits FOR INSERT
  WITH CHECK (true);

-- Policy: Only allow reading visits (for admin dashboard - no user auth, relies on password)
CREATE POLICY "Anyone can read visits"
  ON visits FOR SELECT
  USING (true);
