import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./trpc";

function allow(role: string, allowed: string[]) {
  return allowed.includes(role);
}

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!allow(ctx.user.role, ["super_admin", "admin", "owner"])) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
  }
  return next({ ctx });
});

export const candidateProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!allow(ctx.user.role, ["candidate", "candidat", "super_admin", "admin", "owner"])) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux candidats" });
  }
  return next({ ctx });
});

export const juryProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!allow(ctx.user.role, ["jury", "staff", "organizer", "super_admin", "admin", "owner"])) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé au jury et à l’organisation" });
  }
  return next({ ctx });
});

export const partnerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!allow(ctx.user.role, ["partner", "marketing", "organizer", "super_admin", "admin", "owner"])) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux partenaires" });
  }
  return next({ ctx });
});

export const permissions = {
  "candidates.create": ["super_admin", "admin", "owner", "organizer"],
  "candidates.update": ["super_admin", "admin", "owner", "organizer", "staff", "candidate", "candidat"],
  "candidates.delete": ["super_admin", "admin", "owner"],
  "candidates.validate": ["super_admin", "admin", "owner", "organizer"],
  "candidates.view": ["super_admin", "admin", "owner", "organizer", "staff", "photographer", "photographe", "marketing", "press", "jury", "candidate", "candidat", "user"],
  "votes.view": ["super_admin", "admin", "owner", "organizer", "jury"],
  "votes.invalidate": ["super_admin", "admin", "owner"],
  "votes.export": ["super_admin", "admin", "owner"],
  "jury.create": ["super_admin", "admin", "owner", "organizer"],
  "jury.evaluate": ["super_admin", "admin", "owner", "organizer", "staff", "jury"],
  "jury.viewEvaluations": ["super_admin", "admin", "owner", "organizer", "staff", "jury"],
  "partners.create": ["super_admin", "admin", "owner", "organizer", "marketing"],
  "partners.update": ["super_admin", "admin", "owner", "organizer", "marketing", "partner"],
  "partners.delete": ["super_admin", "admin", "owner"],
  "partners.view": ["super_admin", "admin", "owner", "organizer", "marketing", "partner"],
  "events.create": ["super_admin", "admin", "owner", "organizer"],
  "events.update": ["super_admin", "admin", "owner", "organizer"],
  "events.delete": ["super_admin", "admin", "owner"],
  "events.view": ["super_admin", "admin", "owner", "organizer", "staff", "jury", "candidate", "candidat", "partner"],
  "articles.create": ["super_admin", "admin", "owner", "organizer", "marketing"],
  "articles.update": ["super_admin", "admin", "owner", "organizer", "marketing"],
  "articles.delete": ["super_admin", "admin", "owner"],
  "articles.publish": ["super_admin", "admin", "owner", "organizer", "marketing"],
  "analytics.view": ["super_admin", "admin", "owner", "organizer"],
  "analytics.export": ["super_admin", "admin", "owner"],
} as const;

export function hasPermission(userRole: string, permission: keyof typeof permissions): boolean {
  return (permissions[permission] as readonly string[]).includes(userRole);
}

export function requirePermission(permission: keyof typeof permissions) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!hasPermission(ctx.user.role, permission)) {
      throw new TRPCError({ code: "FORBIDDEN", message: `Permission requise: ${permission}` });
    }
    return next({ ctx });
  });
}
