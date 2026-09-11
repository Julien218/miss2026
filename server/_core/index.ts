import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerLocalAuthRoutes } from "./auth-local-routes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { ogMetaMiddleware } from "./og-meta";
import { generateSitemap, generateRobotsTxt } from "../sitemap";
import { domainRedirectMiddleware } from "./domain-redirect";
import { generateCountdownImage } from "../routes/og-countdown";
import { profilePhotoUploadRoute } from "../routes/profilePhotoUpload";
import { registerCandidateApplicationAdminRoutes } from "../routes/candidateApplicationsAdmin";
import { registerPublicFormRoutes } from "../routes/publicForms";
import { apiLimiter } from "./rateLimit";
import {
  securityHeaders,
  sameOriginMutationGuard,
  blockLegacyPublicRegistration,
  publicShareLimiter,
} from "./security";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Railway termine HTTPS derrière un reverse proxy de confiance.
  app.set("trust proxy", 1);

  // Sécurité HTTP commune à toutes les réponses et défense CSRF en profondeur.
  app.use(securityHeaders);
  app.use(sameOriginMutationGuard);

  // Domaine canonique.
  app.use(domainRedirectMiddleware);

  // Les anciennes expériences 2026 ne doivent plus concurrencer l'édition 2027.
  app.get("/intro", (_req, res) => res.redirect(301, "/"));
  app.get("/miss-mister-dour-2026", (_req, res) => res.redirect(301, "/about"));
  app.get("/miss-mister", (_req, res) => res.redirect(301, "/candidates"));
  app.get("/video-factory", (_req, res) => res.redirect(302, "/login?returnTo=/admin/video-generator"));

  // Le formulaire candidat transporte temporairement une photo encodée ; la route
  // applique ensuite sa propre limite stricte de 5 Mo sur l'image décodée.
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Auth locale — chemin canonique pour les espaces protégés.
  registerLocalAuthRoutes(app);

  // OAuth externe seulement si un fournisseur valide est explicitement configuré.
  if (process.env.OAUTH_SERVER_URL) registerOAuthRoutes(app);

  // Formulaires publics -> MySQL/R2/cockpit.
  registerPublicFormRoutes(app);

  // Boîte de réception admin des candidatures.
  registerCandidateApplicationAdminRoutes(app);

  // Image countdown legacy encore utilisée par certains partages internes.
  app.get("/api/countdown-image", generateCountdownImage);

  // Upload photo candidat par lien/token contrôlé.
  app.post("/api/upload/profile-photo", ...(profilePhotoUploadRoute as [any, ...any[]]));

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const xml = await generateSitemap();
      res.header("Content-Type", "application/xml; charset=utf-8");
      res.header("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (error) {
      console.error("Sitemap error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", (_req, res) => {
    res.header("Content-Type", "text/plain; charset=utf-8");
    res.send(generateRobotsTxt());
  });

  // API tRPC : ancienne inscription bloquée, compteur de partage limité,
  // puis protection globale anti-abus.
  app.use(
    "/api/trpc",
    blockLegacyPublicRegistration,
    publicShareLimiter,
    apiLimiter,
    createExpressMiddleware({ router: appRouter, createContext })
  );

  // OG meta SSR.
  app.use(ogMetaMiddleware);

  if (process.env.NODE_ENV === "development") await setupVite(app, server);
  else serveStatic(app);

  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, "0.0.0.0", () => console.log(`✅ Server running on port ${port}`));
}

startServer().catch(console.error);
