# 🚀 Deploy KIM AI Form Builder - COMPLETELY FREE

## FREE Hosting Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (FREE TIER)                      │
│  • Frontend: React app (unlimited)                          │
│  • Backend: Serverless Functions (~100hrs CPU/month)        │
│  • Cold starts: OK for small teams                          │
│  • Custom domain: ✅ Free                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │    NEONDB (FREE TIER)        │
        │  • PostgreSQL: 3GB storage   │
        │  • 20 connections            │
        │  • Unlimited queries         │
        │  • Perfect for small forms   │
        └──────────────────────────────┘
```

## Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| **Vercel** | FREE | 100GB bandwidth/mo + Serverless |
| **NeonDB** | FREE | 3GB PostgreSQL + 20 connections |
| **Anthropic API** | ~$0.06/generation | ~10 free tests, then pay-as-you-go |
| **Total** | **~$0.60/month** | (if you only test AI) |

---

## Step 1️⃣ - Create GitHub Repository

```bash
cd "d:/Work in the company task/Drag-drop website/KIM_AI"

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit: KIM AI Form Builder"
git branch -M main

# Create repo on GitHub (https://github.com/new)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/formbuilder.git
git push -u origin main
```

---

## Step 2️⃣ - Create Vercel Account & Deploy

### 2.1: Sign up on Vercel (FREE)
1. Go to **https://vercel.com/sign-up**
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your repositories

### 2.2: Import Your Project
1. Click **"Add New"** → **"Project"**
2. Select your `formbuilder` repository
3. Configure build settings:

| Setting | Value |
|---------|-------|
| **Framework** | Other (Turborepo) |
| **Build Command** | `npm run build` |
| **Output Directory** | `apps/web/dist` |
| **Root Directory** | `.` (default) |

4. Click **"Deploy"** ⏳ (will fail - that's OK, we'll add env vars next)

### 2.3: Add Environment Variables

Go to **Vercel Dashboard → Settings → Environment Variables**

Add these (we'll generate/get them in next steps):

```
DATABASE_URL             (from NeonDB)
ANTHROPIC_API_KEY        (from Anthropic)
JWT_SECRET               (generate)
JWT_REFRESH_SECRET       (generate)
NODE_ENV                 production
VITE_API_BASE_URL        https://your-vercel-app.vercel.app/api
```

---

## Step 3️⃣ - Create FREE PostgreSQL Database (NeonDB)

### 3.1: Sign up for NeonDB
1. Go to **https://neon.tech**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**

### 3.2: Create Database
1. Click **"Create New Project"**
2. Fill in:
   - **Database name:** `form_builder`
   - **Region:** `US East` (closest to you)
   - **Postgres version:** `16`
3. Click **"Create Project"**

### 3.3: Get Connection String
1. On the dashboard, copy the **"Connection string"**
2. Should look like:
   ```
   postgresql://user:password@ep-xxxxx.us-east-2.neon.tech/form_builder?sslmode=require
   ```

### 3.4: Add to Vercel
1. Go back to Vercel → Your Project → Settings → Environment Variables
2. Add:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.neon.tech/form_builder?sslmode=require
   ```
3. Click **"Save"** ✅

---

## Step 4️⃣ - Generate Secrets

Run these commands locally to generate JWT secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1

# Copy this value to Vercel → JWT_SECRET
# Repeat for JWT_REFRESH_SECRET
```

---

## Step 5️⃣ - Get FREE Claude API Key

1. Go to **https://console.anthropic.com**
2. Sign up or login
3. Click **"API keys"** in left menu
4. Click **"Create Key"**
5. Name it: `form-builder`
6. Copy the key: `sk-ant-v0-xxxxx...`
7. Add to Vercel:
   ```
   ANTHROPIC_API_KEY=sk-ant-v0-xxxxx
   ```

**FREE LIMITS:**
- First 10 API calls are free
- Then: $0.003 per 1K input tokens, $0.015 per 1K output tokens
- Example: 1 form generation = ~$0.06

---

## Step 6️⃣ - Local Testing Before Deploy

```bash
# Create local .env
cp apps/api/.env.example apps/api/.env

# Fill in:
cat > apps/api/.env << 'EOF'
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.neon.tech/form_builder?sslmode=require
JWT_SECRET=<your-generated-secret>
JWT_REFRESH_SECRET=<your-generated-secret2>
ANTHROPIC_API_KEY=sk-ant-v0-xxxxx
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
VITE_API_BASE_URL=http://localhost:4000/api
EOF

# Test
npm run dev

# In another terminal:
curl http://localhost:4000/health
# Should return: {"status":"ok","service":"api",...}
```

---

## Step 7️⃣ - Deploy to Vercel

```bash
# Make sure all env vars are in Vercel ✅
# Then push:

git add .
git commit -m "Add environment configuration for Vercel"
git push origin main

# Vercel auto-deploys on push! 🎉
# Check: https://vercel.com/dashboard
```

---

## Step 8️⃣ - Verify Deployment

Once deployment finishes:

1. **Frontend:** `https://your-project.vercel.app`
2. **API:** `https://your-project.vercel.app/api/health`
3. **Database:** Connection from Vercel → NeonDB ✅

Test signup:
```bash
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

---

## ⚠️ FREE Tier Limitations

| Resource | FREE | Limit | Workaround |
|----------|------|-------|-----------|
| **Vercel Bandwidth** | 100GB/mo | ✅ Usually enough | Monitor usage |
| **Serverless Duration** | 10 seconds | ⚠️ Long operations timeout | Keep functions quick |
| **CPU Per Month** | ~100 CPU-hours | ⚠️ ~3-4 concurrent users | Upgrade at $20/mo |
| **NeonDB Storage** | 3GB | ✅ OK for testing | Archive old forms |
| **NeonDB Connections** | 20 | ⚠️ Can hit limit | Use connection pooling |

---

## 💡 Tips to Stay FREE

### 1. **Reduce Cold Starts**
```bash
# Keep functions warm with a periodic ping (CRON job free on Vercel)
# In your scheduler service:
setInterval(async () => {
  fetch('https://your-app.vercel.app/api/health')
}, 5 * 60 * 1000) // Every 5 minutes
```

### 2. **Monitor API Usage**
- Anthropic Dashboard: Check token count
- Vercel Analytics: Monitor bandwidth/CPU
- NeonDB Dashboard: Check storage used

### 3. **Archive Old Forms**
```bash
# Delete submissions older than 90 days to free NeonDB space
DELETE FROM submissions WHERE created_at < NOW() - INTERVAL '90 days';
```

### 4. **Upgrade When Needed**
- **Vercel Pro:** $20/month (unlimited everything)
- **NeonDB Pro:** $20/month (100GB + unlimited connections)

---

## 🔄 Full Deployment Checklist

- [ ] GitHub repo created
- [ ] Vercel project imported
- [ ] NeonDB database created
- [ ] Environment variables added to Vercel:
  - [ ] `DATABASE_URL`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
  - [ ] `VITE_API_BASE_URL`
- [ ] Local `.env` configured
- [ ] Local test: `npm run dev` ✅
- [ ] Local test: `curl http://localhost:4000/health` ✅
- [ ] Push to GitHub
- [ ] Vercel deployment complete ✅
- [ ] Test production signup at `https://your-project.vercel.app`
- [ ] AI generation test (will cost ~$0.06)

---

## 📊 Monthly Cost

**If you create 100 forms/month:**
- Vercel: **$0** (FREE tier)
- NeonDB: **$0** (FREE tier)
- Claude API: ~100 × $0.06 = **$6**
- **Total: ~$6/month** 💰

**Scale up later:**
- Vercel Pro: $20/mo
- Vercel Pro + NeonDB: $40/mo
- **For small teams: Still cheaper than competitors!**

---

## 🆘 Troubleshooting

**Deployment failed: "DATABASE_URL is required"**
```bash
# Check Vercel env vars are set
# Redeploy after adding DATABASE_URL
```

**502 Bad Gateway**
```bash
# Function timed out (>10s)
# Keep API responses fast
# Or upgrade to Pro tier
```

**"Too many connections" error**
```bash
# Hit NeonDB 20-connection limit
# Restart Vercel deployment
# Or use connection pooling
```

---

## Next Steps

After deployment:

1. ✅ **Create a form** → Sign up → Build form → Save
2. ✅ **Test AI generation** → Click "Generate with AI" → Enter prompt
3. ✅ **Collect submissions** → Share form link → Get responses
4. ✅ **Monitor usage** → Check Vercel & NeonDB dashboards

---

## Support

- **Vercel:** https://vercel.com/docs
- **NeonDB:** https://neon.tech/docs
- **Anthropic:** https://docs.anthropic.com
- **This Project:** See `README.md` and `DOCUMENTATION.md`

---

**🎉 Your form builder is now LIVE and FREE! Deploy in <30 minutes. No credit card required for Vercel + NeonDB free tiers!**
