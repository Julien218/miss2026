<div align="center">

# 👑 Miss & Mister Dour 2026

### Site officiel du concours Miss & Mister Dour

> Plateforme web complète pour la gestion et la présentation du concours Miss & Mister Dour — inscriptions, galerie des candidats, vote et actualités.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)
![DrizzleORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)

</div>

---

## ✨ Fonctionnalités

- 👑 **Galerie des candidats** — Présentation des candidates Miss & Mister Dour
- 📝 **Inscriptions en ligne** — Formulaire de candidature sécurisé
- 🗳️ **Système de vote** — Vote public pour les favoris
- 📰 **Actualités** — Suivi de l'événement en temps réel
- 🖼️ **Galerie photos** — Albums des événements passés
- 🔐 **Interface admin** — Gestion complète des candidats et votes
- 📱 **Design responsive** — Optimisé mobile & desktop

---

## 🛠️ Stack Technique

| Catégorie | Technologie |
|-----------|-------------|
| Frontend | Next.js, TypeScript, Radix UI |
| Backend | Node.js, Drizzle ORM |
| Base de données | MySQL (Railway) |
| Stockage fichiers | AWS S3 |
| Formulaires | React Hook Form, Zod |
| Déploiement | Railway |

---

## 🚀 Installation

```bash
# Cloner le projet
git clone https://github.com/Julien218/miss2026.git
cd miss2026

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir les valeurs dans .env

# Initialiser la base de données
npm run db:push

# Lancer en développement
npm run dev
```

---

## 🔧 Variables d'environnement

```env
DATABASE_URL=mysql://user:pass@host:PORT/miss2026
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=eu-west-1
AWS_BUCKET_NAME=your-bucket
JWT_SECRET=your-secret
NODE_ENV=production
```

---

## 📁 Arborescence

```
miss2026/
├── /app                # Pages Next.js (App Router)
│   ├── /api            # Routes API
│   ├── /candidats      # Galerie des candidats
│   ├── /vote           # Système de vote
│   └── /admin          # Interface administration
├── /components         # Composants UI réutilisables
├── /lib                # Utilitaires, auth, db
├── /db                 # Schéma Drizzle ORM
└── package.json
```

---

## 🔗 Liens utiles

- 🌐 [Olivier Trevis](https://www.oliviertrevis.be)
- 🚀 [Js-Innov.IA](https://www.jsinnovia.com)

---

## 👥 Crédits

Développé avec ❤️ par **Js-Innov.IA** pour **Miss & Mister Dour**

---

<div align="center">

🚀 **Js-Innov.IA** — Intelligence artificielle amplifiée par l'humain.

</div>
