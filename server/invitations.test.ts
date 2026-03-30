import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Invitations System", () => {
  it("should create invitation with secure token", async () => {
    const invitation = await db.createInvitation({
      role: "candidat",
      email: "candidate@example.com",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      maxUses: 1,
      createdBy: 1,
    });

    expect(invitation).toBeDefined();
    expect(invitation.id).toBeGreaterThan(0);
    expect(invitation.token).toBeDefined();
    expect(invitation.token.length).toBeGreaterThan(30); // UUID length
    expect(invitation.role).toBe("candidat");
  });

  it("should retrieve invitation by token", async () => {
    const created = await db.createInvitation({
      role: "viewer",
      email: "test@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      maxUses: 3,
      createdBy: 1,
    });

    const invitation = await db.getInvitationByToken(created.token);

    expect(invitation).toBeDefined();
    expect(invitation?.id).toBe(created.id);
    expect(invitation?.role).toBe("viewer");
    expect(invitation?.email).toBe("test@example.com");
    expect(invitation?.usedCount || 0).toBe(0);
    expect(invitation?.maxUses).toBe(3);
    expect(invitation?.isActive).toBe(1);
  });

  it("should return null for invalid token", async () => {
    const invitation = await db.getInvitationByToken("invalid-token-123");
    expect(invitation).toBeNull();
  });

  it("should increment used count", async () => {
    const created = await db.createInvitation({
      role: "manager",
      email: "counter@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxUses: 5,
      createdBy: 1,
    });

    await db.incrementInvitationUsedCount(created.id);
    const invitation = await db.getInvitationByToken(created.token);

    expect(invitation?.usedCount).toBe(1);
  });

  it("should deactivate invitation", async () => {
    const tempInvitation = await db.createInvitation({
      role: "manager",
      email: "deactivate@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxUses: 1,
      createdBy: 1,
    });

    await db.deactivateInvitation(tempInvitation.id);
    const deactivated = await db.getInvitationByToken(tempInvitation.token);

    expect(deactivated?.isActive).toBe(0);
  });

  it("should list all invitations", async () => {
    const invitations = await db.getAllInvitations();

    expect(invitations).toBeDefined();
    expect(Array.isArray(invitations)).toBe(true);
    expect(invitations.length).toBeGreaterThan(0);
  });

  it("should list only active invitations", async () => {
    const activeInvitations = await db.getActiveInvitations();

    expect(activeInvitations).toBeDefined();
    expect(Array.isArray(activeInvitations)).toBe(true);
    
    // All returned invitations should be active
    activeInvitations.forEach(inv => {
      expect(inv.isActive).toBe(1);
    });
  });

  it("should support multiple roles", async () => {
    const roles = ["admin", "directeur", "manager", "photographe", "candidat", "viewer", "jury"];
    
    for (const role of roles) {
      const invitation = await db.createInvitation({
        role,
        email: `${role}@example.com`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxUses: 1,
        createdBy: 1,
      });

      expect(invitation.role).toBe(role);
    }
  });

  it("should handle permission overrides", async () => {
    const overrides = JSON.stringify({
      add: ["can_delete_media"],
      remove: ["can_edit_candidates"],
    });

    const invitation = await db.createInvitation({
      role: "photographe",
      email: "overrides@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxUses: 1,
      createdBy: 1,
      permissionOverrides: overrides,
    });

    expect(invitation.permissionOverrides).toBe(overrides);

    const retrieved = await db.getInvitationByToken(invitation.token);
    expect(retrieved?.permissionOverrides).toBe(overrides);
    
    // Vérifier que le JSON est valide
    const parsed = JSON.parse(retrieved?.permissionOverrides || "{}");
    expect(parsed.add).toEqual(["can_delete_media"]);
    expect(parsed.remove).toEqual(["can_edit_candidates"]);
  });

  it("should handle multi-use invitations", async () => {
    const invitation = await db.createInvitation({
      role: "jury",
      email: "multi@example.com",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      maxUses: 10,
      createdBy: 1,
    });

    expect(invitation.maxUses).toBe(10);
    expect(invitation.usedCount || 0).toBe(0);

    // Simuler 3 utilisations
    await db.incrementInvitationUsedCount(invitation.id);
    await db.incrementInvitationUsedCount(invitation.id);
    await db.incrementInvitationUsedCount(invitation.id);

    const retrieved = await db.getInvitationByToken(invitation.token);
    expect(retrieved?.usedCount).toBe(3);
    expect(retrieved?.isActive).toBe(1); // Toujours actif car < maxUses
  });

  it("should handle expired invitations", async () => {
    const invitation = await db.createInvitation({
      role: "viewer",
      email: "expired@example.com",
      expiresAt: new Date(Date.now() - 1000), // Déjà expiré
      maxUses: 1,
      createdBy: 1,
    });

    const retrieved = await db.getInvitationByToken(invitation.token);
    expect(retrieved).toBeDefined();
    
    // Vérifier que l'expiration est dans le passé
    expect(retrieved?.expiresAt).toBeDefined();
    if (retrieved?.expiresAt) {
      expect(new Date(retrieved.expiresAt).getTime()).toBeLessThan(Date.now());
    }
  });
});
