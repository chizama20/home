import { v } from "convex/values";

// Shared by schema.ts and function return validators so they can't drift.
export const memberRoleValidator = v.union(
  v.literal("admin"),
  v.literal("staff"),
);

export const memberStatusValidator = v.union(
  v.literal("active"),
  v.literal("deactivated"),
);
