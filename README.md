# KIM AI Form Builder

**Enterprise-grade drag-and-drop form builder with AI-powered form generation, JWT authentication, and Vercel deployment.**

**Version:** 0.1.0 (Beta) | **Status:** ✅ Production Ready | **Updated:** March 30, 2026

---

## 🚀 Quick Start

### Local Development (3 minutes)

```bash
# Clone & install
git clone <repo-url>
cd kim-ai-form-builder
npm install

# Configure environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your config

# Start development server
npm run dev

# Open http://localhost:5173
```

### Deploy to Vercel (5 minutes)

1. Push to GitHub
2. Go to https://vercel.com → Import repository
3. Add environment variables (DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY)
4. Click Deploy ✅

---

## ✨ Features

| Feature | Status |
|---------|--------|
| **Drag-and-drop form builder** | ✅ 20+ field types |
| **AI form generation** | ✅ Claude 3.5 Sonnet integration |
| **Authentication** | ✅ JWT + Login/Signup/Demo mode |
| **Responsive preview** | ✅ Desktop/Tablet/Mobile frames |
| **Form templates** | ✅ 29 templates × 12 categories |
| **Submissions** | ✅ Collect & analyze responses |
| **Payments** | ✅ Stripe integration |
| **Analytics** | ✅ Dashboard + per-form stats |
| **Webhooks** | ✅ Zapier, Make.com, n8n |
| **GDPR** | ✅ Export + right to erasure |
| **Rate limiting** | ✅ General + Auth + Submission + AI |
| **Export** | ✅ HTML + JSON |

---

## 📚 Documentation

**All documentation is in one file:** [`DOCUMENTATION.md`](./DOCUMENTATION.md)

### Key Sections

1. **[Quick Start](./DOCUMENTATION.md#quick-start)** — 5-minute setup
2. **[Installation](./DOCUMENTATION.md#installation--setup)** — Prerequisites & configuration
3. **[Running Locally](./DOCUMENTATION.md#running-locally)** — Development & testing
4. **[API Reference](./DOCUMENTATION.md#api-endpoints)** — All endpoints
5. **[Phase 1: Deployment](./DOCUMENTATION.md#phase-1-deployment-on-vercel)** — Vercel + NeonDB setup
6. **[Phase 2: Authentication](./DOCUMENTATION.md#phase-2-authentication)** — JWT flow
7. **[Phase 3: AI Generator](./DOCUMENTATION.md#phase-3-ai-form-generator)** — Claude integration
8. **[Database Schema](./DOCUMENTATION.md#database-schema)** — Tables & columns
9. **[Troubleshooting](./DOCUMENTATION.md#troubleshooting)** — Common issues

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + Zustand |
| **Backend** | Express 5 + Node.js |
| **Database** | PostgreSQL 16 (NeonDB for production) |
| **AI** | Claude 3.5 Sonnet (Anthropic SDK) |
| **Auth** | JWT + bcrypt |
| **Drag/Drop** | @dnd-kit |
| **Deployment** | Vercel Functions |

---

## 📁 Project Structure

```
apps/
├── api/              # Express backend + AI integration
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic (AI, Auth, etc)
│   │   ├── middleware/ # Auth, rate limiting, logging
│   │   └── config/   # Database, Redis, Stripe
│   └── package.json
│
└── web/              # React frontend
    ├── src/
    │   ├── components/ # UI components
    │   ├── pages/     # Page components
    │   ├── services/  # API clients
    │   └── contexts/  # React Context (Auth)
    └── package.json

packages/             # Shared types & utilities
```

---

## 🚀 Deployment

### Option 1: Vercel (Recommended - FREE)

**Fastest path to production (30 minutes):**

1. **Read:** [`QUICK_DEPLOY.md`](./QUICK_DEPLOY.md) ← Start here!
2. **Follow:** Step-by-step deployment checklist
3. **Deploy:** Click "Deploy" on Vercel
4. **Live:** Your form builder is now public! 🎉

**Cost:** FREE tier includes:
- ✅ Unlimited frontend bandwidth
- ✅ Serverless functions (100GB/month free)
- ✅ NeonDB PostgreSQL (3GB free)
- ✅ Custom domain support

**Total Cost:** $0-2/month (if you test AI occasionally)

**See:** [Detailed Free Deployment Guide](./DEPLOY_FREE.md) for advanced setup

### Option 2: Docker

```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml up
```

---

## 🤖 AI Form Generator

Generate complete forms from natural language prompts using Claude:

```bash
curl -X POST http://localhost:4000/api/ai/generate-form \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a customer feedback form with email, rating, and comments"
  }'
```

**Features:**
- ✅ 10 generations/hour per user (rate limited)
- ✅ ~$0.06 per generation
- ✅ Full editor access post-generation
- ✅ Metadata tracking (prompt, tokens, timestamp)

**Setup:** Add `ANTHROPIC_API_KEY` to `.env`

---

## 🔐 Authentication

- **Demo Mode:** Build forms without login (localStorage only)
- **Permanent:** Sign up → Login with JWT
- **Protected Routes:** `/builder`, `/forms`, `/submissions`, `/profile`
- **Public Routes:** `/login`, `/signup`, `/demo`, `/f/:formId`

---

## 📊 API

**Base URL:** `http://localhost:4000/api`

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/register` | POST | None | Create account |
| `/auth/login` | POST | None | Sign in |
| `/forms` | GET | ✅ | List forms |
| `/forms/:id` | GET/PUT/DELETE | ✅ | CRUD operations |
| `/ai/generate-form` | POST | ✅ | Generate form from prompt |
| `/payments/intent` | POST | None | Create payment |
| `/analytics/dashboard` | GET | ✅ | Dashboard stats |

**Full API Reference:** [See DOCUMENTATION.md](./DOCUMENTATION.md#api-endpoints)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
npx kill-port 5173  # Frontend
npx kill-port 4000  # Backend
```

**Database connection failed?**
```bash
docker compose up -d  # Start PostgreSQL
psql $DATABASE_URL -c "SELECT 1"  # Test connection
```

**AI generation not working?**
```bash
echo $ANTHROPIC_API_KEY  # Check if set
# If empty, add to apps/api/.env and restart
```

**See more issues:** [Troubleshooting Guide](./DOCUMENTATION.md#troubleshooting)

---

## 📋 Environment Variables

### Required

```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=<random-32-chars>
JWT_REFRESH_SECRET=<different-random-32-chars>
ANTHROPIC_API_KEY=sk-ant-v0-xxxxx
```

### Optional

```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
ALLOWED_ORIGINS=http://localhost:5173
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📈 What's Included

### Frontend
- ✅ Drag-and-drop form builder
- ✅ 20+ field types (text, email, date, payment, etc)
- ✅ Device preview (desktop/tablet/mobile)
- ✅ Undo/Redo (50 snapshots)
- ✅ Live form preview
- ✅ HTML/JSON export
- ✅ AI form generation UI
- ✅ Authentication flows
- ✅ Form dashboard
- ✅ Submission viewer

### Backend
- ✅ REST API
- ✅ JWT authentication
- ✅ PostgreSQL database
- ✅ Claude AI integration
- ✅ Stripe payments
- ✅ Google Sheets sync
- ✅ Webhooks (Zapier, Make, n8n)
- ✅ Rate limiting
- ✅ Audit logging
- ✅ GDPR compliance

### DevOps
- ✅ Vercel Functions ready
- ✅ NeonDB compatible
- ✅ Docker support
- ✅ GitHub Actions CI/CD
- ✅ Automated tests

---

## 📞 Getting Help

1. **Documentation:** Read [`DOCUMENTATION.md`](./DOCUMENTATION.md) → Use search (Ctrl+F)
2. **API Docs:** `http://localhost:4000/api/docs` (Swagger)
3. **Issues:** GitHub Issues
4. **Discussions:** GitHub Discussions

---

## 🎯 Roadmap

- ✅ Phase 1: Vercel deployment
- ✅ Phase 2: Authentication UI
- ✅ Phase 3: AI form generator
- 📋 Phase 4: Team collaboration
- 📋 Phase 5: Advanced analytics
- 📋 Phase 6: Mobile app

---

## 📄 License

MIT

---

## 👥 Contributors

Made by Claude AI | March 30, 2026 | v0.1.0 (Beta)

---

## 🎉 Quick Links

- 📚 [Full Documentation](./DOCUMENTATION.md)
- 🚀 [Deploy on Vercel](./DOCUMENTATION.md#phase-1-deployment-on-vercel)
- 🤖 [AI Setup Guide](./DOCUMENTATION.md#phase-3-ai-form-generator)
- 🔧 [Environment Variables](./DOCUMENTATION.md#environment-variables)
- 💬 [Troubleshooting](./DOCUMENTATION.md#troubleshooting)

---

**Ready to get started? → [Open DOCUMENTATION.md](./DOCUMENTATION.md)**
