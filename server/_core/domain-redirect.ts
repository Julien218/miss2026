/**
 * Middleware pour rediriger automatiquement l'ancien domaine manus.space
 * vers le domaine officiel https://missetmisterdour.be
 * 
 * Redirection 301 (permanente) pour SEO
 */

import { Request, Response, NextFunction } from "express";
import { getPublicBaseUrl } from "../url-helpers";

/**
 * Middleware de redirection 301 pour forcer le domaine officiel
 * 
 * Si le site est accessible sur manus.space ou manus.computer,
 * redirige automatiquement vers missetmisterdour.be
 */
export function domainRedirectMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const host = req.get("host") || "";
  const officialDomain = getPublicBaseUrl().replace(/^https?:\/\//, "");
  
  // Vérifier si on est sur un domaine non-officiel
  const isManusSpace = host.includes("manus.space");
  const isManusComputer = host.includes("manus.computer");
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  
  // Si on est sur manus.space ou manus.computer (mais pas localhost pour le dev)
  if ((isManusSpace || isManusComputer) && !isLocalhost) {
    // Construire l'URL de redirection vers le domaine officiel
    const officialUrl = `https://${officialDomain}${req.originalUrl}`;
    
    // Log pour debugging
    console.log(`[Domain Redirect] ${host}${req.originalUrl} → ${officialUrl}`);
    
    // Redirection 301 (permanente)
    return res.redirect(301, officialUrl);
  }
  
  // Continuer normalement si on est déjà sur le bon domaine
  next();
}

/**
 * Alternative: Ajouter meta noindex sur les domaines non-officiels
 * Empêche l'indexation sans rediriger
 */
export function addNoindexForNonOfficialDomains(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const host = req.get("host") || "";
  const officialDomain = getPublicBaseUrl().replace(/^https?:\/\//, "");
  
  const isManusSpace = host.includes("manus.space");
  const isManusComputer = host.includes("manus.computer");
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  
  // Si on est sur un domaine non-officiel (mais pas localhost)
  if ((isManusSpace || isManusComputer) && !isLocalhost) {
    // Stocker dans res.locals pour injection dans le HTML
    res.locals.noindex = true;
  }
  
  next();
}
