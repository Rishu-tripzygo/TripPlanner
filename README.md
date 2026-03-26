# Wandrly

Wandrly is an AI travel planning app built with Next.js, TypeScript, Prisma, NextAuth, and Tailwind CSS. It combines AI trip generation, route review, budget tracking, packing, documents, journal notes, public sharing, and collaborator access in one workspace.

## Current Product Scope

- Multi-provider auth with guest preview support
- AI planner with OpenAI primary and Gemini fallback
- Versioned itineraries and route sync state
- Trip workspace with route review, map, budget, packing, documents, and journal
- Public trip sharing and explore feed
- Owner/editor/viewer collaboration roles

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Prisma + PostgreSQL
- NextAuth v5
- Tailwind CSS
- UploadThing
- Leaflet / React Leaflet

## Environment Setup

Use `.env.local` for local development. Required values depend on which features you want active.

### Core

```env
DATABASE_URL=
AUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

### AI Providers

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
AI_PROVIDER_ORDER=openai,gemini
AI_GENERATION_LIMIT_PER_HOUR=8
ASSISTANT_LIMIT_PER_MINUTE=12
```

### Auth Providers

```env
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_EMAIL_SERVER_HOST=
AUTH_EMAIL_SERVER_PORT=587
AUTH_EMAIL_SERVER_USER=
AUTH_EMAIL_SERVER_PASSWORD=
AUTH_EMAIL_FROM=
```

### Uploads

```env
UPLOADTHING_TOKEN=
```

## Local Development

```bash
npm install
npx prisma generate
npm run dev
```

## Verification Commands

```bash
npm run typecheck
npm run build
npm run verify
```

## Health Check

Wandrly exposes a basic health endpoint:

```text
/api/health
```

It reports:

- app status
- database reachability
- whether AI/auth providers are configured
- response latency

## Database Notes

This repo uses Prisma with Neon/PostgreSQL.

Important:

- `prisma migrate dev` can fail against a pooled Neon connection string
- use a direct database URL for full migration workflow when possible
- `prisma db push` is acceptable for additive local/schema sync when the pooler blocks the schema engine

## Collaboration Model

- `OWNER`: full control, settings, delete, duplicate, public sharing, collaborator management
- `EDITOR`: can work on budget, packing, documents, journal, and trip content
- `VIEWER`: read-only access to the trip workspace

## Deployment Checklist

Before shipping:

1. Set production env vars in your host
2. Confirm `/api/health` returns `ok: true`
3. Run `npm run verify`
4. Confirm database schema is in sync
5. Test:
   - sign in
   - guest preview
   - AI trip generation
   - route confirmation
   - collaboration invite
   - public share link
6. Rotate any exposed API keys
7. Verify production auth callback URLs

## Launch QA Checklist

- Landing page explains value before sign-in
- Planner works for signed-in and guest preview flows
- Route review supports edit/reorder/home base/return home
- Budget, packing, documents, and journal work for owner/editor
- Viewer access is read-only
- Explore and shared trip pages load correctly
- Public profile and share states work when data is sparse
- Assistant respects request limits and returns useful errors

## Known Operational Notes

- `npm run typecheck` was updated to avoid the stale `.next/types` issue from the earlier config
- AI request limits are in-memory for now, which is fine for a single-node deployment but not a distributed long-term limit system
- public security headers are configured in `next.config.ts`

## Recommended Next Infrastructure Steps

- move rate limiting to a shared store when you need multi-instance enforcement
- add Sentry or equivalent error tracking
- add analytics for generation success, conversion, and retention
- use a direct Neon connection for safer Prisma migration workflows
