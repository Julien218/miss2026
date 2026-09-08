import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { storagePut } from "../storage";
import { invokeLLM } from "../_core/llm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 500); // Limit length
}

export const articlesRouter = router({
  /**
   * List articles with optional filters and pagination
   */
  list: publicProcedure
    .input(z.object({
      category: z.enum(["event", "good_action", "candidate", "news_dour", "announcement"]).optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      return await db.getArticles({
        category: input.category,
        status: input.status || "published",
        limit: input.limit,
        offset: input.offset,
      });
    }),

  /**
   * Get single article by ID or slug
   */
  getById: publicProcedure
    .input(z.object({
      id: z.number().optional(),
      slug: z.string().optional(),
    }))
    .query(async ({ input }) => {
      if (!input.id && !input.slug) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'ID or slug required' });
      }
      
      const article = input.id 
        ? await db.getArticleById(input.id)
        : await db.getArticleBySlug(input.slug!);
      
      if (!article) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Article not found' });
      }
      
      // Increment view count
      await db.incrementArticleViewCount(article.id);
      
      return article;
    }),

  /**
   * Analyze photo with AI vision and generate article content
   */
  analyzePhoto: adminProcedure
    .input(z.object({
      imageData: z.string(), // base64
      fileName: z.string(),
      mimeType: z.string(),
      contestId: z.number().optional(),
      candidateId: z.number().optional(),
      eventId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Upload image to S3
        const buffer = Buffer.from(input.imageData, 'base64');
        const timestamp = Date.now();
        const fileKey = `articles/${ctx.user.id}/${timestamp}-${input.fileName}`;
        const { url: imageUrl } = await storagePut(fileKey, buffer, input.mimeType);

        // 2. Analyze image with vision AI
        const analysisResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Tu es un journaliste expert spécialisé dans les événements Miss & Mister Dour 2026.
Ton rôle est d'analyser des photos d'événements, bonnes actions, ou candidats et de générer un article premium en français.

Analyse la photo et identifie:
- Le contexte (événement, bonne action, candidat posant, autre)
- Les personnes présentes (nombre, genre, âge approximatif)
- L'activité ou l'action en cours
- Le lieu (intérieur/extérieur, type de lieu)
- L'émotion générale (joie, sérieux, engagement, etc.)
- Les éléments visuels importants (décor, vêtements, objets)

Ensuite, génère un article structuré avec:
1. **Catégorie** : "event", "good_action", "candidate", "news_dour", ou "announcement"
2. **Titre** : Accrocheur, max 100 caractères, style journalistique premium
3. **Extrait** : Résumé en 1-2 phrases, max 200 caractères
4. **Contenu** : Article complet 200-400 mots, style élégant, paragraphes courts
5. **Tags** : 3-5 mots-clés pertinents (JSON array)

Format de réponse JSON strict.`
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyse cette photo et génère un article premium pour Miss & Mister Dour 2026."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "article_generation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: ["event", "good_action", "candidate", "news_dour", "announcement"],
                    description: "Catégorie de l'article"
                  },
                  title: {
                    type: "string",
                    description: "Titre accrocheur max 100 caractères"
                  },
                  excerpt: {
                    type: "string",
                    description: "Résumé 1-2 phrases max 200 caractères"
                  },
                  content: {
                    type: "string",
                    description: "Article complet 200-400 mots en markdown"
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 mots-clés pertinents"
                  },
                  detectedContext: {
                    type: "string",
                    description: "Description du contexte détecté dans l'image"
                  }
                },
                required: ["category", "title", "excerpt", "content", "tags", "detectedContext"],
                additionalProperties: false
              }
            }
          }
        });

        const content = analysisResponse.choices[0].message.content;
        const result = JSON.parse(typeof content === 'string' ? content : "{}");

        // 3. Return generated content
        return {
          success: true,
          imageUrl,
          imageKey: fileKey,
          category: result.category,
          title: result.title,
          excerpt: result.excerpt,
          content: result.content,
          tags: result.tags,
          detectedContext: result.detectedContext,
          aiModel: "gpt-4-vision",
        };
      } catch (error) {
        console.error("AI analysis error:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze photo with AI'
        });
      }
    }),

  /**
   * Create article (manual or from AI analysis)
   */
  create: adminProcedure
    .input(z.object({
      title: z.string().min(10).max(500),
      content: z.string().min(50),
      excerpt: z.string().max(500).optional(),
      imageUrl: z.string().optional(),
      imageKey: z.string().optional(),
      category: z.enum(["event", "good_action", "candidate", "news_dour", "announcement"]),
      tags: z.array(z.string()).optional(),
      candidateId: z.number().optional(),
      eventId: z.number().optional(),
      contestId: z.number().optional(),
      status: z.enum(["draft", "published", "archived"]).default("draft"),
      isAiGenerated: z.boolean().default(false),
      aiPrompt: z.string().optional(),
      aiModel: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const slug = generateSlug(input.title);
      
      // Check if slug already exists
      const existing = await db.getArticleBySlug(slug);
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Un article avec ce titre existe déjà'
        });
      }

      const articleId = await db.createArticle({
        ...input,
        slug,
        authorId: ctx.user.id,
        authorName: ctx.user.name || "Admin",
        tags: input.tags ? JSON.stringify(input.tags) : null,
        isAiGenerated: input.isAiGenerated ? 1 : 0,
        publishedAt: input.status === "published" ? new Date() : null,
      });

      return { success: true, articleId, slug };
    }),

  /**
   * Update article
   */
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(10).max(500).optional(),
      content: z.string().min(50).optional(),
      excerpt: z.string().max(500).optional(),
      imageUrl: z.string().optional(),
      category: z.enum(["event", "good_action", "candidate", "news_dour", "announcement"]).optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, title, tags, status, ...data } = input;
      
      const article = await db.getArticleById(id);
      if (!article) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Article not found' });
      }

      const updateData: any = { ...data };
      
      if (title) {
        updateData.title = title;
        updateData.slug = generateSlug(title);
      }
      
      if (tags) {
        updateData.tags = JSON.stringify(tags);
      }
      
      if (status && status !== article.status) {
        updateData.status = status;
        if (status === "published" && !article.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      await db.updateArticle(id, updateData);
      return { success: true };
    }),

  /**
   * Delete article
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteArticle(input.id);
      return { success: true };
    }),

  /**
   * Increment share count
   */
  incrementShareCount: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.incrementArticleShareCount(input.id);
      return { success: true };
    }),

  /**
   * Toggle like
   */
  toggleLike: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // TODO: Implement proper like tracking per user
      await db.incrementArticleLikeCount(input.id);
      return { success: true };
    }),
});
