/**
 * Vote Anti-Fraud System
 * 
 * Calcule un risk_score (0-100) pour détecter les votes frauduleux
 * Plus le score est élevé, plus le vote est suspect
 * 
 * Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

import crypto from "crypto";

export interface VoteData {
  fingerprint: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  timestamp: Date;
}

export interface RiskAnalysis {
  riskScore: number; // 0-100
  flags: string[];
  isSuspicious: boolean; // true si riskScore >= 70
  isFraudulent: boolean; // true si riskScore >= 90
}

/**
 * Hash une valeur avec SHA256 pour anonymisation
 */
export function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * Calcule le risk_score d'un vote
 */
export function calculateRiskScore(
  voteData: VoteData,
  previousVotes: VoteData[] = []
): RiskAnalysis {
  let riskScore = 0;
  const flags: string[] = [];

  // 1. Vérifier la fréquence de vote (même fingerprint)
  const sameFingerprint = previousVotes.filter(
    (v) => v.fingerprint === voteData.fingerprint
  );
  if (sameFingerprint.length > 0) {
    const timeSinceLastVote =
      voteData.timestamp.getTime() -
      sameFingerprint[sameFingerprint.length - 1].timestamp.getTime();
    const minutesSinceLastVote = timeSinceLastVote / 1000 / 60;

    if (minutesSinceLastVote < 1) {
      riskScore += 50;
      flags.push("RAPID_VOTING");
    } else if (minutesSinceLastVote < 5) {
      riskScore += 30;
      flags.push("FAST_VOTING");
    } else if (minutesSinceLastVote < 15) {
      riskScore += 10;
      flags.push("MODERATE_VOTING");
    }
  }

  // 2. Vérifier l'IP address (si fournie)
  if (voteData.ipAddress) {
    const sameIP = previousVotes.filter(
      (v) => v.ipAddress === voteData.ipAddress
    );
    if (sameIP.length > 5) {
      riskScore += 20;
      flags.push("MULTIPLE_VOTES_SAME_IP");
    }
  }

  // 3. Vérifier le User-Agent
  if (!voteData.userAgent || voteData.userAgent.length < 20) {
    riskScore += 15;
    flags.push("SUSPICIOUS_USER_AGENT");
  }

  // 4. Vérifier les patterns de bot
  if (voteData.userAgent) {
    const botKeywords = ["bot", "crawler", "spider", "scraper", "curl", "wget"];
    const isBot = botKeywords.some((keyword) =>
      voteData.userAgent!.toLowerCase().includes(keyword)
    );
    if (isBot) {
      riskScore += 40;
      flags.push("BOT_DETECTED");
    }
  }

  // 5. Vérifier le referrer
  if (!voteData.referrer) {
    riskScore += 5;
    flags.push("NO_REFERRER");
  }

  // 6. Vérifier les patterns de fingerprint suspects
  if (voteData.fingerprint.length < 10) {
    riskScore += 25;
    flags.push("WEAK_FINGERPRINT");
  }

  // Limiter le score à 100
  riskScore = Math.min(riskScore, 100);

  return {
    riskScore,
    flags,
    isSuspicious: riskScore >= 70,
    isFraudulent: riskScore >= 90,
  };
}

/**
 * Vérifie si un vote doit être bloqué
 */
export function shouldBlockVote(riskAnalysis: RiskAnalysis): boolean {
  return riskAnalysis.isFraudulent;
}

/**
 * Génère un rapport d'analyse de risque
 */
export function generateRiskReport(riskAnalysis: RiskAnalysis): string {
  const level =
    riskAnalysis.riskScore < 30
      ? "FAIBLE"
      : riskAnalysis.riskScore < 70
      ? "MOYEN"
      : riskAnalysis.riskScore < 90
      ? "ÉLEVÉ"
      : "CRITIQUE";

  return `
Analyse de Risque: ${level}
Score: ${riskAnalysis.riskScore}/100
Drapeaux: ${riskAnalysis.flags.join(", ") || "Aucun"}
Suspect: ${riskAnalysis.isSuspicious ? "OUI" : "NON"}
Frauduleux: ${riskAnalysis.isFraudulent ? "OUI" : "NON"}
  `.trim();
}

/**
 * Récupère les votes récents pour analyse
 * (À implémenter avec la base de données)
 */
export async function getRecentVotes(
  contestId: number,
  hours: number = 24
): Promise<VoteData[]> {
  // TODO: Implémenter avec la base de données
  return [];
}
