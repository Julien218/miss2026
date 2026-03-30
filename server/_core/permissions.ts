import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./trpc";

/**
 * Middleware pour vérifier que l'utilisateur est administrateur
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé aux administrateurs",
    });
  }
  return next({ ctx });
});

/**
 * Middleware pour vérifier que l'utilisateur est candidat
 */
export const candidateProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "candidate" && ctx.user.role !== "admin" && ctx.user.role !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé aux candidats",
    });
  }
  return next({ ctx });
});

/**
 * Middleware pour vérifier que l'utilisateur est membre du jury
 */
export const juryProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "jury" && ctx.user.role !== "admin" && ctx.user.role !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé au jury",
    });
  }
  return next({ ctx });
});

/**
 * Middleware pour vérifier que l'utilisateur est partenaire
 */
export const partnerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "partner" && ctx.user.role !== "admin" && ctx.user.role !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé aux partenaires",
    });
  }
  return next({ ctx });
});

/**
 * Permissions granulaires par action
 */
export const permissions = {
  // Gestion candidats
  "candidates.create": ["admin", "owner"],
  "candidates.update": ["admin", "owner", "candidate"],
  "candidates.delete": ["admin", "owner"],
  "candidates.validate": ["admin", "owner"],
  "candidates.view": ["admin", "owner", "jury", "candidate", "user"],
  
  // Gestion votes
  "votes.view": ["admin", "owner", "jury"],
  "votes.invalidate": ["admin", "owner"],
  "votes.export": ["admin", "owner"],
  
  // Gestion jury
  "jury.create": ["admin", "owner"],
  "jury.evaluate": ["admin", "owner", "jury"],
  "jury.viewEvaluations": ["admin", "owner", "jury"],
  
  // Gestion partenaires
  "partners.create": ["admin", "owner"],
  "partners.update": ["admin", "owner", "partner"],
  "partners.delete": ["admin", "owner"],
  "partners.view": ["admin", "owner", "partner"],
  
  // Gestion événements
  "events.create": ["admin", "owner"],
  "events.update": ["admin", "owner"],
  "events.delete": ["admin", "owner"],
  "events.view": ["admin", "owner", "jury", "candidate", "partner"],
  
  // Gestion contenu
  "articles.create": ["admin", "owner"],
  "articles.update": ["admin", "owner"],
  "articles.delete": ["admin", "owner"],
  "articles.publish": ["admin", "owner"],
  
  // Analytics
  "analytics.view": ["admin", "owner"],
  "analytics.export": ["admin", "owner"],
} as const;

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(userRole: string, permission: keyof typeof permissions): boolean {
  const allowedRoles = permissions[permission];
  return allowedRoles.includes(userRole as any);
}

/**
 * Middleware générique pour vérifier une permission
 */
export function requirePermission(permission: keyof typeof permissions) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!hasPermission(ctx.user.role, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permission requise: ${permission}`,
      });
    }
    return next({ ctx });
  });
}
