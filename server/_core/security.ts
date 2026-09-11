import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";

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

/** Défense en profondeur pour les mutations exécutées depuis un navigateur. */
export function sameOriginMutationGuard(req: Request, res: Response, next: NextFunction) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
  if (!req.path.startsWith("/api/")) return next();
  // Les intégrations serveur-à-serveur disposent de leur propre authentification.
  if (req.path.startsWith("/api/integrations/")) return next();

  const origin = req.get("origin");
  const referer = req.get("referer");
  if (origin && !isAllowedBrowserOrigin(req, origin)) {
    return res.status(403).json({ error: "Origine de requête non autorisée." });
  }
  if (!origin && referer && !isAllowedBrowserOrigin(req, referer)) {
    return res.status(403).json({ error: "Origine de requête non autorisée." });
  }
  return next();
}

/** Headers de sécurité compatibles avec la PWA, R2 et Google Fonts. */
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

  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store");
  }
  next();
}

/** L'ancien endpoint tRPC d'inscription ne doit plus contourner la route 2027 sécurisée. */
export function blockLegacyPublicRegistration(req: Request, res: Response, next: NextFunction) {
  if (req.method === "POST" && req.path.includes("candidates.registerPublic")) {
    return res.status(410).json({
      error: "Cette ancienne route d'inscription est désactivée. Utilisez le formulaire officiel 2027.",
    });
  }
  next();
}

/** Limite dédiée aux compteurs de partage publics afin d'éviter leur manipulation. */
export const publicShareLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.path.includes("candidates.incrementShareCount"),
  message: { error: "Trop de partages enregistrés depuis cette connexion. Réessayez plus tard." },
});
