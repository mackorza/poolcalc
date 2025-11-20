# Test Supabase Connection

## Check if Database Migration is Run

1. Go to your Supabase project: https://supabase.com/dashboard/projects
2. Click on your `poolcalc` project
3. Go to **Table Editor** (left sidebar)
4. You should see these 3 tables:
   - ✅ `tournaments`
   - ✅ `teams`
   - ✅ `matches`

**If you DON'T see these tables**, you need to run the migration:

### Run Database Migration

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Open the file `supabase/migrations/001_initial_schema.sql` (in your project)
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. You should see: "Success. No rows returned"

### Verify Tables Were Created

1. Go back to **Table Editor**
2. You should now see all 3 tables
3. Click on `tournaments` - it should show columns like `id`, `venue_name`, `tournament_date`, etc.

## Check Vercel Environment Variables

The 500 error on `/tournaments` suggests the Supabase credentials might not be set in Vercel.

### Verify in Vercel:

1. Go to https://vercel.com/mackor-projects/poolcalc/settings/environment-variables
2. Check you have both:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ... (long string)
   ```

### Get Your Credentials:

1. In Supabase → **Settings** → **API**
2. Copy:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

### Add to Vercel:

1. In Vercel → Settings → Environment Variables
2. Click **Add New**
3. Add both variables
4. Save
5. Go to **Deployments** tab
6. Click **...** → **Redeploy** on latest deployment

## Test After Setup

Once both are done:

1. Wait for Vercel redeploy to complete (~1 minute)
2. Visit: https://poolcalc.vercel.app/tournaments
3. Should show "No tournaments yet" (if working)
4. Go to: https://poolcalc.vercel.app/admin
5. Create a test tournament
6. Should redirect to tournament page

## Common Issues

**Still getting 500 error?**
- Check Supabase project is active (not paused)
- Verify environment variables have no extra spaces
- Check you copied the FULL anon key (starts with `eyJ` and is very long)

**"Invalid Supabase URL" error?**
- URL must be full URL: `https://xxxxx.supabase.co`
- Not just the project ID

**Tables not showing in Supabase?**
- Make sure SQL migration completed successfully
- Check for any error messages in SQL Editor
