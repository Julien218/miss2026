/**
 * profilePhotoUpload.ts
 * Route Express POST /api/upload/profile-photo
 * Permet aux candidats d'uploader leur photo de profil via leur token unique.
 * - Valide le token (table profileEditTokens)
 * - Accepte les images JPG, PNG, WebP (max 5MB)
 * - Upload vers S3 via storagePut
 * - Met à jour candidates.profilePhoto
 */

import { Request, Response } from "express";
import multer from "multer";
import { getDb } from "../db";
import { candidates, profileEditTokens } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "../storage";
import crypto from "crypto";

// ─── Multer : stockage en mémoire (max 5MB) ──────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format non supporté. Utilisez JPG, PNG ou WebP."));
    }
  },
});

// ─── Handler principal ────────────────────────────────────────────────────────
async function handleProfilePhotoUpload(req: Request, res: Response) {
  try {
    const token = req.body?.token || req.query?.token;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Token manquant" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Base de données indisponible" });
    }

    // 1. Valider le token
    const [tokenRow] = await db
      .select()
      .from(profileEditTokens)
      .where(
        and(
          eq(profileEditTokens.token, token),
          eq(profileEditTokens.isActive, 1)
        )
      )
      .limit(1);

    if (!tokenRow) {
      return res.status(403).json({ error: "Lien invalide ou expiré" });
    }

    if (tokenRow.expiresAt && new Date() > tokenRow.expiresAt) {
      return res.status(403).json({ error: "Ce lien a expiré" });
    }

    // 2. Générer une clé S3 unique
    const ext = req.file.mimetype === "image/png" ? "png"
      : req.file.mimetype === "image/webp" ? "webp"
      : "jpg";
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const s3Key = `profile-photos/candidate-${tokenRow.candidateId}-${randomSuffix}.${ext}`;

    // 3. Upload vers S3
    const { url: photoUrl } = await storagePut(
      s3Key,
      req.file.buffer,
      req.file.mimetype
    );

    // 4. Mettre à jour la table candidates
    await db
      .update(candidates)
      .set({
        profilePhoto: photoUrl,
        updatedAt: new Date(),
      })
      .where(eq(candidates.id, tokenRow.candidateId));

    // 5. Incrémenter le compteur d'utilisation du token
    await db
      .update(profileEditTokens)
      .set({
        usedCount: tokenRow.usedCount + 1,
        lastUsedAt: new Date(),
      })
      .where(eq(profileEditTokens.token, token));

    return res.json({
      success: true,
      photoUrl,
      candidateId: tokenRow.candidateId,
    });
  } catch (err: any) {
    console.error("[ProfilePhotoUpload] Error:", err);
    return res.status(500).json({ error: err?.message || "Erreur interne" });
  }
}

// ─── Export : middleware multer + handler ─────────────────────────────────────
export const profilePhotoUploadRoute = [
  upload.single("photo"),
  handleProfilePhotoUpload,
] as const;
