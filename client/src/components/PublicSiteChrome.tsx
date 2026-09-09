import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { PublicSiteHeader } from "./PublicSiteHeader";

const exactPublicRoutes = new Set([
  "/about",
  "/press",
  "/sponsors",
  "/contact",
  "/ranking",
  "/gallery",
  "/candidates",
  "/inscription-candidat",
  "/inscription-merci",
  "/public",
  "/intro",
  "/miss-mister-dour-2026",
  "/miss-mister",
  "/mentions-legales",
  "/legal/cgu",
  "/legal/privacy",
  "/legal/cookies",
]);

const publicPrefixes = [
  "/article/",
  "/candidat/",
  "/candidates/",
  "/verify/",
  "/invite/",
  "/invitation/",
  "/onboarding/candidate/",
  "/profile/edit/",
];

function isPublicExperienceRoute(location: string) {
  if (location === "/") return false;
  return exactPublicRoutes.has(location) || publicPrefixes.some((prefix) => location.startsWith(prefix));
}

export function PublicSiteChrome({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const enabled = isPublicExperienceRoute(location);

  if (!enabled) return <>{children}</>;

  return (
    <div className="mmd-public-experience">
      <PublicSiteHeader />
      <div className="mmd-public-content">{children}</div>
    </div>
  );
}
