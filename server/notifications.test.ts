import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import * as db from "./db";

describe("Notifications System", () => {

  it("should list notifications for user", async () => {
    // Créer un utilisateur de test temporaire
    const openId = `test-notif-list-${Date.now()}`;
    await db.upsertUser({
      openId,
      name: "Test List User",
      email: `test-list-${Date.now()}@example.com`,
      role: "candidate",
    });
    
    const user = await db.getUserByOpenId(openId);
    if (!user) throw new Error("User not created");

    const caller = appRouter.createCaller({
      user: { id: user.id, role: "candidate" },
    } as Context);

    const notifications = await caller.notifications.list({ limit: 50 });

    expect(Array.isArray(notifications)).toBe(true);
  });

  it("should mark notification as read", async () => {
    // Créer un utilisateur de test temporaire
    const openId = `test-notif-read-${Date.now()}`;
    await db.upsertUser({
      openId,
      name: "Test Read User",
      email: `test-read-${Date.now()}@example.com`,
      role: "candidate",
    });
    
    const user = await db.getUserByOpenId(openId);
    if (!user) throw new Error("User not created");

    const caller = appRouter.createCaller({
      user: { id: user.id, role: "candidate" },
    } as Context);

    // Créer une notification de test
    await db.createNotification({
      userId: user.id,
      title: "Test Notification",
      content: "This is a test notification",
      type: "info",
      isRead: 0,
    });

    // Récupérer la notification créée
    const notifications = await db.getUserNotifications(user.id, 1);
    expect(notifications.length).toBeGreaterThan(0);
    
    const notificationId = notifications[0].id;

    // Marquer comme lue
    const result = await caller.notifications.markAsRead({ id: notificationId });

    expect(result.success).toBe(true);

    // Vérifier que la notification est marquée comme lue
    const updatedNotifications = await db.getUserNotifications(user.id, 1);
    expect(updatedNotifications[0].isRead).toBe(1);
  });

  it("should mark all notifications as read", async () => {
    // Créer un utilisateur de test temporaire
    const openId = `test-notif-all-${Date.now()}`;
    await db.upsertUser({
      openId,
      name: "Test All User",
      email: `test-all-${Date.now()}@example.com`,
      role: "candidate",
    });
    
    const user = await db.getUserByOpenId(openId);
    if (!user) throw new Error("User not created");

    const caller = appRouter.createCaller({
      user: { id: user.id, role: "candidate" },
    } as Context);

    // Créer plusieurs notifications de test
    await db.createNotification({
      userId: user.id,
      title: "Test Notification 1",
      content: "This is test notification 1",
      type: "info",
      isRead: 0,
    });

    await db.createNotification({
      userId: user.id,
      title: "Test Notification 2",
      content: "This is test notification 2",
      type: "info",
      isRead: 0,
    });

    // Marquer toutes comme lues
    const result = await caller.notifications.markAllAsRead();

    expect(result.success).toBe(true);

    // Vérifier que toutes les notifications sont marquées comme lues
    const notifications = await db.getUserNotifications(user.id, 50);
    const unreadCount = notifications.filter((n) => n.isRead === 0).length;
    expect(unreadCount).toBe(0);
  });

  it("should create notification directly", async () => {
    // Créer un utilisateur de test temporaire
    const openId = `test-notif-create-${Date.now()}`;
    await db.upsertUser({
      openId,
      name: "Test Create User",
      email: `test-create-${Date.now()}@example.com`,
      role: "candidate",
    });
    
    const user = await db.getUserByOpenId(openId);
    if (!user) throw new Error("User not created");

    // Créer une notification directement
    await db.createNotification({
      userId: user.id,
      title: "Nouveau partage",
      content: "Votre profil a été partagé sur Facebook",
      type: "info",
      isRead: 0,
    });

    // Vérifier que la notification a été créée
    const notifications = await db.getUserNotifications(user.id, 50);

    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].title).toBe("Nouveau partage");
  });
});
