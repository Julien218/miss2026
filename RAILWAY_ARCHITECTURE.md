# Railway Architecture — Miss & Mister Dour 2026

## Project

| Field | Value |
|-------|-------|
| **Project name** | missetmisterdour2026 |
| **Project ID** | `d9a8ba3c-4dbe-490d-b931-fa8d9a12cebf` |
| **Environment** | production (`80fdd9eb-a436-4c8e-8c77-e4c1e6f622aa`) |
| **Created** | 2026-03-31 |

## Services

### 1. miss-mister-dour-web (main app)

| Field | Value |
|-------|-------|
| **Service ID** | `ecb51c1f-446b-4db4-a474-9d0224a90f78` |
| **Source** | GitHub: `Julien218/miss-mister-dour-web` (private/deleted) |
| **Branch** | `main` |
| **Builder** | Railpack V3 |
| **Build command** | `pnpm install && pnpm build` |
| **Start command** | `pnpm start` |
| **Runtime** | Node.js 22.22.3 + pnpm 10.4.1 |
| **Last deployment** | 2026-05-28T20:31:58Z — SUCCESS |
| **Last commit** | `3ac7a2c` — "📝 docs: add premium README — Js-Innov.IA" |

### 2. MySQL (database)

| Field | Value |
|-------|-------|
| **Service ID** | `0b0739e9-eca9-45ca-994f-d8f2d0e61fde` |
| **Image** | `mysql:9.4` |
| **Volume** | `/var/lib/mysql` |
| **Start command** | `docker-entrypoint.sh mysqld --innodb-use-native-aio=0 --disable-log-bin --performance_schema=0 --innodb-buffer-pool-size=1G` |
| **Region** | us-west2 |
| **Last deployment** | 2026-04-21 — SUCCESS |

### 3. APPopensource

| Field | Value |
|-------|-------|
| **Service ID** | `44dd37ec-b6c7-498a-b8b8-f94a721de4d9` |
| **Details** | Not inspected (lower priority) |

## Domains

| Domain | Type | Status |
|--------|------|--------|
| `miss-mister-dour-web-production.up.railway.app` | Railway service domain | ACTIVE |
| `missetmisterdour.be` | Custom domain | ACTIVE (cert: ISSUING) |
| `www.missetmisterdour.be` | Custom domain | ACTIVE (verified) |

## Related Project (older)

| Field | Value |
|-------|-------|
| **Project name** | missetmisterdour002 |
| **Project ID** | `3173fd5f-d25b-4e57-beb3-dbbea5859df8` |
| **Service** | `miss-mister-dour-web` (ID: `dc2ddf1d-5322-4792-9718-377e5e179e65`) |
| **Note** | Older version, no MySQL service |

## Recovery

Source code was recovered via SSH into the running `miss-mister-dour-web` container on 2026-07-25.
The GitHub repository `Julien218/miss-mister-dour-web` is no longer publicly accessible (404).
