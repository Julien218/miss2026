# Missing Files

## Confirmed missing (not in container)

| File | Reason | Impact |
|------|--------|--------|
| `client/public/.gitkeep` | Empty placeholder file | None — git artifact |
| `railway.json` / `railway.toml` | Not present — Railpack auto-detects config | None — Railway generates this at build |
| `nixpacks.toml` | Not present | None — Railpack V3 used instead |
| `Dockerfile` | Not present | None — Railpack builds from source |
| `tailwind.config.*` | Not present | Low — Tailwind v4 may use CSS-based config (check `client/src/index.css`) |
| `postcss.config.*` | Not present | Low — may be handled by Vite plugin |
| `.eslintrc*` / `eslint.config.*` | Not present | Low — linting not configured in this build |
| `.npmrc` | Not present | None |
| `.github/workflows/` | Not present | None — no CI/CD workflows in container |
| Email templates | Not found as separate files | Medium — may be inline in `server/helpers/email.ts` |
| PDF templates | Not found | Medium — certificates generated programmatically |

## Files outside /app (not recoverable via container SSH)

| Item | Location | Notes |
|------|----------|-------|
| GitHub repo history | `Julien218/miss-mister-dour-web` | Repo returns 404 (deleted or made private) |
| `.env` values | Railway variables | Not recovered — contains secrets |
| MySQL data | Railway volume `/var/lib/mysql` | Not recovered — production data |
| `.git/` directory | Not in container | Not included in deployment image |

## Notes

- The container contains the **deployed build**, not the full git repository
- `dist/` directory exists but was excluded from recovery (compiled output)
- `node_modules/` excluded (regenerable from `pnpm-lock.yaml`)
- `.manus/` directory excluded (IDE artifact, not application code)
