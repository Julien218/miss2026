import type { Express, Request, Response } from "express";
import { sdk } from "../_core/sdk";
import * as db from "../db";

function canManageApplications(role: string | null | undefined) {
  return role === "admin" || role === "super_admin" || role === "owner" || role === "organizer";
}

async function requireAdmin(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!canManageApplications(user.role)) {
      res.status(403).json({ error: "Accès administrateur requis" });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: "Authentification requise" });
    return null;
  }
}

export function registerCandidateApplicationAdminRoutes(app: Express) {
  app.get("/api/admin/candidate-applications", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    try {
      const contestIdRaw = typeof req.query.contestId === "string" ? Number(req.query.contestId) : undefined;
      const contestId = contestIdRaw && Number.isFinite(contestIdRaw) ? contestIdRaw : undefined;
      const applications = await db.getAllCandidateApplications(contestId);
      res.json({ applications });
    } catch (error) {
      console.error("[CandidateApplications] list failed", error);
      res.status(500).json({ error: "Impossible de charger les candidatures" });
    }
  });

  app.post("/api/admin/candidate-applications/:id/approve", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Identifiant de candidature invalide" });
    }

    try {
      const result = await db.approveCandidateApplication(id, user.id);
      res.json(result);
    } catch (error) {
      console.error("[CandidateApplications] approve failed", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Validation impossible" });
    }
  });

  app.post("/api/admin/candidate-applications/:id/reject", async (req, res) => {
    const user = await requireAdmin(req, res);
    if (!user) return;

    const id = Number(req.params.id);
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Identifiant de candidature invalide" });
    }
    if (!reason || reason.length > 1000) {
      return res.status(400).json({ error: "Un motif de refus est requis (1000 caractères maximum)" });
    }

    try {
      const result = await db.rejectCandidateApplication(id, user.id, reason);
      res.json(result);
    } catch (error) {
      console.error("[CandidateApplications] reject failed", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Refus impossible" });
    }
  });
}
