/**
 * Rate Limiting Middleware
 * 
 * Protège les endpoints sensibles contre les abus et attaques DDoS.
 * Utilise express-rate-limit avec stockage en mémoire.
 * 
 * Pour production à grande échelle, remplacer par Redis store.
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter pour validation de token d'invitation
 * Limite : 10 requêtes par minute par IP
 * 
 * Protège contre :
 * - Énumération de tokens
 * - Brute force
 */
export const validateTokenLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requêtes max
  message: 'Trop de tentatives de validation. Veuillez réessayer dans 1 minute.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // keyGenerator: (req) => req.ip || 'unknown', // Par défaut utilise req.ip
});

/**
 * Rate limiter pour soumission de candidature
 * Limite : 3 requêtes par heure par IP
 * 
 * Protège contre :
 * - Spam de candidatures
 * - Abus du formulaire
 */
export const submitOnboardingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 requêtes max
  message: 'Vous avez soumis trop de candidatures. Veuillez réessayer dans 1 heure.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Compte toutes les requêtes, même réussies
});

/**
 * Rate limiter pour votes
 * Limite : 20 requêtes par heure par utilisateur
 * 
 * Protège contre :
 * - Vote farming
 * - Manipulation des résultats
 */
export const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 votes max
  message: 'Vous avez voté trop de fois. Veuillez réessayer dans 1 heure.',
  standardHeaders: true,
  legacyHeaders: false,
  // keyGenerator: (req) => req.user?.id?.toString() || req.ip || 'unknown',
});

/**
 * Rate limiter pour tracking de partages sociaux
 * Limite : 50 requêtes par heure par utilisateur
 * 
 * Protège contre :
 * - Spam de tracking
 * - Manipulation des statistiques
 */
export const shareTrackingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 50, // 50 partages max
  message: 'Trop de partages enregistrés. Veuillez réessayer dans 1 heure.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter générique pour API
 * Limite : 100 requêtes par 15 minutes par IP
 * 
 * Protection globale contre abus
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
  message: 'Trop de requêtes depuis cette adresse IP. Veuillez réessayer dans 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});


/**
 * Store en mémoire pour rate limiting tRPC
 * 
 * Structure : Map<key, { count: number, resetAt: number }>
 * key = `${procedureName}:${identifier}` (ex: "validateToken:192.168.1.1")
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Nettoie les entrées expirées toutes les 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((value, key) => {
    if (value.resetAt < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}, 5 * 60 * 1000);

interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en ms
  max: number; // Nombre max de requêtes
  message: string; // Message d'erreur
}

/**
 * Vérifie et incrémente le compteur de rate limit
 * 
 * @returns true si la limite est atteinte, false sinon
 */
export function checkRateLimit(
  procedureName: string,
  identifier: string,
  config: RateLimitConfig
): { limited: boolean; message?: string; remaining?: number } {
  const key = `${procedureName}:${identifier}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Créer ou réinitialiser l'entrée si expirée
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Incrémenter le compteur
  entry.count++;
  
  // Vérifier la limite
  if (entry.count > config.max) {
    return {
      limited: true,
      message: config.message,
      remaining: 0,
    };
  }
  
  return {
    limited: false,
    remaining: config.max - entry.count,
  };
}

/**
 * Configurations pré-définies pour chaque endpoint
 */
export const rateLimitConfigs = {
  validateToken: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    message: 'Trop de tentatives de validation. Veuillez réessayer dans 1 minute.',
  },
  submitOnboarding: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 3,
    message: 'Vous avez soumis trop de candidatures. Veuillez réessayer dans 1 heure.',
  },
  vote: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20,
    message: 'Vous avez voté trop de fois. Veuillez réessayer dans 1 heure.',
  },
  shareTracking: {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 50,
    message: 'Trop de partages enregistrés. Veuillez réessayer dans 1 heure.',
  },
} as const;
