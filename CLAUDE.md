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
- AI: Gemini via `@google/genai`. Server-side only; the API key must never reach client code.

## Layout

- `src/app/` pages, layouts and route handlers (`src/app/api/*/route.js`).
- `src/lib/` shared server utilities (e.g. `db.js`).
- `prisma/` database schema.

The project is SAPA (see `PRD.txt`): a dual-view PWA. `/lansia` is a 3-button kiosk with voice notes; `/pengawas` is the family app (tabs: Beranda, Riwayat, Asisten AI; bottom nav on mobile, sidebar >=900px). `/` is a role gateway that remembers the role in localStorage (`?ganti` to re-pick); roles are defined in `src/lib/roles.js`. Icons: `react-icons/pi` (Phosphor), no emoji. Palette tokens live in `src/app/globals.css` (status colors via `.tone-HIJAU/KUNING/MERAH`).

Structure: `src/app` (routes + thin route handlers), `src/features/{lansia,pengawas}` (feature UI), `src/components/ui` (shared UI), `src/services` (business logic: record, triage, assistant), `src/hooks`, `src/lib` (db, gemini, orca, constants, format). Route handlers validate input and call services; they hold no logic.

AI: audio triage and the assistant use Gemini; the assistant falls back to OrcaRouter (`ORCA_API_KEY`). If no key is set, triage saves the voice note as KUNING with `aiAnalysis.fallback = true`. PWA uses the native `src/app/manifest.js` (no `next-pwa`, no service worker). Demo data: `node prisma/seed.js`.

## Environment

Copy `.env.example` to `.env`: `DATABASE_URL` (Supabase pooler, port 6543, runtime), `DIRECT_URL` (direct, port 5432, migrations) and `GEMINI_API_KEY`.

## Next.js caveats

- `AGENTS.md` warns that this Next.js version has breaking changes from what you may know. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app/`, `03-architecture/`, etc.) and heed deprecation notices. `AGENTS.md` is managed by `next dev`, which re-adds it if removed.
- `next.config.mjs` enables `cacheComponents`, `partialPrefetching` and `experimental.agentFeedback`. `cacheComponents` changes caching and rendering semantics (dynamic/uncached data access must go through Suspense or `use cache`), so check the docs before writing data-fetching or caching code.
