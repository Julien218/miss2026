import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { getAllPublishedArticles } from "../db";
import { serveStatic, setupVite } from "./vite";
import { ogMetaMiddleware } from "./og-meta";
import { generateSitemap, generateRobotsTxt } from "../sitemap";
import { domainRedirectMiddleware } from "./domain-redirect";
import { generateCountdownImage } from "../routes/og-countdown";
import { profilePhotoUploadRoute } from "../routes/profilePhotoUpload";
import { apiLimiter } from "./rateLimit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Redirection 301 pour forcer le domaine officiel https://missetmisterdour.be
  // Redirige automatiquement manus.space → missetmisterdour.be
  app.use(domainRedirectMiddleware);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Countdown image routes for social sharing (3 formats: standard, instagram, story)
  app.get("/api/countdown-image", generateCountdownImage);

  // Route upload photo de profil candidat (via token unique)
  app.post("/api/upload/profile-photo", ...(profilePhotoUploadRoute as [any, any]));

  // Sitemap.xml route - Utilise PUBLIC_BASE_URL pour le domaine officiel
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const xml = await generateSitemap();
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt route - Utilise PUBLIC_BASE_URL pour le domaine officiel
  app.get("/robots.txt", (req, res) => {
    const robotsTxt = generateRobotsTxt();
    res.header("Content-Type", "text/plain");
    res.send(robotsTxt);
  });
  // tRPC API avec rate limiting global
  app.use(
    "/api/trpc",
    apiLimiter, // 100 req/15min par IP
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // Middleware OG meta pour injection SSR (avant Vite/static)
  app.use(ogMetaMiddleware);
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
