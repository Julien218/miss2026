import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { ogMetaMiddleware } from "./og-meta";
import { generateSitemap, generateRobotsTxt } from "../sitemap";
import { domainRedirectMiddleware } from "./domain-redirect";
import { generateCountdownImage } from "../routes/og-countdown";
import { profilePhotoUploadRoute } from "../routes/profilePhotoUpload";
import { apiLimiter } from "./rateLimit";
import { serveStatic, setupVite } from "./vite";
import { registerUser } from "./auth-password";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // 🔁 Redirection domaine
  app.use(domainRedirectMiddleware);

  // 📦 Body parser (upload fichiers)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // 🔐 OAuth
  registerOAuthRoutes(app);

  // 🖼️ Image countdown
  app.get("/api/countdown-image", generateCountdownImage);

  // 📸 Upload photo candidat
  app.post("/api/upload/profile-photo", ...(profilePhotoUploadRoute as [any, any]));

  // ============================================================
  // ⚠️  TEMPORARY ENDPOINT - DELETE AFTER USE
  // ------------------------------------------------------------
  // Cette route est temporaire pour la création initiale d'utilisateurs.
  // À supprimer une fois les comptes créés.
  //
  // Comptes à créer :
  //   - julien.pagin.pv@gmail.com  → super_admin
  //   - olivier.trevis@houtlook.be → admin
  // ============================================================
  app.post("/api/admin/create-user-temp", async (req, res) => {
    try {
      const { email, password, role, organizationId } = req.body as {
        email?: string;
        password?: string;
        role?: string;
        organizationId?: number;
      };

      if (!email || !password) {
        res.status(400).json({ error: "email et password sont requis" });
        return;
      }

      const allowedRoles = [
        "user", "candidate", "press", "photographer", "staff",
        "marketing", "organizer", "admin", "super_admin",
      ];
      if (role && !allowedRoles.includes(role)) {
        res.status(400).json({ error: `Rôle invalide. Valeurs acceptées: ${allowedRoles.join(", ")}` });
        return;
      }

      const user = await registerUser({
        email,
        password,
        role: (role as any) ?? "user",
        organizationId: organizationId ?? 1,
      });

      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        user,
      });
    } catch (error: any) {
      console.error("[create-user-temp] Erreur:", error);
      res.status(500).json({
        error: error?.message ?? "Erreur interne lors de la création de l'utilisateur",
      });
    }
  });
  // ============================================================
  // ⚠️  FIN TEMPORARY ENDPOINT
  // ============================================================

  // 📄 Sitemap
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const xml = await generateSitemap();
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      console.error("Sitemap error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // 🤖 Robots.txt
  app.get("/robots.txt", (req, res) => {
    const robotsTxt = generateRobotsTxt();
    res.header("Content-Type", "text/plain");
    res.send(robotsTxt);
  });

  // ⚡ API tRPC + rate limit
  app.use(
    "/api/trpc",
    apiLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // 🧠 OG meta SSR
  app.use(ogMetaMiddleware);

  // ⚙️ DEV vs PROD
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app); // ⚠️ dépend de vite.ts
  }

  // 🚀 PORT RAILWAY (IMPORTANT)
  const port = parseInt(process.env.PORT || "3000", 10);

  server.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${port}`);
  });
}

startServer().catch(console.error);
