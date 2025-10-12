# Vercel Deployment Guide

## Overview

Your Next.js application is perfectly structured for Vercel deployment. Vercel automatically handles:
- ✅ Frontend (React pages, components)
- ✅ Backend (API routes)
- ✅ Server-side rendering
- ✅ Automatic HTTPS
- ✅ Edge caching
- ✅ Environment variables

**No code reorganization needed!**

## Prerequisites

1. GitHub account (you already have this)
2. Vercel account (free tier available)
3. Your repository pushed to GitHub (✅ done)

## Step-by-Step Deployment

### 1. Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### 2. Import Your Project

1. Click "Add New Project"
2. Select your repository: `aj-hardimon/BostonHacks2025`
3. Vercel will auto-detect Next.js configuration
4. Click "Deploy" (for now, we'll add env vars after first deploy)

### 3. Configure Environment Variables

After initial deployment, add your environment variables:

1. Go to your project dashboard on Vercel
2. Click "Settings" → "Environment Variables"
3. Add these variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://zohaibm:HGRyj8Kp3sQHpsz6@budgetingapp.glbdxaf.mongodb.net/?retryWrites=true&w=majority&appName=budgetingapp
MONGODB_DB_NAME=budgeting_app

# Google Gemini AI Configuration
GEMINI_API_KEY=AIzaSyAbOzI24At4A9QK4JTJR9hUUIW6zX_WTX8

# Nessie API Configuration
NESSIE_API_KEY=fbdfae0ec262cc360150647282dfdeea

# Encryption Key (optional - leave commented for now)
# CSFLE_LOCAL_MASTER_KEY=WtYAqLD2+ZeF616UwAfNWNXGJtXkd0u3PUxkXx0NvwPtCI7Dv5K74kFsRhhgXwGX9vt9U4UGhDdNtorZ9zlE29fXVD4X8gFrPt9nECdVgVASXIrKO05qYbzRFrVVKx0w
```

**Important:** 
- Add each as a separate environment variable
- Select "Production", "Preview", and "Development" for each
- Don't include the `#` comments

### 4. Redeploy After Adding Environment Variables

1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Your app will rebuild with the environment variables

### 5. Access Your Deployed App

Your app will be available at:
```
https://your-project-name.vercel.app
```

You can also add a custom domain later.

## Project Structure (Current - Perfect for Vercel)

```
bostonhacks2025/
├── src/
│   ├── app/                  # Frontend pages + API routes
│   │   ├── page.tsx         # ✅ Frontend: Home page
│   │   ├── budget/          # ✅ Frontend: Budget pages
│   │   ├── transactions/    # ✅ Frontend: Transaction pages
│   │   └── api/             # ✅ Backend: API routes
│   │       ├── budget/      # Budget endpoints
│   │       ├── transactions/# Transaction endpoints
│   │       └── ai/          # AI endpoints
│   ├── components/          # ✅ Frontend: Reusable components
│   ├── hooks/               # ✅ Frontend: Custom React hooks
│   ├── context/             # ✅ Frontend: React context
│   └── app/backend/         # ✅ Backend: Business logic
│       ├── database.ts      # Database operations
│       ├── geminiAI.ts      # AI integration
│       └── nessieAPI.ts     # Nessie API
├── public/                  # ✅ Static assets
├── package.json             # ✅ Dependencies
├── next.config.ts           # ✅ Next.js configuration
└── .env.local              # ❌ Local only (not deployed)
```

**Vercel automatically:**
- Serves frontend pages as static/SSR
- Deploys API routes as serverless functions
- Handles routing between frontend and backend
- Manages build process

## How Vercel Handles Your App

### Frontend (React Pages)
```
User Request → Vercel Edge → SSR/Static Page → Browser
```

### Backend (API Routes)
```
Fetch Request → Vercel Serverless Function → Your API Code → Database → Response
```

**Example:**
```typescript
// Frontend: src/app/budget/page.tsx
const response = await fetch('/api/budget/get?userId=user123');

// Backend: src/app/api/budget/get/route.ts
export async function GET(request: NextRequest) {
  // This runs as a serverless function on Vercel
  const budget = await getBudget(userId);
  return NextResponse.json(budget);
}
```

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

1. **Production Deployments** (main branch)
   ```bash
   git push origin main
   ```
   - Deploys to: `your-app.vercel.app`
   - Uses production environment variables

2. **Preview Deployments** (other branches)
   ```bash
   git checkout -b feature-branch
   git push origin feature-branch
   ```
   - Creates preview URL: `your-app-git-feature-branch.vercel.app`
   - Uses preview environment variables
   - Perfect for testing before merging

3. **Pull Request Previews**
   - Each PR gets its own preview URL
   - Comment on PR with preview link
   - Test changes before merging

## MongoDB Atlas Configuration

**Important:** Allow Vercel's IP addresses in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Navigate to "Network Access"
3. Click "Add IP Address"
4. Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add Vercel's IP ranges (recommended for production)

**Why?** Vercel serverless functions use dynamic IPs, so you need to whitelist them.

## Testing After Deployment

### 1. Test Frontend Pages
```
https://your-app.vercel.app/
https://your-app.vercel.app/budget
https://your-app.vercel.app/create-budget
https://your-app.vercel.app/transactions
https://your-app.vercel.app/ai-assistant
```

### 2. Test API Endpoints
```bash
# PowerShell
$baseUrl = "https://your-app.vercel.app"

# Test budget endpoint
Invoke-RestMethod -Uri "$baseUrl/api/budget/get?userId=user123" -Method Get

# Test transactions endpoint
Invoke-RestMethod -Uri "$baseUrl/api/transactions/history?userId=user123" -Method Get

# Test AI endpoint
$body = @{
    userId = "user123"
    message = "How can I save more money?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/api/ai/recommendations" -Method Post -ContentType "application/json" -Body $body
```

### 3. Check Logs

1. Go to Vercel dashboard
2. Click on your deployment
3. Click "Functions" tab
4. View logs for each API route
5. Debug any errors

## Common Issues & Solutions

### Issue 1: Environment Variables Not Working

**Symptom:** API endpoints return errors about missing env vars

**Solution:**
1. Check "Settings" → "Environment Variables"
2. Ensure all variables are set for Production
3. Redeploy after adding variables

### Issue 2: MongoDB Connection Fails

**Symptom:** "Unable to connect to MongoDB"

**Solution:**
1. Verify MongoDB Atlas allows Vercel IPs (0.0.0.0/0)
2. Check `MONGODB_URI` is correct in Vercel
3. Test connection string locally first

### Issue 3: Build Fails

**Symptom:** Deployment shows "Build Error"

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure `npm run build` works locally
3. Fix TypeScript errors
4. Check dependencies in `package.json`

### Issue 4: API Routes Return 404

**Symptom:** `/api/budget/get` returns 404

**Solution:**
1. Verify file structure: `src/app/api/budget/get/route.ts`
2. Check route exports `GET` or `POST` function
3. Redeploy if files were recently added

### Issue 5: Slow Cold Starts

**Symptom:** First API request takes 3-5 seconds

**Solution:**
- This is normal for serverless functions
- Subsequent requests will be faster
- Consider upgrading to Vercel Pro for faster cold starts

## Performance Optimization

### 1. Enable Edge Caching

Add to API routes that don't change often:

```typescript
// src/app/api/some-route/route.ts
export const revalidate = 60; // Cache for 60 seconds
```

### 2. Optimize Images

Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image 
  src="/logo.png" 
  width={200} 
  height={100} 
  alt="Logo"
/>
```

### 3. Database Connection Pooling

Your `database.ts` already has connection caching - perfect for serverless!

```typescript
// src/app/backend/database.ts
let cachedClient: MongoClient | null = null;
```

## Security Best Practices

### 1. Never Commit `.env.local`

Already in `.gitignore` ✅

### 2. Use Environment Variables

All secrets in Vercel environment variables ✅

### 3. Validate User Input

Add validation to API routes:

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  if (!body.userId || typeof body.userId !== 'string') {
    return NextResponse.json(
      { error: 'Invalid userId' },
      { status: 400 }
    );
  }
  
  // ... rest of code
}
```

### 4. Rate Limiting

Consider adding rate limiting for production:

```bash
npm install @upstash/ratelimit @upstash/redis
```

## Monitoring & Analytics

### 1. Vercel Analytics

Enable in dashboard:
- Go to "Analytics" tab
- Enable Web Analytics (free)
- See page views, performance metrics

### 2. Function Logs

- View in "Functions" tab
- See execution time, errors
- Debug issues in production

### 3. Performance Monitoring

- Check "Speed Insights"
- Optimize slow pages
- Monitor Core Web Vitals

## Custom Domain (Optional)

### 1. Add Domain in Vercel

1. Go to "Settings" → "Domains"
2. Add your domain (e.g., `budgetapp.com`)
3. Follow DNS configuration instructions

### 2. Update DNS Records

Add these records at your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 3. Wait for DNS Propagation

- Usually takes 5-30 minutes
- Vercel will auto-provision SSL certificate
- Your app will be available at your custom domain

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables added to Vercel
- [ ] MongoDB Atlas allows Vercel IPs
- [ ] `npm run build` works locally
- [ ] All TypeScript errors fixed
- [ ] Tested all critical API endpoints locally
- [ ] Removed console.logs or debugging code
- [ ] Updated README with deployment info
- [ ] Tested on mobile devices (responsive design)
- [ ] Set up error monitoring (optional)
- [ ] Configure custom domain (optional)

## Costs

### Vercel Pricing (as of 2025)

**Hobby (Free):**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless function executions
- ✅ Automatic HTTPS
- ⚠️ 1 team member only
- ⚠️ Slower cold starts

**Pro ($20/month):**
- ✅ Everything in Hobby
- ✅ Faster serverless functions
- ✅ More bandwidth
- ✅ Team collaboration
- ✅ Password protection
- ✅ Analytics

**For a hackathon/demo:** Hobby plan is perfect!

### MongoDB Atlas Costs

**M0 (Free):**
- ✅ 512MB storage
- ✅ Shared cluster
- ✅ Good for demos/testing

**Your current usage:** Free tier is fine for BostonHacks demo

## Post-Deployment

### Share Your App

```
Production URL: https://your-app.vercel.app
GitHub: https://github.com/aj-hardimon/BostonHacks2025
```

### Monitoring

1. Check Vercel dashboard daily
2. Monitor error rates
3. Review function execution logs
4. Check bandwidth usage

### Updates

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys in ~2 minutes
```

## Troubleshooting Commands

```bash
# Check build locally (before deploying)
npm run build

# Run production build locally
npm run start

# Clear Next.js cache if issues
rm -rf .next
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# View Vercel logs (install Vercel CLI)
npm i -g vercel
vercel logs
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas + Vercel](https://www.mongodb.com/developer/products/atlas/deploy-nextjs-mongodb-atlas/)

---

## Quick Start (TL;DR)

1. **Sign up:** [vercel.com](https://vercel.com) with GitHub
2. **Import:** Select your repository
3. **Add env vars:** MongoDB, Gemini, Nessie API keys
4. **Deploy:** Click deploy button
5. **Done!** Your app is live at `your-app.vercel.app`

**Your current code structure is already perfect for Vercel - no reorganization needed!** 🚀

---

**Created:** October 12, 2025  
**Status:** Ready to Deploy ✅
