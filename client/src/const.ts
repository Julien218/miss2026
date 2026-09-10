export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Canonical login entry point for protected areas.
 *
 * Authentication is local (email/password) and does not depend on an external
 * OAuth portal. A relative return path can be preserved after a successful
 * login.
 */
export const getLoginUrl = (returnPath?: string) => {
  if (typeof window === "undefined") return "/login";

  const params = new URLSearchParams();
  if (returnPath && returnPath.startsWith("/") && !returnPath.startsWith("//")) {
    params.set("returnTo", returnPath);
  }

  const query = params.toString();
  return query ? `/login?${query}` : "/login";
};
