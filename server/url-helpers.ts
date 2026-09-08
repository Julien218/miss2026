/**
 * Helpers pour générer les URLs avec le domaine officiel PUBLIC_BASE_URL
 * Garantit que tous les liens utilisent https://missetmisterdour.be
 */

/**
 * Récupère l'URL de base publique depuis l'environnement
 * Par défaut: https://missetmisterdour.be
 */
export function getPublicBaseUrl(): string {
  return process.env.PUBLIC_BASE_URL || "https://missetmisterdour.be";
}

/**
 * Génère l'URL complète d'un candidat
 * @param candidateId ID du candidat
 * @returns URL complète: https://missetmisterdour.be/candidate/123
 */
export function getCandidateUrl(candidateId: number): string {
  const baseUrl = getPublicBaseUrl();
  return `${baseUrl}/candidate/${candidateId}`;
}

/**
 * Génère l'URL de partage d'un asset spécifique
 * @param candidateId ID du candidat
 * @param assetId ID de l'asset (photo/vidéo)
 * @returns URL complète: https://missetmisterdour.be/share/123/456
 */
export function getShareUrl(candidateId: number, assetId: number): string {
  const baseUrl = getPublicBaseUrl();
  return `${baseUrl}/share/${candidateId}/${assetId}`;
}

/**
 * Génère l'URL d'invitation avec token
 * @param token Token d'invitation sécurisé
 * @returns URL complète: https://missetmisterdour.be/invite/abc123
 */
export function getInvitationUrl(token: string): string {
  const baseUrl = getPublicBaseUrl();
  return `${baseUrl}/invite/${token}`;
}

/**
 * Génère l'URL canonique pour une page
 * @param path Chemin de la page (ex: "/about", "/candidate/123")
 * @returns URL complète: https://missetmisterdour.be/about
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = getPublicBaseUrl();
  // Enlever le slash initial si présent
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Génère l'URL de la homepage
 * @returns URL complète: https://missetmisterdour.be/
 */
export function getHomepageUrl(): string {
  return getPublicBaseUrl();
}

/**
 * Génère l'URL du sitemap
 * @returns URL complète: https://missetmisterdour.be/sitemap.xml
 */
export function getSitemapUrl(): string {
  const baseUrl = getPublicBaseUrl();
  return `${baseUrl}/sitemap.xml`;
}
