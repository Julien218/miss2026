import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import crypto from "crypto";

describe("FlowithOS Webhook Signature Verification", () => {
  let testJobId: number;
  let testCandidateId: number;

  beforeAll(async () => {
    // Create test candidate
    const candidates = await db.getCandidatesByContest(1);
    if (candidates.length === 0) {
      throw new Error("No candidates found for testing");
    }
    testCandidateId = candidates[0].id;

    // Create test media job
    testJobId = await db.createMediaJob({
      candidateId: testCandidateId,
      kind: "candidate_video",
      format: "vertical_9_16",
      durationSeconds: 30,
      videoType: "profile",
      missionPackJson: JSON.stringify({ test: true }),
      requestedBy: 1,
    });
  });

  it("should accept webhook with valid signature", async () => {
    const payload = JSON.stringify({ jobId: testJobId, status: "done" });
    const validSignature = crypto
      .createHmac("sha256", process.env.FLOWITHOS_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    const caller = appRouter.createCaller({ user: null } as any);
    const result = await caller.flowithos.callback({
      jobId: testJobId,
      status: "done",
      outputUrl: "https://example.com/video.mp4",
      thumbnailUrl: "https://example.com/thumb.jpg",
      logs: "Video generated successfully",
      signature: validSignature,
    });

    expect(result.success).toBe(true);

    // Verify job was updated
    const job = await db.getMediaJobById(testJobId);
    expect(job?.status).toBe("done");
    expect(job?.outputUrl).toBe("https://example.com/video.mp4");
  });

  it("should reject webhook with invalid signature", async () => {
    const invalidSignature = "invalid_signature_12345";

    const caller = appRouter.createCaller({ user: null } as any);
    
    await expect(
      caller.flowithos.callback({
        jobId: testJobId,
        status: "running",
        signature: invalidSignature,
      })
    ).rejects.toThrow("Invalid signature");
  });

  it("should reject webhook without signature", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    
    await expect(
      caller.flowithos.callback({
        jobId: testJobId,
        status: "running",
        // No signature provided
      })
    ).rejects.toThrow("Missing signature");
  });

  it("should reject webhook with wrong secret", async () => {
    const payload = JSON.stringify({ jobId: testJobId, status: "failed" });
    const wrongSignature = crypto
      .createHmac("sha256", "wrong_secret_key_12345")
      .update(payload)
      .digest("hex");

    const caller = appRouter.createCaller({ user: null } as any);
    
    await expect(
      caller.flowithos.callback({
        jobId: testJobId,
        status: "failed",
        errorMessage: "Processing failed",
        signature: wrongSignature,
      })
    ).rejects.toThrow("Invalid signature");
  });

  it("should reject webhook with tampered payload", async () => {
    // Sign with status="done", but send status="failed"
    const payload = JSON.stringify({ jobId: testJobId, status: "done" });
    const signature = crypto
      .createHmac("sha256", process.env.FLOWITHOS_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    const caller = appRouter.createCaller({ user: null } as any);
    
    await expect(
      caller.flowithos.callback({
        jobId: testJobId,
        status: "failed", // Different status than signed
        signature: signature,
      })
    ).rejects.toThrow("Invalid signature");
  });

  it("should update job status correctly on valid webhook", async () => {
    // Create a new job for this test
    const newJobId = await db.createMediaJob({
      candidateId: testCandidateId,
      kind: "intro_video",
      format: "square_1_1",
      durationSeconds: 15,
      videoType: "intro",
      missionPackJson: JSON.stringify({ test: true }),
      requestedBy: 1,
    });

    // Send "running" webhook
    const runningPayload = JSON.stringify({ jobId: newJobId, status: "running" });
    const runningSignature = crypto
      .createHmac("sha256", process.env.FLOWITHOS_WEBHOOK_SECRET!)
      .update(runningPayload)
      .digest("hex");

    const caller = appRouter.createCaller({ user: null } as any);
    await caller.flowithos.callback({
      jobId: newJobId,
      status: "running",
      logs: "Processing started",
      signature: runningSignature,
    });

    const runningJob = await db.getMediaJobById(newJobId);
    expect(runningJob?.status).toBe("running");
    expect(runningJob?.processingStartedAt).toBeTruthy();

    // Send "done" webhook
    const completedPayload = JSON.stringify({ jobId: newJobId, status: "done" });
    const completedSignature = crypto
      .createHmac("sha256", process.env.FLOWITHOS_WEBHOOK_SECRET!)
      .update(completedPayload)
      .digest("hex");

    await caller.flowithos.callback({
      jobId: newJobId,
      status: "done",
      outputUrl: "https://example.com/final.mp4",
      thumbnailUrl: "https://example.com/final-thumb.jpg",
      logs: "Processing completed successfully",
      signature: completedSignature,
    });

    const completedJob = await db.getMediaJobById(newJobId);
    expect(completedJob?.status).toBe("done");
    expect(completedJob?.outputUrl).toBe("https://example.com/final.mp4");
    expect(completedJob?.processingCompletedAt).toBeTruthy();
  });
});
