import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from "vitest";
import express from "express";
import type { Server } from "node:http";
import { readFileSync } from "node:fs";
import {
  COCKPIT_VERIFIED,
  type CockpitRequest,
} from "../_core/cockpit-auth-policy";
import { publishTemplate } from "../helpers/candidateContractTemplate";
import {
  CONTRACT_SETUP_FIELDS,
  NO_MEDIA,
} from "../../shared/candidate-contract";

const state = vi.hoisted(() => ({
  user: {
    id: 7,
    role: "admin",
    organizationId: 1,
    email: "olivier.trevis@outlook.be",
  },
  bridge: true,
  application: null as any,
  template: null as any,
  create: vi.fn(),
  finalize: vi.fn(),
  put: vi.fn(),
  approve: vi.fn(),
  pdf: vi.fn(),
  update: vi.fn(),
  mode: "admin",
  lookup: true,
  affected: 1,
}));
vi.mock("../_core/sdk", () => ({
  sdk: { authenticateRequest: vi.fn(async () => state.user) },
}));
vi.mock("../helpers/contractStore", () => ({
  getPublishedContract: vi.fn(async () => state.template),
  savePublishedContract: vi.fn(),
}));
vi.mock("../helpers/candidateContract2027", () => ({
  CANDIDATE_CONTRACT_VERSION: "contract-2027-v1",
  generateCandidateContract2027: state.pdf,
}));
vi.mock("../storage", () => ({
  storageGetPrivate: vi.fn(async () => ({
    data: Buffer.from("%PDF-test"),
    contentType: "application/pdf",
  })),
  storagePutPrivate: state.put,
  storagePut: vi.fn(),
}));
vi.mock("../helpers/email", () => ({
  sendEmail: vi.fn(async () => true),
  emailProvider: () => "mock",
}));
vi.mock("../archive/candidate-archive", () => ({ archiveTick: vi.fn() }));
vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
}));
vi.mock("../db", () => ({
  getAllCandidateApplications: vi.fn(async () => [state.application]),
  getCandidateApplicationById: vi.fn(async () => state.application),
  finalizeCandidateContract: state.finalize,
  updateCandidateApplicationContract: vi.fn(async () => state.application),
  approveCandidateApplication: state.approve,
  rejectCandidateApplication: vi.fn(),
  createCandidateApplication: state.create,
  getAllAdmins: vi.fn(async () => [{ id: 7 }]),
  createNotification: vi.fn(),
  getContestById: vi.fn(async () => ({ id: 10, year: 2027 })),
  getDb: vi.fn(async () => ({
    select: (projection?: unknown) => ({
      from: () => ({
        where: () => ({
          limit: async () =>
            state.mode === "public"
              ? projection
                ? []
                : [{ id: 10, year: 2027 }]
              : state.lookup
                ? [state.application]
                : [],
        }),
      }),
    }),
    update: () => ({
      set: (data: unknown) => {
        state.update(data);
        return { where: async () => [{ affectedRows: state.affected }] };
      },
    }),
  })),
}));
import { registerCandidateApplicationAdminRoutes } from "./candidateApplicationsAdmin";
import { registerPublicFormRoutes } from "./publicForms";
import { registerContractRenewalRoutes } from "./contractRenewal";

let server: Server, base: string;
beforeAll(async () => {
  const app = express();
  app.use(express.json({ limit: "5mb" }));
  app.use((req, _res, next) => {
    if (state.bridge) (req as CockpitRequest)[COCKPIT_VERIFIED] = true;
    next();
  });
  registerCandidateApplicationAdminRoutes(app);
  registerPublicFormRoutes(app);
  registerContractRenewalRoutes(app);
  server = await new Promise<Server>(resolve => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
  base = `http://127.0.0.1:${(server.address() as any).port}`;
});
afterAll(() => new Promise<void>(resolve => server.close(() => resolve())));
beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-30T10:00:00Z"));
  state.mode = "admin";
  state.lookup = true;
  state.affected = 1;
  state.bridge = true;
  state.user = {
    id: 7,
    role: "admin",
    organizationId: 1,
    email: "olivier.trevis@outlook.be",
  };
  state.template = publishTemplate(
    CONTRACT_SETUP_FIELDS.map((_, i) => `Information confirmée de test ${i}`),
    7
  );
  state.application = {
    id: 42,
    organizationId: 1,
    status: "pending",
    firstName: "Camille",
    lastName: "Dupont",
    dateOfBirth: new Date("2003-01-01T12:00:00Z"),
    street: "Rue Exemple",
    houseNumber: "3",
    postalCode: "7370",
    city: "Dour",
    height: null,
    weight: null,
    email: "camille@example.test",
    phone: "0470000000",
    category: "miss",
    candidateSignatureName: "Camille Dupont",
    candidateSignedAt: new Date(),
    contractVersion: state.template.version,
    contractStatus: "candidate_signed",
    contractPdfKey: "private/42.pdf",
    contractPdfSha256: "a".repeat(64),
    contractSnapshot: JSON.stringify({
      template: state.template,
      media: NO_MEDIA,
      newsletter: false,
      guardianDeclaration: false,
      publicName: "Camille Dupont",
    }),
  };
  state.pdf.mockResolvedValue(Buffer.from("%PDF-test"));
  state.finalize.mockResolvedValue(state.application);
  state.create.mockImplementation(async data => ({ ...data, id: 42 }));
});
const post = (path: string, body: unknown) =>
  fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const sign = () =>
  post("/api/admin/candidate-applications/42/sign-contract", {
    signatureName: "Olivier TREVIS",
    confirm: true,
    expectedSha256: "a".repeat(64),
  });
describe("Cockpit validation authority", () => {
  it("denies signing from another admin or a direct site session", async () => {
    state.user.email = "other@example.test";
    expect((await sign()).status).toBe(403);
    state.user.email = "olivier.trevis@outlook.be";
    state.bridge = false;
    expect((await sign()).status).toBe(403);
    expect(state.pdf).not.toHaveBeenCalled();
  });
  it("protects contracts belonging to another organization", async () => {
    state.application.organizationId = 2;
    expect(
      (await fetch(base + "/api/admin/candidate-applications/42/contract"))
        .status
    ).toBe(403);
    expect((await sign()).status).toBe(403);
  });
  it("rejects stale PDF review, old versions and missing guardian acts", async () => {
    state.application.contractPdfSha256 = "b".repeat(64);
    expect((await sign()).status).toBe(409);
    state.application.contractPdfSha256 = "a".repeat(64);
    state.application.contractSnapshot = null;
    expect((await sign()).status).toBe(409);
    state.application.contractSnapshot = JSON.stringify({
      template: state.template,
      media: NO_MEDIA,
      guardianDeclaration: false,
    });
    state.application.dateOfBirth = new Date("2010-01-01T12:00:00Z");
    expect((await sign()).status).toBe(409);
    expect(state.finalize).not.toHaveBeenCalled();
  });
  it("records the actual Cockpit actor and preserves the candidate's version", async () => {
    expect((await sign()).status).toBe(200);
    expect(state.pdf.mock.calls[0][0].snapshot.template.version).toBe(
      state.template.version
    );
    expect(state.finalize).toHaveBeenCalledWith(
      42,
      "a".repeat(64),
      expect.objectContaining({
        organizationSignedBy: 7,
        organizationSignatureName: "Olivier TREVIS",
        contractStatus: "completed",
      })
    );
  });
  it("does not create a candidate before an organizer validation", async () => {
    expect(
      (await post("/api/admin/candidate-applications/42/approve", {})).status
    ).toBe(409);
    expect(state.approve).not.toHaveBeenCalled();
  });
  it("does not regenerate an already validated PDF", async () => {
    state.application.organizationSignedAt = new Date();
    state.application.contractStatus = "completed";
    expect(
      (
        await post(
          "/api/admin/candidate-applications/42/regenerate-contract",
          {}
        )
      ).status
    ).toBe(409);
    expect(state.put).not.toHaveBeenCalled();
  });
});
describe("new registrations", () => {
  const photo = readFileSync("client/public/contracts/starlight.jpg").toString(
    "base64"
  );
  function input() {
    return {
      firstName: "Camille",
      lastName: "Dupont",
      email: "camille@example.test",
      phone: "0470000000",
      birthDate: "2003-01-01",
      street: "Rue Exemple",
      houseNumber: "3",
      postalCode: "7370",
      city: "Dour",
      category: "miss",
      photoBase64: `data:image/jpeg;base64,${photo}`,
      photoFilename: "photo.jpg",
      bio: "Présentation du candidat de test. ".repeat(5),
      motivation: "Motivation pour participer au concours de test. ".repeat(3),
      profession: "Études",
      candidateSignatureName: "Camille Dupont",
      acceptEligibility: true,
      acceptRules: true,
      acceptCGU: true,
      acceptNewsletter: false,
      mediaChoices: NO_MEDIA,
      consentVersion: state.template.version,
      templateSha256: state.template.sha256,
    };
  }
  it("requires an actually published, unchanged contract", async () => {
    state.mode = "public";
    const body = input();
    state.template = null;
    expect(
      (await post("/api/public/candidate-applications", body)).status
    ).toBe(409);
    expect(state.create).not.toHaveBeenCalled();
  });
  it("rejects an outdated candidate acceptance", async () => {
    state.mode = "public";
    const body = { ...input(), consentVersion: "contract-2027-v1" };
    expect(
      (await post("/api/public/candidate-applications", body)).status
    ).toBe(409);
    expect(state.create).not.toHaveBeenCalled();
  });
  it("accepts all media refused and no weight, keeping the portrait private", async () => {
    state.mode = "public";
    const response = await post("/api/public/candidate-applications", input());
    expect(response.status).toBe(201);
    const created = state.create.mock.calls[0][0];
    expect(created.weight).toBeUndefined();
    expect(created.acceptedMedia).toBe(false);
    expect(created.photoProfile).toMatch(/^private:/);
    expect(JSON.parse(created.contractSnapshot).media).toEqual(NO_MEDIA);
    expect(created.organizationSignedAt).toBeUndefined();
  });
  it("requires the guardian's explicit declaration, beyond a typed name", async () => {
    state.mode = "public";
    const body = {
      ...input(),
      birthDate: "2011-05-20",
      guardianFullName: "Alex Dupont",
      guardianEmail: "alex@example.test",
      guardianPhone: "0470000001",
      guardianSignatureName: "Alex Dupont",
      guardianDeclaration: false,
    };
    expect(
      (await post("/api/public/candidate-applications", body)).status
    ).toBe(400);
    expect(state.create).not.toHaveBeenCalled();
  });
});
describe("renewal links", () => {
  const agreement = () => ({
    version: state.template.version,
    sha256: state.template.sha256,
    candidateName: "Camille Dupont",
    confirm: true,
    eligibility: true,
    cgu: true,
    newsletter: false,
    media: NO_MEDIA,
    guardianConfirm: false,
  });
  const renewal = () => post("/contrats/accord/" + "a".repeat(64), agreement());
  it("preserves the prior acts and PDF, consumes the token and returns a durable copy", async () => {
    state.application.contractRenewalHash = "a".repeat(64);
    state.application.acceptedMedia = 1;
    const response = await renewal();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Buffer.from(body.pdfBase64, "base64").toString()).toBe("%PDF-test");
    const update = state.update.mock.calls[0][0];
    expect(update.contractRenewalHash).toBeNull();
    expect(update.organizationSignedAt).toBeUndefined();
    expect(JSON.parse(update.contractHistory)[0]).toMatchObject({
      pdfKey: "private/42.pdf",
      acceptedMedia: 1,
      candidateSignatureName: "Camille Dupont",
    });
    state.lookup = false;
    expect((await renewal()).status).toBe(410);
  });
  it("rejects an acceptance if another request already consumed the token", async () => {
    state.affected = 0;
    expect((await renewal()).status).toBe(409);
    expect(state.pdf).not.toHaveBeenCalled();
  });
  it("requires rereading a changed template and the identified guardian's positive act", async () => {
    expect(
      (
        await post("/contrats/accord/" + "a".repeat(64), {
          ...agreement(),
          sha256: "stale",
        })
      ).status
    ).toBe(409);
    state.application.dateOfBirth = new Date("2010-01-01T12:00:00Z");
    state.application.guardianFullName = "Alex Dupont";
    expect((await renewal()).status).toBe(400);
    expect(state.update).not.toHaveBeenCalled();
  });
  it("retains the accepted acts when PDF generation fails and explains how to obtain a copy", async () => {
    state.pdf.mockRejectedValue(new Error("storage unavailable"));
    const response = await renewal();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.pdfBase64).toBeUndefined();
    expect(body.message).toContain("régénéré");
    expect(state.update.mock.calls[0][0].contractStatus).toBe(
      "generation_failed"
    );
  });
  it("does not look up malformed tokens", async () => {
    expect((await fetch(base + "/contrats/accord/not-a-token")).status).toBe(
      410
    );
  });
  it("marks the renewal page private and includes separate guardian and media choices", async () => {
    state.application.dateOfBirth = new Date("2010-01-01T12:00:00Z");
    state.application.guardianFullName = "Alex Dupont";
    const response = await fetch(base + "/contrats/accord/" + "a".repeat(64));
    expect(response.status).toBe(200);
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    const html = await response.text();
    expect(html).toContain('name="guardianConfirm"');
    expect(html).toContain('name="advertising"');
    expect(html).toContain('name="cgu"');
  });
  it("rejects a token that has expired or has been consumed", async () => {
    state.lookup = false;
    expect(
      (await fetch(base + "/contrats/accord/" + "a".repeat(64))).status
    ).toBe(410);
  });
});
