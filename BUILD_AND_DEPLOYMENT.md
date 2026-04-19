# Build & Deployment Architecture - FormBuilder Form Builder

## 🏗️ Project Structure for Deployment

```
KIM_AI/
├── package.json                    # Root monorepo config
├── vercel.json                     # Vercel deployment config ✅ NEW
├── VERCEL_DEPLOYMENT_CHECKLIST.md  # Step-by-step guide ✅ NEW
│
├── apps/
│   ├── web/                        # React frontend (Vite)
│   │   ├── package.json
│   │   ├── vite.config.ts          # Vite build config
│   │   ├── tsconfig.json
│   │   ├── public/
│   │   │   └── data/               # Static JSON files ✅
│   │   │       ├── categories.json      # 18 categories
│   │   │       └── templates-catalog.json # 30+ templates
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   └── templateService.ts   # Loads JSON files ✅ NEW
│   │   │   ├── pages/
│   │   │   │   ├── LandingPage.tsx      # ✅ NEW
│   │   │   │   ├── RootPage.tsx         # ✅ NEW
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── SignupPage.tsx
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── TemplatesModal.tsx   # Loads templates ✅ UPDATED
│   │   │   │   ├── toolbar/
│   │   │   │   ├── canvas/
│   │   │   │   └── panels/
│   │   │   └── App.tsx             # Routing setup
│   │   ├── dist/                   # Build output (not in git)
│   │   └── node_modules/
│   │
│   └── api/                        # Express backend
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── app.ts              # Express setup
│       │   ├── server.ts           # Local dev server
│       │   ├── routes/
│       │   ├── services/
│       │   └── config/
│       │       └── database.ts      # PostgreSQL connection
│       └── dist/                   # Build output (not in git)
│
├── api/
│   └── index.ts                    # Vercel serverless handler ✅ KEY FILE
│
└── packages/
    └── shared-types/              # Shared TypeScript types
```

---

## 🔨 Build Pipeline

### **Local Development Build**
```bash
npm run build
# Runs: turbo run build
# Executes in parallel:
#   1. apps/web: tsc && vite build
#   2. apps/api: tsc -p tsconfig.json
```

### **Vercel Build Process** (Automatic)
```
1. GitHub push to main branch
   ↓
2. Vercel webhook triggered
   ↓
3. Vercel clones repo
   ↓
4. npm install (root + workspaces)
   ↓
5. Vercel detects build command from vercel.json
   ↓
6. Runs: npm run build
   ├─ Web: TypeScript compilation + Vite bundling
   │  └─ Output: apps/web/dist/
   └─ API: TypeScript compilation
      └─ Output: apps/api/dist/
   ↓
7. Routes requests:
   ├─ /api/* → Vercel Function (api/index.ts)
   └─ /* → Static files (apps/web/dist/) + React Router
   ↓
8. Deployment complete ✅
```

---

## 📦 Static Asset Bundling

### **Template JSON Files**
```
Location: apps/web/public/data/
Files:
- categories.json      (~4KB, 18 categories)
- templates-catalog.json (~40KB, 30+ templates)

Bundling Process:
1. Vite sees files in public/
2. During build: copies to dist/data/
3. Available at: /data/categories.json and /data/templates-catalog.json
4. Loaded at runtime by templateService

Cache Strategy:
- Long cache (24h) for templates (low change frequency)
- Medium cache (1h) for categories
- No cache for index.html (always fresh)
```

### **Vite Configuration** (apps/web/vite.config.ts)
```typescript
export default defineConfig({
  // Public assets path - where Vite looks for static files
  // Default: ./public (relative to apps/web/)
  
  build: {
    outDir: 'dist',           // Output directory
    sourcemap: true,          // Debug maps
    minify: 'terser',         // JS minification
    rollupOptions: {
      output: {
        manualChunks: {       // Code splitting
          'vendor': [
            'react',
            'react-dom',
            'zustand',
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            'lucide-react',
          ],
        },
      },
    },
  },
})
```

### **What Gets Bundled**
```
apps/web/dist/ (Production Ready)
├── index.html                    # Main HTML entry
├── assets/
│   ├── index-[hash].js          # Main app bundle
│   ├── vendor-[hash].js         # Vendor chunk
│   ├── [module]-[hash].js       # Code-split modules
│   └── [stylesheet]-[hash].css  # Tailwind CSS bundle
├── data/
│   ├── categories.json          # ✅ Copied from public/
│   └── templates-catalog.json   # ✅ Copied from public/
└── [other-assets]/
```

### **Request Flow**
```
User Browser
  ↓
1. GET / → Served: dist/index.html (with asset references)
  ↓
2. Browser downloads:
   - JS bundles (vendor + app)
   - CSS bundle
  ↓
3. React app initializes
  ↓
4. User clicks "Templates" button
  ↓
5. templateService.loadTemplates()
  ↓
6. fetch('/data/templates-catalog.json')
  ↓
7. Served from: dist/data/templates-catalog.json
  ↓
8. Templates parsed and displayed ✅
```

---

## 🔗 vercel.json Configuration

### **Key Sections**

#### 1. **Build Configuration**
```json
"projectSettings": {
  "buildCommand": "npm run build",        // Runs turbo
  "outputDirectory": "apps/web/dist",     // Frontend output
  "devCommand": "npm run dev",            // Local dev
  "installCommand": "npm install"         // Install deps
}
```

#### 2. **Routes Configuration**
```json
"routes": [
  {
    "src": "/api/(.*)",              // /api/* → Function
    "dest": "/api/index.ts"
  },
  {
    "src": "/(.*)",                  // All others → React Router
    "dest": "/index.html",
    "status": 200
  }
]
```

#### 3. **Builds Configuration**
```json
"builds": [
  {
    "src": "apps/web/package.json",      // Frontend build
    "use": "@vercel/static-build",
    "config": { "distDir": "dist" }
  },
  {
    "src": "api/index.ts",               // API build
    "use": "@vercel/node"
  }
]
```

---

## ✅ Deployment Readiness Checklist

### **Frontend (Vite Build)**
- [x] package.json build script configured
- [x] vite.config.ts optimized for production
- [x] TypeScript types checked
- [x] Static files in public/data/
- [x] Source maps enabled
- [x] Code splitting configured
- [x] CSS bundling configured
- [x] No hardcoded API URLs (uses VITE_API_BASE_URL)

### **Backend (Express/Vercel Functions)**
- [x] api/index.ts handler in place
- [x] Express app configured
- [x] Database connection pooling ready
- [x] Environment variables supported
- [x] Error handling implemented
- [x] CORS configured
- [x] Rate limiting set up

### **Static Assets**
- [x] Template JSON files in correct location
- [x] Categories file accessible
- [x] Templates catalog file accessible
- [x] Files will be copied during build
- [x] templateService.ts loads from /data/

### **Configuration**
- [x] vercel.json created
- [x] Environment variables documented
- [x] Build command correct
- [x] Output directory correct
- [x] Routes configured

### **Git Repository**
- [x] .deleted files removed
- [x] Unused docs cleaned up
- [x] All necessary files tracked
- [x] .gitignore includes dist/
- [x] Ready for GitHub deployment

---

## 📊 Build Output Analysis

### **Typical Build Size**
```
apps/web/dist/
├── index.html                    ~2-5KB
├── assets/
│   ├── vendor chunk            ~200KB (React, Zustand, DnD Kit, Lucide)
│   ├── main app bundle         ~50-100KB (Form builder logic)
│   ├── other chunks            ~20-50KB (Routes, modals)
│   └── styles.css              ~30-50KB (Tailwind CSS)
├── data/
│   ├── categories.json         ~4KB
│   └── templates-catalog.json  ~40KB
└── Total size:                 ~350-450KB (uncompressed)
                                ~80-120KB (gzipped)
```

### **Expected Build Time on Vercel**
- Install dependencies: ~30-45s
- TypeScript compilation: ~15-20s
- Vite bundling: ~10-15s
- Total: ~60-90 seconds

---

## 🚀 Deployment Command Reference

### **Manual Deployment** (if needed)
```bash
# From project root
vercel deploy --prod

# With environment variables
vercel env add DATABASE_URL postgresql://...
vercel env add GEMINI_API_KEY ...
```

### **Automatic Deployment** (Recommended)
1. Push to GitHub main branch
2. Vercel automatically detects and deploys
3. No manual intervention needed
4. Deployment URL: https://kim-ai-form-builder.vercel.app

---

## 🔍 Monitoring Build Output

### **View Vercel Logs**
```
Vercel Dashboard → Your Project → Deployments → [Latest] → Logs

Look for:
✓ npm install: installed X packages
✓ npm run build: successful completion
✓ apps/web:build: output dist/ created
✓ Deployment Successful
```

### **Verify Static Files**
```bash
# After deployment, check:
curl https://your-project.vercel.app/data/categories.json
curl https://your-project.vercel.app/data/templates-catalog.json

# Both should return valid JSON
```

---

## 🐛 Common Build Issues & Solutions

### **Issue: Build fails with "Cannot find dist"**
**Solution**: Check vercel.json outputDirectory matches apps/web/dist

### **Issue: Templates don't load (404 on /data/)**
**Solution**: Verify files are in apps/web/public/data/

### **Issue: API returns 500 errors**
**Solution**: Check environment variables in Vercel dashboard

### **Issue: Large bundle size**
**Solution**: Already optimized with vendor chunking

---

## 📋 Pre-Deployment Checklist

Before pushing to GitHub:

- [ ] Run `npm run build` locally - should succeed
- [ ] No console errors in dist/index.html
- [ ] All TypeScript errors resolved
- [ ] .deleted files removed from git
- [ ] vercel.json in root directory
- [ ] apps/web/public/data/ files present
- [ ] .env files NOT committed (check .gitignore)
- [ ] package-lock.json is current
- [ ] All changes committed with clear messages

---

## 🎯 Final Verification

After Vercel deployment completes:

```bash
# 1. Check frontend loads
curl https://your-domain.vercel.app/ | grep "<title>"

# 2. Check templates load
curl https://your-domain.vercel.app/data/categories.json | head -c 100

# 3. Check API responds
curl https://your-domain.vercel.app/api/health

# 4. Check DNS if custom domain
dig your-domain.com

# 5. Verify HTTPS certificate
curl -I https://your-domain.vercel.app/ | grep "Strict-Transport"
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Express on Vercel](https://vercel.com/docs/functions/serverless-functions/node-js)
- [NeonDB Documentation](https://neon.tech/docs)

