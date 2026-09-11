import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { sdk } from "./sdk";

const CANONICAL_ORIGINS = new Set([
  "https://missetmisterdour.be",
  "https://www.missetmisterdour.be",
  "https://miss-mister-dour-web-production.up.railway.app",
]);

function requestOrigin(req: Request) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const proto = forwardedProto || req.protocol || "https";
  const forwardedHost = String(req.headers["x-forwarded-host"] || "").split(",")[0].trim();
  const host = forwardedHost || req.get("host") || "";
  return host ? `${proto}://${host}` : "";
}

function isAllowedBrowserOrigin(req: Request, value: string) {
  try {
    const origin = new URL(value).origin;
    return origin === requestOrigin(req) || CANONICAL_ORIGINS.has(origin);
  } catch {
    return false;
  }
}

export function sameOriginMutationGuard(req: Request, res: Response, next: NextFunction) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
  if (!req.path.startsWith("/api/")) return next();
  if (req.path.startsWith("/api/integrations/")) return next();

  const origin = req.get("origin");
  const referer = req.get("referer");
  if (origin && !isAllowedBrowserOrigin(req, origin)) return res.status(403).json({ error: "Origine de requête non autorisée." });
  if (!origin && referer && !isAllowedBrowserOrigin(req, referer)) return res.status(403).json({ error: "Origine de requête non autorisée." });
  return next();
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      "frame-ancestors 'self' https://missetmisterdour.be https://www.missetmisterdour.be",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self' https: wss:",
      process.env.NODE_ENV === "production" ? "upgrade-insecure-requests" : "",
    ].filter(Boolean).join("; ")
  );
  if (process.env.NODE_ENV === "production") res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  if (req.path.startsWith("/api/")) res.setHeader("Cache-Control", "no-store");
  next();
}

export function blockLegacyPublicRegistration(req: Request, res: Response, next: NextFunction) {
  if (req.method === "POST" && req.path.includes("candidates.registerPublic")) {
    return res.status(410).json({ error: "Cette ancienne route d'inscription est désactivée. Utilisez le formulaire officiel 2027." });
  }
  next();
}

/**
 * Défense en profondeur autour de procédures tRPC héritées du prototype.
 * Les vérifications métier dans les routers restent la première couche ; ce
 * middleware empêche qu'une procédure sensible mal déclarée `publicProcedure`
 * redevienne exploitable à l'avenir.
 */
export async function sensitiveTrpcGuard(req: Request, res: Response, next: NextFunction) {
  const url = decodeURIComponent(req.originalUrl || req.url || "");

  if (req.method === "POST" && url.includes("invitations.markUsed")) {
    return res.status(410).json({ error: "Cette ancienne action d'invitation est désactivée." });
  }

  const adminOnly = [
    "analytics.updateInfluenceIndex",
    "permissions.getEffective",
    "permissions.checkPermission",
  ];
  const contentTeam = [
    "photos.upload",
    "flowithos.createMission",
    "flowithos.getJob",
    "flowithos.getJobsByCandidate",
    "flowithos.getKnowledgeDocs",
    "elevenlabs.generateTTS",
    "elevenlabs.getVoices",
  ];

  const needsAdmin = adminOnly.some((name) => url.includes(name));
  const needsContentRole = contentTeam.some((name) => url.includes(name));
  if (!needsAdmin && !needsContentRole) return next();

  try {
    const user = await sdk.authenticateRequest(req);
    const adminRoles = new Set(["super_admin", "admin", "owner"]);
    const contentRoles = new Set(["super_admin", "admin", "owner", "organizer", "staff", "photographer", "photographe"]);
    if (needsAdmin && !adminRoles.has(user.role)) return res.status(403).json({ error: "Accès administrateur requis." });
    if (needsContentRole && !contentRoles.has(user.role)) return res.status(403).json({ error: "Accès équipe requis." });
    return next();
  } catch {
    return res.status(401).json({ error: "Authentification requise." });
  }
}

export const publicShareLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.path.includes("candidates.incrementShareCount"),
  message: { error: "Trop de partages enregistrés depuis cette connexion. Réessayez plus tard." },
});
