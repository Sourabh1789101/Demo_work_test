# 🚀 Integration & Deployment Guide

**Complete guide for deploying KIM AI Form Builder to production**

---

## 📋 Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Database Setup](#database-setup)
3. [AI Integration (Claude)](#ai-integration-claude)
4. [Vercel Deployment](#vercel-deployment)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

---

## 🏠 Local Development Setup

### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL 16 (or Docker)
- Git

### Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone <repo-url>
cd kim-ai-form-builder

# 2. Install dependencies
npm install

# 3. Start PostgreSQL (if using Docker)
docker compose up -d

# 4. Copy environment templates
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 5. Configure apps/api/.env
nano apps/api/.env
# Edit: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, ANTHROPIC_API_KEY

# 6. Start development server
npm run dev

# 7. Open browser
# Frontend: http://localhost:5173
# API: http://localhost:4000
# API Docs: http://localhost:4000/api/docs
```

---

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

```bash
# Start PostgreSQL in Docker
docker compose up -d

# Verify connection
psql postgresql://postgres:postgres@localhost:5432/form_builder -c "SELECT 1"

# Stop when done
docker compose down
```

### Option 2: NeonDB (Recommended for Production)

1. Go to [neon.tech](https://neon.tech)
2. Create project → Copy connection string
3. Add to `apps/api/.env`:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require
   ```

### Option 3: Other PostgreSQL Hosts

- **AWS RDS:** Get endpoint from RDS console
- **GCP Cloud SQL:** Get public IP + password
- **DigitalOcean:** Get managed database connection string

### Auto-Migration

Tables are created automatically on first API startup:
```bash
npm run dev:api
# Logs: "✅ Database initialized with 10 tables"
```

---

## 🤖 AI Integration (Claude)

### Setup

1. **Get API Key:**
   - Go to [console.anthropic.com](https://console.anthropic.com)
   - Create → API Keys
   - Copy key starting with `sk-ant-v0-`

2. **Add to Environment:**
   ```bash
   # apps/api/.env
   ANTHROPIC_API_KEY=sk-ant-v0-xxxxx
   ```

3. **Verify:**
   ```bash
   # Frontend: Go to http://localhost:5173/builder
   # Click "AI Generate" button
   # Enter prompt: "Create a contact form with name, email, and message"
   # Should generate form within 10 seconds
   ```

### Rate Limiting

- **Limit:** 10 generations/hour per user
- **Cost:** ~$0.06 per generation (Claude 3.5 Sonnet)
- **Model:** claude-3-5-sonnet-20241022

### Troubleshooting

```bash
# Check if key is set
echo $ANTHROPIC_API_KEY

# Test API directly
curl -X POST http://localhost:4000/api/ai/generate-form \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a feedback form"}'
```

---

## 🚀 Vercel Deployment

### Step 1: Prepare Repository

```bash
# Ensure .gitignore is correct
cat .gitignore
# Should exclude: node_modules, .env, dist, build

# Check for uncommitted changes
git status

# Commit everything
git add .
git commit -m "Complete Phase 3: AI form generator"
git push origin main
```

### Step 2: Create NeonDB Project

1. Go to [neon.tech](https://neon.tech)
2. Sign up (free tier available)
3. Create project
4. Copy connection string
5. Keep for later (needed in Vercel)

### Step 3: Deploy on Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "Import Project"**
4. **Select your repository**
5. **Configure:**
   - **Framework Preset:** Other
   - **Root Directory:** `.` (monorepo)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all values from `apps/api/.env`:

   ```
   NODE_ENV           = production
   PORT                = 4000
   DATABASE_URL        = <NeonDB connection string>
   JWT_SECRET          = <generate new>
   JWT_REFRESH_SECRET  = <generate new>
   ANTHROPIC_API_KEY   = <from console.anthropic.com>
   STRIPE_SECRET_KEY   = <from stripe.com (optional)>
   ALLOWED_ORIGINS     = https://yourdomain.com,https://www.yourdomain.com
   ```

7. **Click "Deploy"**
8. **Wait 3-5 minutes**
9. **Visit your URL** ✅

### Generate Secure Secrets

```bash
# Generate JWT_SECRET and JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Run twice for two different values

# Use those values in Vercel environment variables
```

### Verify Deployment

```bash
# Check API health
curl https://your-project.vercel.app/health
# → {"status":"ok","service":"api","timestamp":"..."}

# List forms
curl https://your-project.vercel.app/api/forms
# → {"success":true,"data":[]}

# Frontend
# Open https://your-project.vercel.app in browser
# Should see login page
```

---

## 📝 Environment Variables

### Required for All Deployments

| Variable | Example | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | Set to `production` for Vercel |
| `PORT` | `4000` | API port |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection |
| `JWT_SECRET` | _(32 random chars)_ | Sign access tokens |
| `JWT_REFRESH_SECRET` | _(32 random chars)_ | Sign refresh tokens |

### Required for AI Feature

| Variable | Example | Notes |
|----------|---------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-v0-...` | Get from console.anthropic.com |

### Optional

| Variable | Example | Use Case |
|----------|---------|----------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Payment forms |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhooks |
| `ALLOWED_ORIGINS` | `https://app.com` | CORS whitelist |
| `REDIS_URL` | `redis://...` | Caching (optional) |
| `SMTP_*` | `smtp.gmail.com` | Email notifications |

---

## 🧪 Testing

### Run All Tests

```bash
# Frontend + Backend
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Manual Testing Checklist

- [ ] **Signup:** Create new account → verify JWT tokens
- [ ] **Login:** Sign in → verify auth works
- [ ] **Builder:** Create form → drag fields → preview
- [ ] **AI Generate:** Click "AI Generate" → enter prompt → verify form created
- [ ] **Save Form:** Click save → verify in database
- [ ] **Export:** Export HTML/JSON
- [ ] **Public Link:** Share form → test submission
- [ ] **Analytics:** Check submission count on dashboard

---

## 🐛 Troubleshooting

### "DATABASE_URL is required"

**Solution:**
```bash
# Check if env file exists
ls apps/api/.env

# Check if DATABASE_URL is set
grep DATABASE_URL apps/api/.env

# If empty, add it:
echo 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/form_builder' >> apps/api/.env

# Restart API
npm run dev:api
```

### "ANTHROPIC_API_KEY is not set"

**Solution:**
```bash
# Go to console.anthropic.com and create API key
# Add to apps/api/.env
echo 'ANTHROPIC_API_KEY=sk-ant-v0-xxxxx' >> apps/api/.env

# Restart API
npm run dev:api
```

### "AI generation returns 503"

**Cause:** Claude API rate limit or API key invalid

**Solution:**
```bash
# Verify API key
echo $ANTHROPIC_API_KEY

# Test with curl
curl -X POST http://localhost:4000/api/ai/generate-form \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# Check logs
tail -f logs/app.log
```

### "Port 5173 already in use"

**Solution:**
```bash
# Kill the process using the port
npx kill-port 5173

# Or use a different port
npm run dev -- --port 5174
```

### "TypeScript errors"

**Solution:**
```bash
# Clear build cache
rm -rf dist node_modules/.vite

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

### "Database connection reset"

**Solution:**
```bash
# Restart PostgreSQL
docker compose restart postgres

# Verify connection
psql $DATABASE_URL -c "SELECT 1"

# Clear Vercel cache and redeploy
# (In Vercel dashboard: Settings → Deployments → Redeploy)
```

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] All env variables are set correctly
- [ ] Database is backed up
- [ ] JWT secrets are different and random (32+ chars)
- [ ] CORS origins are restricted (not `*`)
- [ ] ANTHROPIC_API_KEY is valid
- [ ] Stripe webhook secrets configured (if using payments)
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in browser DevTools
- [ ] Rate limits are appropriate for your use case
- [ ] Error logging is configured
- [ ] Database backups are automated
- [ ] SSL/TLS is enforced (Vercel handles this)

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│           Vercel Edge Network                   │
│  Frontend (React) + API Functions (Express)     │
└────────────────────┬────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
      NeonDB    Anthropic   Stripe API
    (Database)   (Claude)    (Payments)
```

---

## 🎯 Next Steps

1. **Setup NeonDB:** 5 minutes
2. **Get API Keys:** 5 minutes
   - Anthropic: console.anthropic.com
   - Stripe: stripe.com (optional)
3. **Deploy to Vercel:** 10 minutes
4. **Test in Production:** 10 minutes
5. **Go Live!** 🎉

---

## 📞 Support

- **Docs:** Read this guide + `README.md`
- **API Reference:** `http://localhost:4000/api/docs` (Swagger)
- **Issues:** GitHub Issues
- **Discussion:** GitHub Discussions

---

**Ready to deploy? Start with [NeonDB Setup](https://neon.tech/docs/get-started-with-neon/signing-up)** ⚡
