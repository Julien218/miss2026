import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("../_core/env", () => ({ ENV: { forgeApiUrl: "https://legacy.example/", forgeApiKey: "legacy-fixture" } }));
import { emailProvider, sendEmail } from "./email";

const options = { to: "test@example.com", subject: "Confirmation", html: "<p>Confirmation</p>", text: "Confirmation", idempotencyKey: "application-123-confirmation", attachments: [{ filename: "contract.pdf", content: "JVBERg==", contentType: "application/pdf" }] };
const receipt = "11111111-1111-4111-8111-111111111111";
describe("transactional email transport", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "resend-fixture");
    vi.stubEnv("RESEND_FROM_EMAIL", "inscriptions@example.com");
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });
  it("prefers Resend and preserves text and the PDF attachment", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: receipt }), { status: 200 }));
    vi.stubGlobal("fetch", request);
    expect(emailProvider()).toBe("resend");
    expect(await sendEmail(options)).toBe(true);
    expect(request.mock.calls[0][0]).toBe("https://api.resend.com/emails");
    const init = request.mock.calls[0][1];
    expect(init.headers["Idempotency-Key"]).toBe(options.idempotencyKey);
    expect(JSON.parse(init.body)).toMatchObject({ from: "inscriptions@example.com", to: [options.to], attachments: [{ filename: "contract.pdf", content: "JVBERg==", content_type: "application/pdf" }] });
    expect(JSON.parse(init.body).text).toContain(options.text);
    expect(JSON.parse(init.body).text).toContain("Js-Innov.IA");
    expect(JSON.parse(init.body).html).toContain('data-mmd-email="2027"');
  });
  it("rejects a success without an acceptance ID", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    expect(await sendEmail(options)).toBe(false);
  });
  it("does not retry permanent errors or fall back to Forge", async () => {
    const request = vi.fn().mockResolvedValue(new Response("{}", { status: 403 }));
    vi.stubGlobal("fetch", request);
    expect(await sendEmail(options)).toBe(false);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("retries transient failures with the same idempotency key and body", async () => {
    vi.useFakeTimers();
    const request = vi.fn().mockResolvedValueOnce(new Response("{}", { status: 429 })).mockRejectedValueOnce(new Error("timeout")).mockResolvedValueOnce(new Response(JSON.stringify({ id: receipt }), { status: 200 }));
    vi.stubGlobal("fetch", request);
    const result = sendEmail(options);
    await vi.runAllTimersAsync();
    expect(await result).toBe(true);
    expect(request).toHaveBeenCalledTimes(3);
    expect(new Set(request.mock.calls.map(call => call[1].headers["Idempotency-Key"])).size).toBe(1);
    expect(new Set(request.mock.calls.map(call => call[1].body)).size).toBe(1);
  });
  it("stops after three transient failures", async () => {
    vi.useFakeTimers();
    const request = vi.fn().mockImplementation(() => Promise.resolve(new Response("{}", { status: 503 })));
    vi.stubGlobal("fetch", request);
    const result = sendEmail(options);
    await vi.runAllTimersAsync();
    expect(await result).toBe(false);
    expect(request).toHaveBeenCalledTimes(3);
  });
  it("keeps Forge compatibility only when Resend is absent", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.spyOn(console, "log").mockImplementation(() => {});
    const request = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", request);
    expect(emailProvider()).toBe("forge");
    expect(await sendEmail(options)).toBe(true);
    expect(request.mock.calls[0][0]).toContain("https://legacy.example/");
  });
});
