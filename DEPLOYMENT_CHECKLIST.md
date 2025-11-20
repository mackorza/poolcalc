# Vercel Deployment Checklist

## Ready to Deploy? Follow These Steps:

### ☐ Step 1: Create Supabase Project (5 minutes)

**If not done yet:**

1. Go to https://supabase.com
2. Sign up/Login
3. Click "New Project"
4. Fill in:
   - Name: `poolcalc`
   - Password: (save this!)
   - Region: (closest to you)
5. Wait for project creation

**Then:**

6. Settings → API
7. Copy these values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJ...
   ```
8. Keep these handy - you'll need them for Vercel!

### ☐ Step 2: Run Database Migration (2 minutes)

1. In Supabase → SQL Editor
2. Click "New Query"
3. Open `supabase/migrations/001_initial_schema.sql`
4. Copy all contents (Ctrl+A, Ctrl+C)
5. Paste into SQL Editor
6. Click "Run" or press Ctrl+Enter
7. Verify: "Success. No rows returned"

### ☐ Step 3: Test Locally (Optional, 3 minutes)

**Verify everything works before deploying:**

1. Update `.env.local` with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Go to http://localhost:3000
4. Create a test tournament
5. If it works → ready to deploy!

### ☐ Step 4: Push to GitHub (3 minutes)

**Create GitHub repository:**

1. Go to https://github.com/new
2. Repository name: `poolcalc`
3. Public or Private (your choice)
4. **Don't** initialize with README
5. Click "Create repository"

**Push your code:**

```bash
# Replace YOUR-USERNAME with your GitHub username
git remote add origin https://github.com/YOUR-USERNAME/poolcalc.git
git push -u origin main
```

**Verify:** Refresh GitHub - see your files!

### ☐ Step 5: Deploy to Vercel (5 minutes)

**Import project:**

1. Go to https://vercel.com
2. Sign up with GitHub (if new)
3. Click "Add New..." → "Project"
4. Find `poolcalc` → Click "Import"

**Add environment variables:**

Click "Environment Variables" and add BOTH:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJ... (your full key)
```

**Deploy:**

5. Click "Deploy"
6. Wait 1-2 minutes
7. Get your URL: `https://poolcalc-xxx.vercel.app`

### ☐ Step 6: Test Live App (2 minutes)

1. Click your Vercel URL
2. Click "Create Tournament"
3. Fill in venue, date, add players
4. Click "Create Tournament"
5. Verify tournament page loads
6. Test admin panel → enter a winner
7. Check leaderboard updates

**If all works:** 🎉 SUCCESS!

### ☐ Step 7: Share Your App

**Your live URLs:**
- Home: `https://poolcalc-xxx.vercel.app`
- Create Tournament: `https://poolcalc-xxx.vercel.app/admin`
- All Tournaments: `https://poolcalc-xxx.vercel.app/tournaments`

**Share with:**
- Tournament organizers
- Players
- Pool hall management

## Quick Command Reference

```bash
# Push updates to deploy
git add .
git commit -m "Your changes"
git push

# Vercel auto-deploys in 30-60 seconds!
```

## Troubleshooting

**Build fails on Vercel?**
- Check environment variables are set
- Verify both NEXT_PUBLIC_ variables exist
- Check values don't have extra spaces

**App deployed but database errors?**
- Verify Supabase migration was run
- Check environment variables match Supabase project
- Test locally with same credentials first

**Real-time not working?**
- Check Supabase Realtime is enabled
- Open browser console for errors
- Verify WebSocket connection

## All Done?

Your pool tournament app is now:
- ✅ Live on the internet
- ✅ Real-time updates working
- ✅ Accessible from any device
- ✅ Auto-deploys on git push
- ✅ Free hosting (Vercel + Supabase free tiers)

**Total time:** ~20 minutes
**Total cost:** $0

Enjoy managing your pool tournaments! 🎱🚀
