import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import sharp from "sharp";
import crypto from "node:crypto";
import { getDb } from "../db";
import { candidates, profileEditTokens } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "../storage";

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop d’envois de photo. Réessayez dans une heure." },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 10 },
  fileFilter: (_req, file, cb) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (allowed.has(file.mimetype.toLowerCase())) cb(null, true);
    else cb(new Error("Format non supporté. Utilisez JPG, PNG ou WebP."));
  },
});

async function normalizeProfileImage(buffer: Buffer) {
  try {
    const source = sharp(buffer, { failOn: "error", limitInputPixels: 50_000_000 });
    const metadata = await source.metadata();
    if (!metadata.width || !metadata.height) throw new Error("Dimensions de photo invalides");
    if (metadata.width > 10_000 || metadata.height > 10_000) {
      throw new Error("La résolution de la photo est trop élevée");
    }
    return await source
      .rotate()
      .resize({ width: 1600, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86, effort: 4 })
      .toBuffer();
  } catch (error) {
    console.warn("[ProfilePhotoUpload] invalid image", error);
    throw new Error("La photo est invalide ou endommagée. Utilisez une image JPG, PNG ou WebP valide.");
  }
}

async function handleProfilePhotoUpload(req: Request, res: Response) {
  try {
    const token = req.body?.token || req.query?.token;
    if (!token || typeof token !== "string" || token.length > 512) {
      return res.status(400).json({ error: "Token manquant ou invalide" });
    }
    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

    const database = await getDb();
    if (!database) return res.status(500).json({ error: "Base de données indisponible" });

    const [tokenRow] = await database
      .select()
      .from(profileEditTokens)
      .where(and(eq(profileEditTokens.token, token), eq(profileEditTokens.isActive, 1)))
      .limit(1);

    if (!tokenRow) return res.status(403).json({ error: "Lien invalide ou expiré" });
    if (tokenRow.expiresAt && new Date() > tokenRow.expiresAt) {
      return res.status(403).json({ error: "Ce lien a expiré" });
    }

    // Sharp décode réellement les octets, corrige l'orientation et réencode sans EXIF.
    const normalized = await normalizeProfileImage(req.file.buffer);
    const randomSuffix = crypto.randomBytes(12).toString("hex");
    const objectKey = `profile-photos/candidate-${tokenRow.candidateId}-${randomSuffix}.webp`;
    const { url: photoUrl } = await storagePut(objectKey, normalized, "image/webp");

    await database
      .update(candidates)
      .set({ profilePhoto: photoUrl, updatedAt: new Date() })
      .where(eq(candidates.id, tokenRow.candidateId));

    await database
      .update(profileEditTokens)
      .set({ usedCount: tokenRow.usedCount + 1, lastUsedAt: new Date() })
      .where(eq(profileEditTokens.token, token));

    return res.json({ success: true, photoUrl, candidateId: tokenRow.candidateId });
  } catch (error: any) {
    console.error("[ProfilePhotoUpload] Error:", error);
    const message = typeof error?.message === "string" && error.message.toLowerCase().includes("photo")
      ? error.message
      : "Impossible de traiter la photo pour le moment.";
    return res.status(400).json({ error: message });
  }
}

export const profilePhotoUploadRoute = [
  uploadLimiter,
  upload.single("photo"),
  handleProfilePhotoUpload,
] as const;
