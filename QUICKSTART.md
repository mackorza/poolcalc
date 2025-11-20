# PoolCalc - Quickstart

## 30-Second Setup

1. **Install packages**
   ```bash
   npm install
   ```

2. **Create Supabase project at [supabase.com](https://supabase.com)**

3. **Run SQL migration**
   - Copy `supabase/migrations/001_initial_schema.sql`
   - Paste in Supabase SQL Editor → Run

4. **Add your Supabase keys to `.env.local`**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key
   ```

5. **Start the app**
   ```bash
   npm run dev
   ```

6. **Open http://localhost:3000**

That's it!

## URLs

- **Home**: `http://localhost:3000`
- **Create Tournament**: `http://localhost:3000/admin`
- **All Tournaments**: `http://localhost:3000/tournaments`
- **Tournament View**: `http://localhost:3000/tournament/[id]`

## Common Tasks

### Create a Tournament
1. Go to `/admin`
2. Enter venue name and date
3. Add players (must be even: 2, 4, 6, 8, 10...)
4. Click "Create Tournament"

### Record Match Results
1. Open tournament page
2. Click "Admin Panel"
3. Click on the winning team for each match
4. Leaderboard updates automatically

### Share Tournament
- Copy the tournament URL: `/tournament/[id]`
- Share with participants
- Everyone sees live updates

## Files You'll Edit

**Want to customize?**

- **Styling**: `app/globals.css` + TailwindCSS classes
- **Home page**: `app/page.tsx`
- **Tournament logic**: `lib/tournament/utils.ts`
- **Database**: `supabase/migrations/001_initial_schema.sql`

## Troubleshooting

**Can't create tournament?**
- Check `.env.local` has correct Supabase credentials
- Verify SQL migration was run
- Check browser console (F12) for errors

**Real-time not working?**
- Refresh the page
- Check Supabase Realtime is enabled in project settings

**Build errors?**
```bash
npm run build
```

## Deploy to Vercel

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/poolcalc.git
git push -u origin main
```

Then:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Add environment variables
4. Deploy!

## Full Documentation

- **README.md** - Complete documentation
- **SETUP.md** - Detailed setup guide
- **PROJECT_STRUCTURE.md** - Code architecture

## Tech Stack

- Next.js 15 + React + TypeScript
- TailwindCSS
- Supabase (PostgreSQL + Realtime)
- Vercel (hosting)

## Questions?

Check the full README.md or open an issue!
