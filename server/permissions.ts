/**
 * Permissions fines Miss & Mister Dour.
 * Les rôles du schéma 2027 et les anciens alias sont maintenus ici afin
 * qu'un changement de nom de rôle ne retire pas silencieusement des droits.
 */
export enum Permission {
  CAN_MANAGE_USERS = "can_manage_users",
  CAN_MANAGE_INVITATIONS = "can_manage_invitations",
  CAN_VIEW_CANDIDATES = "can_view_candidates",
  CAN_CREATE_CANDIDATES = "can_create_candidates",
  CAN_EDIT_CANDIDATES = "can_edit_candidates",
  CAN_UPLOAD_MEDIA = "can_upload_media",
  CAN_VIEW_MEDIA = "can_view_media",
  CAN_DELETE_MEDIA = "can_delete_media",
  CAN_GENERATE_VIDEO = "can_generate_video",
  CAN_GENERATE_VOICE = "can_generate_voice",
  CAN_VIEW_JURY_AREA = "can_view_jury_area",
  CAN_SUBMIT_SCORES = "can_submit_scores",
  CAN_PUBLISH_CONTENT = "can_publish_content",
  CAN_VIEW_AUDIT_LOGS = "can_view_audit_logs",
}

const FULL_ADMIN: Permission[] = Object.values(Permission);

const ORGANIZER: Permission[] = [
  Permission.CAN_VIEW_CANDIDATES,
  Permission.CAN_CREATE_CANDIDATES,
  Permission.CAN_EDIT_CANDIDATES,
  Permission.CAN_UPLOAD_MEDIA,
  Permission.CAN_VIEW_MEDIA,
  Permission.CAN_DELETE_MEDIA,
  Permission.CAN_GENERATE_VIDEO,
  Permission.CAN_GENERATE_VOICE,
  Permission.CAN_VIEW_JURY_AREA,
  Permission.CAN_PUBLISH_CONTENT,
];

const STAFF: Permission[] = [
  Permission.CAN_VIEW_CANDIDATES,
  Permission.CAN_EDIT_CANDIDATES,
  Permission.CAN_UPLOAD_MEDIA,
  Permission.CAN_VIEW_MEDIA,
  Permission.CAN_VIEW_JURY_AREA,
];

const PHOTOGRAPHER: Permission[] = [
  Permission.CAN_VIEW_CANDIDATES,
  Permission.CAN_UPLOAD_MEDIA,
  Permission.CAN_VIEW_MEDIA,
];

const MARKETING: Permission[] = [
  Permission.CAN_VIEW_CANDIDATES,
  Permission.CAN_VIEW_MEDIA,
  Permission.CAN_PUBLISH_CONTENT,
];

const READ_ONLY: Permission[] = [
  Permission.CAN_VIEW_CANDIDATES,
  Permission.CAN_VIEW_MEDIA,
];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Rôles actuels du schéma.
  super_admin: FULL_ADMIN,
  admin: FULL_ADMIN,
  organizer: ORGANIZER,
  staff: STAFF,
  photographer: PHOTOGRAPHER,
  marketing: MARKETING,
  press: READ_ONLY,
  candidate: READ_ONLY,
  user: [Permission.CAN_VIEW_CANDIDATES],

  // Rôles encore présents dans d'anciennes données/invitations.
  owner: FULL_ADMIN,
  directeur: ORGANIZER,
  manager: STAFF,
  photographe: PHOTOGRAPHER,
  candidat: READ_ONLY,
  jury: [
    Permission.CAN_VIEW_CANDIDATES,
    Permission.CAN_VIEW_JURY_AREA,
    Permission.CAN_SUBMIT_SCORES,
  ],
  viewer: READ_ONLY,
  partner: READ_ONLY,
};

export interface PermissionOverrides {
  add?: Permission[];
  remove?: Permission[];
}

export function getRoleDefaultPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function getEffectivePermissions(
  role: string,
  overrides?: string | null
): Permission[] {
  const defaultPermissions = getRoleDefaultPermissions(role);
  if (!overrides) return [...defaultPermissions];

  let parsedOverrides: PermissionOverrides;
  try {
    const parsed = JSON.parse(overrides);
    // permissionOverrides contient aussi le hash des comptes locaux historiques.
    // Seules les propriétés add/remove participent au calcul des droits.
    parsedOverrides = {
      add: Array.isArray(parsed?.add) ? parsed.add : undefined,
      remove: Array.isArray(parsed?.remove) ? parsed.remove : undefined,
    };
  } catch (error) {
    console.error("Failed to parse permission overrides:", error);
    return [...defaultPermissions];
  }

  let effectivePermissions = [...defaultPermissions];
  for (const permission of parsedOverrides.add || []) {
    if (Object.values(Permission).includes(permission) && !effectivePermissions.includes(permission)) {
      effectivePermissions.push(permission);
    }
  }
  if (parsedOverrides.remove?.length) {
    effectivePermissions = effectivePermissions.filter(
      (permission) => !parsedOverrides.remove!.includes(permission)
    );
  }
  return effectivePermissions;
}

export function hasPermission(
  role: string,
  permission: Permission,
  overrides?: string | null
): boolean {
  return getEffectivePermissions(role, overrides).includes(permission);
}

export function hasAllPermissions(
  role: string,
  permissions: Permission[],
  overrides?: string | null
): boolean {
  const effective = getEffectivePermissions(role, overrides);
  return permissions.every((permission) => effective.includes(permission));
}

export function hasAnyPermission(
  role: string,
  permissions: Permission[],
  overrides?: string | null
): boolean {
  const effective = getEffectivePermissions(role, overrides);
  return permissions.some((permission) => effective.includes(permission));
}
