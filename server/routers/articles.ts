import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { storagePut } from "../storage";
import { invokeLLM } from "../_core/llm";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

function generateSlug(title: string): string {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 500);
}

export const articlesRouter = router({
  list: publicProcedure.input(z.object({ category: z.enum(["event", "good_action", "candidate", "news_dour", "announcement"]).optional(), status: z.enum(["draft", "published", "archived"]).optional(), limit: z.number().min(1).max(100).default(20), offset: z.number().min(0).default(0) })).query(async ({ input }) => db.getArticles({ category: input.category, status: input.status || "published", limit: input.limit, offset: input.offset })),

  getById: publicProcedure.input(z.object({ id: z.number().optional(), slug: z.string().optional() })).query(async ({ input }) => {
    if (!input.id && !input.slug) throw new TRPCError({ code: "BAD_REQUEST", message: "ID or slug required" });
    const article = input.id ? await db.getArticleById(input.id) : await db.getArticleBySlug(input.slug!);
    if (!article) throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
    await db.incrementArticleViewCount(article.id);
    return article;
  }),

  analyzePhoto: adminProcedure.input(z.object({ imageData: z.string(), fileName: z.string().max(255), mimeType: z.string().startsWith("image/"), contestId: z.number().optional(), candidateId: z.number().optional(), eventId: z.number().optional() })).mutation(async ({ ctx, input }) => {
    try {
      const buffer = Buffer.from(input.imageData, "base64");
      if (!buffer.length || buffer.length > 8 * 1024 * 1024) throw new Error("Image invalide ou trop volumineuse");
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
      const fileKey = `articles/${ctx.user.id}/${Date.now()}-${safeName || "image"}`;
      const { url: imageUrl } = await storagePut(fileKey, buffer, input.mimeType);

      const analysisResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Tu aides l'équipe éditoriale de Miss & Mister Dour 2027 à préparer un brouillon d'article en français à partir d'une photo.

Règles impératives :
- Décris uniquement ce qui est raisonnablement visible dans l'image.
- N'invente jamais le nom d'une personne, un lieu précis, une date, un résultat, un sponsor ou un fait qui ne sont pas fournis.
- N'infère pas l'âge, l'origine, la santé, la religion, l'orientation ou d'autres caractéristiques personnelles sensibles.
- Évite d'assigner un genre à une personne si cette information n'est pas fournie par le contexte.
- Si une information manque, reste générique et indique qu'elle devra être complétée par l'équipe avant publication.
- Le résultat est un brouillon : ton ton doit rester élégant, local, humain et factuel.

Retourne un JSON strict avec :
1. category : event | good_action | candidate | news_dour | announcement
2. title : max 100 caractères
3. excerpt : max 200 caractères
4. content : 200 à 400 mots en Markdown
5. tags : 3 à 5 mots-clés
6. detectedContext : description factuelle courte de la scène.`
          },
          { role: "user", content: [{ type: "text", text: "Prépare un brouillon éditorial pour Miss & Mister Dour 2027 à partir de cette image. N'invente aucune information absente." }, { type: "image_url", image_url: { url: imageUrl, detail: "high" } }] }
        ],
        response_format: { type: "json_schema", json_schema: { name: "article_generation", strict: true, schema: { type: "object", properties: { category: { type: "string", enum: ["event", "good_action", "candidate", "news_dour", "announcement"] }, title: { type: "string" }, excerpt: { type: "string" }, content: { type: "string" }, tags: { type: "array", items: { type: "string" } }, detectedContext: { type: "string" } }, required: ["category", "title", "excerpt", "content", "tags", "detectedContext"], additionalProperties: false } } }
      });

      const raw = analysisResponse.choices[0]?.message?.content;
      const result = JSON.parse(typeof raw === "string" ? raw : "{}");
      return { success: true, imageUrl, imageKey: fileKey, category: result.category, title: result.title, excerpt: result.excerpt, content: result.content, tags: result.tags, detectedContext: result.detectedContext, aiModel: "configured-vision-model" };
    } catch (error) {
      console.error("AI analysis error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Impossible de préparer le brouillon à partir de cette image" });
    }
  }),

  create: adminProcedure.input(z.object({ title: z.string().min(10).max(500), content: z.string().min(50), excerpt: z.string().max(500).optional(), imageUrl: z.string().optional(), imageKey: z.string().optional(), category: z.enum(["event", "good_action", "candidate", "news_dour", "announcement"]), tags: z.array(z.string()).optional(), candidateId: z.number().optional(), eventId: z.number().optional(), contestId: z.number().optional(), status: z.enum(["draft", "published", "archived"]).default("draft"), isAiGenerated: z.boolean().default(false), aiPrompt: z.string().optional(), aiModel: z.string().optional(), metaTitle: z.string().optional(), metaDescription: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const slug = generateSlug(input.title);
    if (await db.getArticleBySlug(slug)) throw new TRPCError({ code: "CONFLICT", message: "Un article avec ce titre existe déjà" });
    const articleId = await db.createArticle({ ...input, slug, authorId: ctx.user.id, authorName: ctx.user.name || "Équipe Miss & Mister Dour", tags: input.tags ? JSON.stringify(input.tags) : null, isAiGenerated: input.isAiGenerated ? 1 : 0, publishedAt: input.status === "published" ? new Date() : null });
    return { success: true, articleId, slug };
  }),

  update: adminProcedure.input(z.object({ id: z.number(), title: z.string().min(10).max(500).optional(), content: z.string().min(50).optional(), excerpt: z.string().max(500).optional(), imageUrl: z.string().optional(), category: z.enum(["event", "good_action", "candidate", "news_dour", "announcement"]).optional(), tags: z.array(z.string()).optional(), status: z.enum(["draft", "published", "archived"]).optional(), metaTitle: z.string().optional(), metaDescription: z.string().optional() })).mutation(async ({ input }) => {
    const { id, title, tags, status, ...data } = input;
    const article = await db.getArticleById(id);
    if (!article) throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
    const updateData: any = { ...data };
    if (title) { updateData.title = title; updateData.slug = generateSlug(title); }
    if (tags) updateData.tags = JSON.stringify(tags);
    if (status && status !== article.status) { updateData.status = status; if (status === "published" && !article.publishedAt) updateData.publishedAt = new Date(); }
    await db.updateArticle(id, updateData);
    return { success: true };
  }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.deleteArticle(input.id); return { success: true }; }),
  incrementShareCount: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.incrementArticleShareCount(input.id); return { success: true }; }),
  toggleLike: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await db.incrementArticleLikeCount(input.id); return { success: true }; }),
});
