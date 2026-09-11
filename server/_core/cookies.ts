import type { CookieOptions, Request } from "express";

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    // L'application et son API sont sur le même site. "lax" bloque la majorité
    // des requêtes cross-site tout en conservant la navigation normale.
    sameSite: "lax",
    // Toujours sécurisé en production ; compatible localhost en développement.
    secure: process.env.NODE_ENV === "production" ? true : isSecureRequest(req),
  };
}
