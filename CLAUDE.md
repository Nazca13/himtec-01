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

The project is SAPA (see `README.md` for the full role/flow/API reference). Three roles: **ADMIN** and **PEMANTAU** are `Member` rows of a `Household` (family) and use the web dashboard (`/pengawas/*`: Beranda, Riwayat, Asisten AI, Keluarga); **LANSIA** is an elder (`Lansia` row) whose phone is paired once via `/hubungkan?kode=` and runs the PWA (`/lansia`; only that page and `/hubungkan` link `/app.webmanifest`). Admin registers at `/daftar` (creates household + admin + first elder), viewers join at `/gabung` with the invite code, the guide is `/panduan`, `/demo` logs one browser into the seeded demo family as admin + elder side by side.

DB relations: Household 1-n Member, Household 1-n Lansia, Lansia 1-n DailyRecord (cascade). DailyRecord carries optional `latitude/longitude/akurasiMeter` (sent by the elder phone, validated in `lib/lokasi.js`). Old databases are migrated by the SQL files in `prisma/sql/`.

Structure: `src/app` (routes + thin route handlers), `src/features/{lansia,pengawas,masuk}`, `src/components/ui`, `src/services` (household = families/members/elders, record, triage, mascot, assistant, demo), `src/hooks`, `src/lib`. Route handlers validate input and call services; they hold no logic.

Auth: no passwords. Two signed httpOnly cookies (HMAC-SHA256 via Web Crypto, `SESSION_SECRET`): `sapa-pengawas` = `{ m: memberId }`, `sapa-lansia` = `{ l: lansiaId, v: deviceVersion }`. `src/proxy.js` gates pages; every API re-checks with `requireMember(request, { admin })` / `requireLansia(request)` from `lib/auth.js` (role is read from the DB each request) and scopes data to the session's household via `lansiaMilik`/`anggotaMilik`; ids from the client are never trusted. Invite/pairing codes are only returned to admins. A household always keeps at least one admin. Interactive transactions need `timeout` options (remote DB ~300 ms/query).

AI: audio triage (`google/gemini-2.5-flash`, `input_audio` WAV only) and text features (`google/gemini-2.5-flash-lite`, log context uses relative times like "Kemarin, 05:53 WIB"; `orcarouter/auto` was measured at 30-40 s, do not use) all use `ORCA_API_KEY` via `src/lib/orca.js`. The browser converts recordings to 16 kHz mono WAV (`useRecorder`). Mascot message and the family "Ringkasan AI" are cached in memory; if AI fails or is slow (>6 s) a local rule-based text is used, and triage saves the voice note as KUNING with `aiAnalysis.fallback = true`.

PWA: hand-written `public/sw.js` (no `next-pwa`; registered only in production by `RegisterSW`) caches the app shell and `/_next/static`, never `/api/*`; offline fallback `public/offline.html`; bump `VERSION` when changing cache strategy. Entrance animations must be CSS (not JS `initial` states) so content paints without waiting for hydration; use `m.*` from `motion/react-m` (LazyMotion strict), never `motion.*`. Cookie-reading GET handlers call `await connection()`. GET routes with side effects (`/demo`, `/demo?reset=1`) must be linked with a plain `<a>`, never `<Link>`: Link prefetch would execute them (set cookies, reset data) without a click. `next.config.mjs` sets `allowedDevOrigins` for LAN IPs; without it the dev server blocks its scripts on a phone and forms appear frozen. Demo data: `npm run db:seed` or `/demo?reset=1`. Non-verbal complaints (`KELUHAN`, 9 options in `lib/keluhan.js`, one tap sends) are interpreted server-side in `services/kabar.service.js`; the client never sets the status. Motion-based fall/seizure detection was tried and removed as unreliable on the web (only works while the app is open); `DETEKSI_OTOMATIS` stays in the CHECK constraint only so old rows remain valid. UI follows Apple HIG: grouped `--bg` background, white cards, single tint `--tint`, system font. Location: elder phone sends coordinates with each button press when permitted (`lib/geo.js`, never blocks sending >3 s); `Permissions-Policy` allows `geolocation=(self)`.

## Environment

Copy `.env.example` to `.env`: `DATABASE_URL` (Supabase pooler, port 6543, runtime), `DIRECT_URL` (direct, port 5432, migrations) `ORCA_API_KEY` and `SESSION_SECRET`. No Supabase anon/service keys are used (Prisma connects directly).

## Next.js caveats

- `AGENTS.md` warns that this Next.js version has breaking changes from what you may know. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app/`, `03-architecture/`, etc.) and heed deprecation notices. `AGENTS.md` is managed by `next dev`, which re-adds it if removed.
- `next.config.mjs` enables `cacheComponents`, `partialPrefetching` and `experimental.agentFeedback`. `cacheComponents` changes caching and rendering semantics (dynamic/uncached data access must go through Suspense or `use cache`), so check the docs before writing data-fetching or caching code.
