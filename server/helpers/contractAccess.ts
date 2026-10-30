import type { Request } from "express";
import {
  COCKPIT_VERIFIED,
  type CockpitRequest,
} from "../_core/cockpit-auth-policy";
import { ORGANIZER_EMAIL } from "../../shared/candidate-contract";

type Actor = {
  id: number;
  email: string | null;
  role: string;
  organizationId: number | null;
};
const managers = new Set([
  "client",
  "admin",
  "super_admin",
  "owner",
  "organizer",
]);
export const canReadContracts = (user: Actor) =>
  managers.has(user.role) && user.organizationId === 1;
export const canValidateContracts = (user: Actor, req: Request) =>
  canReadContracts(user) &&
  user.email?.trim().toLowerCase() === ORGANIZER_EMAIL &&
  (req as CockpitRequest)[COCKPIT_VERIFIED] === true;
export const canAccessApplication = (
  user: Actor,
  application: { organizationId: number }
) =>
  canReadContracts(user) && application.organizationId === user.organizationId;
