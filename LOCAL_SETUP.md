# KIM AI Form Builder - Local Development Setup

Complete guide for running KIM AI Form Builder on your local machine.

## Prerequisites

- **Node.js 18+** (LTS recommended) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Sourabh1789101/Demo_work_test.git
cd Demo_work_test
```

### 2. Install Dependencies

```bash
npm install
```

This installs all dependencies for the monorepo (apps/api, apps/web, and shared packages).

### 3. Start PostgreSQL Database

```bash
docker compose up -d
```

This starts PostgreSQL 16 in a Docker container on port 5432. The database:
- **Name:** `form_builder`
- **User:** `postgres`
- **Password:** `postgres`
- **Port:** `5432`

**Verify it's running:**
```bash
docker compose ps
```

### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp apps/api/.env.example apps/api/.env
```

The `.env.example` file already contains sensible defaults for local development. You can use it as-is, or customize:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/form_builder

# Generate secure JWT secrets with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=change_me_to_32_random_characters
JWT_REFRESH_SECRET=change_me_to_different_32_random_characters

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 5. Start Development Servers

```bash
npm run dev
```

This starts:
- **API Server:** http://localhost:4000 (Express backend)
- **Web App:** http://localhost:5173 (React frontend with Vite)

### 6. Open in Browser

Open http://localhost:5173 and you should see the KIM AI Form Builder dashboard.

## Development Workflow

### Creating Forms

1. **Dashboard:** Browse all forms at http://localhost:5173
2. **Builder:** Click "Create Form" to open the drag-and-drop builder
3. **Authentication:** Use Login/Signup or Demo mode (no registration required)

### Database Management

**View database contents:**
```bash
docker compose exec postgres psql -U postgres -d form_builder
```

**Reset database:**
```bash
docker compose down -v
docker compose up -d
```

**Stop database:**
```bash
docker compose down
```

### Building for Production

```bash
npm run build
```

Builds both API and Web apps. Output:
- **API:** `apps/api/dist/`
- **Web:** `apps/web/dist/`

### Running Production Build Locally

```bash
# Build first
npm run build

# Start API in production mode
cd apps/api
NODE_ENV=production node dist/app.js

# Serve web app (in another terminal)
cd apps/web
npx serve dist -p 5173
```

## Troubleshooting

### Port Already in Use

If ports 4000 or 5173 are already in use:

**API (port 4000):**
- Change `PORT=4000` in `apps/api/.env`
- Update `VITE_API_URL` in `apps/web/.env` if needed

**Web (port 5173):**
- Vite will automatically try port 5174, 5175, etc.
- Or manually specify: `npm run dev -- --port 3000`

### Docker Issues

**Container not starting:**
```bash
docker compose logs postgres
```

**Reset Docker setup:**
```bash
docker compose down -v
docker compose up -d
```

### Database Connection Errors

Ensure `DATABASE_URL` in `apps/api/.env` matches Docker setup:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/form_builder
```

If using Docker Compose networking (API also in container):
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/form_builder
```

### Build Errors

**Clear cache and reinstall:**
```bash
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/dist
npm install
npm run build
```

## Project Structure

```
KIM_AI/
├── apps/
│   ├── api/          # Express backend (Port 4000)
│   │   ├── src/
│   │   └── .env      # Backend configuration
│   └── web/          # React frontend (Port 5173)
│       └── src/
├── packages/         # Shared code
├── docker-compose.yml  # PostgreSQL setup
└── turbo.json        # Turborepo config
```

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Express 5 + Node.js + TypeScript
- **Database:** PostgreSQL 16
- **Authentication:** JWT with bcrypt
- **Build System:** Turborepo
- **Drag & Drop:** @dnd-kit
- **State Management:** Zustand

## Next Steps

- **Customize forms:** Explore 20+ field types in the builder
- **Test submissions:** Share forms and collect responses
- **View analytics:** Check submission data and stats
- **Deploy:** When ready, deploy API and Web separately to your hosting provider

## Support

For issues or questions, please open an issue on the GitHub repository.
