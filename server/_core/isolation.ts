/**
 * Multi-Tenant Isolation Helpers
 * 
 * Garantit l'isolation stricte des données entre organisations
 * Tous les helpers vérifient que l'utilisateur appartient bien à une organisation
 * 
 * Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context";

/**
 * Récupère l'organizationId depuis le context
 * Lance une erreur UNAUTHORIZED si l'utilisateur n'est pas authentifié
 * Lance une erreur FORBIDDEN si l'utilisateur n'a pas d'organization
 */
export function getOrganizationId(ctx: TrpcContext): number {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Vous devez être connecté pour effectuer cette action",
    });
  }

  if (!ctx.organizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Votre compte n'est pas associé à une organisation",
    });
  }

  return ctx.organizationId;
}

/**
 * Vérifie que l'utilisateur a le rôle requis
 * Lance une erreur FORBIDDEN si le rôle ne correspond pas
 */
export function requireRole(ctx: TrpcContext, allowedRoles: string[]) {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Vous devez être connecté pour effectuer cette action",
    });
  }

  if (!allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Cette action nécessite l'un des rôles suivants: ${allowedRoles.join(", ")}`,
    });
  }
}

/**
 * Vérifie que l'utilisateur est owner ou admin de son organisation
 */
export function requireAdmin(ctx: TrpcContext) {
  requireRole(ctx, ["owner", "admin"]);
}

/**
 * Vérifie que l'utilisateur est owner de son organisation
 */
export function requireOwner(ctx: TrpcContext) {
  requireRole(ctx, ["owner"]);
}

/**
 * Log une action dans les audit logs
 * À implémenter avec la table audit_logs
 */
export async function logAuditAction(
  ctx: TrpcContext,
  action: string,
  entityType: string,
  entityId?: number,
  payload?: any
) {
  // TODO: Implémenter l'insertion dans audit_logs
  console.log("[AUDIT]", {
    organizationId: ctx.organizationId,
    userId: ctx.user?.id,
    action,
    entityType,
    entityId,
    payload,
    timestamp: new Date().toISOString(),
  });
}
