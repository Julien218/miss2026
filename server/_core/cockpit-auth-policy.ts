import type { Express, Request } from "express";

// Only the server bridge can set this marker, after verifying the delegation.
export const COCKPIT_VERIFIED = Symbol("cockpit-verified");
export type CockpitRequest = Request & { [COCKPIT_VERIFIED]?: true };
export const cockpitOnly = (env = process.env) => env.COCKPIT_ONLY_AUTH === "true";

export function cockpitLoginUrl(env = process.env) {
  const origin = new URL(env.COCKPIT_SSO_ORIGIN || "https://cockpit.jsinnovia.com").origin;
  if (!origin.startsWith("https://")) throw new Error("Cockpit login requires HTTPS");
  return `${origin}/mes-sites/miss-mister-dour`;
}

// Destinations are server-owned; neither a ticket nor a URL can supply a role.
export function spaceForRole(role: string): string | null {
  switch (role) {
    case "owner": case "super_admin": case "admin": return "/admin";
    case "organizer": case "marketing": case "staff": return "/choreographer";
    case "photographer": return "/photographer";
    case "press": case "partner": return "/press";
    case "candidate": return "/my-profile";
    case "user": return "/";
    // No dedicated jury space currently enforces a jury-only entry policy.
    default: return null;
  }
}

export function registerCockpitOnlyAuth(app: Express, env = process.env) {
  if (!cockpitOnly(env)) return;
  if (!/^[A-Za-z0-9_-]{43}$/.test(env.COCKPIT_SSO_SECRET || "")) {
    throw new Error("Cockpit-only authentication requires the SSO bridge");
  }
  const loginUrl = cockpitLoginUrl(env);
  app.get("/api/auth/config", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ cockpitOnly: true, loginUrl });
  });
  app.get(["/login", "/forgot-password", "/reset-password"], (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.redirect(303, loginUrl);
  });
  app.use("/api/auth", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(403).json({ error: "Connectez-vous avec votre compte Cockpit.", loginUrl });
  });
  app.use("/api/oauth", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(403).json({ error: "Connectez-vous avec votre compte Cockpit.", loginUrl });
  });
  app.use("/api/trpc", (req, res, next) => {
    // Includes batched tRPC requests. Old invitations must not create local passwords.
    let procedures: string[];
    try { procedures = decodeURIComponent(req.path).slice(1).split(","); }
    catch { res.sendStatus(400); return; }
    if (procedures.includes("invitations.createAccount")) {
      res.setHeader("Cache-Control", "no-store");
      res.status(403).json({ error: "Les nouveaux accès sont attribués dans le Cockpit.", loginUrl });
      return;
    }
    next();
  });
}
