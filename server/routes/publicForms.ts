import crypto from "node:crypto";
import type { Express, Request } from "express";
import rateLimit from "express-rate-limit";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { candidateApplications, contests } from "../../drizzle/schema";
import * as db from "../db";
import { storagePut } from "../storage";

const candidateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de candidatures envoyées depuis cette connexion. Réessayez dans une heure." },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de messages envoyés. Réessayez dans une heure." },
});

const candidateSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(8).max(50),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().trim().min(2).max(100),
  category: z.enum(["miss", "mister"]),
  photoBase64: z.string().min(32),
  photoFilename: z.string().trim().min(1).max(255),
  bio: z.string().trim().min(100).max(500),
  motivation: z.string().trim().min(50).max(2500),
  interests: z.array(z.string().trim().max(100)).max(20).default([]),
  profession: z.string().trim().min(2).max(255),
  instagram: z.string().trim().max(100).optional().default(""),
  facebook: z.string().trim().max(100).optional().default(""),
  tiktok: z.string().trim().max(100).optional().default(""),
  linkedin: z.string().trim().max(100).optional().default(""),
  acceptRules: z.literal(true),
  acceptMedia: z.literal(true),
  acceptNewsletter: z.boolean().default(false),
  acceptCGU: z.literal(true),
  consentVersion: z.string().trim().max(20).default("v1.0"),
});

const contactSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(5000),
});

function getClientIp(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function calculateAge(dateText: string) {
  const birth = new Date(`${dateText}T00:00:00`);
  const today = new Date();
  if (Number.isNaN(birth.getTime())) return -1;
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function decodeImageDataUrl(dataUrl: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) throw new Error("Format de photo invalide");
  const contentType = match[1].toLowerCase();
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
    throw new Error("La photo doit peser au maximum 5 Mo");
  }
  return { contentType, buffer };
}

function safeFilename(filename: string, contentType: string) {
  const clean = filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(-120);
  if (clean.includes(".")) return clean;
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : contentType.includes("heic") ? "heic" : "jpg";
  return `${clean || "photo"}.${ext}`;
}

async function getOrCreateContest2027() {
  const database = await db.getDb();
  if (!database) throw new Error("Base de données indisponible");

  const [existing] = await database.select().from(contests).where(eq(contests.year, 2027)).limit(1);
  if (existing) return existing.id;

  const result = await (database.insert(contests) as any).values({
    title: "Miss & Mister Dour 2027",
    year: 2027,
    description: "Édition 2027 de Miss & Mister Dour",
    status: "registration",
    location: "Dour, Belgique",
  });
  const contestId = Number(result?.[0]?.insertId);
  if (!contestId) throw new Error("Impossible de créer l’édition 2027");
  return contestId;
}

async function notifyAdmins(title: string, content: string, type: "info" | "message" = "info") {
  const admins = await db.getAllAdmins();
  await Promise.all(
    admins.map((admin) =>
      db.createNotification({
        userId: admin.id,
        type,
        title,
        content,
        isRead: 0,
      } as any)
    )
  );
}

export function registerPublicFormRoutes(app: Express) {
  app.get("/api/public/forms-health", async (_req, res) => {
    try {
      const database = await db.getDb();
      if (!database) return res.status(503).json({ ok: false, database: false });
      const contestId = await getOrCreateContest2027();
      const admins = await db.getAllAdmins();
      return res.json({ ok: true, database: true, contest2027: !!contestId, adminsAvailable: admins.length > 0, storage: "r2" });
    } catch (error) {
      console.error("[Forms health]", error);
      return res.status(503).json({ ok: false, error: "Forms dependencies unavailable" });
    }
  });

  app.post("/api/public/candidate-applications", candidateLimiter, async (req, res) => {
    const parsed = candidateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Certaines informations sont invalides ou incomplètes." });
    }

    try {
      const input = parsed.data;
      const age = calculateAge(input.birthDate);
      if (age < 18 || age > 35) {
        return res.status(400).json({ error: "Vous devez avoir entre 18 et 35 ans à la date de l’inscription." });
      }

      const contestId = await getOrCreateContest2027();
      const database = await db.getDb();
      if (!database) return res.status(503).json({ error: "Base de données momentanément indisponible." });

      const normalizedEmail = input.email.toLowerCase();
      const [duplicate] = await database
        .select({ id: candidateApplications.id, status: candidateApplications.status })
        .from(candidateApplications)
        .where(and(eq(candidateApplications.email, normalizedEmail), eq(candidateApplications.contestId, contestId)))
        .limit(1);
      if (duplicate) {
        return res.status(409).json({ error: "Une candidature existe déjà avec cette adresse email pour l’édition 2027." });
      }

      const { buffer, contentType } = decodeImageDataUrl(input.photoBase64);
      const key = `candidate-applications/2027/${Date.now()}-${crypto.randomUUID()}-${safeFilename(input.photoFilename, contentType)}`;
      const uploaded = await storagePut(key, buffer, contentType);

      const application = await db.createCandidateApplication({
        email: normalizedEmail,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        dateOfBirth: new Date(`${input.birthDate}T00:00:00`),
        city: input.city,
        country: "Belgique",
        category: input.category,
        photoProfile: uploaded.url,
        bio: input.bio,
        motivation: input.motivation,
        interests: JSON.stringify(input.interests),
        profession: input.profession,
        instagram: input.instagram || undefined,
        facebook: input.facebook || undefined,
        tiktok: input.tiktok || undefined,
        linkedin: input.linkedin || undefined,
        acceptedTerms: input.acceptRules && input.acceptCGU,
        acceptedMedia: input.acceptMedia,
        acceptedNewsletter: input.acceptNewsletter,
        ipAddress: getClientIp(req),
        contestId,
        status: "pending",
      });

      await notifyAdmins(
        "Nouvelle candidature 2027",
        `${application.firstName} ${application.lastName} (${application.category}) · ${application.city} · ${application.email}. À examiner dans /admin/applications.`,
        "info"
      );

      return res.status(201).json({ success: true, applicationId: application.id, contestId });
    } catch (error) {
      console.error("[Public candidate application]", error);
      const message = error instanceof Error ? error.message : "Impossible d’enregistrer la candidature.";
      return res.status(500).json({ error: message.includes("photo") || message.includes("Mo") ? message : "Impossible d’enregistrer la candidature pour le moment." });
    }
  });

  app.post("/api/public/contact", contactLimiter, async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Veuillez vérifier les champs du formulaire." });

    try {
      const input = parsed.data;
      await notifyAdmins(
        `Nouveau message site — ${input.subject}`,
        `De : ${input.name} <${input.email}>\n\n${input.message}`,
        "message"
      );
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("[Public contact]", error);
      return res.status(500).json({ error: "Impossible d’envoyer votre message pour le moment." });
    }
  });
}
