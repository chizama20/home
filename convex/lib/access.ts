import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { appError } from "./errors";

// The single place for permission checks (PLAN.md §5 rule 2).
// MutationCtx extends QueryCtx, so every helper here works in both.

// The signed-in user's ID, derived from the auth token. Never from args.
export async function requireUser(ctx: QueryCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw appError("UNAUTHENTICATED", "You need to sign in");
  }
  return userId;
}

// The user's active membership in the org, or null. Non-throwing so callers
// that must not reveal whether an org exists (orgs.resolveSlug) can use it.
export async function getActiveMember(
  ctx: QueryCtx,
  orgId: Id<"orgs">,
  userId: Id<"users">,
): Promise<Doc<"members"> | null> {
  const member = await ctx.db
    .query("members")
    .withIndex("by_orgId_and_userId", (q) =>
      q.eq("orgId", orgId).eq("userId", userId),
    )
    .unique();
  return member !== null && member.status === "active" ? member : null;
}

// Only approved orgs can be used. Call after membership is established, so
// the status of an org is only ever revealed to its own members.
export function assertOrgActive(org: Doc<"orgs">): void {
  if (org.status !== "approved") {
    throw appError("ORG_INACTIVE", "This organization isn't active");
  }
}

// Signed in -> active member -> org approved, in that order.
export async function requireMember(
  ctx: QueryCtx,
  orgId: Id<"orgs">,
): Promise<{ userId: Id<"users">; member: Doc<"members">; org: Doc<"orgs"> }> {
  const userId = await requireUser(ctx);
  const member = await getActiveMember(ctx, orgId, userId);
  if (member === null) {
    throw appError("FORBIDDEN", "You don't have access to this organization");
  }
  const org = await ctx.db.get("orgs", orgId);
  if (org === null) {
    // Unreachable while members are never orphaned; fail closed regardless.
    throw appError("FORBIDDEN", "You don't have access to this organization");
  }
  assertOrgActive(org);
  return { userId, member, org };
}
