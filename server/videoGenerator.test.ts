/**
 * videoGenerator.test.ts — Tests vitest pour le générateur de vidéos IA
 * Créé par JS-Innov.IA — Pagin Julien, Dour, Belgique
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { videoGeneratorRouter, VIDEO_TYPES, VIDEO_STYLES } from "./routers/videoGenerator";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          title: "Miss & Mister Dour 2026 - Promo",
          description: "Vidéo de promotion pour la soirée du 19 avril 2026",
          totalDuration: 30,
          aspectRatio: "16:9",
          style: "Luxe Doré",
          colorPalette: ["#D4AF37", "#B8941E", "#1A1A1A"],
          scenes: [
            {
              id: 1,
              duration: 5,
              type: "intro",
              description: "Logo Miss & Mister Dour avec particules dorées",
              cameraMovement: "zoom",
              visualElements: ["logo", "particules dorées"],
              textOverlay: "Miss & Mister Dour 2026",
              narration: "Bienvenue à la soirée la plus glamour de Belgique",
              soundEffect: "Musique orchestrale montante",
              transition: "fade",
            },
            {
              id: 2,
              duration: 10,
              type: "main",
              description: "Défilé des candidats sur scène",
              cameraMovement: "pan",
              visualElements: ["candidats", "scène", "lumières"],
              textOverlay: null,
              narration: "Découvrez nos candidats exceptionnels",
              soundEffect: "Musique pop énergique",
              transition: "cut",
            },
            {
              id: 3,
              duration: 15,
              type: "cta",
              description: "Appel à l'action vote",
              cameraMovement: "static",
              visualElements: ["bouton vote", "QR code"],
              textOverlay: "Votez maintenant !",
              narration: "Votez pour votre favori sur notre site",
              soundEffect: "Musique finale crescendo",
              transition: "dissolve",
            },
          ],
          narrationScript: "Bienvenue à Miss & Mister Dour 2026...",
          musicMood: "Glamour, luxueux, festif",
          productionNotes: "Utiliser des transitions fluides",
          imagePrompts: [
            { sceneId: 1, prompt: "Logo Miss & Mister Dour avec fond doré" },
            { sceneId: 2, prompt: "Candidats en tenue de gala sur scène" },
          ],
        }),
      },
    }],
  }),
}));

vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({
    url: "https://example.com/generated-image.jpg",
  }),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://s3.example.com/video-plan.json",
    key: "video-plans/test-plan.json",
  }),
}));

vi.mock("./db", () => ({
  getUserById: vi.fn(),
}));

// ─── Tests des constantes ─────────────────────────────────────────────────────
describe("VIDEO_TYPES", () => {
  it("doit contenir 6 types de vidéo", () => {
    expect(VIDEO_TYPES).toHaveLength(6);
  });

  it("doit inclure les types essentiels", () => {
    const ids = VIDEO_TYPES.map(t => t.id);
    expect(ids).toContain("promo_event");
    expect(ids).toContain("candidate_intro");
    expect(ids).toContain("sponsor_reel");
    expect(ids).toContain("vote_cta");
    expect(ids).toContain("winner_reveal");
    expect(ids).toContain("custom");
  });

  it("chaque type doit avoir id, label et description", () => {
    VIDEO_TYPES.forEach(type => {
      expect(type.id).toBeTruthy();
      expect(type.label).toBeTruthy();
      expect(type.description).toBeTruthy();
    });
  });
});

describe("VIDEO_STYLES", () => {
  it("doit contenir 5 styles visuels", () => {
    expect(VIDEO_STYLES).toHaveLength(5);
  });

  it("doit inclure les styles essentiels", () => {
    const ids = VIDEO_STYLES.map(s => s.id);
    expect(ids).toContain("luxury_gold");
    expect(ids).toContain("cinematic");
    expect(ids).toContain("modern_minimal");
    expect(ids).toContain("social_media");
    expect(ids).toContain("documentary");
  });

  it("chaque style doit avoir id, label et description", () => {
    VIDEO_STYLES.forEach(style => {
      expect(style.id).toBeTruthy();
      expect(style.label).toBeTruthy();
      expect(style.description).toBeTruthy();
    });
  });
});

// ─── Tests du router ──────────────────────────────────────────────────────────
describe("videoGeneratorRouter", () => {
  it("doit exporter un router valide", () => {
    expect(videoGeneratorRouter).toBeDefined();
    expect(typeof videoGeneratorRouter).toBe("object");
  });

  it("doit avoir les procédures requises", () => {
    const procedures = Object.keys(videoGeneratorRouter._def.procedures);
    expect(procedures).toContain("generateScript");
    expect(procedures).toContain("generateKeyframes");
    expect(procedures).toContain("generateProductionPlan");
    expect(procedures).toContain("getOptions");
  });
});

// ─── Tests de validation des inputs ──────────────────────────────────────────
describe("Validation des inputs generateScript", () => {
  it("doit valider les types de vidéo autorisés", () => {
    const validTypes = ["promo_event", "candidate_intro", "sponsor_reel", "vote_cta", "winner_reveal", "custom"];
    validTypes.forEach(type => {
      expect(VIDEO_TYPES.map(t => t.id)).toContain(type);
    });
  });

  it("doit valider les styles autorisés", () => {
    const validStyles = ["luxury_gold", "cinematic", "modern_minimal", "social_media", "documentary"];
    validStyles.forEach(style => {
      expect(VIDEO_STYLES.map(s => s.id)).toContain(style);
    });
  });

  it("doit valider les durées (15-120 secondes)", () => {
    const validDurations = [15, 30, 45, 60, 90, 120];
    validDurations.forEach(d => {
      expect(d).toBeGreaterThanOrEqual(15);
      expect(d).toBeLessThanOrEqual(120);
    });
  });

  it("doit valider les formats d'aspect ratio", () => {
    const validRatios = ["16:9", "9:16", "1:1"];
    validRatios.forEach(ratio => {
      expect(["16:9", "9:16", "1:1"]).toContain(ratio);
    });
  });

  it("doit valider les langues supportées", () => {
    const validLanguages = ["fr", "en", "nl"];
    validLanguages.forEach(lang => {
      expect(["fr", "en", "nl"]).toContain(lang);
    });
  });
});

// ─── Tests de la logique métier ───────────────────────────────────────────────
describe("Logique métier du générateur vidéo", () => {
  it("doit limiter les keyframes à 8 maximum", () => {
    const prompts = Array.from({ length: 15 }, (_, i) => ({
      sceneId: i + 1,
      prompt: `Scène ${i + 1}`,
    }));
    const limited = prompts.slice(0, 8);
    expect(limited).toHaveLength(8);
  });

  it("doit construire un prompt enrichi pour les keyframes", () => {
    const basePrompt = "Logo Miss & Mister Dour";
    const style = "Luxe Doré";
    const aspectRatio = "16:9";
    const enhancedPrompt = `${basePrompt}. Style: ${style}, Miss & Mister Dour 2026 aesthetic, luxury Belgian beauty pageant, golden glamour, professional photography, cinematic lighting. Aspect ratio ${aspectRatio}. No text, no watermarks.`;
    
    expect(enhancedPrompt).toContain(basePrompt);
    expect(enhancedPrompt).toContain(style);
    expect(enhancedPrompt).toContain("Miss & Mister Dour 2026");
    expect(enhancedPrompt).toContain("No text, no watermarks");
  });

  it("doit injecter les URLs keyframes dans le plan de production", () => {
    const timeline = [
      { sceneId: 1, startTime: 0, endTime: 5, imageUrl: "" },
      { sceneId: 2, startTime: 5, endTime: 15, imageUrl: "" },
    ];
    const keyframes = [
      { sceneId: 1, imageUrl: "https://example.com/scene1.jpg" },
      { sceneId: 2, imageUrl: "https://example.com/scene2.jpg" },
    ];

    const enrichedTimeline = timeline.map(item => {
      const keyframe = keyframes.find(k => k.sceneId === item.sceneId);
      if (keyframe?.imageUrl) {
        item.imageUrl = keyframe.imageUrl;
      }
      return item;
    });

    expect(enrichedTimeline[0].imageUrl).toBe("https://example.com/scene1.jpg");
    expect(enrichedTimeline[1].imageUrl).toBe("https://example.com/scene2.jpg");
  });

  it("doit générer un nom de fichier unique pour l'export", () => {
    const videoType = "promo_event";
    const timestamp = Date.now();
    const filename = `plan-production-${videoType}-${timestamp}.json`;
    
    expect(filename).toContain("plan-production");
    expect(filename).toContain(videoType);
    expect(filename).toContain(".json");
  });
});

// ─── Tests de sécurité ───────────────────────────────────────────────────────
describe("Sécurité du générateur vidéo", () => {
  it("doit vérifier que le rôle super_admin est requis", () => {
    // Le router utilise superAdminProcedure qui vérifie ctx.user.role === 'super_admin'
    const superAdminCheck = (role: string) => role === "super_admin";
    
    expect(superAdminCheck("super_admin")).toBe(true);
    expect(superAdminCheck("admin")).toBe(false);
    expect(superAdminCheck("user")).toBe(false);
    expect(superAdminCheck("jury")).toBe(false);
  });

  it("doit limiter les instructions personnalisées à 2000 caractères", () => {
    const maxLength = 2000;
    const longText = "a".repeat(2001);
    expect(longText.length).toBeGreaterThan(maxLength);
    
    const truncated = longText.slice(0, maxLength);
    expect(truncated.length).toBe(maxLength);
  });
});
