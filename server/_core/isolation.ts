/** Helpers d'isolation multi-tenant. */
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context";

export function getOrganizationId(ctx: TrpcContext): number {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Vous devez être connecté pour effectuer cette action" });
  if (!ctx.organizationId) throw new TRPCError({ code: "FORBIDDEN", message: "Votre compte n'est pas associé à une organisation" });
  return ctx.organizationId;
}

export function requireRole(ctx: TrpcContext, allowedRoles: string[]) {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Vous devez être connecté pour effectuer cette action" });
  if (!allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: `Cette action nécessite l'un des rôles suivants: ${allowedRoles.join(", ")}` });
  }
}

export function requireAdmin(ctx: TrpcContext) {
  requireRole(ctx, ["super_admin", "owner", "admin"]);
}

export function requireOwner(ctx: TrpcContext) {
  requireRole(ctx, ["super_admin", "owner"]);
}

export async function logAuditAction(
  ctx: TrpcContext,
  action: string,
  entityType: string,
  entityId?: number,
  payload?: unknown
) {
  // Ne jamais passer de mot de passe/token dans payload. Les appels actuels
  // utilisent uniquement des changements métier non sensibles.
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
