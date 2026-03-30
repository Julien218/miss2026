/**
 * Hiérarchie des rôles pour Miss & Mister Dour
 * Ordre croissant de privilèges : USER (1) → SUPER_ADMIN (9)
 */

export const ROLE_HIERARCHY = {
  user: 1,           // Utilisateur basique
  candidate: 2,      // Candidat
  press: 3,          // Presse
  photographer: 4,   // Photographe
  staff: 5,          // Staff événement
  marketing: 6,      // Marketing
  organizer: 7,      // Organisateur
  admin: 8,          // Administrateur
  super_admin: 9,    // Super administrateur
  // Rôles legacy (à migrer)
  owner: 10,         // Propriétaire (équivalent super_admin)
  jury: 4,           // Jury (équivalent photographer)
  partner: 3,        // Partenaire (équivalent press)
} as const;

export type Role = keyof typeof ROLE_HIERARCHY;

/**
 * Vérifie si un rôle a au moins le niveau requis
 * @param userRole Rôle de l'utilisateur
 * @param requiredRole Rôle minimum requis
 * @returns true si l'utilisateur a le niveau requis ou supérieur
 */
export function hasRoleLevel(userRole: Role, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Retourne le niveau numérique d'un rôle
 */
export function getRoleLevel(role: Role): number {
  return ROLE_HIERARCHY[role] || 0;
}

/**
 * Vérifie si un rôle est admin ou supérieur
 */
export function isAdminOrAbove(role: Role): boolean {
  return hasRoleLevel(role, 'admin');
}

/**
 * Vérifie si un rôle est staff ou supérieur
 */
export function isStaffOrAbove(role: Role): boolean {
  return hasRoleLevel(role, 'staff');
}

/**
 * Vérifie si un rôle est candidat
 */
export function isCandidate(role: Role): boolean {
  return role === 'candidate';
}
