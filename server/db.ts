import { eq, desc, and, gte, lte, lt, inArray, sql, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  contests, InsertContest,
  candidates, InsertCandidate,
  candidateApplications, InsertCandidateApplication,
  media, InsertMedia,
  events, InsertEvent,
  eventAttendees, InsertEventAttendee,
  evaluations, InsertEvaluation,
  professionals, InsertProfessional,
  messages, InsertMessage,
  notifications, InsertNotification,
  votes, InsertVote,
  voteSessions, InsertVoteSession,
  trackingEvents, InsertTrackingEvent,
  socialScores, InsertSocialScore,
  eventParticipants, InsertEventParticipant,
  articles, InsertArticle,
  candidateAnalytics, InsertCandidateAnalytics,
  ipTracking, InsertIpTracking,
  mediaJobs, InsertMediaJob,
  knowledgeGarden, InsertKnowledgeGarden,
  assets, InsertAsset,
  invitations, InsertInvitation,
  photos, InsertPhoto
} from "../drizzle/schema";
import crypto from "crypto";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'super_admin';
      updateSet.role = 'super_admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== CONTESTS ==========

export async function getAllContests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contests).orderBy(desc(contests.year));
}

export async function getContestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contests).where(eq(contests.id, id)).limit(1);
  return result[0];
}

export async function createContest(data: InsertContest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contests).values(data);
  return result;
}

export async function updateContest(id: number, data: Partial<InsertContest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contests).set(data).where(eq(contests.id, id));
}

export async function deleteContest(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contests).where(eq(contests.id, id));
}

// ========== CANDIDATES ==========

export async function getCandidatesByContest(contestId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(candidates).where(eq(candidates.contestId, contestId)).orderBy(candidates.id);
}

export async function getCandidateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(candidates).where(eq(candidates.id, id)).limit(1);
  return result[0];
}

export async function getCandidateByUserId(userId: number, contestId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(candidates)
    .where(and(eq(candidates.userId, userId), eq(candidates.contestId, contestId)))
    .limit(1);
  return result[0];
}

export async function createCandidate(data: InsertCandidate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(candidates).values(data);
  return result;
}

export async function updateCandidate(id: number, data: Partial<InsertCandidate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(candidates).set(data).where(eq(candidates.id, id));
}

export async function searchCandidates(contestId: number, search?: string, category?: string, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(candidates.contestId, contestId)];
  
  if (search) {
    conditions.push(
      or(
        like(candidates.firstName, `%${search}%`),
        like(candidates.lastName, `%${search}%`)
      )!
    );
  }
  
  if (category) {
    conditions.push(eq(candidates.category, category as any));
  }
  
  if (status) {
    conditions.push(eq(candidates.status, status as any));
  }
  
  return db.select().from(candidates).where(and(...conditions)).orderBy(candidates.id);
}

// ========== MEDIA ==========

export async function getMediaByCandidate(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(media)
    .where(eq(media.candidateId, candidateId))
    .orderBy(desc(media.createdAt));
}

export async function getPublicMedia(contestId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(media.isPublic, 1)];
  if (contestId) {
    conditions.push(eq(media.contestId, contestId));
  }
  
  return db.select().from(media)
    .where(and(...conditions))
    .orderBy(desc(media.createdAt));
}

export async function createMedia(data: InsertMedia) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(media).values(data);
  return result;
}

export async function updateMedia(id: number, data: Partial<InsertMedia>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(media).set(data).where(eq(media.id, id));
}

export async function deleteMedia(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(media).where(eq(media.id, id));
}

// ========== EVENTS ==========

export async function getEventsByContest(contestId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events)
    .where(eq(events.contestId, contestId))
    .orderBy(desc(events.date));
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0];
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(events).values(data);
  return result;
}

export async function updateEvent(id: number, data: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set(data).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq(events.id, id));
}

// ========== EVENT ATTENDEES ==========

export async function getEventAttendees(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventAttendees).where(eq(eventAttendees.eventId, eventId));
}

export async function createEventAttendee(data: InsertEventAttendee) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(eventAttendees).values(data);
  return result;
}

export async function updateEventAttendee(id: number, data: Partial<InsertEventAttendee>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(eventAttendees).set(data).where(eq(eventAttendees.id, id));
}

// ========== EVALUATIONS ==========

export async function getEvaluationsByCandidate(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(evaluations)
    .where(eq(evaluations.candidateId, candidateId))
    .orderBy(desc(evaluations.createdAt));
}

export async function getEvaluationsByJury(juryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(evaluations)
    .where(eq(evaluations.juryId, juryId))
    .orderBy(desc(evaluations.createdAt));
}

export async function createEvaluation(data: InsertEvaluation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(evaluations).values(data);
  return result;
}

export async function updateEvaluation(id: number, data: Partial<InsertEvaluation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(evaluations).set(data).where(eq(evaluations.id, id));
}

export async function getCandidateScores(contestId: number, phase?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(evaluations.contestId, contestId)];
  if (phase) {
    conditions.push(eq(evaluations.phase, phase as any));
  }
  
  return db.select({
    candidateId: evaluations.candidateId,
    avgScore: sql<number>`AVG(${evaluations.overallScore})`.as('avgScore'),
    totalEvaluations: sql<number>`COUNT(*)`.as('totalEvaluations')
  })
  .from(evaluations)
  .where(and(...conditions))
  .groupBy(evaluations.candidateId)
  .orderBy(desc(sql`avgScore`));
}

// ========== PROFESSIONALS ==========

export async function getProfessionalByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(professionals)
    .where(eq(professionals.userId, userId))
    .limit(1);
  return result[0];
}

export async function getProfessionalsByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(professionals).where(eq(professionals.type, type as any));
}

export async function createProfessional(data: InsertProfessional) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(professionals).values(data);
  return result;
}

export async function updateProfessional(userId: number, data: Partial<InsertProfessional>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(professionals).set(data).where(eq(professionals.userId, userId));
}

// ========== MESSAGES ==========

export async function getMessagesBetweenUsers(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId1), eq(messages.recipientId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.recipientId, userId1))
      )!
    )
    .orderBy(desc(messages.createdAt));
}

export async function getUserMessages(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages)
    .where(
      or(
        eq(messages.senderId, userId),
        eq(messages.recipientId, userId)
      )!
    )
    .orderBy(desc(messages.createdAt));
}

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values(data);
  return result;
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(messages)
    .set({ isRead: 1, readAt: new Date() })
    .where(eq(messages.id, id));
}

// ========== NOTIFICATIONS ==========

export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result;
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications)
    .set({ isRead: 1, readAt: new Date() })
    .where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications)
    .set({ isRead: 1, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)));
}

// ============================================================================
// VOTES HELPERS
// ============================================================================

/**
 * Create a vote for a candidate
 */
export async function createVote(vote: InsertVote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(votes).values(vote);
  return { id: Number(result.insertId), ...vote };
}

/**
 * Get all votes for a contest
 */
export async function getVotesByContest(contestId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(votes).where(eq(votes.contestId, contestId));
}

/**
 * Get votes count grouped by candidate for a contest
 */
export async function getVoteResultsByContest(contestId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select({
      candidateId: votes.candidateId,
      totalVotes: sql<number>`COUNT(*)`,
      verifiedVotes: sql<number>`SUM(CASE WHEN ${votes.isVerified} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(votes)
    .where(and(
      eq(votes.contestId, contestId),
      eq(votes.isFraudulent, 0) // Exclude fraudulent votes
    ))
    .groupBy(votes.candidateId);
  
  return results;
}

/**
 * Check if a fingerprint has already voted in a contest
 */
export async function hasVoted(contestId: number, fingerprint: string) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(votes)
    .where(and(
      eq(votes.contestId, contestId),
      eq(votes.voterFingerprint, fingerprint)
    ))
    .limit(1);
  
  return result.length > 0;
}

/**
 * Get or create a vote session
 */
export async function getOrCreateVoteSession(
  contestId: number,
  fingerprint: string,
  voterIp?: string,
  userId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Try to find existing session
  const existing = await db
    .select()
    .from(voteSessions)
    .where(and(
      eq(voteSessions.contestId, contestId),
      eq(voteSessions.sessionFingerprint, fingerprint)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new session
  const result = await db.insert(voteSessions).values({
    contestId,
    sessionFingerprint: fingerprint,
    voterIp,
    userId,
    votesCount: 0,
  });
  
  return {
    id: Number(result[0].insertId),
    contestId,
    sessionFingerprint: fingerprint,
    voterIp,
    userId,
    votesCount: 0,
    lastVoteAt: null,
    createdAt: new Date(),
  };
}

/**
 * Update vote session after a vote
 */
export async function updateVoteSession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(voteSessions)
    .set({
      votesCount: sql`${voteSessions.votesCount} + 1`,
      lastVoteAt: new Date(),
    })
    .where(eq(voteSessions.id, sessionId));
}

/**
 * Get vote statistics for admin dashboard
 */
export async function getVoteStatistics(contestId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const stats = await db
    .select({
      totalVotes: sql<number>`COUNT(*)`,
      verifiedVotes: sql<number>`SUM(CASE WHEN ${votes.isVerified} = 1 THEN 1 ELSE 0 END)`,
      fraudulentVotes: sql<number>`SUM(CASE WHEN ${votes.isFraudulent} = 1 THEN 1 ELSE 0 END)`,
      uniqueVoters: sql<number>`COUNT(DISTINCT ${votes.voterFingerprint})`,
    })
    .from(votes)
    .where(eq(votes.contestId, contestId));
  
  return stats[0] || null;
}

// Get average scores for a candidate across all jury members
export async function getCandidateAverageScores(candidateId: number, contestId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const evals = await db.select().from(evaluations)
    .where(and(
      eq(evaluations.candidateId, candidateId),
      eq(evaluations.contestId, contestId)
    ));
  
  if (evals.length === 0) return null;
  
  const totals = evals.reduce((acc, ev) => ({
    presentation: acc.presentation + (ev.presentationScore || 0),
    talent: acc.talent + (ev.talentScore || 0),
    charisma: acc.charisma + (ev.charismaScore || 0),
    communication: acc.communication + (ev.communicationScore || 0),
    overall: acc.overall + (ev.overallScore || 0),
  }), { presentation: 0, talent: 0, charisma: 0, communication: 0, overall: 0 });
  
  const count = evals.length;
  
  return {
    presentationAvg: totals.presentation / count,
    talentAvg: totals.talent / count,
    charismaAvg: totals.charisma / count,
    communicationAvg: totals.communication / count,
    overallAvg: totals.overall / count,
    juryCount: count,
  };
}


// ============================================================
// TRACKING & SOCIAL SCORING FUNCTIONS
// ============================================================

/**
 * Record a tracking event (view, click, share, qr_scan)
 */
export async function recordTrackingEvent(event: InsertTrackingEvent) {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(trackingEvents).values(event);
  
  // Update social scores
  await updateSocialScore(event.contestId, event.candidateId, event.eventType as "view" | "click" | "share" | "qr_scan");
  
  return { success: true };
}

/**
 * Update social score for a candidate
 */
async function updateSocialScore(contestId: number, candidateId: number, eventType: "view" | "click" | "share" | "qr_scan") {
  const db = await getDb();
  if (!db) return;
  
  // Check if score exists
  const existing = await db
    .select()
    .from(socialScores)
    .where(and(
      eq(socialScores.contestId, contestId),
      eq(socialScores.candidateId, candidateId)
    ))
    .limit(1);
  
  if (existing.length === 0) {
    // Create new score
    await db.insert(socialScores).values({
      contestId,
      candidateId,
      viewCount: eventType === 'view' ? 1 : 0,
      clickCount: eventType === 'click' ? 1 : 0,
      shareCount: eventType === 'share' ? 1 : 0,
      qrScanCount: eventType === 'qr_scan' ? 1 : 0,
      totalScore: calculateScore(eventType, 1),
    });
  } else {
    // Update existing score
    const score = existing[0];
    if (!score) return;
    
    const updates: any = {};
    if (eventType === 'view') updates.viewCount = (score.viewCount || 0) + 1;
    if (eventType === 'click') updates.clickCount = (score.clickCount || 0) + 1;
    if (eventType === 'share') updates.shareCount = (score.shareCount || 0) + 1;
    if (eventType === 'qr_scan') updates.qrScanCount = (score.qrScanCount || 0) + 1;
    
    updates.totalScore = calculateTotalScore({
      viewCount: score.viewCount || 0,
      clickCount: score.clickCount || 0,
      shareCount: score.shareCount || 0,
      qrScanCount: score.qrScanCount || 0,
      ...updates
    });
    
    await db
      .update(socialScores)
      .set(updates)
      .where(and(
        eq(socialScores.contestId, contestId),
        eq(socialScores.candidateId, candidateId)
      ));
  }
}

/**
 * Calculate score for a single event type
 */
function calculateScore(eventType: string, count: number): number {
  const weights = {
    view: 1,
    click: 3,
    share: 10,
    qr_scan: 5
  };
  return (weights[eventType as keyof typeof weights] || 0) * count;
}

/**
 * Calculate total weighted score
 */
function calculateTotalScore(counts: {
  viewCount: number;
  clickCount: number;
  shareCount: number;
  qrScanCount: number;
}): number {
  return (
    counts.viewCount * 1 +
    counts.clickCount * 3 +
    counts.shareCount * 10 +
    counts.qrScanCount * 5
  );
}

/**
 * Get social scores for a contest
 */
export async function getSocialScoresByContest(contestId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const scores = await db
    .select({
      candidateId: socialScores.candidateId,
      candidateName: sql`CONCAT(${candidates.firstName}, ' ', ${candidates.lastName})`.as('candidateName'),
      candidatePhoto: candidates.profilePhoto,
      candidateCategory: candidates.category,
      viewCount: socialScores.viewCount,
      clickCount: socialScores.clickCount,
      shareCount: socialScores.shareCount,
      qrScanCount: socialScores.qrScanCount,
      totalScore: socialScores.totalScore,
      isClosed: socialScores.isClosed,
      updatedAt: socialScores.updatedAt,
    })
    .from(socialScores)
    .leftJoin(candidates, eq(socialScores.candidateId, candidates.id))
    .where(eq(socialScores.contestId, contestId))
    .orderBy(desc(socialScores.totalScore));
  
  return scores;
}

/**
 * Get social score for a specific candidate
 */
export async function getSocialScoreByCandidate(contestId: number, candidateId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(socialScores)
    .where(and(
      eq(socialScores.contestId, contestId),
      eq(socialScores.candidateId, candidateId)
    ))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Close scoring for a contest (freeze scores)
 */
export async function closeSocialScoring(contestId: number) {
  const db = await getDb();
  if (!db) return { success: false };
  
  await db
    .update(socialScores)
    .set({
      isClosed: 1,
      closedAt: new Date(),
    })
    .where(eq(socialScores.contestId, contestId));
  
  return { success: true };
}

/**
 * Check for duplicate tracking event (anti-fraud)
 */
export async function isDuplicateTrackingEvent(
  fingerprint: string,
  candidateId: number,
  eventType: string,
  timeWindowMinutes: number = 5
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
  
  const existing = await db
    .select()
    .from(trackingEvents)
    .where(and(
      eq(trackingEvents.fingerprint, fingerprint),
      eq(trackingEvents.candidateId, candidateId),
      sql`${trackingEvents.eventType} = ${eventType}`,
      sql`${trackingEvents.createdAt} > ${cutoff}`
    ))
    .limit(1);
  
  return existing.length > 0;
}


// ============================================================================
// EVENT HELPERS
// ============================================================================


// ============================================================================
// EVENT PARTICIPANT HELPERS
// ============================================================================

export async function registerForEvent(participant: InsertEventParticipant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already registered
  const existing = await db.select().from(eventParticipants)
    .where(and(
      eq(eventParticipants.eventId, participant.eventId),
      eq(eventParticipants.userId, participant.userId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    return { success: false, message: "Already registered for this event" };
  }
  
  const result = await db.insert(eventParticipants).values(participant);
  return { success: true, id: Number((result as any).insertId) };
}

export async function getEventParticipants(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: eventParticipants.id,
      eventId: eventParticipants.eventId,
      userId: eventParticipants.userId,
      candidateId: eventParticipants.candidateId,
      status: eventParticipants.status,
      registeredAt: eventParticipants.registeredAt,
      confirmedAt: eventParticipants.confirmedAt,
      notes: eventParticipants.notes,
      userName: users.name,
      userEmail: users.email,
    })
    .from(eventParticipants)
    .leftJoin(users, eq(eventParticipants.userId, users.id))
    .where(eq(eventParticipants.eventId, eventId));
  
  return result;
}

export async function getUserEvents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: events.id,
      contestId: events.contestId,
      type: events.type,
      title: events.title,
      description: events.description,
      date: events.date,
      endDate: events.endDate,
      location: events.location,
      duration: events.duration,
      status: events.status,
      participantStatus: eventParticipants.status,
      registeredAt: eventParticipants.registeredAt,
      confirmedAt: eventParticipants.confirmedAt,
    })
    .from(eventParticipants)
    .innerJoin(events, eq(eventParticipants.eventId, events.id))
    .where(eq(eventParticipants.userId, userId))
    .orderBy(events.date);
  
  return result;
}

export async function updateParticipantStatus(participantId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updates: any = { status };
  if (status === "confirmed") {
    updates.confirmedAt = new Date();
  }
  
  await db.update(eventParticipants).set(updates).where(eq(eventParticipants.id, participantId));
  return { success: true };
}

export async function cancelEventRegistration(eventId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(eventParticipants)
    .where(and(
      eq(eventParticipants.eventId, eventId),
      eq(eventParticipants.userId, userId)
    ));
  
  return { success: true };
}

/**
 * Track a share event for a candidate
 */
export async function trackShare(data: {
  contestId: number;
  candidateId: number;
  platform: string;
  fingerprint: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Insert tracking event
    await db.insert(trackingEvents).values({
      contestId: data.contestId,
      candidateId: data.candidateId,
      eventType: "share",
      fingerprint: data.fingerprint,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer,
      shareUrl: data.platform,
      metadata: JSON.stringify({ platform: data.platform }),
    });

    // Update social scores
    await db
      .insert(socialScores)
      .values({
        contestId: data.contestId,
        candidateId: data.candidateId,
        shareCount: 1,
        totalScore: 5, // 5 points par partage
      })
      .onDuplicateKeyUpdate({
        set: {
          shareCount: sql`shareCount + 1`,
          totalScore: sql`totalScore + 5`,
        },
      });
  } catch (error) {
    console.error("[Database] Error tracking share:", error);
  }
}

/**
 * Get share statistics for a candidate
 */
export async function getShareStats(candidateId: number): Promise<{
  totalShares: number;
  sharesByPlatform: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) {
    return { totalShares: 0, sharesByPlatform: {} };
  }

  try {
    // Get all share events for this candidate
    const shares = await db
      .select()
      .from(trackingEvents)
      .where(
        and(
          eq(trackingEvents.candidateId, candidateId),
          eq(trackingEvents.eventType, "share")
        )
      );

    // Count by platform
    const sharesByPlatform: Record<string, number> = {};
    shares.forEach((share) => {
      try {
        const metadata = JSON.parse(share.metadata || "{}");
        const platform = metadata.platform || "unknown";
        sharesByPlatform[platform] = (sharesByPlatform[platform] || 0) + 1;
      } catch {
        sharesByPlatform["unknown"] = (sharesByPlatform["unknown"] || 0) + 1;
      }
    });

    return {
      totalShares: shares.length,
      sharesByPlatform,
    };
  } catch (error) {
    console.error("[Database] Error getting share stats:", error);
    return { totalShares: 0, sharesByPlatform: {} };
  }
}

/**
 * Get detailed analytics for a candidate
 */
export async function getDetailedAnalytics(candidateId: number, contestId: number): Promise<{
  totalShares: number;
  totalViews: number;
  totalQRScans: number;
  totalClicks: number;
  sharesByPlatform: Record<string, number>;
  sharesTimeline: Array<{ date: string; count: number }>;
  averageShares: number;
  ranking: number;
  totalCandidates: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalShares: 0,
      totalViews: 0,
      totalQRScans: 0,
      totalClicks: 0,
      sharesByPlatform: {},
      sharesTimeline: [],
      averageShares: 0,
      ranking: 0,
      totalCandidates: 0,
    };
  }

  try {
    // Get all tracking events for this candidate
    const events = await db
      .select()
      .from(trackingEvents)
      .where(
        and(
          eq(trackingEvents.candidateId, candidateId),
          eq(trackingEvents.contestId, contestId)
        )
      )
      .orderBy(trackingEvents.createdAt);

    // Count by event type
    let totalShares = 0;
    let totalViews = 0;
    let totalQRScans = 0;
    let totalClicks = 0;
    const sharesByPlatform: Record<string, number> = {};
    const sharesByDate: Record<string, number> = {};

    events.forEach((event) => {
      switch (event.eventType) {
        case "share":
          totalShares++;
          try {
            const metadata = JSON.parse(event.metadata || "{}");
            const platform = metadata.platform || "unknown";
            sharesByPlatform[platform] = (sharesByPlatform[platform] || 0) + 1;
          } catch {
            sharesByPlatform["unknown"] = (sharesByPlatform["unknown"] || 0) + 1;
          }
          
          // Group by date
          const date = new Date(event.createdAt).toISOString().split("T")[0];
          sharesByDate[date] = (sharesByDate[date] || 0) + 1;
          break;
        case "view":
          totalViews++;
          break;
        case "qr_scan":
          totalQRScans++;
          break;
        case "click":
          totalClicks++;
          break;
      }
    });

    // Convert sharesByDate to timeline array
    const sharesTimeline = Object.entries(sharesByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get all social scores for this contest to calculate average and ranking
    const allScores = await db
      .select()
      .from(socialScores)
      .where(eq(socialScores.contestId, contestId))
      .orderBy(desc(socialScores.shareCount));

    const totalCandidates = allScores.length;
    const averageShares = totalCandidates > 0
      ? allScores.reduce((sum, score) => sum + score.shareCount, 0) / totalCandidates
      : 0;

    // Find ranking
    const ranking = allScores.findIndex((score) => score.candidateId === candidateId) + 1;

    return {
      totalShares,
      totalViews,
      totalQRScans,
      totalClicks,
      sharesByPlatform,
      sharesTimeline,
      averageShares: Math.round(averageShares),
      ranking: ranking || totalCandidates + 1,
      totalCandidates,
    };
  } catch (error) {
    console.error("[Database] Error getting detailed analytics:", error);
    return {
      totalShares: 0,
      totalViews: 0,
      totalQRScans: 0,
      totalClicks: 0,
      sharesByPlatform: {},
      sharesTimeline: [],
      averageShares: 0,
      ranking: 0,
      totalCandidates: 0,
    };
  }
}

// ========== ARTICLES ==========

export async function getArticles(filters: {
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const conditions = [];
    if (filters.category) {
      conditions.push(eq(articles.category, filters.category as any));
    }
    if (filters.status) {
      conditions.push(eq(articles.status, filters.status as any));
    }
    
    const result = await db
      .select()
      .from(articles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(articles.createdAt))
      .limit(filters.limit || 100)
      .offset(filters.offset || 0);
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get articles:", error);
    return [];
  }
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get article by ID:", error);
    return null;
  }
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get article by slug:", error);
    return null;
  }
}

export async function createArticle(article: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db.insert(articles).values(article);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to create article:", error);
    throw error;
  }
}

export async function updateArticle(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.update(articles).set(data).where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to update article:", error);
    throw error;
  }
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.delete(articles).where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete article:", error);
    throw error;
  }
}

export async function incrementArticleViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.update(articles).set({ viewCount: sql`${articles.viewCount} + 1` }).where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to increment view count:", error);
  }
}

export async function incrementArticleShareCount(id: number) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.update(articles).set({ shareCount: sql`${articles.shareCount} + 1` }).where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to increment share count:", error);
  }
}

export async function incrementArticleLikeCount(id: number) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.update(articles).set({ likeCount: sql`${articles.likeCount} + 1` }).where(eq(articles.id, id));
  } catch (error) {
    console.error("[Database] Failed to increment like count:", error);
  }
}

// ==================== ARTICLES ====================

export async function getAllPublishedArticles() {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt));
    
    return result;
  } catch (error) {
    console.error("[Database] Error fetching published articles:", error);
    return [];
  }
}


// ==================== VOTES (EXTENDED) ====================

export async function getVoteByFingerprintAndCandidate(
  fingerprint: string,
  candidateId: number,
  contestId: number
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(votes)
    .where(and(
      eq(votes.voterFingerprint, fingerprint),
      eq(votes.candidateId, candidateId),
      eq(votes.contestId, contestId)
    ))
    .limit(1);

  return result[0] || null;
}

export async function getVotesCountByIpToday(ip: string, contestId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(votes)
    .where(and(
      eq(votes.voterIp, ip),
      eq(votes.contestId, contestId),
      sql`${votes.createdAt} >= ${today.toISOString()}`
    ));

  return Number(result[0]?.count) || 0;
}

export async function getVotesCountByFingerprintToday(fingerprint: string, contestId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(votes)
    .where(and(
      eq(votes.voterFingerprint, fingerprint),
      eq(votes.contestId, contestId),
      sql`${votes.createdAt} >= ${today.toISOString()}`
    ));

  return Number(result[0]?.count) || 0;
}

export async function upsertVoteSession(session: Partial<InsertVoteSession>) {
  const db = await getDb();
  if (!db) return;

  const existing = await db
    .select()
    .from(voteSessions)
    .where(and(
      eq(voteSessions.sessionFingerprint, session.sessionFingerprint!),
      eq(voteSessions.contestId, session.contestId!)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update existing session
    await db
      .update(voteSessions)
      .set({
        votesCount: sql`${voteSessions.votesCount} + 1`,
        lastVoteAt: new Date(),
      })
      .where(eq(voteSessions.id, existing[0].id));
  } else {
    // Create new session
    await db.insert(voteSessions).values({
      contestId: session.contestId!,
      sessionFingerprint: session.sessionFingerprint!,
      voterIp: session.voterIp || null,
      userId: session.userId || null,
      votesCount: 1,
      lastVoteAt: new Date(),
    });
  }
}

export async function incrementCandidateVoteCount(candidateId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(candidates)
    .set({ voteCount: sql`${candidates.voteCount} + 1` })
    .where(eq(candidates.id, candidateId));
}

export async function getCandidateVoteStats(candidateId: number, contestId: number) {
  const db = await getDb();
  if (!db) return { totalVotes: 0, verifiedVotes: 0, todayVotes: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [stats] = await db
    .select({
      totalVotes: sql<number>`COUNT(*)`,
      verifiedVotes: sql<number>`SUM(CASE WHEN ${votes.isVerified} = 1 THEN 1 ELSE 0 END)`,
      todayVotes: sql<number>`SUM(CASE WHEN ${votes.createdAt} >= ${today.toISOString()} THEN 1 ELSE 0 END)`,
    })
    .from(votes)
    .where(and(
      eq(votes.candidateId, candidateId),
      eq(votes.contestId, contestId)
    ));

  return {
    totalVotes: Number(stats?.totalVotes) || 0,
    verifiedVotes: Number(stats?.verifiedVotes) || 0,
    todayVotes: Number(stats?.todayVotes) || 0,
  };
}

export async function getAllCandidatesVoteStats(contestId: number) {
  const db = await getDb();
  if (!db) return [];

  const stats = await db
    .select({
      candidateId: votes.candidateId,
      totalVotes: sql<number>`COUNT(*)`,
      verifiedVotes: sql<number>`SUM(CASE WHEN ${votes.isVerified} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(votes)
    .where(eq(votes.contestId, contestId))
    .groupBy(votes.candidateId);

  return stats.map((s) => ({
    candidateId: s.candidateId,
    totalVotes: Number(s.totalVotes) || 0,
    verifiedVotes: Number(s.verifiedVotes) || 0,
  }));
}

export async function getVoteLeaderboard(contestId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const leaderboard = await db
    .select({
      candidateId: candidates.id,
      candidateName: sql<string>`CONCAT(${candidates.firstName}, ' ', ${candidates.lastName})`,
      category: candidates.category,
      photoUrl: candidates.profilePhoto,
      voteCount: sql<number>`COUNT(${votes.id})`,
    })
    .from(candidates)
    .leftJoin(votes, eq(votes.candidateId, candidates.id))
    .where(eq(candidates.contestId, contestId))
    .groupBy(candidates.id)
    .orderBy(desc(sql`COUNT(${votes.id})`))
    .limit(limit);

  return leaderboard;
}

export async function getRecentVotes(contestId: number, limit: number = 50, candidateId?: number) {
  const db = await getDb();
  if (!db) return [];

  let whereConditions = [eq(votes.contestId, contestId)];
  if (candidateId) {
    whereConditions.push(eq(votes.candidateId, candidateId));
  }

  const recentVotes = await db
    .select()
    .from(votes)
    .where(and(...whereConditions))
    .orderBy(desc(votes.createdAt))
    .limit(limit);

  return recentVotes;
}

export async function getVoteTimeline(contestId: number, days: number = 7, candidateId?: number) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let whereConditions = [
    eq(votes.contestId, contestId),
    sql`${votes.createdAt} >= ${startDate.toISOString()}`
  ];
  
  if (candidateId) {
    whereConditions.push(eq(votes.candidateId, candidateId));
  }

  const timeline = await db
    .select({
      date: sql<string>`DATE(${votes.createdAt})`,
      voteCount: sql<number>`COUNT(*)`,
    })
    .from(votes)
    .where(and(...whereConditions))
    .groupBy(sql`DATE(${votes.createdAt})`)
    .orderBy(sql`DATE(${votes.createdAt}) ASC`);

  return timeline;
}

// ============================================
// CANDIDATE ANALYTICS FUNCTIONS
// ============================================

/**
 * Hash IP address for privacy-preserving tracking
 */
export function hashIpAddress(ip: string): string {
  return crypto.createHash("sha256").update(ip + ENV.cookieSecret).digest("hex");
}

/**
 * Get or create analytics record for a candidate
 */
export async function getOrCreateCandidateAnalytics(candidateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(candidateAnalytics).where(eq(candidateAnalytics.candidateId, candidateId)).limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }

  // Create new analytics record
  await db.insert(candidateAnalytics).values({
    candidateId,
    shareClicksTotal: 0,
    uniqueShareClicks: 0,
    shareClicksToday: 0,
    profileViews: 0,
    uniqueProfileViews: 0,
    profileViewsToday: 0,
    lastResetDate: new Date(),
  });

  const newRecord = await db.select().from(candidateAnalytics).where(eq(candidateAnalytics.candidateId, candidateId)).limit(1);
  return newRecord[0];
}

/**
 * Check if IP can perform action (rate limiting: 1 action per 10 minutes)
 */
export async function canPerformAction(ipAddress: string, candidateId: number, actionType: "share" | "view"): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const ipHash = hashIpAddress(ipAddress);
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const recentAction = await db
    .select()
    .from(ipTracking)
    .where(
      and(
        eq(ipTracking.ipHash, ipHash),
        eq(ipTracking.candidateId, candidateId),
        eq(ipTracking.actionType, actionType),
        gte(ipTracking.lastActionAt, tenMinutesAgo)
      )
    )
    .limit(1);

  return recentAction.length === 0;
}

/**
 * Record IP action (share or view)
 */
export async function recordIpAction(ipAddress: string, candidateId: number, actionType: "share" | "view"): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const ipHash = hashIpAddress(ipAddress);

  // Check if this IP has ever performed this action for this candidate
  const existingAction = await db
    .select()
    .from(ipTracking)
    .where(
      and(
        eq(ipTracking.ipHash, ipHash),
        eq(ipTracking.candidateId, candidateId),
        eq(ipTracking.actionType, actionType)
      )
    )
    .limit(1);

  if (existingAction.length > 0) {
    // Update existing record
    await db
      .update(ipTracking)
      .set({ lastActionAt: new Date() })
      .where(eq(ipTracking.id, existingAction[0].id));
  } else {
    // Insert new record
    await db.insert(ipTracking).values({
      ipHash,
      candidateId,
      actionType,
      lastActionAt: new Date(),
    });
  }
}

/**
 * Check if IP is unique for this candidate and action type
 */
export async function isUniqueIpForAction(ipAddress: string, candidateId: number, actionType: "share" | "view"): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const ipHash = hashIpAddress(ipAddress);

  const existing = await db
    .select()
    .from(ipTracking)
    .where(
      and(
        eq(ipTracking.ipHash, ipHash),
        eq(ipTracking.candidateId, candidateId),
        eq(ipTracking.actionType, actionType)
      )
    )
    .limit(1);

  return existing.length === 0;
}

/**
 * Track share click with rate limiting
 */
export async function trackShareClick(candidateId: number, ipAddress: string): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "Database not available" };

  // Check rate limit
  const canClick = await canPerformAction(ipAddress, candidateId, "share");
  if (!canClick) {
    return { success: false, message: "Please wait 10 minutes before sharing again" };
  }

  // Check if daily reset is needed
  await resetDailyAnalyticsIfNeeded(candidateId);

  // Get analytics
  const analytics = await getOrCreateCandidateAnalytics(candidateId);

  // Check if unique IP
  const isUnique = await isUniqueIpForAction(ipAddress, candidateId, "share");

  // Update analytics
  if (isUnique) {
    await db
      .update(candidateAnalytics)
      .set({
        shareClicksTotal: sql`${candidateAnalytics.shareClicksTotal} + 1`,
        uniqueShareClicks: sql`${candidateAnalytics.uniqueShareClicks} + 1`,
        shareClicksToday: sql`${candidateAnalytics.shareClicksToday} + 1`,
      })
      .where(eq(candidateAnalytics.candidateId, candidateId));
  } else {
    await db
      .update(candidateAnalytics)
      .set({
        shareClicksTotal: sql`${candidateAnalytics.shareClicksTotal} + 1`,
        shareClicksToday: sql`${candidateAnalytics.shareClicksToday} + 1`,
      })
      .where(eq(candidateAnalytics.candidateId, candidateId));
  }

  // Record IP action
  await recordIpAction(ipAddress, candidateId, "share");

  return { success: true, message: "Share tracked successfully" };
}

/**
 * Track profile view with rate limiting
 */
export async function trackProfileView(candidateId: number, ipAddress: string): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "Database not available" };

  // Check rate limit
  const canView = await canPerformAction(ipAddress, candidateId, "view");
  if (!canView) {
    return { success: false, message: "View already counted recently" };
  }

  // Check if daily reset is needed
  await resetDailyAnalyticsIfNeeded(candidateId);

  // Get analytics
  const analytics = await getOrCreateCandidateAnalytics(candidateId);

  // Check if unique IP
  const isUnique = await isUniqueIpForAction(ipAddress, candidateId, "view");

  // Update analytics
  if (isUnique) {
    await db
      .update(candidateAnalytics)
      .set({
        profileViews: sql`${candidateAnalytics.profileViews} + 1`,
        uniqueProfileViews: sql`${candidateAnalytics.uniqueProfileViews} + 1`,
        profileViewsToday: sql`${candidateAnalytics.profileViewsToday} + 1`,
      })
      .where(eq(candidateAnalytics.candidateId, candidateId));
  } else {
    await db
      .update(candidateAnalytics)
      .set({
        profileViews: sql`${candidateAnalytics.profileViews} + 1`,
        profileViewsToday: sql`${candidateAnalytics.profileViewsToday} + 1`,
      })
      .where(eq(candidateAnalytics.candidateId, candidateId));
  }

  // Record IP action
  await recordIpAction(ipAddress, candidateId, "view");

  return { success: true, message: "View tracked successfully" };
}

/**
 * Reset daily analytics if last reset was yesterday or earlier
 */
export async function resetDailyAnalyticsIfNeeded(candidateId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const analytics = await getOrCreateCandidateAnalytics(candidateId);

  const now = new Date();
  const lastReset = new Date(analytics.lastResetDate);

  // Check if last reset was on a different day
  const needsReset = 
    lastReset.getDate() !== now.getDate() ||
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getFullYear() !== now.getFullYear();

  if (needsReset) {
    await db
      .update(candidateAnalytics)
      .set({
        shareClicksToday: 0,
        profileViewsToday: 0,
        lastResetDate: now,
      })
      .where(eq(candidateAnalytics.candidateId, candidateId));
  }
}

/**
 * Get candidate analytics by ID
 */
export async function getCandidateAnalytics(candidateId: number) {
  const db = await getDb();
  if (!db) return null;

  // Ensure analytics exist and are up to date
  await resetDailyAnalyticsIfNeeded(candidateId);
  
  return await getOrCreateCandidateAnalytics(candidateId);
}

/**
 * Get analytics for multiple candidates
 */
export async function getBulkCandidateAnalytics(candidateIds: number[]) {
  const db = await getDb();
  if (!db) return [];

  if (candidateIds.length === 0) return [];

  // Ensure all candidates have analytics records
  for (const candidateId of candidateIds) {
    await getOrCreateCandidateAnalytics(candidateId);
    await resetDailyAnalyticsIfNeeded(candidateId);
  }

  return await db
    .select()
    .from(candidateAnalytics)
    .where(sql`${candidateAnalytics.candidateId} IN (${sql.join(candidateIds.map(id => sql`${id}`), sql`, `)})`);
}


// ============================================
// GLOBAL BAROMETER FUNCTIONS
// ============================================

/**
 * Calculate global social barometer metrics for the entire event
 */
export async function getGlobalBarometer() {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Get all analytics records
  const allAnalytics = await db.select().from(candidateAnalytics);

  // Calculate total interactions today
  const interactionsToday = allAnalytics.reduce((sum, a) => 
    sum + (a.shareClicksToday || 0) + (a.profileViewsToday || 0), 0
  );

  // Get IP tracking for last 60 minutes (shares)
  const sharesLast60Min = await db
    .select()
    .from(ipTracking)
    .where(
      and(
        eq(ipTracking.actionType, "share"),
        gte(ipTracking.lastActionAt, oneHourAgo)
      )
    );

  // Get IP tracking for last 24 hours (shares)
  const sharesLast24H = await db
    .select()
    .from(ipTracking)
    .where(
      and(
        eq(ipTracking.actionType, "share"),
        gte(ipTracking.lastActionAt, twentyFourHoursAgo)
      )
    );

  // Get IP tracking for 24-48 hours ago (shares) for trend calculation
  const sharesPrevious24H = await db
    .select()
    .from(ipTracking)
    .where(
      and(
        eq(ipTracking.actionType, "share"),
        gte(ipTracking.lastActionAt, fortyEightHoursAgo),
        lt(ipTracking.lastActionAt, twentyFourHoursAgo)
      )
    );

  // Get IP tracking for last 60 minutes (views)
  const viewsLast60Min = await db
    .select()
    .from(ipTracking)
    .where(
      and(
        eq(ipTracking.actionType, "view"),
        gte(ipTracking.lastActionAt, oneHourAgo)
      )
    );

  // Calculate trend (percentage change from previous 24h to current 24h)
  const currentShares = sharesLast24H.length;
  const previousShares = sharesPrevious24H.length;
  const trend24h = previousShares > 0 
    ? ((currentShares - previousShares) / previousShares) * 100 
    : currentShares > 0 ? 100 : 0;

  // Calculate intensity score (0-100)
  // Formula: weighted combination of recent activity
  const maxExpectedSharesPerHour = 50; // Adjust based on event size
  const maxExpectedViewsPerHour = 200;
  
  const shareIntensity = Math.min((sharesLast60Min.length / maxExpectedSharesPerHour) * 100, 100);
  const viewIntensity = Math.min((viewsLast60Min.length / maxExpectedViewsPerHour) * 100, 100);
  
  // Weighted average: shares 60%, views 40%
  const intensity = Math.round(shareIntensity * 0.6 + viewIntensity * 0.4);

  return {
    intensity, // 0-100
    sharesLast60Min: sharesLast60Min.length,
    sharesLast24H: sharesLast24H.length,
    viewsLast60Min: viewsLast60Min.length,
    trend24h: Math.round(trend24h * 10) / 10, // Round to 1 decimal
    interactionsToday,
    timestamp: now,
  };
}


/**
 * Calculate influence index for a candidate (0-1000)
 * Formula: weighted combination of engagement metrics with logarithmic normalization
 * - unique_share_clicks: 40%
 * - unique_profile_views: 30%
 * - shares_24h: 20%
 * - velocity (growth rate): 10%
 */
export async function calculateInfluenceIndex(candidateId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const analytics = await getCandidateAnalytics(candidateId);
  if (!analytics) return 0;

  // Get historical data for velocity calculation (compare with yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Weights
  const WEIGHT_UNIQUE_SHARES = 0.4;
  const WEIGHT_UNIQUE_VIEWS = 0.3;
  const WEIGHT_SHARES_24H = 0.2;
  const WEIGHT_VELOCITY = 0.1;

  // Normalize metrics using logarithmic scale
  // This prevents outliers from dominating and creates a more balanced distribution
  const normalizeLog = (value: number, max: number): number => {
    if (value === 0) return 0;
    if (max === 0) return 0;
    // Logarithmic normalization: log(1 + value) / log(1 + max)
    return Math.log(1 + value) / Math.log(1 + max);
  };

  // Expected maximum values for normalization (adjust based on event size)
  const MAX_UNIQUE_SHARES = 500;
  const MAX_UNIQUE_VIEWS = 2000;
  const MAX_SHARES_24H = 200;
  const MAX_VELOCITY = 50; // Max daily growth

  // Calculate normalized scores (0-1)
  const shareScore = normalizeLog(analytics.uniqueShareClicks, MAX_UNIQUE_SHARES);
  const viewScore = normalizeLog(analytics.uniqueProfileViews, MAX_UNIQUE_VIEWS);
  const shares24hScore = normalizeLog(analytics.shareClicksToday, MAX_SHARES_24H);

  // Calculate velocity (growth rate)
  // Velocity = (today's activity) / (total activity) * 100
  const totalActivity = analytics.shareClicksTotal + analytics.profileViews;
  const todayActivity = analytics.shareClicksToday + analytics.profileViewsToday;
  const velocityRaw = totalActivity > 0 ? (todayActivity / totalActivity) * 100 : 0;
  const velocityScore = normalizeLog(velocityRaw, MAX_VELOCITY);

  // Calculate weighted influence index (0-1)
  const influenceNormalized = 
    shareScore * WEIGHT_UNIQUE_SHARES +
    viewScore * WEIGHT_UNIQUE_VIEWS +
    shares24hScore * WEIGHT_SHARES_24H +
    velocityScore * WEIGHT_VELOCITY;

  // Scale to 0-1000
  const influenceIndex = Math.round(influenceNormalized * 1000);

  return Math.min(influenceIndex, 1000); // Cap at 1000
}

/**
 * Update influence index for a candidate
 */
export async function updateInfluenceIndex(candidateId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const analytics = await getCandidateAnalytics(candidateId);
  if (!analytics) return;

  const previousIndex = analytics.influenceIndex;
  const newIndex = await calculateInfluenceIndex(candidateId);
  const trend = newIndex - previousIndex;

  await db
    .update(candidateAnalytics)
    .set({
      influenceIndex: newIndex,
      influenceTrend: trend,
    })
    .where(eq(candidateAnalytics.candidateId, candidateId));
}

/**
 * Update influence index for all candidates
 */
export async function updateAllInfluenceIndexes(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const allAnalytics = await db.select().from(candidateAnalytics);

  for (const analytics of allAnalytics) {
    await updateInfluenceIndex(analytics.candidateId);
  }
}


// ============================================
// HEATMAP ENGAGEMENT FUNCTIONS
// ============================================

/**
 * Get heatmap data for engagement tracking (7 days × 24 hours)
 * Returns aggregated event counts grouped by day of week and hour
 */
export async function getHeatmapData(params: {
  startDate: Date;
  endDate: Date;
  eventType?: "view" | "click" | "share" | "qr_scan" | "all";
  candidateId?: number;
  contestId?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const { startDate, endDate, eventType, candidateId, contestId = 1 } = params;

  // Build where conditions
  const conditions = [
    gte(trackingEvents.createdAt, startDate),
    lte(trackingEvents.createdAt, endDate),
    eq(trackingEvents.contestId, contestId),
  ];

  if (eventType && eventType !== "all") {
    conditions.push(eq(trackingEvents.eventType, eventType));
  }

  if (candidateId) {
    conditions.push(eq(trackingEvents.candidateId, candidateId));
  }

  // Fetch raw events
  const events = await db
    .select()
    .from(trackingEvents)
    .where(and(...conditions));

  // Aggregate by day of week (0-6) and hour (0-23)
  const heatmapGrid: Record<string, number> = {};

  for (const event of events) {
    const eventDate = new Date(event.createdAt);
    const dayOfWeek = eventDate.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = eventDate.getHours(); // 0-23

    const key = `${dayOfWeek}-${hour}`;
    heatmapGrid[key] = (heatmapGrid[key] || 0) + 1;
  }

  // Convert to array format for frontend
  const heatmapData: Array<{
    day: number;
    dayName: string;
    hour: number;
    count: number;
  }> = [];

  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      heatmapData.push({
        day,
        dayName: dayNames[day],
        hour,
        count: heatmapGrid[key] || 0,
      });
    }
  }

  return heatmapData;
}

/**
 * Export heatmap data to CSV format
 */
export async function exportHeatmapToCSV(params: {
  startDate: Date;
  endDate: Date;
  eventType?: "view" | "click" | "share" | "qr_scan" | "all";
  candidateId?: number;
  contestId?: number;
}): Promise<string> {
  const data = await getHeatmapData(params);

  // CSV header
  let csv = "Jour,Heure,Nombre d'événements\n";

  // CSV rows
  for (const row of data) {
    csv += `${row.dayName},${row.hour}h,${row.count}\n`;
  }

  return csv;
}

/**
 * Export heatmap data to JSON format
 */
export async function exportHeatmapToJSON(params: {
  startDate: Date;
  endDate: Date;
  eventType?: "view" | "click" | "share" | "qr_scan" | "all";
  candidateId?: number;
  contestId?: number;
}): Promise<string> {
  const data = await getHeatmapData(params);

  return JSON.stringify({
    metadata: {
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
      eventType: params.eventType || "all",
      candidateId: params.candidateId || null,
      contestId: params.contestId || 1,
      generatedAt: new Date().toISOString(),
    },
    data,
  }, null, 2);
}

/**
 * Get summary statistics for heatmap
 */
export async function getHeatmapSummary(params: {
  startDate: Date;
  endDate: Date;
  eventType?: "view" | "click" | "share" | "qr_scan" | "all";
  candidateId?: number;
  contestId?: number;
}) {
  const data = await getHeatmapData(params);

  const totalEvents = data.reduce((sum, row) => sum + row.count, 0);
  const avgEventsPerCell = totalEvents / (7 * 24);
  
  // Find peak hour
  const peakCell = data.reduce((max, row) => row.count > max.count ? row : max, data[0]);
  
  // Find quietest hour
  const quietestCell = data.reduce((min, row) => row.count < min.count ? row : min, data[0]);

  return {
    totalEvents,
    avgEventsPerCell: Math.round(avgEventsPerCell * 10) / 10,
    peakHour: {
      day: peakCell.dayName,
      hour: `${peakCell.hour}h`,
      count: peakCell.count,
    },
    quietestHour: {
      day: quietestCell.dayName,
      hour: `${quietestCell.hour}h`,
      count: quietestCell.count,
    },
  };
}


// ============================================
// MEDIA JOBS & KNOWLEDGE GARDEN FUNCTIONS
// ============================================

/**
 * Create a new media job for video generation
 */
export async function createMediaJob(data: {
  candidateId: number;
  kind: string; // Required: intro_video, candidate_video, teaser, banner, voiceover
  contestId?: number;
  provider?: string;
  format?: string;
  durationSeconds?: number;
  videoType?: string;
  missionPackJson?: string;
  idempotencyKey?: string;
  requestedBy: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(mediaJobs).values({
    candidateId: data.candidateId,
    kind: data.kind,
    contestId: data.contestId || 1,
    provider: data.provider || "flowithOS",
    format: data.format,
    durationSeconds: data.durationSeconds,
    videoType: data.videoType,
    missionPackJson: data.missionPackJson,
    idempotencyKey: data.idempotencyKey,
    requestedBy: data.requestedBy,
    status: "pending",
  });

  return result.insertId;
}

/**
 * Get media job by ID
 */
export async function getMediaJobById(jobId: number) {
  const db = await getDb();
  if (!db) return null;

  const [job] = await db.select().from(mediaJobs).where(eq(mediaJobs.id, jobId));
  return job || null;
}

/**
 * Get all media jobs for a candidate
 */
export async function getMediaJobsByCandidate(candidateId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mediaJobs)
    .where(eq(mediaJobs.candidateId, candidateId))
    .orderBy(desc(mediaJobs.createdAt));
}

/**
 * Update media job status and results
 */
export async function updateMediaJob(jobId: number, data: {
  status?: "pending" | "ready" | "running" | "done" | "failed" | "needs_approval";
  outputUrl?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  logsJson?: string;
  logs?: string; // Deprecated, use logsJson
  errorMessage?: string;
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
}) {
  const db = await getDb();
  if (!db) return false;

  await db.update(mediaJobs).set(data).where(eq(mediaJobs.id, jobId));
  return true;
}

/**
 * Get all knowledge garden documents
 */
export async function getKnowledgeGardenDocs(filter?: {
  docType?: string;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filter?.docType) {
    conditions.push(eq(knowledgeGarden.docType, filter.docType as any));
  }
  if (filter?.isActive !== undefined) {
    conditions.push(eq(knowledgeGarden.isActive, filter.isActive ? 1 : 0));
  }

  if (conditions.length > 0) {
    return await db
      .select()
      .from(knowledgeGarden)
      .where(and(...conditions))
      .orderBy(desc(knowledgeGarden.createdAt));
  }

  return await db.select().from(knowledgeGarden).orderBy(desc(knowledgeGarden.createdAt));
}

/**
 * Get knowledge garden document by slug
 */
export async function getKnowledgeGardenDocBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const [doc] = await db.select().from(knowledgeGarden).where(eq(knowledgeGarden.slug, slug));
  return doc || null;
}

/**
 * Generate Mission Pack JSON for FlowithOS
 */
export async function generateMissionPack(params: {
  candidateId: number;
  format: string;
  durationSeconds: number;
  videoType: string;
}) {
  const db = await getDb();
  if (!db) return null;

  // Get candidate data
  const [candidate] = await db.select().from(candidates).where(eq(candidates.id, params.candidateId));
  if (!candidate) return null;

  // Get knowledge garden references
  const brandStyle = await getKnowledgeGardenDocBySlug("brand-style-lock-2026");
  const videoTemplate = await getKnowledgeGardenDocBySlug("video-template-candidate-profile");
  const executionProtocol = await getKnowledgeGardenDocBySlug("execution-protocol-flowithos");

  // Generate mission pack
  const missionPack = {
    mission_id: `mission_${Date.now()}_${params.candidateId}`,
    version: "1.0.0",
    created_at: new Date().toISOString(),
    
    candidate: {
      id: candidate.id,
      name: `${candidate.firstName} ${candidate.lastName}`,
      category: candidate.category,
      age: null, // Calculate from dateOfBirth if needed
      city: candidate.city,
      profession: null, // Not in schema
      bio: candidate.bio,
      photo_url: candidate.profilePhoto || null,
      achievements: candidate.experience || null,
    },
    
    video_config: {
      format: params.format,
      duration_seconds: params.durationSeconds,
      video_type: params.videoType,
      resolution: "1080p",
      codec: "H.264",
      frame_rate: 30,
    },
    
    knowledge_refs: [
      {
        slug: "brand-style-lock-2026",
        title: brandStyle?.title || "Brand Style Lock",
        type: "brand_style",
      },
      {
        slug: "video-template-candidate-profile",
        title: videoTemplate?.title || "Video Structure Template",
        type: "video_template",
      },
      {
        slug: "execution-protocol-flowithos",
        title: executionProtocol?.title || "Execution Protocol",
        type: "execution_protocol",
      },
    ],
    
    steps: [
      {
        step: 1,
        action: "gather_assets",
        description: "Collect candidate photos, bio, and achievements",
        inputs: {
          photo_url: candidate.profilePhoto || null,
          bio: candidate.bio,
          achievements: candidate.experience || null,
        },
      },
      {
        step: 2,
        action: "generate_script",
        description: "Create 30s narrative following brand voice",
        inputs: {
          candidate_name: `${candidate.firstName} ${candidate.lastName}`,
          category: candidate.category,
          tone: "elegant, inspiring, authentic",
          language: "French",
        },
      },
      {
        step: 3,
        action: "select_music",
        description: "Choose orchestral track from licensed library",
        inputs: {
          genre: "orchestral",
          mood: "uplifting, cinematic",
          duration: params.durationSeconds,
        },
      },
      {
        step: 4,
        action: "assemble_timeline",
        description: "Arrange clips following template structure",
        inputs: {
          template: "candidate_profile",
          duration: params.durationSeconds,
          format: params.format,
        },
      },
      {
        step: 5,
        action: "add_graphics",
        description: "Apply lower thirds, text overlays, logo",
        inputs: {
          logo_url: "https://files.manuscdn.com/user_upload_by_module/session_file/87304619/GRnxeynZwidOueul.png",
          brand_colors: {
            primary_gold: "#C8A45C",
            secondary_gold: "#D4AF37",
          },
          typography: "Playfair Display",
        },
      },
      {
        step: 6,
        action: "color_grade",
        description: "Apply warm, elegant color correction",
        inputs: {
          style: "warm tones, slightly desaturated",
          lut: "cinematic_warm",
        },
      },
      {
        step: 7,
        action: "audio_mix",
        description: "Balance music, voiceover, sound effects",
        inputs: {
          music_volume: 0.7,
          voiceover_volume: 1.0,
          normalization: "-14 LUFS",
        },
      },
      {
        step: 8,
        action: "export",
        description: "Render in specified format",
        inputs: {
          format: params.format,
          resolution: "1080p",
          codec: "H.264",
          bitrate: "8000k",
        },
      },
      {
        step: 9,
        action: "upload",
        description: "Send to secure storage, return URL via webhook",
        inputs: {
          storage: "s3",
          webhook_url: `${process.env.VITE_FRONTEND_FORGE_API_URL || "https://api.manus.im"}/api/flowithos/callback`,
        },
      },
    ],
    
    quality_checklist: [
      "Logo visible and correctly positioned",
      "Brand colors used consistently",
      "Typography matches guidelines (Playfair Display)",
      "Music volume balanced (not overpowering)",
      "Transitions smooth and elegant",
      "Text readable on all backgrounds",
      "Duration within ±2 seconds of target",
      "No visual artifacts or glitches",
      "Audio levels normalized (-14 LUFS)",
      "Captions accurate and synced",
    ],
  };

  return missionPack;
}


// ========== ASSETS ==========

export async function createAsset(data: {
  type: string;
  url: string;
  sha256: string;
  tags: string[];
  candidateId?: number;
  mediaJobId?: number;
  uploadedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(assets).values({
    type: data.type,
    url: data.url,
    sha256: data.sha256,
    tags: JSON.stringify(data.tags),
    candidateId: data.candidateId,
    mediaJobId: data.mediaJobId,
    uploadedBy: data.uploadedBy || 1, // Default to admin user
  });
  // @ts-ignore - insertId exists on MySQL result
  return { id: Number(result.insertId), ...data };
}

export async function getAssetById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const results = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  return results[0] || null;
}

export async function getAssetsByCandidate(candidateId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(assets).where(eq(assets.candidateId, candidateId));
}

export async function getAssetsByMediaJob(mediaJobId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(assets).where(eq(assets.mediaJobId, mediaJobId));
}


// ========== INVITATIONS ==========

export async function createInvitation(data: {
  role: string;
  email: string;
  expiresAt?: Date;
  maxUses?: number;
  createdBy: number;
  permissionOverrides?: string;
  token?: string; // Optionnel pour les tests
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate secure token (UUID v4) ou utiliser token fourni
  const token = data.token || crypto.randomUUID();

  const result = await db.insert(invitations).values({
    role: data.role as any,
    email: data.email,
    token,
    expiresAt: data.expiresAt,
    maxUses: data.maxUses || 1,
    usedCount: 0,
    isActive: 1,
    createdBy: data.createdBy,
    permissionOverrides: data.permissionOverrides || null,
  });

  // @ts-ignore - insertId exists on MySQL result
  const id = Number(result.insertId);
  
  // Retourner l'objet complet avec tous les champs
  return {
    id,
    token,
    role: data.role,
    email: data.email,
    expiresAt: data.expiresAt || null,
    maxUses: data.maxUses || 1,
    usedCount: 0,
    isActive: true,
    createdBy: data.createdBy,
    permissionOverrides: data.permissionOverrides || null,
    candidateApplicationId: null,
    createdAt: new Date(),
  };
}

export async function getInvitationByToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const results = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1);
  return results[0] || null;
}

export async function incrementInvitationUsedCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(invitations)
    .set({ usedCount: sql`${invitations.usedCount} + 1` })
    .where(eq(invitations.id, id));
}

export async function deactivateInvitation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(invitations)
    .set({ isActive: 0 })
    .where(eq(invitations.id, id));
}

export async function getAllInvitations() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(invitations).orderBy(desc(invitations.createdAt));
}

export async function getActiveInvitations() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(invitations)
    .where(eq(invitations.isActive, 1))
    .orderBy(desc(invitations.createdAt));
}

// ========== USER PERMISSIONS ==========

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPermissionOverrides(userId: number, data: { role?: string; permissionOverrides?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {};
  if (data.role !== undefined) updateData.role = data.role;
  if (data.permissionOverrides !== undefined) updateData.permissionOverrides = data.permissionOverrides;
  
  await db.update(users).set(updateData).where(eq(users.id, userId));
  
  return { success: true };
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(users).orderBy(desc(users.createdAt));
}


// ========== PHOTOS ==========

export async function createPhoto(data: {
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  category: "portrait" | "event" | "backstage" | "performance" | "other";
  tags?: string[];
  candidateId?: number;
  uploadedBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(photos).values({
    ...data,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    status: "pending",
  });

  return result;
}

export async function getPhotos(filters?: {
  category?: string;
  status?: string;
  candidateId?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.category) {
    conditions.push(eq(photos.category, filters.category as any));
  }
  if (filters?.status) {
    conditions.push(eq(photos.status, filters.status as any));
  }
  if (filters?.candidateId) {
    conditions.push(eq(photos.candidateId, filters.candidateId));
  }

  const query = conditions.length > 0
    ? db.select().from(photos).where(and(...conditions))
    : db.select().from(photos);

  const results = await query.orderBy(desc(photos.createdAt));

  // Parse tags JSON (handle non-JSON values gracefully)
  return results.map((photo) => {
    let parsedTags: string[] = [];
    if (photo.tags) {
      try {
        const parsed = JSON.parse(photo.tags);
        parsedTags = Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        // Handle non-JSON tags like "[studio]" → extract as plain strings
        const cleaned = photo.tags.replace(/^\[|\]$/g, '').trim();
        parsedTags = cleaned ? cleaned.split(',').map((t: string) => t.trim()) : [];
      }
    }
    return { ...photo, tags: parsedTags };
  });
}

export async function getPhotoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
  
  if (result.length === 0) return undefined;

  const photo = result[0];
  let parsedTags: string[] = [];
  if (photo.tags) {
    try {
      const parsed = JSON.parse(photo.tags);
      parsedTags = Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      const cleaned = photo.tags.replace(/^\[|\]$/g, '').trim();
      parsedTags = cleaned ? cleaned.split(',').map((t: string) => t.trim()) : [];
    }
  }
  return { ...photo, tags: parsedTags };
}

export async function updatePhotoStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  approvedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(photos)
    .set({
      status,
      approvedBy,
      approvedAt: new Date(),
    })
    .where(eq(photos.id, id));

  return { success: true };
}

export async function deletePhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(photos).where(eq(photos.id, id));

  return { success: true };
}

export async function getPhotosByCandidate(candidateId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(photos)
    .where(eq(photos.candidateId, candidateId))
    .orderBy(desc(photos.createdAt));

  return results.map((photo) => ({
    ...photo,
    tags: photo.tags ? JSON.parse(photo.tags) : [],
  }));
}


// ========== CANDIDATE APPLICATIONS (ONBOARDING) ==========

export async function createCandidateApplication(data: {
  invitationToken?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  address?: string;
  city: string;
  postalCode?: string;
  country?: string;
  region?: string;
  category: string;
  photoProfile?: string;
  photoFullBody?: string;
  videoPresentation?: string;
  bio: string;
  motivation?: string;
  interests?: string;
  profession?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  acceptedTerms: boolean;
  acceptedMedia?: boolean;
  acceptedNewsletter?: boolean;
  ipAddress?: string;
  contestId?: number;
  status?: "pending" | "approved" | "rejected";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Hasher l'IP pour RGPD
  let ipAddressHash: string | undefined;
  if (data.ipAddress) {
    ipAddressHash = crypto.createHash("sha256").update(data.ipAddress).digest("hex");
  }

  const result = await (db.insert(candidateApplications) as any).values({
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    dateOfBirth: data.dateOfBirth,
    city: data.city,
    country: data.country || "Belgique",
    region: data.region,
    category: data.category,
    profilePhoto: data.photoProfile,
    galleryPhotos: data.photoFullBody,
    videoPresentation: data.videoPresentation,
    bio: data.bio,
    motivation: data.motivation,
    interests: data.interests,
    profession: data.profession,
    instagram: data.instagram,
    facebook: data.facebook,
    tiktok: data.tiktok,
    linkedin: data.linkedin,
    acceptedTerms: data.acceptedTerms ? 1 : 0,
    acceptedMedia: data.acceptedMedia ? 1 : 0,
    acceptedNewsletter: data.acceptedNewsletter ? 1 : 0,
    ipAddressHash: ipAddressHash,
    contestId: data.contestId || 1,
    status: data.status || "pending",
  });

  // @ts-ignore - insertId exists on MySQL result
  const applicationId = Number(result[0].insertId);

  // Lier l'invitation à la candidature si token fourni
  if (data.invitationToken) {
    const invitation = await getInvitationByToken(data.invitationToken);
    if (invitation) {
      await linkInvitationToApplication(invitation.id, applicationId);
    }
  }

  // Retourner l'objet complet depuis la DB
  const application = await getCandidateApplicationById(applicationId);
  if (!application) {
    throw new Error("Failed to retrieve created application");
  }
  
  return application;
}

export async function getCandidateApplicationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(candidateApplications)
    .where(eq(candidateApplications.id, id))
    .limit(1);

  return results[0] || null;
}

export async function getAllCandidateApplications(contestId?: number) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(candidateApplications);

  if (contestId) {
    query = query.where(eq(candidateApplications.contestId, contestId)) as any;
  }

  const results = await query.orderBy(desc(candidateApplications.createdAt));
  return results;
}

export async function updateCandidateApplicationStatus(
  id: number,
  status: "pending" | "approved" | "rejected",
  approvedBy: number,
  rejectionReason?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(candidateApplications)
    .set({
      status,
      reviewedBy: approvedBy,
      reviewedAt: new Date(),
      rejectionReason: rejectionReason || null,
    })
    .where(eq(candidateApplications.id, id));

  return { success: true };
}

export async function linkInvitationToApplication(invitationId: number, applicationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(invitations)
    .set({
      candidateApplicationId: applicationId,
    })
    .where(eq(invitations.id, invitationId));

  return { success: true };
}

export async function linkApplicationToCandidate(applicationId: number, candidateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(candidateApplications)
    .set({
      candidateId: candidateId,
    })
    .where(eq(candidateApplications.id, applicationId));

  return { success: true };
}

export async function approveCandidateApplication(id: number, reviewedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Récupérer la candidature
  const application = await getCandidateApplicationById(id);
  if (!application) {
    throw new Error("Candidature non trouvée");
  }

  // 1. Créer un utilisateur avec rôle candidat
  // Générer un openId unique basé sur l'email
  const openId = `candidate_${application.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
  
  await upsertUser({
    openId,
    email: application.email,
    name: `${application.firstName} ${application.lastName}`,
    role: 'candidate',
    lastSignedIn: new Date(),
  });

  // Récupérer l'ID de l'utilisateur créé
  const user = await getUserByOpenId(openId);
  if (!user) {
    throw new Error("Erreur lors de la création de l'utilisateur");
  }

  // 2. Créer un profil candidat lié à cet utilisateur
  const result = await createCandidate({
    userId: user.id,
    contestId: application.contestId || 1,
    category: application.category as "miss" | "mister" | "teen_miss" | "teen_mister",
    firstName: application.firstName,
    lastName: application.lastName,
    dateOfBirth: application.dateOfBirth,
    phone: application.phone,
    city: application.city,
    country: application.country,
    profilePhoto: application.profilePhoto,
    bio: application.bio,
    instagram: application.instagram,
    facebook: application.facebook,
    tiktok: application.tiktok,
    linkedin: application.linkedin,
    status: "approved",
  });

  // @ts-ignore - insertId exists on MySQL result
  const candidateId = Number(result[0].insertId);

  // 3. Mettre à jour le statut de la candidature
  await db
    .update(candidateApplications)
    .set({
      status: "approved",
      reviewedBy,
      reviewedAt: new Date(),
      candidateId,
    })
    .where(eq(candidateApplications.id, id));

  return { success: true, candidateId };
}

export async function rejectCandidateApplication(id: number, reviewedBy: number, rejectionReason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(candidateApplications)
    .set({
      status: "rejected",
      reviewedBy,
      reviewedAt: new Date(),
      rejectionReason,
    })
    .where(eq(candidateApplications.id, id));

  return { success: true };
}

export async function deleteCandidateApplication(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(candidateApplications)
    .where(eq(candidateApplications.id, id));

  return { success: true };
}
