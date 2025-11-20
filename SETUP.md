# Quick Setup Guide

Follow these steps to get your PoolCalc tournament app running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase Database

### 2.1 Create Supabase Account

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Enter:
   - **Name**: poolcalc
   - **Database Password**: (save this!)
   - **Region**: (choose closest to you)
5. Wait 1-2 minutes for setup

### 2.2 Get API Keys

1. In Supabase dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 2.3 Update Environment Variables

Edit `.env.local` and replace with your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

### 2.4 Run Database Migration

1. In Supabase → **SQL Editor**
2. Click **New Query**
3. Open `supabase/migrations/001_initial_schema.sql`
4. Copy all contents
5. Paste into SQL Editor
6. Click **Run**
7. Should see "Success"

## Step 3: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 4: Create Your First Tournament

1. Click "Create Tournament"
2. Fill in venue name and date
3. Add player names (must be even number)
4. Click "Create Tournament"
5. Done!

## Troubleshooting

**"Can't connect to database"**
- Check `.env.local` has correct Supabase URL and key
- Ensure database migration was run

**"Failed to create tournament"**
- Open browser console (F12) for error details
- Verify even number of players (2, 4, 6, 8, etc.)

**Real-time not updating**
- Refresh the page
- Check Supabase project is active
- Verify Realtime is enabled in Supabase settings

## Next Steps

- Deploy to Vercel (see README.md)
- Share tournament URL with participants
- Use Admin Panel to enter scores
- Watch leaderboard update in real-time!

## Need Help?

See full README.md for detailed documentation.
