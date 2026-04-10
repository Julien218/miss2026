# Miss & Mister Dour 2026 - Site Officiel SaaS
# https://missetmisterdour.be

## 🎯 OBJECTIF GLOBAL
Construire un site officiel de standing international (niveau Miss France/Dior) en tant que SaaS propriétaire complet avec Supabase, gestion multi-rôles, vote sécurisé, galerie validée, upload médias, agent IA vocal Julian, et backoffice administratif.

---

## 📋 PHASE 1: ARCHITECTURE & SUPABASE

### Configuration Supabase
- [ ] Créer projet Supabase pour Miss & Mister Dour 2026
- [ ] Configurer Supabase Auth (email/password + magic links)
- [ ] Configurer Supabase Storage pour médias
- [ ] Installer @supabase/supabase-js dans le projet
- [ ] Créer fichier de configuration Supabase

### Schéma Base de Données Multi-Rôles
- [ ] Table `profiles` : id, user_id, role (super_admin/admin_director/photographer/candidate), full_name, avatar_url, created_at
- [ ] Table `candidates` : id, profile_id, category (miss/mister), bio, motivation, photos_urls[], status (pending/approved/finalist/winner), votes_count, created_at
- [ ] Table `votes` : id, candidate_id, voter_email, voter_ip_hash, session_token, voted_at
- [ ] Table `media` : id, uploader_id (photographer), file_url, file_type, category, status (pending/approved/rejected), approved_by, created_at
- [ ] Table `leads` : id, type (candidate/sponsor/fan/ai/insurance), name, email, phone, message, status, created_at
- [ ] Table `audit_logs` : id, user_id, action, entity_type, entity_id, details_json, ip_hash, created_at

### Gestion des Rôles (RLS Supabase)
- [ ] Policy Super Admin : accès total
- [ ] Policy Admin Directeur : validation médias, gestion candidats
- [ ] Policy Photographe : upload médias uniquement
- [ ] Policy Candidat : voir son profil, modifier bio

---

## 📋 PHASE 2: ANIMATION D'OUVERTURE CINÉMATIQUE

### Intro Prestige ✅
- [x] Animation d'ouverture digne d'un film (8.5 secondes)
- [x] Effet miroir Liligaga (20 éclats SVG animés, 30 particules dorées)
- [x] Logo JS-Innov.IA animé (rotation -180°→0°, scale 0→1, glow doré)
- [x] Message "Ce site est une création exclusive JS-Innov.IA – Tous droits réservés"
- [x] Transition fluide vers /miss-mister-dour-2026
- [x] Skip button (affichage après 3 secondes)
- [x] 4 phases d'animation : mirror (2s) → logo (2.5s) → message (2.5s) → transition (1.5s)
- [x] Signature "Créé par Pagin Julien - Dour, Belgique" en bas

---

## 📋 PHASE 3: SYSTÈME DE VOTE SÉCURISÉ

### Vote Frontend
- [ ] Page `/vote` avec liste des candidats (Miss + Mister)
- [ ] Cards candidats avec photo, nom, bio courte
- [ ] Bouton "Voter" avec modal de confirmation
- [ ] Formulaire : email + captcha
- [ ] Affichage dynamique des scores (barres de progression)
- [ ] Classement en temps réel

### Vote Backend & Sécurité
- [ ] Fonction `castVote(candidateId, voterEmail, ipHash, sessionToken)`
- [ ] Vérification : 1 vote par email
- [ ] Vérification : limitation par IP (max 3 votes/IP)
- [ ] Vérification : session token unique
- [ ] Envoi email de confirmation avec token de vérification
- [ ] Incrémentation automatique `votes_count` dans `candidates`
- [ ] Audit log de chaque vote

---

## 📋 PHASE 4: GALERIE & UPLOAD MÉDIAS

### Galerie Publique
- [ ] Page `/galerie` avec filtres (Miss/Mister/Événements/Coulisses)
- [ ] Grid responsive avec lazy loading
- [ ] Lightbox pour affichage plein écran
- [ ] Affichage uniquement des médias `status = approved`
- [ ] Tri par date/catégorie

### Upload Photographes
- [ ] Page `/upload` (réservée rôle `photographer`)
- [ ] Drag & drop multi-fichiers
- [ ] Upload vers Supabase Storage
- [ ] Sélection catégorie (Miss/Mister/Événements/Coulisses)
- [ ] Prévisualisation avant upload
- [ ] Barre de progression
- [ ] Notification succès/erreur

### Validation Admin
- [ ] Page `/admin/media` (Admin Directeur + Super Admin)
- [ ] Liste médias `status = pending`
- [ ] Boutons Approuver/Rejeter
- [ ] Prévisualisation full-screen
- [ ] Commentaires de rejet (optionnel)
- [ ] Audit log des validations

---

## 📋 PHASE 5: AGENT IA JULIAN VOCAL

### Chatbot IA
- [ ] Widget chatbot bottom-right (design premium)
- [ ] Intégration GPT-4 via OpenAI API
- [ ] Contexte : "Tu es Julian, agent IA de JS-Innov.IA pour Miss & Mister Dour 2026"
- [ ] Réponses aux questions fréquentes
- [ ] Tri automatique des leads (candidat/sponsor/fan)
- [ ] Sauvegarde conversations dans table `leads`

### Voix IA ElevenLabs
- [ ] Créer voix "Julian" masculine suave sur ElevenLabs
- [ ] Bouton "Parler avec Julian" (voix)
- [ ] Conversion text-to-speech des réponses IA
- [ ] Lecture audio automatique
- [ ] Contrôles Play/Pause/Stop

---

## 📋 PHASE 6: BACKOFFICE COMPLET

### Dashboard Super Admin
- [ ] Page `/admin/dashboard` avec statistiques globales
- [ ] Nombre total candidats (Miss/Mister)
- [ ] Nombre total votes
- [ ] Nombre médias (pending/approved/rejected)
- [ ] Nombre leads par type
- [ ] Graphiques interactifs (Recharts)

### Gestion Candidats
- [ ] Page `/admin/candidates` avec liste complète
- [ ] Filtres Miss/Mister, statut
- [ ] Boutons Approuver/Rejeter/Finaliste/Gagnant
- [ ] Édition profil candidat
- [ ] Suppression candidat

### Gestion Votes
- [ ] Page `/admin/votes` avec liste tous les votes
- [ ] Filtres par candidat, date
- [ ] Détection votes suspects (même IP)
- [ ] Suppression vote frauduleux
- [ ] Export CSV

### Gestion Médias
- [ ] Déjà implémenté dans Phase 4

### Gestion Leads
- [ ] Page `/admin/leads` avec liste tous les leads
- [ ] Filtres par type (candidat/sponsor/fan/ai/insurance)
- [ ] Statut (nouveau/contacté/converti/archivé)
- [ ] Bouton "Contacter" (email)
- [ ] Export CSV

### Audit Logs
- [ ] Page `/admin/audit` avec liste toutes les actions
- [ ] Filtres par utilisateur, action, date
- [ ] Recherche par entity_id
- [ ] Export CSV

---

## 📋 PHASE 7: OPTIMISATION SEO & RESPONSIVE

### SEO
- [ ] Meta tags optimisés (title, description, keywords)
- [ ] Schema.org Organization + Event
- [ ] Sitemap XML automatique
- [ ] Robots.txt
- [ ] Canonical tags
- [ ] Open Graph tags (Facebook/Twitter)
- [ ] Rich snippets FAQ
- [ ] Alt text sur toutes les images

### Performance
- [ ] Images WebP avec fallback
- [ ] Lazy loading images
- [ ] Code splitting
- [ ] Minification CSS/JS
- [ ] Compression Gzip
- [ ] CDN pour assets statiques
- [ ] Core Web Vitals > 90

### Responsive
- [ ] Mobile-first design
- [ ] Breakpoints : 320px, 768px, 1024px, 1440px
- [ ] Navigation mobile hamburger
- [ ] Touch-friendly buttons (min 44px)
- [ ] Test sur iOS/Android

---

## 📋 PHASE 8: TESTS & DÉPLOIEMENT

### Tests
- [ ] Tests unitaires (Vitest) pour fonctions critiques
- [ ] Test vote sécurisé (limitations)
- [ ] Test upload médias
- [ ] Test agent IA Julian
- [ ] Test RLS Supabase (isolation rôles)
- [ ] Test responsive (mobile/tablet/desktop)

### Déploiement
- [ ] Configurer custom domain `missetmisterdour.be`
- [ ] SSL/HTTPS activé
- [ ] Variables d'environnement Supabase
- [ ] Variables d'environnement OpenAI
- [ ] Variables d'environnement ElevenLabs
- [ ] Backup automatique base de données
- [ ] Monitoring (Sentry/LogRocket)

---

## 🎨 IDENTITÉ VISUELLE

### Palette Cohérente
- Or élégant: #D4AF37, #B8941E
- Bleu profond: #1E40AF, #3B82F6
- Cyan lumineux: #06B6D4, #22D3EE
- Rose/Magenta: #EC4899, #F472B6
- Violet profond: #7C3AED, #A855F7
- Noir profond: #000000, #0A0A0A
- Blanc pur: #FFFFFF

### Logos
- Logo JS-Innov.IA (phoenix doré) : https://files.manuscdn.com/user_upload_by_module/session_file/87304619/TSTzHwjZoWSIonON.jpg
- Logo Miss & Mister Dour (hologramme) : https://files.manuscdn.com/user_upload_by_module/session_file/87304619/TnnTVaRgkxfghmQM.png
- Logo Miss & Mister Dour (transparent) : https://files.manuscdn.com/user_upload_by_module/session_file/87304619/ZQTzULwGEMrWUmHB.png

### Typographie
- Titres : Playfair Display (élégant, serif)
- Corps : Inter (moderne, sans-serif)
- Accent : Cinzel (prestige, serif)

---

## 🔐 SÉCURITÉ

### Authentification
- [ ] Supabase Auth avec email/password
- [ ] Magic links pour connexion sans mot de passe
- [ ] Vérification email obligatoire
- [ ] Reset password sécurisé

### Protection
- [ ] Rate limiting sur API
- [ ] CORS configuré
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] SQL injection protection (Supabase RLS)
- [ ] Encryption des données sensibles

---

## 📊 STATISTIQUES & ANALYTICS

- [ ] Google Analytics 4
- [ ] Tracking conversions (votes, inscriptions candidats)
- [ ] Heatmaps (Hotjar)
- [ ] A/B testing (boutons CTA)

---

## ✅ CHECKLIST FINALE

- [ ] Toutes les fonctionnalités testées
- [ ] SEO score > 95 (Lighthouse)
- [ ] Performance score > 90 (Lighthouse)
- [ ] Accessibilité score > 90 (Lighthouse)
- [ ] Responsive testé sur 5+ appareils
- [ ] Backup base de données configuré
- [ ] Monitoring actif
- [ ] Documentation admin créée
- [ ] Formation équipe (Super Admin, Admin Directeur, Photographes)

---

**Créé par Pagin Julien - Dour, Belgique**
**© 2026 JS-Innov.IA - Tous droits réservés**
