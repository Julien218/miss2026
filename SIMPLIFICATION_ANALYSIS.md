# Analyse de Simplification - Miss & Mister Dour 2026

## Pages à GARDER (Usage Interne)

### Core Admin
- `AdminDashboard.tsx` - Dashboard principal admin
- `AdminAnalytics.tsx` - Analytics heatmap 7j×24h
- `VideoFactory2026.tsx` - Media Factory (FlowithOS + ElevenLabs)

### Candidate Management
- `Candidates.tsx` - Liste candidats
- `CandidateProfile.tsx` - Profil candidat détaillé
- `CandidateRegister.tsx` - Inscription candidat
- `CandidateAnalytics.tsx` - Analytics candidat individuel

### Public Facing (Minimal)
- `MissMisterDour2026Premium.tsx` - Page publique principale
- `Home.tsx` - Redirection vers Premium
- `NotFound.tsx` - Page 404

## Pages à SUPPRIMER (Commerciales/Inutiles)

### Commerciales
- `JSInnovHome.tsx` - Page commerciale JS Innov
- `LiligagaMirror.tsx` - Page commerciale Liligaga
- `ComponentShowcase.tsx` - Showcase composants (dev only)

### Duplicates
- `MissMisterDour2026.tsx` - Duplicate de Premium
- `MissMisterDour2026Intro.tsx` - Intro inutile
- `Rankings.tsx` - Duplicate de Ranking.tsx

### Features Non-Essentielles
- `Ranking.tsx` - Classement public (pas prioritaire)
- `Vote.tsx` - Vote public (pas prioritaire)
- `Gallery.tsx` - Galerie photos (pas prioritaire)
- `Calendar.tsx` - Calendrier événements (pas prioritaire)
- `Chat.tsx` - Chat (pas prioritaire)
- `SocialTracking.tsx` - Tracking social (remplacé par Analytics)
- `HomeArticles.tsx` - Articles homepage (pas prioritaire)
- `ArticleDetail.tsx` - Détail article (pas prioritaire)
- `AdminArticles.tsx` - Admin articles (pas prioritaire)
- `Contests.tsx` - Gestion concours multiples (un seul concours 2026)
- `JuryEvaluation.tsx` - Évaluation jury (pas prioritaire)
- `MyProfile.tsx` - Profil utilisateur (pas prioritaire)
- `RegistrationThankYou.tsx` - Page remerciement (simplifier)
- `VerifyCertificate.tsx` - Vérification certificat (pas prioritaire)
- `Dashboard.tsx` - Dashboard générique (remplacé par AdminDashboard)

## Tables DB à GARDER

- `users` - Utilisateurs admin
- `candidates` - Candidats
- `media_jobs` - Jobs génération média
- `assets` - Assets média (vidéos, audios)
- `knowledge_garden` - Brand Lock + prompts
- `candidate_analytics` - Analytics candidats
- `tracking_events` - Events tracking
- `ip_tracking` - Rate limiting

## Tables DB à SUPPRIMER/SIMPLIFIER

- `contests` - Un seul concours 2026, hardcoder
- `articles` - Pas prioritaire
- `events` - Pas prioritaire
- `eventAttendees` - Pas prioritaire
- `event_participants` - Pas prioritaire
- `messages` - Chat pas prioritaire
- `evaluations` - Jury pas prioritaire
- `professionals` - Pas utilisé
- `organizations` - Pas utilisé
- `organization_settings` - Pas utilisé
- `partners` - Pas prioritaire
- `partner_benefits` - Pas prioritaire
- `badges` - Gamification pas prioritaire
- `user_badges` - Gamification pas prioritaire
- `certificates` - Pas prioritaire
- `audit_logs` - Pas prioritaire pour usage interne
- `social_scores` - Remplacé par candidate_analytics
- `votes` - Pas prioritaire
- `voteSessions` - Pas prioritaire
- `notifications` - Simplifier (juste pour admin)
- `media` - Duplicate de assets
- `event_config` - Mode live pas prioritaire

## Actions Simplification

1. **Supprimer 22 pages inutiles**
2. **Garder 11 pages essentielles**
3. **Supprimer 18 tables DB**
4. **Garder 8 tables essentielles**
5. **Simplifier navigation (3 sections max)**
6. **Nettoyer routes tRPC (garder candidate, media, analytics)**
