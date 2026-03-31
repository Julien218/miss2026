/**
 * videoGenerator.ts — Router tRPC pour la génération de vidéos IA
 * Réservé exclusivement aux super_admin
 * Créé par JS-Innov.IA — Pagin Julien, Dour, Belgique
 */

import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";
import { storagePut } from "../storage";
import * as db from "../db";

// Procédure réservée aux super_admin uniquement
const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès réservé au Super Administrateur.",
    });
  }
  return next({ ctx });
});

// Types de vidéo disponibles
export const VIDEO_TYPES = [
  { id: "promo_event", label: "Promotion événement", description: "Vidéo de promotion pour la soirée Miss & Mister Dour 2026" },
  { id: "candidate_intro", label: "Présentation candidat", description: "Vidéo d'introduction personnalisée pour un candidat" },
  { id: "sponsor_reel", label: "Reel sponsor", description: "Vidéo de remerciement et mise en avant d'un sponsor" },
  { id: "vote_cta", label: "Appel au vote", description: "Vidéo incitant le public à voter" },
  { id: "winner_reveal", label: "Révélation gagnant", description: "Vidéo dramatique de révélation du gagnant/gagnante" },
  { id: "custom", label: "Personnalisé", description: "Vidéo entièrement personnalisée selon vos instructions" },
] as const;

export const VIDEO_STYLES = [
  { id: "luxury_gold", label: "Luxe Doré", description: "Style élégant avec dorures et glamour" },
  { id: "cinematic", label: "Cinématique", description: "Style film hollywoodien avec effets dramatiques" },
  { id: "modern_minimal", label: "Moderne Minimaliste", description: "Design épuré et contemporain" },
  { id: "social_media", label: "Réseaux Sociaux", description: "Format vertical 9:16 optimisé Instagram/TikTok" },
  { id: "documentary", label: "Documentaire", description: "Style reportage authentique et émotionnel" },
] as const;

export const videoGeneratorRouter = router({
  /**
   * Générer un script de vidéo IA (scènes, narration, instructions)
   */
  generateScript: superAdminProcedure
    .input(z.object({
      videoType: z.enum(["promo_event", "candidate_intro", "sponsor_reel", "vote_cta", "winner_reveal", "custom"]),
      style: z.enum(["luxury_gold", "cinematic", "modern_minimal", "social_media", "documentary"]),
      duration: z.number().min(15).max(120).default(30),
      aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
      language: z.enum(["fr", "en", "nl"]).default("fr"),
      customInstructions: z.string().max(2000).optional(),
      candidateName: z.string().optional(),
      sponsorName: z.string().optional(),
      eventDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const videoTypeLabel = VIDEO_TYPES.find(v => v.id === input.videoType)?.label || input.videoType;
      const styleLabel = VIDEO_STYLES.find(s => s.id === input.style)?.label || input.style;

      const systemPrompt = `Tu es un expert en production vidéo pour des concours de beauté et événements premium. 
Tu crées des scripts de vidéos professionnels pour Miss & Mister Dour 2026, organisé par STARLIGHT ASBL à Dour, Belgique.
Réponds UNIQUEMENT en JSON valide selon le schéma fourni.`;

      const userPrompt = `Crée un script de vidéo complet pour :
- Type : ${videoTypeLabel}
- Style visuel : ${styleLabel}
- Durée : ${input.duration} secondes
- Format : ${input.aspectRatio}
- Langue : ${input.language === 'fr' ? 'Français' : input.language === 'en' ? 'Anglais' : 'Néerlandais'}
${input.candidateName ? `- Candidat(e) : ${input.candidateName}` : ''}
${input.sponsorName ? `- Sponsor : ${input.sponsorName}` : ''}
${input.eventDate ? `- Date événement : ${input.eventDate}` : '- Date événement : 19 avril 2026'}
${input.customInstructions ? `- Instructions spéciales : ${input.customInstructions}` : ''}

Contexte : Miss & Mister Dour 2026 — Soirée de gala au Centre Sportif d'Elouges, Belgique. Thème Born to Dance.

Génère un script JSON avec cette structure exacte :
{
  "title": "Titre de la vidéo",
  "description": "Description courte",
  "totalDuration": ${input.duration},
  "aspectRatio": "${input.aspectRatio}",
  "style": "${styleLabel}",
  "colorPalette": ["#couleur1", "#couleur2", "#couleur3"],
  "scenes": [
    {
      "id": 1,
      "duration": 5,
      "type": "intro|main|cta|outro",
      "description": "Description visuelle détaillée de la scène",
      "cameraMovement": "static|pan|zoom|dolly|arc",
      "visualElements": ["élément1", "élément2"],
      "textOverlay": "Texte à afficher (ou null)",
      "narration": "Texte de narration (ou null)",
      "soundEffect": "Description son/musique",
      "transition": "fade|cut|dissolve|wipe"
    }
  ],
  "narrationScript": "Script complet de la narration",
  "musicMood": "Description de l'ambiance musicale",
  "productionNotes": "Notes techniques pour la production",
  "imagePrompts": [
    {
      "sceneId": 1,
      "prompt": "Prompt détaillé pour générer l'image clé de cette scène"
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "video_script",
            strict: false,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                totalDuration: { type: "number" },
                aspectRatio: { type: "string" },
                style: { type: "string" },
                colorPalette: { type: "array", items: { type: "string" } },
                scenes: { type: "array" },
                narrationScript: { type: "string" },
                musicMood: { type: "string" },
                productionNotes: { type: "string" },
                imagePrompts: { type: "array" },
              },
              required: ["title", "description", "scenes"],
              additionalProperties: true,
            },
          },
        },
      });

      const rawScript = response.choices[0]?.message?.content;
      if (!rawScript) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la génération du script" });
      }
      const scriptStr = typeof rawScript === 'string' ? rawScript : JSON.stringify(rawScript);

      let script;
      try {
        script = JSON.parse(scriptStr);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur de parsing du script généré" });
      }

      return { script, generatedAt: Date.now() };
    }),

  /**
   * Générer les images clés (keyframes) pour chaque scène du script
   */
  generateKeyframes: superAdminProcedure
    .input(z.object({
      imagePrompts: z.array(z.object({
        sceneId: z.number(),
        prompt: z.string(),
      })).max(8),
      style: z.string(),
      aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
    }))
    .mutation(async ({ input }) => {
      const keyframes: Array<{ sceneId: number; imageUrl: string; prompt: string }> = [];

      // Générer les images en séquence (max 8 pour éviter timeout)
      for (const prompt of input.imagePrompts.slice(0, 8)) {
        try {
          const enhancedPrompt = `${prompt.prompt}. Style: ${input.style}, Miss & Mister Dour 2026 aesthetic, luxury Belgian beauty pageant, golden glamour, professional photography, cinematic lighting. Aspect ratio ${input.aspectRatio}. No text, no watermarks.`;

          const imageResult = await generateImage({ prompt: enhancedPrompt });
          const imgUrl = imageResult.url ?? "";

          keyframes.push({
            sceneId: prompt.sceneId,
            imageUrl: imgUrl,
            prompt: enhancedPrompt,
          });
        } catch (err) {
          // Continuer même si une image échoue
          console.error(`Keyframe generation failed for scene ${prompt.sceneId}:`, err);
          keyframes.push({
            sceneId: prompt.sceneId,
            imageUrl: "",
            prompt: prompt.prompt,
          });
        }
      }

      return { keyframes, generatedAt: Date.now() };
    }),

  /**
   * Générer les instructions de montage finales (export pour outil vidéo)
   */
  generateProductionPlan: superAdminProcedure
    .input(z.object({
      script: z.object({
        title: z.string(),
        scenes: z.array(z.any()),
        narrationScript: z.string().optional(),
        musicMood: z.string().optional(),
        productionNotes: z.string().optional(),
      }),
      keyframes: z.array(z.object({
        sceneId: z.number(),
        imageUrl: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = `Tu es un directeur de production vidéo expert. Tu génères des plans de production détaillés pour des outils de montage vidéo comme CapCut, Premiere Pro, DaVinci Resolve.`;

      const userPrompt = `Génère un plan de production complet pour cette vidéo Miss & Mister Dour 2026.

Script : ${JSON.stringify(input.script, null, 2)}

Keyframes disponibles : ${input.keyframes.filter(k => k.imageUrl).length} images générées.

Génère un plan de production JSON :
{
  "title": "Titre",
  "timeline": [
    {
      "sceneId": 1,
      "startTime": 0,
      "endTime": 5,
      "imageUrl": "url_image",
      "textOverlay": "texte ou null",
      "animation": "description animation",
      "transition": "type transition",
      "narration": "texte narration ou null"
    }
  ],
  "exportSettings": {
    "resolution": "1920x1080",
    "fps": 30,
    "format": "MP4",
    "codec": "H.264"
  },
  "musicRecommendations": ["suggestion1", "suggestion2"],
  "capCutInstructions": "Instructions étape par étape pour CapCut",
  "premiereProInstructions": "Instructions pour Adobe Premiere Pro",
  "estimatedEditTime": "30 minutes",
  "totalDuration": 30
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la génération du plan de production" });
      }
      const contentStr = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

      // Enrichir le plan avec les URLs des keyframes
      let plan;
      try {
        const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
        plan = jsonMatch ? JSON.parse(jsonMatch[0]) : { rawContent: contentStr };
      } catch {
        plan = { rawContent: contentStr };
      }

      // Injecter les URLs des keyframes dans le plan
      if (plan.timeline && Array.isArray(plan.timeline)) {
        plan.timeline = plan.timeline.map((item: any) => {
          const keyframe = input.keyframes.find(k => k.sceneId === item.sceneId);
          if (keyframe?.imageUrl) {
            item.imageUrl = keyframe.imageUrl;
          }
          return item;
        });
      }

      return { plan, generatedAt: Date.now() };
    }),

  /**
   * Lister les types de vidéo et styles disponibles
   */
  getOptions: superAdminProcedure
    .query(() => {
      return {
        videoTypes: VIDEO_TYPES,
        videoStyles: VIDEO_STYLES,
        durations: [15, 30, 45, 60, 90, 120],
        aspectRatios: ["16:9", "9:16", "1:1"],
        languages: [
          { id: "fr", label: "Français" },
          { id: "en", label: "English" },
          { id: "nl", label: "Nederlands" },
        ],
      };
    }),
});
