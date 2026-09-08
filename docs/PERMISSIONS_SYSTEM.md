# Système de Permissions - Miss & Mister Dour 2026

## 📋 Vue d'ensemble

Système de permissions fines avec **7 rôles** et **14 permissions granulaires**, permettant une gestion flexible des accès via des **overrides par utilisateur**.

---

## 🎭 Rôles disponibles

| Rôle | Description | Permissions par défaut |
|------|-------------|------------------------|
| **admin** | Super administrateur | Toutes les 14 permissions |
| **owner** | Propriétaire (alias admin) | Toutes les 14 permissions |
| **directeur** | Directeur de production | 9 permissions (gestion complète sauf admin système) |
| **manager** | Manager de candidats | 6 permissions (candidats + médias + IA) |
| **photographe** | Photographe officiel | 3 permissions (upload médias uniquement) |
| **candidat** | Candidat au concours | 2 permissions (voir son profil) |
| **jury** | Membre du jury | 3 permissions (évaluation uniquement) |
| **viewer** | Spectateur | 2 permissions (lecture seule) |

---

## 🔑 14 Permissions granulaires

### Admin (2 permissions)
- `can_manage_users` : Gérer les utilisateurs
- `can_manage_invitations` : Gérer les invitations
- `can_view_audit_logs` : Voir les logs audit

### Candidats (3 permissions)
- `can_view_candidates` : Voir les candidats
- `can_create_candidates` : Créer des candidats
- `can_edit_candidates` : Modifier les candidats

### Médias (3 permissions)
- `can_upload_media` : Upload médias
- `can_view_media` : Voir les médias
- `can_delete_media` : Supprimer médias

### IA (2 permissions)
- `can_generate_video` : Générer vidéos IA (FlowithOS)
- `can_generate_voice` : Générer voix IA (ElevenLabs)

### Jury (2 permissions)
- `can_view_jury_area` : Accès espace jury
- `can_submit_scores` : Soumettre scores

### Publication (1 permission)
- `can_publish_content` : Publier du contenu

---

## 🔧 Overrides par utilisateur

Chaque utilisateur peut avoir des **permission_overrides** (JSON) pour personnaliser ses accès :

```json
{
  "add": ["can_delete_media", "can_generate_video"],
  "remove": ["can_edit_candidates"]
}
```

### Exemples d'usage

#### Photographe avec permission delete
```json
{
  "add": ["can_delete_media"]
}
```
→ Permissions effectives : `can_view_candidates`, `can_upload_media`, `can_view_media`, **`can_delete_media`**

#### Manager sans permission edit
```json
{
  "remove": ["can_edit_candidates"]
}
```
→ Permissions effectives : `can_view_candidates`, ~~`can_edit_candidates`~~, `can_upload_media`, ...

---

## 🗄️ Schéma de base de données

### Table `users`
```sql
ALTER TABLE users ADD COLUMN permissionOverrides TEXT;
```

### Table `invitations`
```sql
ALTER TABLE invitations ADD COLUMN permission_overrides TEXT;
ALTER TABLE invitations MODIFY email VARCHAR(255) NOT NULL;
```

---

## 🛣️ Routes tRPC

### `permissions.getEffective`
Récupère les permissions effectives d'un utilisateur (rôle + overrides).

```typescript
const { data } = trpc.permissions.getEffective.useQuery({ userId: 123 });
// Retour :
// {
//   userId: 123,
//   role: "photographe",
//   permissions: ["can_view_candidates", "can_upload_media", "can_view_media", "can_delete_media"],
//   overrides: { add: ["can_delete_media"], remove: [] }
// }
```

### `permissions.updateUserOverrides`
Modifie les overrides d'un utilisateur (admin only).

```typescript
await trpc.permissions.updateUserOverrides.mutate({
  userId: 123,
  overrides: {
    add: ["can_delete_media"],
    remove: ["can_edit_candidates"]
  }
});
```

### `permissions.checkPermission`
Vérifie si un utilisateur a une permission spécifique.

```typescript
const { data } = trpc.permissions.checkPermission.useQuery({
  permission: "can_delete_media",
  userId: 123
});
// Retour : { allowed: true }
```

### `admin.getAllUsers`
Liste tous les utilisateurs (admin only).

```typescript
const { data: users } = trpc.admin.getAllUsers.useQuery();
```

---

## 🎨 UI Admin

### Page `/admin/users`
Interface de gestion des utilisateurs et permissions :

1. **Liste des utilisateurs**
   - Nom, email, rôle
   - Bouton "Permissions" pour chaque utilisateur

2. **Modal d'édition**
   - Rôle actuel
   - Permissions par défaut du rôle (badges verts)
   - Overrides actuels (add/remove)
   - Checkboxes pour modifier les overrides par catégorie
   - Boutons Annuler/Enregistrer

### Page `/admin/invitations`
Création d'invitations avec overrides optionnels :

```typescript
await trpc.invitations.create.mutate({
  role: "photographe",
  email: "photo@example.com",
  expiresIn: "7d",
  maxUses: 1,
  permissionOverrides: JSON.stringify({
    add: ["can_delete_media"]
  })
});
```

---

## 🧪 Tests vitest

**21 tests passent ✅** (voir `server/permissions.test.ts`)

### Couverture
- ✅ Permissions par défaut pour chaque rôle
- ✅ Ajout de permissions via overrides
- ✅ Retrait de permissions via overrides
- ✅ Gestion simultanée add/remove
- ✅ Pas de duplication lors de l'ajout
- ✅ Gestion des JSON invalides
- ✅ Scénarios réels (photographe, manager, jury)

---

## 📦 Fichiers clés

| Fichier | Description |
|---------|-------------|
| `server/permissions.ts` | Enum permissions, mapping rôles, fonctions de calcul |
| `server/routers.ts` | Routes tRPC `permissions.*` |
| `server/db.ts` | Fonctions `getUserById`, `updateUserPermissionOverrides`, `getAllUsers` |
| `drizzle/schema.ts` | Schéma `users` et `invitations` avec `permissionOverrides` |
| `client/src/pages/AdminUsers.tsx` | UI admin de gestion des permissions |
| `server/permissions.test.ts` | Tests vitest (21 tests) |

---

## 🔒 Sécurité

1. **Email obligatoire** : Toutes les invitations requièrent un email valide
2. **Admin only** : Modification des permissions réservée aux admins
3. **Validation côté serveur** : Vérification des permissions dans `protectedProcedure`
4. **Logs audit** : Toutes les modifications sont tracées (table `audit_logs` existante)

---

## 🚀 Utilisation

### Vérifier une permission dans le code serveur

```typescript
import { hasPermission, Permission } from "./permissions";

const user = await db.getUserById(userId);
if (hasPermission(user.role, Permission.CAN_DELETE_MEDIA, user.permissionOverrides)) {
  // Autoriser la suppression
}
```

### Vérifier une permission dans le frontend

```typescript
const { data } = trpc.permissions.checkPermission.useQuery({
  permission: "can_delete_media"
});

if (data?.allowed) {
  // Afficher le bouton "Supprimer"
}
```

---

## 📝 TODO futur

- [ ] Créer la page `/invite/:token` pour accepter les invitations
- [ ] Ajouter un viewer de logs audit dans `/admin/audit-logs`
- [ ] Implémenter la limitation de permissions par candidat (un candidat ne voit que son profil)
- [ ] Ajouter des notifications lors des modifications de permissions
- [ ] Créer un système de rôles personnalisés (au-delà des 7 rôles prédéfinis)

---

**Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique**  
**© Tous droits réservés - Copie strictement interdite**
