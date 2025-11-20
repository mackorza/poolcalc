# Deploy PoolCalc to Vercel

## Prerequisites

Before deploying, make sure you have:
- ✅ GitHub account
- ✅ Vercel account (free - sign up at https://vercel.com)
- ✅ Supabase project created
- ✅ Supabase credentials ready

## Step 1: Push to GitHub

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `poolcalc` (or your choice)
3. Description: "Pool Tournament Management App"
4. **Keep it Public** or Private (your choice)
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### 1.2 Push Your Code

GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR-USERNAME/poolcalc.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

**Verify:** Refresh GitHub - you should see all your files uploaded.

## Step 2: Deploy to Vercel

### 2.1 Connect Vercel to GitHub

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### 2.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find `poolcalc` in the list
3. Click **"Import"**

### 2.3 Configure Project

**Framework Preset:** Next.js (auto-detected ✅)

**Root Directory:** `./` (leave as default)

**Build Settings:** (auto-configured ✅)
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### 2.4 Add Environment Variables

This is **CRITICAL** - click **"Environment Variables"** and add:

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGci... (your full anon key)
```

**Where to get these values:**
1. Go to your Supabase project
2. Settings → API
3. Copy "Project URL" and "anon public" key

### 2.5 Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Watch the build logs (optional but cool!)
4. See "Congratulations!" when done

## Step 3: Your App is Live!

Vercel will give you a URL like:
```
https://poolcalc.vercel.app
```

Or:
```
https://poolcalc-yourusername.vercel.app
```

Click the URL to visit your live app!

## Step 4: Test Your Deployment

1. **Visit your URL**
2. Click **"Create Tournament"**
3. Fill in venue, date, players
4. Create tournament
5. Verify it works!

**If it works:** 🎉 You're live!

**If you get Supabase errors:** Check environment variables are set correctly in Vercel dashboard.

## Updating Your App

Every time you push to GitHub, Vercel automatically redeploys:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys!
```

**Auto-deploy:** Within 30-60 seconds, your changes are live.

## Custom Domain (Optional)

Want `poolcalc.yourdomain.com` instead of `vercel.app`?

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions
4. Wait 5-10 minutes for DNS propagation

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Solution: Make sure all dependencies are in `package.json`
- Run `npm install` locally first

**Error: "Environment variable not set"**
- Solution: Add both Supabase variables in Vercel dashboard
- Redeploy after adding

### App Deployed But Not Working

**"Invalid Supabase URL" error**
- Check environment variables in Vercel → Settings → Environment Variables
- Make sure they match your Supabase project
- Redeploy after fixing

**Database connection fails**
- Verify Supabase migration was run (check SETUP.md)
- Test locally first with same credentials
- Check Supabase project is active

### Real-time Not Working

**Updates not showing**
- Check Supabase Realtime is enabled
- Verify RLS policies in database
- Check browser console for WebSocket errors

## Vercel Dashboard Features

**Your Project Dashboard:**
- **Deployments:** See all deployments and rollback if needed
- **Analytics:** View traffic and performance
- **Logs:** Debug issues with runtime logs
- **Settings:** Update environment variables, domains, etc.

**Useful Commands:**

```bash
# Link local project to Vercel
npx vercel link

# Deploy from command line
npx vercel

# Deploy to production
npx vercel --prod
```

## Production Checklist

Before sharing with users:

- ✅ Supabase database migration run
- ✅ Environment variables set in Vercel
- ✅ Create a test tournament and verify it works
- ✅ Test on mobile device
- ✅ Test real-time updates with multiple browser tabs
- ✅ Verify admin panel works
- ✅ Check leaderboard updates correctly

## Cost

**Free Forever:**
- Vercel: Free for personal projects
- Supabase: Free tier (500 MB database, 2 GB bandwidth)

**Only pay if you scale beyond:**
- 100 GB bandwidth/month (Vercel)
- 500 MB database (Supabase)

Most pool tournament apps will **never** hit these limits!

## Monitoring

**Vercel automatically provides:**
- Uptime monitoring
- Performance analytics
- Error tracking
- Build logs

**Access at:** https://vercel.com/your-username/poolcalc

## Support

**If you get stuck:**

1. Check Vercel deployment logs
2. Check browser console (F12)
3. Verify Supabase credentials
4. Re-read SETUP.md for Supabase configuration
5. Check Vercel documentation: https://vercel.com/docs

## Next Steps After Deploy

1. **Share the URL** with your pool tournament participants
2. **Bookmark** the admin panel: `your-url.vercel.app/admin`
3. **Test** creating a tournament
4. **Share** tournament URLs with players
5. **Enjoy** real-time tournament management!

## Summary

```bash
# Quick deploy checklist:
1. ✅ Push to GitHub
2. ✅ Import to Vercel
3. ✅ Add environment variables
4. ✅ Deploy
5. ✅ Test and enjoy!
```

**Time to deploy:** 5-10 minutes
**Cost:** $0 (free forever for most users)
**Auto-updates:** Yes (on every git push)

---

Your pool tournament app is ready for the world! 🎱🚀
