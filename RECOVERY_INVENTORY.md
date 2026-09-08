# Recovery Inventory — Miss & Mister Dour Production Source

**Date:** 2026-07-25
**Source:** Railway container (project `missetmisterdour2026`, service `miss-mister-dour-web`)
**Production commit:** `3ac7a2c3fd97282df8527b793f1d0be8022e54f9` by Julien218
**Last deployment:** 2026-05-28T20:31:58Z — SUCCESS

## Summary

- **Total files recovered:** 322
- **Total size:** ~9.2 MB
- **Files missing:** 1 (`client/public/.gitkeep` — empty placeholder)
- **Secret scan:** ✅ PASS — no hardcoded secrets found
- **Entry point:** `dist/server/index.js` (compiled from `server/_core/index.ts`)
- **Build command:** `pnpm install && pnpm build`
- **Start command:** `pnpm start` → `NODE_ENV=production node dist/server/index.js`

## Files by directory

| Directory | Files | Description |
|-----------|-------|-------------|
| `client/src/pages/` | 53 | React page components |
| `client/src/components/ui/` | 53 | shadcn/ui components |
| `client/src/components/` | 28 | Custom React components |
| `server/` | 31 | Server source (non-_core, non-test) |
| `server/_core/` | 26 | Core server modules |
| `server/routers/` | 13 | tRPC routers |
| `client/src/hooks/` | 8 | React hooks |
| `drizzle/` | 7 | Database schema & migrations |
| `shared/` | 5 | Shared types & constants |
| `client/public/` | 8 | Static assets |
| `docs/` | 2 | Architecture docs |
| `scripts/` | 2 | Utility scripts |
| `patches/` | 1 | wouter patch |
| Root | 34 | Config, docs, CSV |

## Environment variables required

See `.env.example` for the complete list. All sensitive values are loaded via `process.env.*`.

## Stack

- **Runtime:** Node.js 22.22.3
- **Package manager:** pnpm 10.4.1
- **Build:** Railpack (V3) with Vite
- **Frontend:** React + TypeScript + shadcn/ui + Tailwind CSS
- **Backend:** Express + tRPC + Drizzle ORM
- **Database:** MySQL 9.4 (Railway provisioned)
- **Auth:** JWT + OAuth (Supabase integration)

## Recovery method

Files were extracted via SSH into the running Railway container (`railway ssh` + `cat`).
No modifications were made to the production container. The recovery is strictly read-only.

## Generated files (not original source)

- `bundle.js` — pre-built frontend bundle (from dist/)
- `styles.css` — compiled CSS (from dist/)
- `index.html` — built HTML entry (from dist/client/)

These were removed from the recovery as they are build artifacts.
