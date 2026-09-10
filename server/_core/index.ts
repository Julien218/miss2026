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
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Railway termine HTTP(S) derrière un reverse proxy.
  app.set("trust proxy", 1);

  // Domaine canonique.
  app.use(domainRedirectMiddleware);

  // Les anciennes expériences 2026 ne doivent plus concurrencer l'édition 2027
  // dans les moteurs ni dans les anciens favoris/liens partagés.
  app.get("/intro", (_req, res) => res.redirect(301, "/"));
  app.get("/miss-mister-dour-2026", (_req, res) => res.redirect(301, "/about"));
  app.get("/miss-mister", (_req, res) => res.redirect(301, "/candidates"));
  app.get("/video-factory", (_req, res) => res.redirect(302, "/login?returnTo=/admin/video-generator"));

  // Body parser : le formulaire candidat transporte une photo en data URL, limitée à 5 Mo côté route.
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Auth locale — chemin canonique pour les espaces protégés.
  registerLocalAuthRoutes(app);

  // OAuth externe conservé uniquement si un vrai serveur OAuth est configuré.
  if (process.env.OAUTH_SERVER_URL) registerOAuthRoutes(app);

  // Formulaires publics -> MySQL/R2/cockpit.
  registerPublicFormRoutes(app);

  // Boîte de réception admin des candidatures.
  registerCandidateApplicationAdminRoutes(app);

  // Image countdown legacy encore utilisée par certains partages internes.
  app.get("/api/countdown-image", generateCountdownImage);

  // Upload photo candidat authentifié.
  app.post("/api/upload/profile-photo", ...(profilePhotoUploadRoute as [any, any]));

  // Sitemap dynamique.
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

  // Robots dynamique.
  app.get("/robots.txt", (_req, res) => {
    res.header("Content-Type", "text/plain; charset=utf-8");
    res.send(generateRobotsTxt());
  });

  // API tRPC + rate limit global.
  app.use(
    "/api/trpc",
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
