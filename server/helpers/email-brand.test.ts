import { afterEach, describe, expect, it, vi } from "vitest";
import { brandEmail, emailButton } from "./email-brand";
import { sendInvitationEmail } from "../_core/invitation-email";
import { sendPasswordResetEmail } from "../_core/password-reset-email";
describe("shared Miss & Mister Dour email identity", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  it("keeps one HTML document and preserves existing content and links", () => {
    const html = brandEmail('<!DOCTYPE html><html><body><h1>Message</h1><a href="https://example.com/action">Action</a></body></html>');
    expect(html.match(/<!DOCTYPE/gi)).toHaveLength(1);
    expect(html.match(/<body\b/g)).toHaveLength(1);
    expect(html).toContain('href="https://example.com/action"');
    expect(html).toContain("logo/miss-mister-dour-logo-transparent.png");
    expect(html).toContain("#C87941");
    expect(html).toContain("Js-Innov.IA");
    expect(brandEmail(html)).toBe(html);
  });
  it("escapes labels and URL attributes", () => {
    expect(emailButton('https://example.com/?a=1&b="2"', '<Action>')).toContain("&lt;Action&gt;");
    expect(emailButton('https://example.com/?a=1&b="2"', 'Action')).toContain('&amp;b=&quot;2&quot;');
  });
  it("applies the common identity to invitation and reset without leaking HTML input", async () => {
    vi.stubEnv("RESEND_API_KEY", "fixture");
    vi.spyOn(console, "info").mockImplementation(() => {});
    const request = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({ id: "11111111-1111-4111-8111-111111111111" }))));
    vi.stubGlobal("fetch", request);
    await sendInvitationEmail("test@example.com", "https://example.com/invite?token=fixture", "candidat", "<Olivier>");
    await sendPasswordResetEmail("test@example.com", "https://example.com/reset?token=fixture");
    expect(request).toHaveBeenCalledTimes(2);
    for (const call of request.mock.calls) {
      const body = JSON.parse(call[1].body);
      expect(body.html).toContain('data-mmd-email="2027"');
      expect(body.html.match(/>Js-Innov\.IA</g)).toHaveLength(1);
      expect(body.html).not.toContain("<Olivier>");
      expect(body.text).toContain("Js-Innov.IA");
    }
    expect(JSON.parse(request.mock.calls[0][1].body).html).toContain("&lt;Olivier&gt;");
  });
});
