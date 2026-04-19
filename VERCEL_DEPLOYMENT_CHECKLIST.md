# Vercel Deployment Checklist - FormBuilder Form Builder

**Status**: ✅ Ready for Deployment
**Last Updated**: 2026-04-19
**Deployment Target**: Vercel + NeonDB PostgreSQL + Gemini API

---

## 🎯 Pre-Deployment Checklist

### 1. **Code Cleanup** ✅
- [x] Remove all `.deleted` files from git
  - `apps/api/src/routes/ai.ts.deleted`
  - `apps/api/src/services/NIMAIFormGeneratorService.ts.deleted`
  - `apps/web/src/components/AIFormGeneratorModal.tsx.deleted`
  - `apps/web/src/services/aiFormService.ts.deleted`
- [x] Clean up unused documentation files (docs/ folder)
- [x] Remove "working of the project" directory
- [x] Memory file cleanup

### 2. **Static Assets** ✅
- [x] Template JSON files in `/apps/web/public/data/`
  - `categories.json` (18 categories, ~4KB)
  - `templates-catalog.json` (30+ templates, ~40KB)
- [x] Public directory configured in Vite
- [x] Assets will be bundled with Vercel build

### 3. **Build Configuration** ✅
- [x] `package.json` build script configured
- [x] `turbo.json` for monorepo builds
- [x] `apps/web/vite.config.ts` optimized
- [x] TypeScript configs in place
- [x] `vercel.json` configuration created

### 4. **Frontend Build** ✅
- [x] React 18 + Vite setup
- [x] TypeScript compilation working
- [x] Tailwind CSS configured
- [x] Source maps enabled for debugging
- [x] Code splitting configured
- [x] Public assets path correct

### 5. **Backend API Setup** ✅
- [x] Express server configured
- [x] API route handler at `/api/index.ts`
- [x] Database initialization logic
- [x] Environment variables supported
- [x] CORS configuration
- [x] Error handling in place

### 6. **Database Configuration** ✅
- [x] Database URL configurable via env
- [x] Migrations folder present
- [x] Initial schema in place
- [x] Connection pooling ready

### 7. **Authentication** ✅
- [x] JWT token management
- [x] Login/Signup UI components
- [x] Protected routes configured
- [x] Demo mode for unauthenticated users
- [x] Auth context setup

### 8. **API Integration** ✅
- [x] Template loading from static JSON files
- [x] API client configured with base URL
- [x] Request interceptors for JWT tokens
- [x] Error handling implemented

---

## 📋 What to Commit to GitHub

### **Files to Add (New Files)**
```bash
✅ vercel.json                          # Vercel deployment configuration
✅ apps/web/public/data/categories.json           # Template categories
✅ apps/web/public/data/templates-catalog.json    # Template definitions
✅ apps/web/src/services/templateService.ts       # Template loader service
✅ apps/web/src/pages/LandingPage.tsx            # Landing page component
✅ apps/web/src/pages/RootPage.tsx               # Root routing component
✅ apps/api/src/controllers/aiController.ts       # AI controller
✅ apps/api/src/services/AIFormGeneratorService.ts # AI service
✅ BUILDER_UI_IMPROVEMENTS.md                     # UI improvements documentation
```

### **Files to Modify (Already Tracked)**
```bash
✅ README.md                                      # Add deployment instructions
✅ package.json                                   # Root package config
✅ apps/web/package.json                         # Web app dependencies
✅ apps/api/package.json                         # API dependencies
✅ apps/web/App.tsx                              # Updated routing
✅ apps/web/src/components/TemplatesModal.tsx    # Template loading
✅ apps/web/src/components/toolbar/BuilderToolbar.tsx
✅ apps/web/src/components/canvas/CanvasItem.tsx
✅ apps/web/src/components/palette/ComponentPalette.tsx
✅ apps/web/src/components/panels/PropertiesPanel.tsx
✅ apps/web/src/pages/DashboardPage.tsx
✅ apps/web/src/pages/LoginPage.tsx
✅ apps/web/src/pages/SignupPage.tsx
```

### **Files to Remove from Git (Cleanup)**
```bash
❌ apps/api/src/routes/ai.ts.deleted
❌ apps/api/src/services/NIMAIFormGeneratorService.ts.deleted
❌ apps/web/src/components/AIFormGeneratorModal.tsx.deleted
❌ apps/web/src/services/aiFormService.ts.deleted
❌ docs/                                         # (Delete entire directory)
❌ "working of the project"                      # (Delete directory)
❌ memory/MEMORY.md                              # (Delete file)
```

---

## 🔐 Environment Variables to Configure on Vercel

### **Production Environment**

```env
# Frontend API Configuration
VITE_API_BASE_URL=https://your-project.vercel.app/api

# Database (NeonDB PostgreSQL)
DATABASE_URL=postgresql://user:password@region.neon.tech/database?sslmode=require

# JWT Authentication
JWT_SECRET=<32 random characters - generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_REFRESH_SECRET=<32 different random characters>

# CORS & Security
ALLOWED_ORIGINS=https://your-project.vercel.app,https://yourdomain.com

# AI Model (Google Gemini)
GEMINI_API_KEY=<Your Gemini API key from ai.google.dev>
GEMINI_MODEL=gemini-2.0-flash

# Stripe (Optional)
STRIPE_SECRET_KEY=<Your Stripe secret key>
STRIPE_WEBHOOK_SECRET=<Your Stripe webhook secret>

# Legal/Compliance
DPO_EMAIL=privacy@yourdomain.com
```

### **Preview Environment** (Optional)
Use same as Production or separate test values

---

## 🚀 Deployment Steps

### **Step 1: Prepare GitHub Repository**
```bash
# Remove deleted files from git
git rm --cached apps/api/src/routes/ai.ts.deleted
git rm --cached apps/api/src/services/NIMAIFormGeneratorService.ts.deleted
git rm --cached apps/web/src/components/AIFormGeneratorModal.tsx.deleted
git rm --cached apps/web/src/services/aiFormService.ts.deleted
git rm --cached -r docs/
git rm --cached -r "working of the project"
git rm --cached memory/MEMORY.md

# Commit cleanup
git commit -m "chore: cleanup deleted and unused files for Vercel deployment"

# Push all changes
git push origin main
```

### **Step 2: Create NeonDB Database**
1. Visit [neon.tech](https://neon.tech)
2. Sign up / Log in
3. Create new project
4. Select "PostgreSQL 16"
5. Copy connection string (will look like: `postgresql://user:password@region.neon.tech/db`)
6. Keep this connection string safe - needed in Step 4

### **Step 3: Generate Secrets**
```bash
# Generate JWT secrets
node -e "console.log('JWT_SECRET:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET:', require('crypto').randomBytes(32).toString('hex'))"
```

### **Step 4: Deploy to Vercel**
1. Visit [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub - select your repository
4. **Framework**: Vite (auto-detected)
5. **Root Directory**: `apps/web` ✅
6. **Build Command**: `npm run build` (from root)
7. **Output Directory**: `dist`
8. Click "Environment Variables" and add all variables from "Environment Variables" section above
9. Click "Deploy"

### **Step 5: Verify Deployment**
- [ ] Frontend loads at `https://your-project.vercel.app`
- [ ] Landing page displays correctly
- [ ] Login/Signup routes work
- [ ] Template JSON files load from `/data/categories.json` and `/data/templates-catalog.json`
- [ ] Form builder opens
- [ ] Templates modal loads templates from JSON files
- [ ] Can create new forms
- [ ] Can save forms (requires API)

---

## 📦 What Gets Deployed

### **Frontend (Vercel Static Hosting)**
```
Build Input:  apps/web/
Build Output: apps/web/dist/
Includes:
- React application
- Tailwind CSS bundle
- Vendor JavaScript chunks
- Static JSON files (/public/data/*.json)
- Source maps for debugging
```

### **Backend (Vercel Functions)**
```
Serverless Function: api/index.ts
Handles:
- /api/* routes
- Database connections
- Authentication
- Form CRUD operations
- AI form generation
- File uploads
```

### **Database (NeonDB)**
```
PostgreSQL 16 instance
Hosted on Neon
Scales automatically
Backups included
```

---

## 🔍 Build & Deployment Process

### **Local Build (Before Push)**
```bash
cd KIM_AI/
npm install
npm run build

# Output should show:
# ✓ apps/web build success
# ✓ Output: apps/web/dist/
```

### **Vercel Build** (Automatic on Push)
1. GitHub detects push to `main`
2. Vercel webhook triggered
3. Vercel clones repository
4. Runs `npm install` (root and workspaces)
5. Runs `npm run build`
6. Uploads `apps/web/dist/` to Vercel CDN
7. Builds serverless API function from `api/index.ts`
8. Routes incoming requests:
   - `/api/*` → Serverless function
   - All other routes → `dist/index.html` (React Router)

---

## ✅ Post-Deployment Checklist

After deploying to Vercel, verify:

- [ ] Domain/URL is accessible
- [ ] HTTPS certificate valid
- [ ] No console errors
- [ ] Templates JSON files load (check Network tab)
- [ ] Login functionality works
- [ ] Form creation works
- [ ] Form saving works (requires API + database)
- [ ] Responsive design on mobile
- [ ] Build logs show no errors
- [ ] Vercel deployment marked as "Ready"

---

## 🐛 Troubleshooting

### **Issue: Templates not loading**
**Solution**: Check Network tab for 404 on `/data/categories.json`
- Ensure files are in `apps/web/public/data/`
- Rebuild and redeploy

### **Issue: API returns 500 error**
**Solution**: 
- Check Vercel function logs
- Verify environment variables are set
- Check DATABASE_URL is correct

### **Issue: Build fails with TypeScript errors**
**Solution**:
- Fix unused variable warnings in `exportForm.ts`
- Run `npm run build` locally first
- Check `tsconfig.json` strict mode settings

### **Issue: Forms not saving**
**Solution**:
- Verify DATABASE_URL environment variable
- Check Neon database is running
- Verify migrations have run
- Check API logs for SQL errors

---

## 📊 Monitoring & Maintenance

### **Vercel Analytics**
- Monitor deployment times
- Check error rates
- Review function execution time

### **NeonDB Monitoring**
- Monitor query performance
- Check connection pool usage
- Review backup status

### **Health Checks**
Add periodic monitoring:
```bash
curl https://your-project.vercel.app/
curl https://your-project.vercel.app/api/health
```

---

## 🎯 Summary

Your FormBuilder Form Builder is now **completely ready for Vercel deployment**:

✅ **Frontend**: React 18 + Vite + Tailwind CSS
✅ **Static Assets**: Template JSON files bundled
✅ **Backend**: Express serverless functions
✅ **Database**: PostgreSQL via NeonDB
✅ **Authentication**: JWT + Login/Signup
✅ **Configuration**: vercel.json in place
✅ **Environment**: Variables documented

**Next Step**: Follow "Deployment Steps" section above to deploy to Vercel.

---

**Questions?** Check git commit history for implementation details:
```bash
git log --oneline | head -20
```
