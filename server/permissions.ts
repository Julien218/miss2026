/**
 * Système de permissions fines pour Miss & Mister Dour
 * 
 * Architecture:
 * - Chaque rôle a des permissions par défaut
 * - Chaque utilisateur peut avoir des overrides (add/remove)
 * - permissions_effectives = permissions_role + overrides.add - overrides.remove
 */

// ========== ENUM PERMISSIONS ==========
export enum Permission {
  // Gestion utilisateurs
  CAN_MANAGE_USERS = "can_manage_users",
  CAN_MANAGE_INVITATIONS = "can_manage_invitations",
  
  // Gestion candidats
  CAN_VIEW_CANDIDATES = "can_view_candidates",
  CAN_CREATE_CANDIDATES = "can_create_candidates",
  CAN_EDIT_CANDIDATES = "can_edit_candidates",
  
  // Gestion médias
  CAN_UPLOAD_MEDIA = "can_upload_media",
  CAN_VIEW_MEDIA = "can_view_media",
  CAN_DELETE_MEDIA = "can_delete_media",
  
  // Génération IA
  CAN_GENERATE_VIDEO = "can_generate_video",
  CAN_GENERATE_VOICE = "can_generate_voice",
  
  // Jury
  CAN_VIEW_JURY_AREA = "can_view_jury_area",
  CAN_SUBMIT_SCORES = "can_submit_scores",
  
  // Publication
  CAN_PUBLISH_CONTENT = "can_publish_content",
  
  // Admin global
  CAN_VIEW_AUDIT_LOGS = "can_view_audit_logs",
}

// ========== MAPPING RÔLES → PERMISSIONS PAR DÉFAUT ==========
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Super admin: toutes les permissions
  admin: [
    Permission.CAN_MANAGE_USERS,
    Permission.CAN_MANAGE_INVITATIONS,
    Permission.CAN_VIEW_CANDIDATES,
    Permission.CAN_CREATE_CANDIDATES,
    Permission.CAN_EDIT_CANDIDATES,
    Permission.CAN_UPLOAD_MEDIA,
    Permission.CAN_VIEW_MEDIA,
    Permission.CAN_DELETE_MEDIA,
    Permission.CAN_GENERATE_VIDEO,
    Permission.CAN_GENERATE_VOICE,
    Permission.CAN_VIEW_JURY_AREA,
    Permission.CAN_SUBMIT_SCORES,
    Permission.CAN_PUBLISH_CONTENT,
    Permission.CAN_VIEW_AUDIT_LOGS,
  ],
  
  // Owner: toutes les permissions (alias admin)
  owner: [
    Permission.CAN_MANAGE_USERS,
    Permission.CAN_MANAGE_INVITATIONS,
    Permission.CAN_VIEW_CANDIDATES,
    Permission.CAN_CREATE_CANDIDATES,
    Permission.CAN_EDIT_CANDIDATES,
    Permission.CAN_UPLOAD_MEDIA,
    Permission.CAN_VIEW_MEDIA,
    Permission.CAN_DELETE_MEDIA,
    Permission.CAN_GENERATE_VIDEO,
    Permission.CAN_GENERATE_VOICE,
    Permission.CAN_VIEW_JURY_AREA,
    Permission.CAN_SUBMIT_SCORES,
    Permission.CAN_PUBLISH_CONTENT,
    Permission.CAN_VIEW_AUDIT_LOGS,
  ],
  
  // Directeur: gestion complète sauf admin système
  directeur: [
    Permission.CAN_VIEW_CANDIDATES,
    Permission.CAN_CREATE_CANDIDATES,
    Permission.CAN_EDIT_CANDIDATES,
    Permission.CAN_UPLOAD_MEDIA,
    Permission.CAN_VIEW_MEDIA,
    Permission.CAN_DELETE_MEDIA,
    Permission.CAN_GENERATE_VIDEO,
    Permission.CAN_GENERATE_VOICE,
    Permission.CAN_PUBLISH_CONTENT,
  ],
  
  // Manager: gestion candidats + médias
  manager: [
    Permission.CAN_VIEW_CANDIDATES,
    Permission.CAN_EDIT_CANDIDATES,
    Permission.CAN_UPLOAD_MEDIA,
    Permission.CAN_VIEW_MEDIA,
    Permission.CAN_GENERATE_VIDEO,
    Permission.CAN_GENERATE_VOICE,
  ],
  
  // Photographe: upload médias uniquement
  photographe: [
    Permission.CAN_VIEW_CANDIDATES,
    Permission.CAN_UPLOAD_MEDIA,
    Permission.CAN_VIEW_MEDIA,
  ],
  
  // Candidat: voir son profil uniquement
  candidat: [
    Permission.CAN_VIEW_CANDIDATES, // Limité à son propre profil (logique métier)
    Permission.CAN_VIEW_MEDIA, // Limité à ses propres médias
  ],
  
  // Candidate (alias candidat)
  candidate: [
    Permission.CAN_VIEW_CANDIDATES,
    Permission.CAN_VIEW_MEDIA,
  ],
  
  // Jury: évaluation uniquement
  jury: [
    Permission.CAN_VIEW_CANDIDATES,
    Permission.CAN_VIEW_JURY_AREA,
    Permission.CAN_SUBMIT_SCORES,
  ],
  
  // Viewer: lecture seule
  viewer: [
    Permission.CAN_VIEW_CANDIDATES,
    Permission.CAN_VIEW_MEDIA,
  ],
  
  // User: permissions minimales
  user: [
    Permission.CAN_VIEW_CANDIDATES,
  ],
  
  // Partner: partenaire commercial
  partner: [
    Permission.CAN_VIEW_CANDIDATES,
    Permission.CAN_VIEW_MEDIA,
  ],
};

// ========== TYPES ==========
export interface PermissionOverrides {
  add?: Permission[];
  remove?: Permission[];
}

// ========== FONCTIONS UTILITAIRES ==========

/**
 * Récupère les permissions par défaut d'un rôle
 */
export function getRoleDefaultPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Calcule les permissions effectives d'un utilisateur
 * @param role Rôle de l'utilisateur
 * @param overrides Overrides JSON (add/remove)
 * @returns Liste des permissions effectives
 */
export function getEffectivePermissions(
  role: string,
  overrides?: string | null
): Permission[] {
  // 1. Récupérer permissions par défaut du rôle
  const defaultPermissions = getRoleDefaultPermissions(role);
  
  // 2. Si pas d'overrides, retourner permissions par défaut
  if (!overrides) {
    return defaultPermissions;
  }
  
  // 3. Parser overrides JSON
  let parsedOverrides: PermissionOverrides;
  try {
    parsedOverrides = JSON.parse(overrides);
  } catch (error) {
    console.error("Failed to parse permission overrides:", error);
    return defaultPermissions;
  }
  
  // 4. Appliquer overrides
  let effectivePermissions = [...defaultPermissions];
  
  // Ajouter permissions (add)
  if (parsedOverrides.add && Array.isArray(parsedOverrides.add)) {
    for (const permission of parsedOverrides.add) {
      if (!effectivePermissions.includes(permission)) {
        effectivePermissions.push(permission);
      }
    }
  }
  
  // Retirer permissions (remove)
  if (parsedOverrides.remove && Array.isArray(parsedOverrides.remove)) {
    effectivePermissions = effectivePermissions.filter(
      (p) => !parsedOverrides.remove!.includes(p)
    );
  }
  
  return effectivePermissions;
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(
  role: string,
  permission: Permission,
  overrides?: string | null
): boolean {
  const effectivePermissions = getEffectivePermissions(role, overrides);
  return effectivePermissions.includes(permission);
}

/**
 * Vérifie si un utilisateur a toutes les permissions spécifiées
 */
export function hasAllPermissions(
  role: string,
  permissions: Permission[],
  overrides?: string | null
): boolean {
  const effectivePermissions = getEffectivePermissions(role, overrides);
  return permissions.every((p) => effectivePermissions.includes(p));
}

/**
 * Vérifie si un utilisateur a au moins une des permissions spécifiées
 */
export function hasAnyPermission(
  role: string,
  permissions: Permission[],
  overrides?: string | null
): boolean {
  const effectivePermissions = getEffectivePermissions(role, overrides);
  return permissions.some((p) => effectivePermissions.includes(p));
}
