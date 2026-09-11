import type { Express, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { verifyPasswordUser } from "./auth-password";
import { sdk } from "./sdk";

const LOCAL_SESSION_MS = 1000 * 60 * 60 * 24 * 30; // 30 jours

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Trop de tentatives de connexion. Réessayez dans quelques minutes." },
});

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/auth/login", loginLimiter, async (req: Request, res: Response) => {
    try {
      const email = String(req.body?.email ?? "").toLowerCase().trim();
      const password = String(req.body?.password ?? "");

      if (!email || !password || email.length > 320 || password.length > 512) {
        res.status(400).json({ error: "Adresse email et mot de passe requis." });
        return;
      }

      const user = await verifyPasswordUser(email, password);
      if (!user) {
        // Message volontairement générique : ne jamais révéler l'existence d'un compte.
        res.status(401).json({ error: "Email ou mot de passe incorrect." });
        return;
      }

      const token = await sdk.createSessionToken(user.openId, {
        name: user.name || user.email || "Utilisateur",
        expiresInMs: LOCAL_SESSION_MS,
      });

      res.cookie(COOKIE_NAME, token, {
        ...getSessionCookieOptions(req),
        maxAge: LOCAL_SESSION_MS,
      });

      res.json({ success: true, role: user.role });
    } catch (error) {
      console.error("[Auth] Local login failed:", error);
      res.status(500).json({ error: "Connexion momentanément indisponible." });
    }
  });
}
