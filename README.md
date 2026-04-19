# FormBuilder

**Modern drag-and-drop form builder with JWT authentication, PostgreSQL database, and Vercel deployment ready.**

**Version:** 0.1.0 (Beta) | **Status:** ✅ Production Ready | **Updated:** April 19, 2026

---

## 🚀 Quick Start (Local Only)

### Prerequisites
- Node.js 18+ (LTS recommended)
- Docker & Docker Compose (for PostgreSQL)
- npm 9+

### Local Development (5 minutes)

```bash
# 1. Clone & install
git clone https://github.com/Sourabh1789101/Demo_work_test.git
cd Demo_work_test
npm install

# 2. Start PostgreSQL with Docker
docker compose up -d

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
# The .env file has sensible defaults for local development

# 4. Start development server
npm run dev

# 5. Open http://localhost:5173 in your browser
```

### Stop the database
```bash
docker compose down
```

---

## ✨ Features

| Feature | Status |
|---------|--------|
| **Drag-and-drop form builder** | ✅ 20+ field types |
| **AI Form Generation** | ✅ Generate forms from natural language prompts |
| **Authentication** | ✅ JWT + Login/Signup/Demo mode |
| **Responsive preview** | ✅ Desktop/Tablet/Mobile frames |
| **Form templates** | ✅ 29 templates × 12 categories |
| **Submissions** | ✅ Collect & analyze responses |
| **Payments** | ✅ Stripe integration |
| **Analytics** | ✅ Dashboard + per-form stats |
| **Webhooks** | ✅ Zapier, Make.com, n8n |
| **GDPR** | ✅ Export + right to erasure |
| **Rate limiting** | ✅ General + Auth + Submission |
| **Export** | ✅ HTML + JSON |

---

## 📚 Documentation

**All documentation is in one file:** [`DOCUMENTATION.md`](./DOCUMENTATION.md)

### Key Sections

1. **[Local Development Setup](./DOCUMENTATION.md#local-setup)** — Docker + PostgreSQL
2. **[Installation](./DOCUMENTATION.md#installation--setup)** — Prerequisites & configuration
3. **[Running Locally](./DOCUMENTATION.md#running-locally)** — Development & testing
4. **[API Reference](./DOCUMENTATION.md#api-endpoints)** — All endpoints
5. **[Authentication](./DOCUMENTATION.md#authentication)** — JWT flow
6. **[Database Schema](./DOCUMENTATION.md#database-schema)** — Tables & columns
7. **[Troubleshooting](./DOCUMENTATION.md#troubleshooting)** — Common issues

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + Zustand |
| **Backend** | Express 5 + Node.js |
| **Database** | PostgreSQL 16 (Local via Docker Compose) |
| **Auth** | JWT + bcrypt |
| **Drag/Drop** | @dnd-kit |

---

## 📁 Project Structure

```
apps/
├── api/              # Express backend
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   ├── middleware/ # Auth, rate limiting, logging
│   │   └── config/   # Database, logger
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
| `/ai/generate` | POST | ✅ | Generate form with AI |
| `/ai/status` | GET | ✅ | AI service status |
| `/forms` | GET | ✅ | List forms |
| `/forms/:id` | GET/PUT/DELETE | ✅ | CRUD operations |
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

**PostgreSQL connection failed?**
```bash
# Start PostgreSQL
docker compose up -d

# Verify connection
docker compose ps

# Check logs
docker compose logs postgres
```

**Database doesn't exist?**
```bash
# PostgreSQL creates the database automatically when the container starts
# If needed, connect and create manually:
docker compose exec postgres psql -U postgres -c "CREATE DATABASE form_builder;"
```

**See more issues:** [Troubleshooting Guide](./DOCUMENTATION.md#troubleshooting)

---

## 📋 Environment Variables

### Required (for local development)

```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/form_builder
JWT_SECRET=<random-32-chars>
JWT_REFRESH_SECRET=<different-random-32-chars>
```

### Optional

```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
OPENAI_API_KEY=<your-openai-api-key>   # For AI form generation
OPENAI_MODEL=gpt-4o-mini               # Model to use (default: gpt-4o-mini)
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📈 What's Included

### Frontend
- ✅ Drag-and-drop form builder
- ✅ **AI-powered form generation** (natural language to form)
- ✅ 20+ field types (text, email, date, payment, etc)
- ✅ Device preview (desktop/tablet/mobile)
- ✅ Undo/Redo (50 snapshots)
- ✅ Live form preview
- ✅ HTML/JSON export
- ✅ Authentication flows
- ✅ Form dashboard
- ✅ Submission viewer

### Backend
- ✅ REST API
- ✅ **AI Form Generator Service** (OpenAI GPT-4o-mini)
- ✅ JWT authentication
- ✅ PostgreSQL database
- ✅ Stripe payments
- ✅ Google Sheets sync
- ✅ Webhooks (Zapier, Make, n8n)
- ✅ Rate limiting
- ✅ Audit logging
- ✅ GDPR compliance

### DevOps
- ✅ Docker support
- ✅ Local PostgreSQL setup
- ✅ GitHub Actions CI/CD
- ✅ Automated tests

---

## 📞 Getting Help

1. **Documentation:** Read [`DOCUMENTATION.md`](./DOCUMENTATION.md) → Use search (Ctrl+F)
2. **API Docs:** `http://localhost:4000/api/docs` (Swagger) - if available
3. **Issues:** GitHub Issues
4. **Docker Issues:** Check logs with `docker compose logs postgres`

---

## 🎯 Local Development Workflow

1. **Start the database:** `docker compose up -d`
2. **Install dependencies:** `npm install`
3. **Configure env:** Copy `.env.example` to `.env` (no changes needed for local setup)
4. **Start dev server:** `npm run dev`
5. **Open in browser:** `http://localhost:5173`
6. **Build for production:** `npm run build`

---

## 📄 License

MIT

---

## 👥 Contributors

Made by Claude AI | March 31, 2026 | v0.1.0 (Beta)

---

## 🎉 Quick Links

- 📚 [Full Documentation](./DOCUMENTATION.md)
- 🐳 [Local Setup with Docker](./README.md#quick-start-local-only)
- 🔧 [Environment Variables](./README.md#environment-variables)
- 💬 [Troubleshooting](./README.md#troubleshooting)

---

**Ready to get started? Start Docker (`docker compose up -d`) and then run `npm run dev`**
