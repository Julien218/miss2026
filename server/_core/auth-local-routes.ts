import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { registerUser, verifyPasswordUser } from "./auth-password";
import { sdk } from "./sdk";

const ADMIN_EMAIL = "info@jsinnovia.store";

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const email = String(req.body?.email ?? "").toLowerCase().trim();
    const password = String(req.body?.password ?? "");
    const user = await verifyPasswordUser(email, password);

    if (!user) {
      res.status(401).json({ error: "Email ou mot de passe incorrect" });
      return;
    }

    const token = await sdk.createSessionToken(user.openId, {
      name: user.name || user.email || "Utilisateur",
      expiresInMs: ONE_YEAR_MS,
    });
    res.cookie(COOKIE_NAME, token, {
      ...getSessionCookieOptions(req),
      maxAge: ONE_YEAR_MS,
    });
    res.json({ success: true, role: user.role });
  });

  app.post("/api/auth/bootstrap-admin", async (req: Request, res: Response) => {
    const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
    const token = String(req.body?.token ?? "");
    const email = String(req.body?.email ?? "").toLowerCase().trim();
    const password = String(req.body?.password ?? "");

    if (!expectedToken || token.length < 32 || token !== expectedToken) {
      res.status(403).json({ error: "Lien d’activation invalide" });
      return;
    }
    if (email !== ADMIN_EMAIL) {
      res.status(403).json({ error: "Cette activation est réservée au propriétaire" });
      return;
    }
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      res.status(400).json({ error: "Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule et un chiffre" });
      return;
    }

    try {
      const created = await registerUser({
        email,
        password,
        role: "super_admin",
        organizationId: 1,
        name: "JS-Innov.IA",
      });
      const sessionToken = await sdk.createSessionToken(created.openId, {
        name: "JS-Innov.IA",
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, sessionToken, {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      });
      res.status(201).json({ success: true, role: "super_admin" });
    } catch (error) {
      const existing = await verifyPasswordUser(email, password);
      if (!existing) {
        res.status(409).json({ error: "Un compte existe déjà pour cette adresse. Utilisez la page de connexion." });
        return;
      }
      const sessionToken = await sdk.createSessionToken(existing.openId, {
        name: existing.name || "JS-Innov.IA",
        expiresInMs: ONE_YEAR_MS,
      });
      res.cookie(COOKIE_NAME, sessionToken, {
        ...getSessionCookieOptions(req),
        maxAge: ONE_YEAR_MS,
      });
      res.json({ success: true, role: existing.role });
    }
  });
}
