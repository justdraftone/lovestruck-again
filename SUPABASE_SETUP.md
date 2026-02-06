# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it "lovestruck-again" (or any name you prefer)
4. Set a secure database password
5. Choose your region
6. Click "Create new project"

## Step 2: Get Credentials

1. Once the project is created, go to **Project Settings** > **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

3. Update your `.env` file:
   ```
   VITE_SUPABASE_URL=<your-project-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

## Step 3: Create Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Create the rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  partner1_name TEXT NOT NULL,
  partner1_id TEXT NOT NULL,
  partner2_name TEXT,
  partner2_id TEXT,
  current_question INTEGER DEFAULT 0,
  current_turn INTEGER DEFAULT 1,
  partner1_answers JSONB DEFAULT '{}'::jsonb,
  partner2_answers JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  question_set TEXT DEFAULT 'global',
  selected_question_ids INTEGER[]
);

-- Create indexes for better performance
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_created_at ON rooms(created_at);
```

4. Click "Run" to execute the query

## Step 4: Enable Realtime

1. In the Supabase dashboard, go to **Database** > **Replication**
2. Find the `rooms` table in the list
3. Toggle the switch to **enable** replication for the `rooms` table
4. This allows real-time subscriptions to work

## Step 5: Configure Row Level Security (RLS)

1. Go back to the **SQL Editor**
2. Create a new query and paste the following:

```sql
-- Enable RLS on the rooms table
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms (needed for real-time subscriptions)
CREATE POLICY "Allow public read access" ON rooms
  FOR SELECT USING (true);

-- Allow anyone to create rooms
CREATE POLICY "Allow public create" ON rooms
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update rooms
CREATE POLICY "Allow public update" ON rooms
  FOR UPDATE USING (true);

-- Optional: Auto-delete rooms older than 24 hours (for cleanup)
-- You can run this manually or set up a cron job
-- DELETE FROM rooms WHERE created_at < NOW() - INTERVAL '24 hours';
```

3. Click "Run" to execute the policies

## Step 6: Verify Setup

1. Restart your development server to pick up the new `.env` variables
2. Try creating a remote couples quiz
3. Check the Supabase dashboard **Table Editor** > `rooms` to see if a room was created
4. Test joining from another device/browser

## Troubleshooting

**If room creation fails:**
- Check browser console for errors
- Verify your `.env` credentials are correct
- Ensure the `rooms` table was created successfully
- Check that RLS policies are enabled

**If real-time doesn't work:**
- Verify replication is enabled for the `rooms` table
- Check browser console for subscription errors
- Ensure RLS policies allow SELECT operations

**If you see authentication errors:**
- Make sure you're using the **anon public** key, not the service role key
- The anon key is safe to use in the browser

## Next Steps

After completing setup:
1. Test the full flow: create room → join room → play quiz → view results
2. Test with two different browsers or devices
3. Check the database to verify answers are being stored correctly
