# TaskPilot AI (formerly "IntelliFlow AI" plan) — Full Project Spec
### AI-Powered Intelligent Workflow Automation Platform — Redesigned for Solo Build with Cursor AI

> ⚠️ Renamed from "IntelliFlow AI" to avoid clashing with your resume project of the same name (different stack). Rename back only if you intend this to *replace* that project.

---

## 0. What Changed From Your Original Plan & Why

| Original | Redesigned | Why |
|---|---|---|
| Everything in one giant Phase 1 (OTP, Google login, Slack, admin panel, 6 AI models, PDF/Excel export) | Split into MVP → Phase 2 → Future | Solo + Cursor builds die from scope creep, not lack of ideas. You need something demo-able in 2–3 weeks. |
| Custom-trained ML (Random Forest/XGBoost) for priority/deadline prediction | LLM-based (Gemini API) reasoning for the same features | You have zero historical task data on day 1 — a trained model needs hundreds of labeled examples to be better than a coin flip. This is the "cold-start problem." An LLM prompted with the same inputs needs *no* training data and gives you a working, explainable AI feature from day one. |
| MongoDB | PostgreSQL | Your data (Users → Projects → Tasks → Teams → Permissions) is relational with real foreign-key relationships and joins (e.g. "all tasks for a project, assigned to members of a team"). Postgres does this natively and cleanly; Mongo makes you fake joins. Bonus: matches the Postgres/pgvector stack already on your resume. |
| No sequencing / workflow | Week-by-week build plan with Cursor-ready prompts | So you (and Cursor) always know exactly what to build next, in what order, and when to commit. |

---

## 1. Problem Statement (Refined)

Teams juggling multiple projects lose time on manual task assignment, status tracking, and reporting. There's no single place that both **organizes work** and **tells you what to worry about next** (what's at risk, who's overloaded, what's likely to slip).

**Goal:** Build a workflow management platform where an AI layer actively assists — suggesting priorities, flagging at-risk tasks, and summarizing project health — instead of just being a to-do list with a chatbot bolted on.

---

## 2. Scope Tiers

### 🟢 MVP (Build This First — Weeks 1–3)
This is the only thing you build until it's fully working end-to-end.

- Auth: Email + password (JWT), no OTP/Google login yet
- Single role model to start: `Admin` and `Member` only (skip granular RBAC)
- Projects: Create / Edit / Delete / Add Members
- Tasks: Create / Edit / Delete, Status (`Todo`, `In Progress`, `Done`), Priority, Due Date
- **Kanban board** (drag & drop) — this is your single most demo-able feature
- **AI Assistant (LLM-based), 3 features only:**
  1. Suggest task priority given title + description + due date
  2. Generate a 2–3 sentence project health summary from current task states
  3. "What should I work on next?" — ranks a user's open tasks
- Basic dashboard: task counts by status, simple bar chart
- Deployment: live on Vercel (frontend) + Render (backend) + Supabase/Neon (Postgres)

**Definition of done for MVP:** a stranger can register, create a project, add tasks, drag them across a Kanban board, and see one AI-generated suggestion — live, on a real URL, no errors.

### 🟡 Phase 2 (Weeks 4–6, only after MVP is live and stable)
- Full RBAC (Owner/Admin/Manager/Member) + permissions
- Notifications (email via Resend/Nodemailer — skip SMS/Slack)
- File attachments on tasks (Cloudinary)
- Comments on tasks
- Calendar view
- Analytics dashboard with real charts (Recharts): completion rate, team workload, overdue trend
- AI: risk analysis (flag at-risk tasks/projects), deadline delay probability (still LLM-based, not trained ML)
- Report export (PDF only — skip Excel/CSV until asked for)

### 🔵 Future / Stretch (only if you want to keep going post-placement)
- Google OAuth login, OTP/2FA
- Slack/GitHub/Jira/Google Calendar integrations
- Conversational AI project assistant (chat interface over your data — this is where pgvector/RAG would actually earn its keep)
- Voice commands, multi-language
- Trained ML models for prediction — **only once you have real usage data** (hundreds of completed tasks) to train on. Revisit this later; it's the right long-term move, just not a day-1 move.

---

## 3. Final Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React.js + TypeScript + Tailwind CSS | Industry standard, fast to build, good for interviews |
| State | Redux Toolkit (or Zustand if you want less boilerplate) | Zustand is lighter for a solo project — recommend it unless you want Redux on your resume specifically |
| Backend | Node.js + Express.js | Matches your existing JS/TS comfort |
| Database | PostgreSQL (via Prisma ORM) | Relational data, type-safe queries, easy migrations |
| Hosting DB | Supabase or Neon (free tier Postgres) | Zero-config managed Postgres |
| AI | Google Gemini API | You already have a Gemini certification — reuse that credibility, no training data needed |
| Auth | JWT + bcrypt | Simple, secure, no third-party lock-in for MVP |
| File Storage | Cloudinary (Phase 2 only) | Free tier, easy image/file uploads |
| Deployment | Vercel (frontend), Render (backend) | Free tiers, matches your existing IntelliFlow AI deployment plan — reusable knowledge |
| CI/CD | GitHub Actions (add in Phase 2, not MVP) | Don't set up CI/CD before you have something worth automating |

---

## 4. System Architecture (MVP)

```
┌─────────────┐        HTTPS/JSON        ┌──────────────┐
│  React App  │ ───────────────────────▶ │  Express API │
│  (Vercel)   │ ◀─────────────────────── │  (Render)    │
└─────────────┘                          └──────┬───────┘
                                                 │
                          ┌──────────────────────┼──────────────────────┐
                          ▼                      ▼                      ▼
                  ┌───────────────┐     ┌────────────────┐     ┌───────────────┐
                  │  PostgreSQL   │     │  Gemini API     │     │  (Phase 2)    │
                  │  (Supabase)   │     │  (AI features)  │     │  Cloudinary   │
                  └───────────────┘     └────────────────┘     └───────────────┘
```

Flow: client sends JWT on every request → Express middleware verifies it → controller hits Postgres via Prisma → for AI endpoints, controller builds a prompt from DB data and calls Gemini → response returned to client.

---

## 5. Database Schema (Postgres, MVP scope)

```sql
-- users
id            UUID PRIMARY KEY
name          TEXT NOT NULL
email         TEXT UNIQUE NOT NULL
password_hash TEXT NOT NULL
role          TEXT DEFAULT 'member'  -- 'admin' | 'member'
created_at    TIMESTAMP DEFAULT now()

-- projects
id            UUID PRIMARY KEY
name          TEXT NOT NULL
description   TEXT
owner_id      UUID REFERENCES users(id)
created_at    TIMESTAMP DEFAULT now()

-- project_members (many-to-many)
project_id    UUID REFERENCES projects(id)
user_id       UUID REFERENCES users(id)
PRIMARY KEY (project_id, user_id)

-- tasks
id            UUID PRIMARY KEY
project_id    UUID REFERENCES projects(id)
title         TEXT NOT NULL
description   TEXT
status        TEXT DEFAULT 'todo'     -- 'todo' | 'in_progress' | 'done'
priority      TEXT DEFAULT 'medium'   -- 'low' | 'medium' | 'high'
assignee_id   UUID REFERENCES users(id)
due_date      DATE
ai_suggested_priority TEXT            -- filled by AI, editable by user
created_at    TIMESTAMP DEFAULT now()

-- activity_logs (Phase 2, but easy to add now)
id            UUID PRIMARY KEY
task_id       UUID REFERENCES tasks(id)
user_id       UUID REFERENCES users(id)
action        TEXT
created_at    TIMESTAMP DEFAULT now()
```

Use **Prisma** — write this as a `schema.prisma` file and let it generate migrations. Much less error-prone than raw SQL, and Cursor is very good at writing Prisma schemas.

---

## 6. AI Module Design (LLM-based, MVP)

All three MVP AI features are just **well-structured prompts to Gemini**, not trained models. This is a legitimate, portfolio-worthy design pattern — explain it this way in interviews: *"I used an LLM-based reasoning layer instead of training custom models because the app had no historical data to train on; this is a standard cold-start solution and keeps the AI feature explainable."*

**Feature 1 — Priority Suggestion**
- Input to prompt: task title, description, due date, days remaining
- Output: one of `low/medium/high` + one-sentence reasoning
- Store both in `ai_suggested_priority` and show it as a suggestion chip the user can accept or override

**Feature 2 — Project Health Summary**
- Input: counts of tasks by status, list of overdue tasks, days to nearest deadline
- Output: 2–3 sentence plain-English summary ("This project is on track. 2 tasks are overdue and blocking the release.")

**Feature 3 — "What should I work on next?"**
- Input: all of a user's open tasks (title, due date, priority)
- Output: ranked list of top 3 with one-line reasoning each

Keep every AI call server-side (never expose the Gemini key to the frontend), and always let the user override AI output — never auto-apply changes silently. This is both good UX and a good interview talking point (human-in-the-loop design).

---

## 7. API Design (MVP)

```
Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

Projects
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members

Tasks
GET    /api/projects/:id/tasks
POST   /api/projects/:id/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/status      -- for drag-and-drop

AI
POST   /api/ai/suggest-priority     { title, description, due_date }
GET    /api/ai/project-summary/:id
GET    /api/ai/next-tasks           -- for logged-in user
```

---

## 8. Folder Structure

```
taskpilot-ai/
├── client/
│   ├── src/
│   │   ├── components/       # Kanban board, TaskCard, Modal, etc.
│   │   ├── pages/             # Login, Register, Dashboard, ProjectBoard
│   │   ├── hooks/
│   │   ├── store/              # Zustand or Redux slices
│   │   ├── services/           # api.ts — axios instance + calls
│   │   └── utils/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/         # auth.ts, errorHandler.ts
│   │   ├── services/
│   │   │   └── ai/             # gemini.ts — all AI prompt logic lives here
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── config/
│   └── package.json
├── docs/
│   └── this file
└── README.md
```

---

## 9. Security (MVP-appropriate, not overbuilt)

- bcrypt for password hashing (12 salt rounds)
- JWT with short expiry (15 min) + refresh token (7 days) — implement refresh in Phase 2 if MVP timeline is tight, plain JWT is fine to start
- express-validator or Zod for input validation on every route
- Helmet.js + CORS locked to your frontend domain
- Rate limiting on `/auth` routes only (express-rate-limit) — don't rate-limit everything on day 1
- Never log or expose the Gemini API key client-side

---

## 10. Deployment Plan

1. Push `server/` to GitHub → connect repo to Render → set env vars (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`)
2. Push `client/` to GitHub → connect to Vercel → set `VITE_API_URL` env var pointing to Render URL
3. Create Supabase project → copy connection string into Render env vars → run `npx prisma migrate deploy`
4. Test the full flow live before adding any Phase 2 feature

---

## 11. Week-by-Week Build Workflow

**Week 1 — Foundation**
- Day 1–2: Set up repo structure, Prisma schema, Postgres connection, basic Express server
- Day 3–4: Auth (register/login/JWT middleware) — test with Postman before touching frontend
- Day 5–7: React app skeleton, routing, login/register pages wired to real API

**Week 2 — Core Features**
- Day 1–3: Projects CRUD (backend + frontend)
- Day 4–6: Tasks CRUD + Kanban board with drag-and-drop (use `@dnd-kit/core`, it's the modern well-maintained choice)
- Day 7: Polish, fix bugs, deploy a rough version to Vercel/Render so it's live early

**Week 3 — AI Layer + Ship**
- Day 1–2: Gemini integration, priority suggestion endpoint + UI chip
- Day 3–4: Project summary + "next tasks" endpoints and UI
- Day 5: Dashboard with basic stats
- Day 6–7: Final deploy, README with screenshots, record a 60-second demo video for your resume/LinkedIn

**When to commit/push (so your GitHub history looks intentional, not chaotic):**
- Commit after each working vertical slice (e.g. "auth: register + login working end-to-end"), not after every file save
- Push to `main` only when the app still runs — use a `dev` branch for anything half-finished if you want a clean history
- Suggested commit checkpoints: schema setup → auth working → projects CRUD → tasks CRUD → Kanban working → AI feature 1 → AI feature 2/3 → deployed → README

**Feeding this to Cursor:** paste this whole file into a `docs/spec.md` in your repo, then prompt Cursor per week ("Using docs/spec.md, build the Projects CRUD API described in section 7 and section 5's schema") rather than asking it to build everything at once — it performs much better scoped to one vertical slice at a time.

---

## 12. Why Two Separate Projects (Not One)

Keep this distinct from your existing **IntelliFlow AI** (Next.js/FastAPI/pgvector/Gemini, RAG-based). Reasoning:

- **IntelliFlow AI** proves you can handle GenAI/RAG depth — a real differentiator for a fresher.
- **TaskPilot AI** proves the fundamentals interviewers grill freshers hardest on: auth, relational schema design, REST API design, state management, live deployment.
- Same name or overlapping domain on two resume projects reads as duplicated effort, not breadth. Different names + different core skill each = a resume that shows range without diluting either story.
- **Most important:** don't start Phase 2 on TaskPilot AI until you can explain every decision in the MVP out loud, unscripted — schema choices, why JWT over sessions, why Gemini over a trained model. A fresher who can defend one small project beats a fresher with two big ones they didn't fully absorb.

## 13. Resume/Interview Framing (once built)

*"Built TaskPilot AI, a full-stack workflow management platform with an LLM-powered assistance layer (Gemini API) that suggests task priorities and generates project health summaries — designed around a human-in-the-loop pattern to avoid the cold-start problem inherent to traditional trained-ML approaches on a new app with no historical data."*

That one sentence signals: full-stack ability, AI integration ability, and — importantly — that you understand *why* you made the architectural choice, not just that you used an API. That "why" is what separates a strong answer from a weak one in interviews.
