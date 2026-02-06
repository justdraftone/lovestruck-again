# 🚀 Quick Start Guide - Supabase Remote Couples Mode

## ⚡ 5-Minute Setup

### 1. Create Supabase Project (2 min)
```bash
# Go to: https://supabase.com/dashboard
# Click: "New Project"
# Name: lovestruck-again
# Click: "Create new project"
```

### 2. Get Your Credentials (1 min)
```bash
# In Supabase Dashboard:
# Go to: Settings → API
# Copy: Project URL
# Copy: anon public key
```

### 3. Update .env File (30 sec)
```bash
# Open: .env
# Replace with your actual values:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx...
```

### 4. Create Database Table (1 min)
```bash
# In Supabase Dashboard:
# Go to: SQL Editor
# Click: "New Query"
# Copy/paste the SQL below and click "Run"
```

```sql
-- Create rooms table
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

CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public create" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON rooms FOR UPDATE USING (true);
```

### 5. Enable Realtime (30 sec)
```bash
# In Supabase Dashboard:
# Go to: Database → Replication
# Find: "rooms" table
# Toggle: ON (enable replication)
```

### 6. Restart Your App (10 sec)
```bash
# Stop current dev server (Ctrl+C)
npm run dev
# Or: yarn dev
```

## ✅ Test It Works

1. **Open**: http://localhost:5173/couples/remote
2. **See**: Invitation screen with room code
3. **Copy**: Join link
4. **Open**: Link in another browser/incognito window
5. **Play**: Answer questions together
6. **Check**: Results page loads with both personas

## 🎯 Success Checklist

- [ ] Supabase project created
- [ ] `.env` file updated with real credentials
- [ ] SQL schema executed successfully
- [ ] Realtime enabled on `rooms` table
- [ ] Dev server restarted
- [ ] Room creation works (no errors)
- [ ] Room joining works (partner sees host name)
- [ ] Turn-based gameplay works
- [ ] Results page shows compatibility

## 🐛 Quick Debug

**Can't create room?**
```bash
# Check credentials in browser console:
console.log(import.meta.env.VITE_SUPABASE_URL)
# Should show: "https://xxxxx.supabase.co"
# If it shows undefined, restart dev server
```

**Real-time not working?**
```bash
# In Supabase Dashboard:
# Database → Replication → rooms → Should be green/ON
```

**Still stuck?**
See detailed troubleshooting in `SUPABASE_SETUP.md`

## 📖 Full Documentation

- **`SUPABASE_SETUP.md`** - Detailed step-by-step setup with screenshots
- **`IMPLEMENTATION_SUMMARY.md`** - Complete technical overview
- **Supabase Docs** - https://supabase.com/docs

## 🎉 You're Done!

Your remote couples quiz is now live with real-time multiplayer! 🎊
