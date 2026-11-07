# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint (flat config, eslint.config.mjs)
```

No test framework is configured. Prisma has no npm script; run `npx prisma generate`, `npx prisma migrate dev` or `npx prisma studio` directly.

## Stack

- Next.js 16.4.5 + React 19.3, App Router, plain JavaScript (no TypeScript). Source lives in `src/`; the `@/*` alias maps to `src/*` (`jsconfig.json`).
- Styling: global CSS (`src/app/globals.css`) plus CSS Modules.
- Data: Prisma 6 on PostgreSQL (Supabase). Schema in `prisma/schema.prisma`; use the shared client from `src/lib/db.js` (singleton, don't instantiate `PrismaClient` elsewhere).
- AI: OrcaRouter (OpenAI-compatible, `openai` SDK, `src/lib/orca.js`). Server-side only; the API key must never reach client code.

## Layout

- `src/app/` pages, layouts and route handlers (`src/app/api/*/route.js`).
- `src/lib/` shared server utilities (e.g. `db.js`).
- `prisma/` database schema.

The project is SAPA (see `docs/PRD.txt`). Flow: a family member creates a household (group) on the web and gets two codes (elder phone, invite family); the elder phone pairs once via `/hubungkan?kode=...` and becomes the installable PWA (`/lansia`, only that page and `/hubungkan` link `/app.webmanifest`); other family join with the family code and use the web dashboard (`/pengawas/*`: Beranda, Riwayat, Asisten AI, Keluarga). `/demo` logs one browser into the seeded demo household as both roles and shows them side by side.

Structure: `src/app` (routes + thin route handlers), `src/features/{lansia,pengawas,masuk}` (feature UI), `src/components/ui` (shared UI incl. `Mascot`), `src/services` (business logic: household, record, triage, mascot, assistant, demo), `src/hooks`, `src/lib` (db, orca, session, auth, codes, rate-limit, format...). Route handlers validate input and call services; they hold no logic.

Auth: no passwords. Two signed httpOnly cookies (`sapa-lansia`, `sapa-pengawas`, HMAC-SHA256 via Web Crypto, `SESSION_SECRET`). `src/proxy.js` gates pages; every API re-checks via `requireSession(request, role)` and scopes queries by `household.id` from the session, never from the body. Revoking the elder phone bumps `Household.lansiaVersion`, which invalidates the old cookie. Join/pair endpoints are rate limited (in-memory shortcut).

AI: audio triage (`google/gemini-2.5-flash`, `input_audio` WAV only) and text features (`google/gemini-2.5-flash-lite`; `orcarouter/auto` was measured at 30-40 s, do not use) all use `ORCA_API_KEY` via `src/lib/orca.js`. The browser converts recordings to 16 kHz mono WAV (`useRecorder`). Mascot message and the family "Ringkasan AI" are cached in memory; if AI fails or is slow (>6 s) a local rule-based text is used, and triage saves the voice note as KUNING with `aiAnalysis.fallback = true`.

PWA: hand-written `public/sw.js` (no `next-pwa`; registered only in production by `RegisterSW`) caches the app shell and `/_next/static`, never `/api/*`; offline fallback `public/offline.html`; bump `VERSION` when changing cache strategy. Entrance animations must be CSS (not JS `initial` states) so content paints without waiting for hydration; use `m.*` from `motion/react-m` (LazyMotion strict), never `motion.*`. Cookie-reading GET handlers call `await connection()`. Demo data: `npm run db:seed` or `/demo?reset=1`.

## Environment

Copy `.env.example` to `.env`: `DATABASE_URL` (Supabase pooler, port 6543, runtime), `DIRECT_URL` (direct, port 5432, migrations) `ORCA_API_KEY` and `SESSION_SECRET`. No Supabase anon/service keys are used (Prisma connects directly).

## Next.js caveats

- `AGENTS.md` warns that this Next.js version has breaking changes from what you may know. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app/`, `03-architecture/`, etc.) and heed deprecation notices. `AGENTS.md` is managed by `next dev`, which re-adds it if removed.
- `next.config.mjs` enables `cacheComponents`, `partialPrefetching` and `experimental.agentFeedback`. `cacheComponents` changes caching and rendering semantics (dynamic/uncached data access must go through Suspense or `use cache`), so check the docs before writing data-fetching or caching code.
