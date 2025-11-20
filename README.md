# PoolCalc - Pool Tournament Management App

A modern web application for managing pool tournaments with real-time leaderboards, automatic team randomization, and round-robin scheduling.

## Features

- **Tournament Creation**: Set up tournaments with venue, date, and time
- **Random Team Generation**: Automatically create randomized teams from player list
- **Round-Robin Scheduling**: Generate fair match schedules across multiple tables
- **Live Leaderboard**: Real-time updates of team standings and scores
- **Admin Panel**: Easy score entry interface for tournament administrators
- **Public View**: Shareable tournament pages for participants to track progress
- **Multi-Table Support**: Manage concurrent games across multiple pool tables

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React + TypeScript
- **Styling**: TailwindCSS
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL (Supabase)
- **Real-time**: Supabase Realtime (WebSocket subscriptions)
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: poolcalc (or your choice)
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
4. Wait for the project to be created (1-2 minutes)

#### Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

#### Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"

### 3. Configure Environment Variables

Update the `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace the values with your actual Supabase credentials from step 2.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Creating a Tournament

1. Click **"Create Tournament"** on the home page
2. Fill in tournament details:
   - **Venue Name**: Name of the location (required)
   - **Venue Location**: Full address (optional)
   - **Tournament Date**: Date of the tournament (required)
   - **Start Time**: When the tournament starts (optional)
   - **Number of Tables**: How many pool tables are available
   - **Number of Rounds**: How many rounds to play
3. Add players:
   - Type each player name and click **"Add"**
   - You need an **even number of players** (2, 4, 6, 8, 10, etc.)
4. Click **"Create Tournament"**
5. Teams will be randomly generated and matches will be scheduled

### Managing Tournament Scores (Admin)

1. On the tournament page, click **"Admin Panel"**
2. You'll see all incomplete matches
3. Click on the winning team for each match
4. The leaderboard updates automatically in real-time
5. Change tournament status:
   - **Setup**: Tournament is being prepared
   - **In Progress**: Tournament is live
   - **Completed**: Tournament is finished

### Viewing Tournament

- Each tournament has a unique URL: `/tournament/[id]`
- Share this URL with participants
- The page updates in real-time as matches complete
- View live leaderboard rankings
- See match schedule and results

## Database Schema

### Tables

**tournaments**
- Tournament metadata (venue, date, status)
- Tracks number of tables and rounds

**teams**
- Team information (two players per team)
- Win/loss record and points

**matches**
- Match details (round, table, teams)
- Winner tracking and completion status

### Real-time Features

The app uses Supabase Realtime to automatically update:
- Leaderboard standings when matches complete
- Match results across all viewers
- Tournament status changes

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **"Deploy"**

Your app will be live at `https://your-project.vercel.app`

### Environment Variables in Production

Make sure to set the same environment variables in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## How the Tournament Works

### Team Generation

When you create a tournament:
1. Player list is shuffled randomly (Fisher-Yates algorithm)
2. Players are paired sequentially into teams of 2
3. Each team gets unique names from their players

### Round-Robin Scheduling

The app uses a standard round-robin algorithm:
1. Every team plays every other team exactly once
2. Matches are distributed across available tables
3. Each round uses all tables simultaneously when possible
4. For N teams: (N × (N-1)) / 2 total matches

### Scoring

- Winner of a match: **1 point**
- Loser of a match: **0 points**
- Teams are ranked by total points
- Ties are broken by win count

## Troubleshooting

### "Failed to create tournament"

- Check that Supabase credentials are correct in `.env.local`
- Verify the database migration was run successfully
- Check browser console for specific error messages

### Real-time updates not working

- Ensure Supabase Realtime is enabled for your project
- Check that you're using the latest version of `@supabase/supabase-js`
- Verify Row Level Security policies are set correctly

### TypeScript errors

```bash
npm run build
```

This will show any type errors that need fixing.

## License

MIT License - feel free to use this for your own tournaments!

---

Built with Next.js and Supabase
