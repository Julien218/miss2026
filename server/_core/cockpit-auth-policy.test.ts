import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { COCKPIT_VERIFIED, type CockpitRequest, registerCockpitOnlyAuth, spaceForRole } from "./cockpit-auth-policy";
import { registerCockpitSso } from "./cockpit-sso";
import { COOKIE_NAME } from "../../shared/const";

vi.mock("./env", () => ({ ENV: { appId: "test", cookieSecret: "test-secret-for-session-revocation", oAuthServerUrl: "" } }));
vi.mock("../db", () => ({ getUserByOpenId: vi.fn(async () => ({ id: 7, openId: "old-user", role: "candidate" })), upsertUser: vi.fn() }));
import { sdk } from "./sdk";

const servers: Server[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve()))));
});
const env = { COCKPIT_ONLY_AUTH: "true", COCKPIT_SSO_SECRET: "k".repeat(43) };
async function listen(app: express.Express) {
  const server = app.listen(0, "127.0.0.1"); servers.push(server);
  await new Promise<void>(resolve => server.once("listening", resolve));
  return `http://127.0.0.1:${(server.address() as { port: number }).port}`;
}

describe("Cockpit-only access", () => {
  it("refuses a valid pre-existing direct session and a client-supplied verification header", async () => {
    const token = await sdk.createSessionToken("old-user", { name: "Old user", expiresInMs: 60_000 });
    const req = { headers: { cookie: `${COOKIE_NAME}=${token}`, "x-cockpit-verified": "true" } } as unknown as CockpitRequest;
    vi.stubEnv("COCKPIT_ONLY_AUTH", "false");
    expect((await sdk.authenticateRequest(req)).id).toBe(7);
    vi.stubEnv("COCKPIT_ONLY_AUTH", "true");
    await expect(sdk.authenticateRequest(req)).rejects.toThrow("Cockpit");
    req[COCKPIT_VERIFIED] = true;
    expect((await sdk.authenticateRequest(req)).role).toBe("candidate");
  });

  it("disables login/reset/OAuth and redirects to a fixed Cockpit destination while public forms stay available", async () => {
    const app = express();
    registerCockpitOnlyAuth(app, env);
    app.post("/api/auth/login", (_req, res) => res.sendStatus(200));
    app.post("/api/public/candidate-application", (_req, res) => res.sendStatus(202));
    app.post("/api/trpc/:procedures", (_req, res) => res.sendStatus(200));
    const base = await listen(app);
    for (const path of ["/api/auth/login", "/api/auth/reset-password", "/api/auth/forgot-password", "/api/oauth/callback"]) {
      expect((await fetch(base + path, { method: "POST" })).status).toBe(403);
    }
    const login = await fetch(base + "/login?returnTo=https://evil.example", { redirect: "manual" });
    expect(login.status).toBe(303);
    expect(login.headers.get("location")).toBe("https://cockpit.jsinnovia.com/mes-sites/miss-mister-dour");
    expect((await fetch(base + "/api/public/candidate-application", { method: "POST" })).status).toBe(202);
    expect((await fetch(base + "/api/auth/config")).status).toBe(200);
    expect((await fetch(base + "/api/trpc/auth.me,invitations.createAccount", { method: "POST" })).status).toBe(403);
    expect((await fetch(base + "/api/trpc/invitations%2EcreateAccount", { method: "POST" })).status).toBe(403);
    expect((await fetch(base + "/api/trpc/candidates.getMine", { method: "POST" })).status).toBe(200);
  });

  it("fails startup rather than leaving a central-only site without a configured bridge", () => {
    expect(() => registerCockpitOnlyAuth(express(), { COCKPIT_ONLY_AUTH: "true" })).toThrow("SSO");
  });

  it.each([
    ["admin", "/admin"], ["super_admin", "/admin"], ["owner", "/admin"],
    ["candidate", "/my-profile"], ["photographer", "/photographer"],
    ["staff", "/choreographer"], ["organizer", "/choreographer"],
    ["marketing", "/choreographer"], ["press", "/press"], ["user", "/"],
  ])("keeps the local %s role and opens only its entry space", async (role, destination) => {
    let currentRole = role;
    let active = true;
    const app = express(); app.use(express.urlencoded({ extended: false }));
    registerCockpitSso(app, {
      siteId: "miss-mister-dour", dashboard: user => spaceForRole(user.role),
      siteOrigins: ["https://site.example"], env,
      findUser: async email => ({ id: 7, email, role: currentRole }),
      sessionCookies: async user => ({ [COOKIE_NAME]: user.role }),
      request: (async () => Response.json({ active, email: "member@example.com", grant: "g".repeat(43) })) as typeof fetch,
    });
    app.get("/api/private", (req, res) => res.json({ cookie: req.headers.cookie, verified: (req as CockpitRequest)[COCKPIT_VERIFIED] }));
    const base = await listen(app);
    const response = await fetch(base + "/api/integrations/cockpit/session", { method: "POST", redirect: "manual", headers: { Origin: "https://cockpit.jsinnovia.com", "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ ticket: "t".repeat(43), role: "admin" }) });
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(`location.replace(${JSON.stringify(destination)})`);
    const read = () => fetch(base + "/api/private", { headers: { Cookie: `__Host-cockpit-module=${"g".repeat(43)}` } });
    expect(await (await read()).json()).toEqual({ cookie: expect.stringContaining(`${COOKIE_NAME}=${role}`), verified: true });
    currentRole = "revoked";
    expect((await read()).status).toBe(401);
    currentRole = role; active = false;
    expect((await read()).status).toBe(401);
  });
});
