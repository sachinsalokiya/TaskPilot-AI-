# TaskPilot AI

TaskPilot AI is an AI-powered workflow management platform that helps teams organize projects and tasks, with an LLM-assisted layer for task prioritization, project health summaries, and personalized "what to work on next" recommendations.

## Local setup

### Prerequisites

- Node.js 18+
- npm

### Server

```bash
cd server
npm install
npm run dev
```

The API runs at `http://localhost:5000`. Health check: `GET /health` → `{ "status": "ok" }`.

### Client

```bash
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` (default Vite port).

### Database (PostgreSQL + Prisma)

1. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` to your Neon or Supabase connection string.

2. Run migrations and seed:

```bash
cd server
npm run db:migrate   # name the first migration e.g. init
npm run db:seed
```

3. Browse data in Prisma Studio:

```bash
npm run db:studio
```

**Seed credentials:** `test@example.com` / `password123`

The schema includes `User`, `Project`, `ProjectMember`, `Task`, and `ActivityLog` models. Prisma 7 uses the `@prisma/adapter-pg` driver adapter — see `server/src/lib/prisma.ts`.
