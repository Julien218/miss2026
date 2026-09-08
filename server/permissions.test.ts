/**
 * Tests unitaires pour le système de permissions
 * 
 * Vérifie :
 * - Calcul des permissions effectives (rôle + overrides)
 * - Validation des overrides (add/remove)
 * - Vérification de permissions individuelles
 */

import { describe, it, expect } from "vitest";
import {
  Permission,
  ROLE_PERMISSIONS,
  getEffectivePermissions,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRoleDefaultPermissions,
} from "./permissions";

describe("Système de permissions", () => {
  describe("getRoleDefaultPermissions", () => {
    it("devrait retourner les permissions par défaut d'un admin", () => {
      const permissions = getRoleDefaultPermissions("admin");
      expect(permissions).toContain(Permission.CAN_MANAGE_USERS);
      expect(permissions).toContain(Permission.CAN_MANAGE_INVITATIONS);
      expect(permissions).toContain(Permission.CAN_VIEW_AUDIT_LOGS);
      expect(permissions.length).toBe(14); // Toutes les permissions
    });

    it("devrait retourner les permissions par défaut d'un photographe", () => {
      const permissions = getRoleDefaultPermissions("photographe");
      expect(permissions).toContain(Permission.CAN_VIEW_CANDIDATES);
      expect(permissions).toContain(Permission.CAN_UPLOAD_MEDIA);
      expect(permissions).toContain(Permission.CAN_VIEW_MEDIA);
      expect(permissions).not.toContain(Permission.CAN_DELETE_MEDIA);
      expect(permissions).not.toContain(Permission.CAN_MANAGE_USERS);
    });

    it("devrait retourner les permissions par défaut d'un jury", () => {
      const permissions = getRoleDefaultPermissions("jury");
      expect(permissions).toContain(Permission.CAN_VIEW_CANDIDATES);
      expect(permissions).toContain(Permission.CAN_VIEW_JURY_AREA);
      expect(permissions).toContain(Permission.CAN_SUBMIT_SCORES);
      expect(permissions).not.toContain(Permission.CAN_MANAGE_USERS);
    });

    it("devrait retourner un tableau vide pour un rôle inconnu", () => {
      const permissions = getRoleDefaultPermissions("unknown_role");
      expect(permissions).toEqual([]);
    });
  });

  describe("getEffectivePermissions", () => {
    it("devrait retourner les permissions par défaut sans overrides", () => {
      const permissions = getEffectivePermissions("manager", null);
      expect(permissions).toContain(Permission.CAN_VIEW_CANDIDATES);
      expect(permissions).toContain(Permission.CAN_EDIT_CANDIDATES);
      expect(permissions).not.toContain(Permission.CAN_MANAGE_USERS);
    });

    it("devrait ajouter des permissions avec overrides.add", () => {
      const overrides = JSON.stringify({
        add: [Permission.CAN_DELETE_MEDIA],
      });
      const permissions = getEffectivePermissions("photographe", overrides);
      
      expect(permissions).toContain(Permission.CAN_UPLOAD_MEDIA); // Permission par défaut
      expect(permissions).toContain(Permission.CAN_DELETE_MEDIA); // Permission ajoutée
    });

    it("devrait retirer des permissions avec overrides.remove", () => {
      const overrides = JSON.stringify({
        remove: [Permission.CAN_EDIT_CANDIDATES],
      });
      const permissions = getEffectivePermissions("manager", overrides);
      
      expect(permissions).toContain(Permission.CAN_VIEW_CANDIDATES); // Permission conservée
      expect(permissions).not.toContain(Permission.CAN_EDIT_CANDIDATES); // Permission retirée
    });

    it("devrait gérer add et remove simultanément", () => {
      const overrides = JSON.stringify({
        add: [Permission.CAN_MANAGE_USERS],
        remove: [Permission.CAN_EDIT_CANDIDATES],
      });
      const permissions = getEffectivePermissions("manager", overrides);
      
      expect(permissions).toContain(Permission.CAN_MANAGE_USERS); // Ajoutée
      expect(permissions).not.toContain(Permission.CAN_EDIT_CANDIDATES); // Retirée
      expect(permissions).toContain(Permission.CAN_VIEW_CANDIDATES); // Conservée
    });

    it("ne devrait pas dupliquer les permissions lors de l'ajout", () => {
      const overrides = JSON.stringify({
        add: [Permission.CAN_VIEW_CANDIDATES], // Déjà présente
      });
      const permissions = getEffectivePermissions("manager", overrides);
      
      const count = permissions.filter((p) => p === Permission.CAN_VIEW_CANDIDATES).length;
      expect(count).toBe(1); // Pas de duplication
    });

    it("devrait gérer un JSON invalide sans crash", () => {
      const permissions = getEffectivePermissions("manager", "invalid json");
      expect(permissions).toContain(Permission.CAN_VIEW_CANDIDATES); // Permissions par défaut
    });
  });

  describe("hasPermission", () => {
    it("devrait retourner true si l'utilisateur a la permission", () => {
      const result = hasPermission("admin", Permission.CAN_MANAGE_USERS, null);
      expect(result).toBe(true);
    });

    it("devrait retourner false si l'utilisateur n'a pas la permission", () => {
      const result = hasPermission("viewer", Permission.CAN_MANAGE_USERS, null);
      expect(result).toBe(false);
    });

    it("devrait retourner true si la permission est ajoutée via overrides", () => {
      const overrides = JSON.stringify({
        add: [Permission.CAN_DELETE_MEDIA],
      });
      const result = hasPermission("photographe", Permission.CAN_DELETE_MEDIA, overrides);
      expect(result).toBe(true);
    });

    it("devrait retourner false si la permission est retirée via overrides", () => {
      const overrides = JSON.stringify({
        remove: [Permission.CAN_EDIT_CANDIDATES],
      });
      const result = hasPermission("manager", Permission.CAN_EDIT_CANDIDATES, overrides);
      expect(result).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("devrait retourner true si l'utilisateur a toutes les permissions", () => {
      const result = hasAllPermissions(
        "admin",
        [Permission.CAN_MANAGE_USERS, Permission.CAN_VIEW_CANDIDATES],
        null
      );
      expect(result).toBe(true);
    });

    it("devrait retourner false si l'utilisateur manque une permission", () => {
      const result = hasAllPermissions(
        "viewer",
        [Permission.CAN_VIEW_CANDIDATES, Permission.CAN_MANAGE_USERS],
        null
      );
      expect(result).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("devrait retourner true si l'utilisateur a au moins une permission", () => {
      const result = hasAnyPermission(
        "viewer",
        [Permission.CAN_VIEW_CANDIDATES, Permission.CAN_MANAGE_USERS],
        null
      );
      expect(result).toBe(true); // Viewer a CAN_VIEW_CANDIDATES
    });

    it("devrait retourner false si l'utilisateur n'a aucune permission", () => {
      const result = hasAnyPermission(
        "viewer",
        [Permission.CAN_MANAGE_USERS, Permission.CAN_DELETE_MEDIA],
        null
      );
      expect(result).toBe(false);
    });
  });

  describe("Scénarios réels", () => {
    it("Photographe avec permission delete ajoutée", () => {
      const overrides = JSON.stringify({
        add: [Permission.CAN_DELETE_MEDIA],
      });
      
      expect(hasPermission("photographe", Permission.CAN_UPLOAD_MEDIA, overrides)).toBe(true);
      expect(hasPermission("photographe", Permission.CAN_DELETE_MEDIA, overrides)).toBe(true);
      expect(hasPermission("photographe", Permission.CAN_MANAGE_USERS, overrides)).toBe(false);
    });

    it("Manager avec permission edit retirée", () => {
      const overrides = JSON.stringify({
        remove: [Permission.CAN_EDIT_CANDIDATES],
      });
      
      expect(hasPermission("manager", Permission.CAN_VIEW_CANDIDATES, overrides)).toBe(true);
      expect(hasPermission("manager", Permission.CAN_EDIT_CANDIDATES, overrides)).toBe(false);
    });

    it("Jury avec permissions par défaut", () => {
      expect(hasPermission("jury", Permission.CAN_VIEW_JURY_AREA, null)).toBe(true);
      expect(hasPermission("jury", Permission.CAN_SUBMIT_SCORES, null)).toBe(true);
      expect(hasPermission("jury", Permission.CAN_MANAGE_USERS, null)).toBe(false);
    });
  });
});
