# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint (flat config, eslint.config.mjs)
```

No test framework is configured.

## Stack and conventions

- Next.js 16.4.5 + React 19.3, App Router, plain JavaScript (no TypeScript). Source lives in `src/app/`; the `@/*` alias maps to `src/*` (`jsconfig.json`).
- Styling is global CSS (`src/app/globals.css`) plus CSS Modules (`page.module.css`).
- Project is still the unmodified `create-next-app` scaffold.

## Next.js version caveat

`AGENTS.md` warns that this Next.js version has breaking changes from what you may know. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app/` for App Router, `03-architecture/`, etc.) and heed deprecation notices. `AGENTS.md` is managed by `next dev`, which re-adds it if removed.

## Non-default Next config

`next.config.mjs` enables `cacheComponents: true`, `partialPrefetching: true`, and `experimental.agentFeedback`. `cacheComponents` changes caching and rendering semantics (e.g. dynamic/uncached data access must be handled via Suspense or `use cache`), so consult the docs for these flags before writing data-fetching or caching code.
