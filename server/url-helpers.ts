/** Helpers pour générer les URLs publiques canoniques. */
export function getPublicBaseUrl(): string {
  return (process.env.PUBLIC_BASE_URL || "https://missetmisterdour.be").replace(/\/$/, "");
}

export function getCandidateUrl(candidateId: number): string {
  return `${getPublicBaseUrl()}/candidat/${candidateId}`;
}

export function getShareUrl(candidateId: number, assetId: number): string {
  return `${getPublicBaseUrl()}/candidat/${candidateId}?asset=${assetId}`;
}

export function getInvitationUrl(token: string): string {
  return `${getPublicBaseUrl()}/invite/${encodeURIComponent(token)}`;
}

export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicBaseUrl()}${cleanPath}`;
}

export function getHomepageUrl(): string {
  return `${getPublicBaseUrl()}/`;
}

export function getSitemapUrl(): string {
  return `${getPublicBaseUrl()}/sitemap.xml`;
}
