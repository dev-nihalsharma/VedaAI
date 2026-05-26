# VedaAI – AI Assessment Creator

Full-stack assignment-creation tool for teachers. A teacher fills a form (file upload metadata, due date, question type mix, instructions), a background worker calls Claude to generate a structured question paper, and the result is rendered as a clean exam-paper page with PDF export via browser print.

## Stack

**Frontend**
- Next.js 14 (app router) + TypeScript
- Redux Toolkit + RTK Query for state & API calls
- Tailwind CSS for styling
- socket.io-client for real-time job updates
- Browser `window.print()` + print CSS for PDF export

**Backend**
- Node.js + Express + TypeScript
- Mongoose / MongoDB Atlas for persistence
- ioredis + BullMQ for the generation job queue
- socket.io for WebSocket fan-out
- `@anthropic-ai/sdk` (Claude Sonnet 4.6) with tool-use for structured output + ephemeral prompt caching
- Zod for input + LLM-output validation

## Architecture

```
[ Browser ]
   │  HTTP (JWT)          WS (socket.io, JWT handshake)
   ▼                       ▼
[ Express API ] ──enqueue──► [ BullMQ Queue ] ──► [ Worker process ]
   │                                                 │
   │                                                 ├─► Anthropic Claude (tool use)
   │                                                 ├─► Zod validate JSON
   │                                                 ├─► MongoDB (Atlas)
   │                                                 ├─► Redis cache (paper:<id>, 1h)
   │                                                 └─► WS emit to assignment:<id> room
```

Key design decisions:
- **Structured output, not prose parsing.** Claude is given a tool `generate_question_paper` with a strict JSON input schema; the response is the validated tool input. We never render raw LLM text.
- **Worker isolation.** Generation runs in a BullMQ worker process so the API stays responsive. Job state changes drive WebSocket events so the UI shows real progress, not a fake spinner.
- **Cache layers.** Redis caches assembled papers (1h TTL) and `@anthropic-ai/sdk` uses `cache_control: ephemeral` on the system prompt so repeated regenerations reuse the cached prefix.
- **Validation mirror.** Both client and server enforce the same Zod schema on assignment creation; the UI gates obvious mistakes (negative counts, past dates) and the API re-checks.

## Setup

### Prerequisites
- Node.js 20+
- Docker (for local Redis) — or run Redis any other way and update `REDIS_URL`
- An Anthropic API key

### 1. Configure environment

```bash
# .env at repo root holds real values (gitignored).
# .env.local lists key names only and is committed as a reference.
cp .env.local .env   # then edit .env to fill in real values
```

Required keys in `.env`:
- `MONGODB_URI` (pre-filled with the assignment-provided Atlas URI)
- `REDIS_URL=redis://localhost:6379`
- `JWT_SECRET` (any random 32+ byte string)
- `ANTHROPIC_API_KEY` (your key)
- `PORT=4000`
- `CORS_ORIGIN=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=http://localhost:4000`
- `NEXT_PUBLIC_WS_URL=http://localhost:4000`

### 2. Start Redis (and optionally local Mongo)

```bash
docker compose up -d
```

This starts:
- Redis on `localhost:6379`
- MongoDB on `localhost:27017` (optional fallback)

By default `.env` points `MONGODB_URI` at the assignment-provided Atlas cluster. If the cluster rejects your IP (Atlas IP allowlist) or you'd rather use a local DB, just change `MONGODB_URI` in `.env` to:

```
MONGODB_URI=mongodb://localhost:27017/vedaai
```

If Docker isn't available, install Redis natively (`brew install redis && brew services start redis`). For local Mongo without Docker: `brew install mongodb-community && brew services start mongodb-community`.

### 3. Install + seed + run backend

```bash
cd backend
npm install
npm run seed        # creates teacher user: johndoe@vedaai.test / password123
npm run dev         # Express + WS + BullMQ worker on :4000
```

### 4. Run frontend

```bash
cd ../frontend
npm install
npm run dev         # Next.js on :3000
```

### 5. Use the app

1. Open http://localhost:3000 — redirected to `/login`.
2. Log in with `johndoe@vedaai.test` / `password123`.
3. Empty-state page appears. Click **Create Assignment**.
4. Fill the form (title, due date, question type rows, instructions).
5. Submit → progress overlay shows queued → processing → generating → completed (driven by WebSocket).
6. Auto-navigate to the output page. Click **Download as PDF** to print/save.
7. Back on `/assignments` you see the saved card. Three-dot menu → View / Delete.

## API

| Method | Path                                    | Description                                 |
|--------|-----------------------------------------|---------------------------------------------|
| POST   | `/api/auth/login`                       | Email + password → JWT                      |
| GET    | `/api/auth/me`                          | Current user (JWT required)                 |
| GET    | `/api/assignments`                      | List for current user                       |
| POST   | `/api/assignments`                      | Create + enqueue generation                 |
| GET    | `/api/assignments/:id`                  | One assignment                              |
| DELETE | `/api/assignments/:id`                  | Delete assignment + paper                   |
| GET    | `/api/assignments/:id/paper`            | Generated paper (cached)                    |
| POST   | `/api/assignments/:id/regenerate`       | Re-enqueue generation                       |

## WebSocket

- Connect to `ws://localhost:4000` (socket.io). JWT goes in `auth.token` during the handshake.
- Emit `subscribe` with `{ assignmentId }` to join that assignment's room.
- Listen to `job` events: `{ type:'status'|'completed'|'error', ... }` (see `shared/types.ts`).

## Project layout

```
.
├── backend/        Express API + BullMQ worker + WS server
├── frontend/       Next.js teacher app
├── shared/         TypeScript types used by both
├── Designs/        Figma reference screens
├── docker-compose.yml
└── .env / .env.local
```

## Notes

- File uploads are accepted by the form but only metadata (name, size, mime) is persisted — Claude is not given the file contents. This was a deliberate scope choice; switching to Claude's native PDF/vision input is a small change in `backend/src/ai/prompt.ts`.
- Mobile responsiveness covers `375px+` for both the form and output pages, matching the mobile Figmas.
