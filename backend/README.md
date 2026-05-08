# iffy.ai Backend

> AI-powered "What If?" scenario simulation engine — backend API

Built with **Next.js 15 App Router** (API-only), **Groq** (`llama-3.3-70b-versatile`), and **Supabase**.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Fill in your keys:
#   GROQ_API_KEY        — from console.groq.com
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
```

### 3. Set up the database
Run the SQL in `lib/supabase/migrations/001_initial.sql` in your **Supabase SQL Editor**.

### 4. Run the dev server
```bash
npm run dev
# Backend runs on http://localhost:3000
```

---

## API Endpoints

All endpoints are `POST` and return JSON.

### `POST /api/simulate`
Generate a full new scenario simulation.
```json
{
  "scenario": "What if college degrees stopped mattering?",
  "duration_focus": "all"
}
```

### `POST /api/mutate`
Branch an existing simulation with a new condition.
```json
{
  "simulation_id": "uuid",
  "existing_state": {},
  "mutation_prompt": "Government subsidizes online certifications"
}
```

### `POST /api/debate`
Generate or continue a multi-character debate.
```json
{
  "simulation_id": "uuid",
  "participants": [],
  "existing_messages": [],
  "scenario": "What if...",
  "continuation_prompt": "What about rural areas?"
}
```

### `POST /api/sector`
Deep-dive analysis for a specific sector.
```json
{
  "simulation_id": "uuid",
  "sector": "Education"
}
```

---

## Project Structure

```
backend/
├── app/api/           # Route handlers (4 endpoints)
│   ├── simulate/
│   ├── mutate/
│   ├── debate/
│   └── sector/
├── lib/
│   ├── ai/
│   │   ├── groq.ts            # Groq client singleton
│   │   ├── pipeline/          # generate → validate → repair
│   │   └── prompts/           # System + user prompts per endpoint
│   ├── schemas/               # Zod schemas (node, edge, timeline, sector, debate)
│   ├── services/              # Business logic per endpoint
│   ├── supabase/              # Client + DB migration
│   └── utils/                 # Logger, errors, cache
```

---

## AI Pipeline

```
Request → Service → Prompt → Groq (llama-3.3-70b-versatile)
→ JSON Parse → Zod Validate → [Pass] → Supabase → Response
                             → [Fail] → Repair (send errors back to model)
                                      → [Fail again] → Error 502
```

## Validation Minimums (enforced by Zod)
- ≥ 6 nodes
- ≥ 5 edges  
- ≥ 4 sectors
- ≥ 3 debate participants
