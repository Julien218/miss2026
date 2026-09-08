import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { badges, userBadges, votes } from "../../drizzle/schema";
import { eq, and, count, sql } from "drizzle-orm";

/**
 * Badge definitions - all available badges in the system
 */
const BADGE_DEFINITIONS = [
  {
    code: "FIRST_VOTE",
    name: "Premier Vote",
    description: "Félicitations ! Vous avez voté pour la première fois.",
    icon: "Heart",
    rarity: "common" as const,
    category: "voting" as const,
    requirement: "Voter pour un candidat",
  },
  {
    code: "FIRST_SHARE",
    name: "Premier Partage",
    description: "Merci d'avoir partagé votre vote sur les réseaux sociaux !",
    icon: "Share2",
    rarity: "common" as const,
    category: "sharing" as const,
    requirement: "Partager votre vote",
  },
  {
    code: "VOTER_STREAK_3",
    name: "Votant Fidèle",
    description: "Vous avez voté 3 fois. Votre soutien compte !",
    icon: "Award",
    rarity: "rare" as const,
    category: "voting" as const,
    requirement: "Voter 3 fois",
  },
  {
    code: "VOTER_STREAK_7",
    name: "Super Votant",
    description: "7 votes ! Vous êtes un ambassadeur du concours.",
    icon: "Crown",
    rarity: "epic" as const,
    category: "voting" as const,
    requirement: "Voter 7 fois",
  },
  {
    code: "SHARE_MASTER_5",
    name: "Maître du Partage",
    description: "5 partages ! Vous êtes un véritable influenceur.",
    icon: "Sparkles",
    rarity: "epic" as const,
    category: "sharing" as const,
    requirement: "Partager 5 fois",
  },
  {
    code: "EARLY_SUPPORTER",
    name: "Supporter Précoce",
    description: "Vous avez voté dans les premières 24h du concours !",
    icon: "Zap",
    rarity: "legendary" as const,
    category: "special" as const,
    requirement: "Voter dans les 24h du lancement",
  },
  {
    code: "CANDIDATE_SUPPORTER",
    name: "Supporter Dévoué",
    description: "Vous avez voté pour le même candidat 3 fois.",
    icon: "Star",
    rarity: "rare" as const,
    category: "engagement" as const,
    requirement: "Voter 3 fois pour le même candidat",
  },
];

export const badgesRouter = router({
  /**
   * Get all available badges
   */
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    return await db.select().from(badges);
  }),

  /**
   * Get user's earned badges
   */
  getUserBadges: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const userId = input.userId || ctx.user.id;
      
      const userBadgesList = await db
        .select({
          id: userBadges.id,
          badgeCode: userBadges.badgeCode,
          earnedAt: userBadges.earnedAt,
          isDisplayed: userBadges.isDisplayed,
          badge: badges,
        })
        .from(userBadges)
        .leftJoin(badges, eq(userBadges.badgeCode, badges.code))
        .where(eq(userBadges.userId, userId));
      
      return userBadgesList;
    }),

  /**
   * Award a badge to a user
   */
  award: protectedProcedure
    .input(z.object({
      userId: z.number(),
      badgeCode: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Check if user already has this badge
      const existing = await db
        .select()
        .from(userBadges)
        .where(
          and(
            eq(userBadges.userId, input.userId),
            eq(userBadges.badgeCode, input.badgeCode)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        return { success: false, message: "Badge already earned" };
      }
      
      // Award the badge
      await db.insert(userBadges).values({
        userId: input.userId,
        badgeCode: input.badgeCode,
        earnedAt: new Date(),
        isDisplayed: 1,
      });
      
      // Get badge details
      const badge = await db
        .select()
        .from(badges)
        .where(eq(badges.code, input.badgeCode))
        .limit(1);
      
      return {
        success: true,
        message: "Badge earned!",
        badge: badge[0],
      };
    }),

  /**
   * Check eligibility for badges after an action (vote or share)
   */
  checkEligibility: protectedProcedure
    .input(z.object({
      action: z.enum(["vote", "share"]),
      candidateId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const newBadges: any[] = [];
      
      // Count user's votes
      const voteCount = await db
        .select({ count: count() })
        .from(votes)
        .where(eq(votes.userId, ctx.user.id));
      
      const totalVotes = voteCount[0]?.count || 0;
      
      // Check FIRST_VOTE
      if (input.action === "vote" && totalVotes === 1) {
        const awarded = await awardBadgeIfNew(db, ctx.user.id, "FIRST_VOTE");
        if (awarded) newBadges.push(awarded);
      }
      
      // Check VOTER_STREAK_3
      if (input.action === "vote" && totalVotes === 3) {
        const awarded = await awardBadgeIfNew(db, ctx.user.id, "VOTER_STREAK_3");
        if (awarded) newBadges.push(awarded);
      }
      
      // Check VOTER_STREAK_7
      if (input.action === "vote" && totalVotes === 7) {
        const awarded = await awardBadgeIfNew(db, ctx.user.id, "VOTER_STREAK_7");
        if (awarded) newBadges.push(awarded);
      }
      
      // Check FIRST_SHARE (we'll track this via a separate mechanism)
      if (input.action === "share") {
        const awarded = await awardBadgeIfNew(db, ctx.user.id, "FIRST_SHARE");
        if (awarded) newBadges.push(awarded);
      }
      
      return {
        newBadges,
        totalVotes,
      };
    }),

  /**
   * Initialize badge definitions in database
   */
  initializeBadges: protectedProcedure.mutation(async ({ ctx }) => {
    // Only admin can initialize badges
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }
    
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    for (const badgeDef of BADGE_DEFINITIONS) {
      // Check if badge already exists
      const existing = await db
        .select()
        .from(badges)
        .where(eq(badges.code, badgeDef.code))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(badges).values({
          code: badgeDef.code,
          name: badgeDef.name,
          description: badgeDef.description,
          icon: badgeDef.icon,
          rarity: badgeDef.rarity,
          category: badgeDef.category,
          requirement: badgeDef.requirement,
          isActive: 1,
        });
      }
    }
    
    return { success: true, message: "Badges initialized" };
  }),
});

/**
 * Helper function to award a badge if user doesn't have it yet
 */
async function awardBadgeIfNew(db: any, userId: number, badgeCode: string) {
  // Check if user already has this badge
  const existing = await db
    .select()
    .from(userBadges)
    .where(
      and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeCode, badgeCode)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    return null;
  }
  
  // Award the badge
  await db.insert(userBadges).values({
    userId,
    badgeCode,
    earnedAt: new Date(),
    isDisplayed: 1,
  });
  
  // Get badge details
  const badge = await db
    .select()
    .from(badges)
    .where(eq(badges.code, badgeCode))
    .limit(1);
  
  return badge[0];
}
