# Audit Système Invitations + Permissions

## ✅ CE QUI EXISTE DÉJÀ

### Table `invitations` (10 champs)
```sql
- id (PK, autoincrement)
- role (enum: admin, directeur, manager, photographe, candidat, viewer)
- email (varchar 255, nullable)
- token (varchar 64, unique, not null)
- expiresAt (timestamp, nullable)
- maxUses (int, default 1)
- usedCount (int, default 0)
- isActive (int, default 1)
- createdBy (int, not null)
- createdAt (timestamp, defaultNow)
```

### Table `users` (champs role)
```sql
- role (enum: user, admin, owner, jury, candidate, partner)
```

### Routes tRPC existantes
- `invitations.create` - Créer invitation
- `invitations.list` - Lister invitations
- `invitations.validateToken` - Valider token
- `invitations.acceptInvitation` - Accepter invitation
- `invitations.deactivate` - Désactiver invitation
- `invitations.getActiveInvitations` - Lister actives

### UI existante
- Page `/admin/invitations` (AdminInvitations.tsx)
- Formulaire création invitation (rôle, email, expiration, maxUses)
- Liste invitations avec badges statut
- Bouton copier lien
- Bouton désactiver

## ❌ CE QUI MANQUE

### Schéma
- [ ] `permissionOverrides` JSON dans `invitations`
- [ ] `permissionOverrides` JSON dans `users`
- [ ] Table `role_permissions` (mapping rôle → permissions par défaut)
- [ ] Enum 14 permissions minimales
- [ ] Table `audit_logs` (append-only)

### Logique Backend
- [ ] Fonction `getRoleDefaultPermissions(role)`
- [ ] Fonction `getEffectivePermissions(role, overrides)`
- [ ] Route `users.updatePermissions` (admin only)
- [ ] Route `users.getEffectivePermissions`
- [ ] Route `users.list` (admin only)
- [ ] Logs audit pour toutes actions critiques

### UI
- [ ] Page `/admin/users` (AdminUsers.tsx)
- [ ] Bloc "Autorisations" dans AdminInvitations (checkbox permissions)
- [ ] Modal détails utilisateur (rôle + overrides)
- [ ] Checkbox permissions avec état (default, added, removed)

### Sécurité
- [ ] Rate limiting sur endpoints sensibles
- [ ] Validation email obligatoire dans invitations
- [ ] Logs audit append-only

## 🔧 ACTIONS À FAIRE

### 1. Extension Schéma
- Ajouter `permissionOverrides` TEXT (JSON) dans `invitations`
- Ajouter `permissionOverrides` TEXT (JSON) dans `users`
- Créer table `role_permissions` avec mapping rôle → permissions
- Créer table `audit_logs` (id, action, userId, details, timestamp)

### 2. Implémentation Permissions
- Créer fichier `server/permissions.ts` avec:
  - Enum 14 permissions
  - Fonction `getRoleDefaultPermissions(role)`
  - Fonction `getEffectivePermissions(role, overrides)`
- Mettre à jour routes invitations pour gérer overrides
- Créer routes users (list, updatePermissions, getEffectivePermissions)

### 3. UI Admin
- Créer page AdminUsers.tsx
- Améliorer AdminInvitations.tsx avec bloc autorisations
- Ajouter modal détails utilisateur

### 4. Logs Audit
- Créer fonctions `createAuditLog`, `getAuditLogs`
- Logger toutes actions critiques (création, utilisation, révocation, modification permissions)

### 5. Tests
- Tester token expiré
- Tester token déjà utilisé
- Tester multi-usage
- Tester révocation
- Tester permissions effectives
