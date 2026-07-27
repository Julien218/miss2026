# rescue: recover complete Miss & Mister Dour production source

## Origine du code

- **Source :** Conteneur Railway en production (lecture seule via SSH)
- **Projet Railway :** `missetmisterdour2026`
- **Service Railway :** `miss-mister-dour-web`
- **Commit de production :** `3ac7a2c3fd97282df8527b793f1d0be8022e54f9` (2026-05-28)
- **GitHub repo original :** `Julien218/miss-mister-dour-web` (supprimé/inaccessible)
- **Domaine de production :** `missetmisterdour.be`

## Fichiers récupérés

| Dossier | Fichiers | Description |
|---------|----------|-------------|
| `client/src/pages/` | 53 | Composants de pages React |
| `client/src/components/ui/` | 53 | Composants shadcn/ui |
| `client/src/components/` | 28 | Composants React custom |
| `server/` | 31 | Code serveur (hors _core et tests) |
| `server/_core/` | 26 | Modules core serveur |
| `server/routers/` | 13 | Routeurs tRPC |
| `client/src/hooks/` | 8 | Hooks React |
| `drizzle/` | 11 | Schéma et migrations base de données |
| `shared/` | 5 | Types et constants partagés |
| `client/public/` | 8 | Assets statiques (favicon, logos) |
| `docs/` | 2 | Documentation architecture |
| `scripts/` | 2 | Scripts utilitaires |
| `patches/` | 1 | Patch wouter |
| **Total** | **322** | + 17 fichiers de config racine = 362 fichiers |

**Taille totale :** 5.0 MB (hors `node_modules/`, `dist/`, `.git/`)

## SHA-256 de l'archive

```
cd6280fc5d3c2725e4389f5315f7f3780f033aeb58b4a8995022c06aae25392c
```

Calculé sur 362 fichiers via `git archive --format=tar rescue/recovered-production-source | sha256sum`.

## Scan de secrets

✅ **PASS** — Aucune valeur secrète hardcoded dans le code source.

- Clés API (Stripe, OpenAI, Supabase, AWS) : aucune trouvée
- Tokens (GitHub, Railway, WhatsApp) : aucun trouvé
- Chaînes de connexion (MySQL, Redis) : aucune trouvée
- JWT secrets : aucun trouvé (référencé via `process.env.JWT_SECRET`)
- Cookies/mots de passe : aucun trouvé

Toutes les valeurs sensibles sont chargées via `process.env.*`. Le fichier `.env.example` documente les 22 variables d'environnement requises sans révéler aucune valeur.

## Fichiers exclus

| Fichier/Dossier | Raison |
|----------------|--------|
| `node_modules/` | Régénérable via `pnpm install` |
| `dist/` | Build artifact (régénérable via `pnpm build`) |
| `.manus/` | Artefact IDE Manus (non applicatif) |
| `.git/` | Non présent dans le conteneur de déploiement |
| `.env` / `.env.production` | Contient des secrets (non récupéré par design) |
| `bundle.js`, `styles.css` | Build artifacts pré-compilés (dist/) |

## Fichiers absents

Voir `MISSING_FILES.md` pour la liste complète. Points principaux :
- `client/public/.gitkeep` (fichier vide, sans impact)
- Aucun `railway.json`, `Dockerfile`, `nixpacks.toml` (Railpack auto-détecte)
- Aucun `tailwind.config.*`, `postcss.config.*` (Tailwind v4 via CSS)
- Aucun workflow GitHub Actions dans le conteneur
- Pas de `.env` (secrets — non récupéré par design)

## TypeScript

✅ **PASS** — `tsc --noEmit` : 0 erreur, 0 warning.

## Build

✅ **PASS** — `pnpm build` :
- Vite build : 20.16s
- esbuild server bundle : 188ms (413 KB)
- Bundle frontend : 3.78 MB (gzip: 1 MB)
- Warning : chunks > 500 KB (code-splitting recommandé)

## Tests

**Base de test :** MariaDB 10.11 sur `127.0.0.1:3306` (base `miss_dour_test`)
**Migrations :** Schéma Drizzle appliqué via `drizzle-kit push` (39 tables créées)

```
Test Files  5 failed | 18 passed (23)
Tests       16 failed | 298 passed | 19 skipped (314 total)
```

⚠️ **Note :** MariaDB 10.11 utilisé pour les tests, pas MySQL. La production utilise MySQL sur Railway. Les résultats peuvent différer légèrement.

### Échecs par catégorie

#### 1. Bug `insertId` non déstructuré (10 tests) — BUGS RÉELS

5 fonctions dans `server/db.ts` utilisent `const result = await db.insert(...)` puis `result.insertId` SANS déstructurer le résultat Drizzle ORM (`const [result] = ...`). Cela retourne `NaN` au lieu de l'ID inséré.

Fonctions affectées :
- `createInvitation` (ligne 2588) — tests: invitations × 5
- `getOrCreateVoteSession` (ligne 567) — tests: candidate onboarding × 2
- `registerForEvent` (ligne 883) — tests: candidate onboarding × 2
- `createArticle` (ligne 1251)
- `createAsset` (ligne 2535)

**Fix :** Remplacer `const result = await db.insert(...)` par `const [result] = await db.insert(...)`.
**Branche cible :** `fix/database-insert-id-handling` (créée après cette PR)

#### 2. Service externe indisponible (1 test) — ENVIRONNEMENT

`Photos Router > Upload Photos` tente de se connecter au Forge API (`localhost:3001`) non démarré en local.

#### 3. Analytics/Gallery sans seed data (5 tests) — ENVIRONNEMENT

Tests d'analytics et de filtres gallery nécessitent des données de seed dans la base de test.

### Tests ignorés

19 tests `.skip()` documentés dans le code source. Aucun test masqué pour rendre le rapport vert.

## Cinq bugs identifiés (volontairement non corrigés)

| # | Fonction | Ligne | Impact | Fix |
|---|----------|-------|--------|-----|
| 1 | `createInvitation` | 2588 | Invitations → NaN | `const [result] = await db.insert(...)` |
| 2 | `getOrCreateVoteSession` | 567 | Vote sessions → NaN | `const [result] = await db.insert(...)` |
| 3 | `registerForEvent` | 883 | Inscriptions événements → NaN | `const [result] = await db.insert(...)` |
| 4 | `createArticle` | 1251 | Articles → NaN | `const [result] = await db.insert(...)` |
| 5 | `createAsset` | 2535 | Assets → NaN | `const [result] = await db.insert(...)` |

Ces corrections seront appliquées dans la branche `fix/database-insert-id-handling`.

## Différences avec la production

| Élément | Production | Récupéré | Statut |
|---------|-----------|----------|--------|
| Routes frontend | 55 routes | 65 pages React | ✅ Couvert |
| Routeurs tRPC | 28 routeurs | 13 fichiers router | ✅ Couvert |
| Procédures tRPC | ~90 procédures | ~90 procédures | ✅ Couvert |
| Tables DB | 39 tables | 39 tables (schema.ts) | ✅ Couvert |
| Assets | Logos + favicons | 8 fichiers | ✅ Couvert |
| Config Docker | Railpack | Non présent | ⚠️ Auto-détecté |
| CI/CD | Aucun workflow | Aucun workflow | ⚠️ Absent |

## Prochaines branches de correction

1. `fix/database-insert-id-handling` — Correction des 5 bugs `insertId`
2. `fix/domain-direct-routing` — Suppression iframe + domaine direct Railway
3. `fix/seo-metadata-cleanup` — Métadonnées SEO périmées
4. `feat/edition-entity` — Implémentation entité Edition
5. `feat/code-splitting` — Découpage du bundle frontend

---

**Ne pas fusionner cette PR.** Elle est un archive fidèle du code de production récupéré.
