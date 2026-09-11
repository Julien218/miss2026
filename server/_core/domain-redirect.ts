import type { Request, Response, NextFunction } from "express";
import { getPublicBaseUrl } from "../url-helpers";

function hostname(value: string) {
  return value.toLowerCase().split(":")[0];
}

export function domainRedirectMiddleware(req: Request, res: Response, next: NextFunction) {
  const host = hostname(req.get("host") || "");
  const official = new URL(getPublicBaseUrl()).hostname.toLowerCase();
  const isLocalhost = host === "localhost" || host === "127.0.0.1" || host === "::1";
  if (isLocalhost || !host) return next();

  // Ne jamais rediriger les API : les redirections cross-origin peuvent supprimer
  // Authorization et casser les webhooks/intégrations serveur-à-serveur.
  if (req.path.startsWith("/api/")) {
    if (host !== official) res.setHeader("X-Robots-Tag", "noindex, nofollow");
    return next();
  }

  const shouldCanonicalize =
    host !== official &&
    (host === `www.${official}` ||
      host.endsWith(".up.railway.app") ||
      host.endsWith(".manus.space") ||
      host.endsWith(".manus.computer"));

  if (shouldCanonicalize) {
    return res.redirect(301, `${getPublicBaseUrl()}${req.originalUrl}`);
  }

  if (host !== official) res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return next();
}

export function addNoindexForNonOfficialDomains(req: Request, res: Response, next: NextFunction) {
  const host = hostname(req.get("host") || "");
  const official = new URL(getPublicBaseUrl()).hostname.toLowerCase();
  if (host && host !== official && host !== "localhost" && host !== "127.0.0.1") {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.locals.noindex = true;
  }
  next();
}
