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
