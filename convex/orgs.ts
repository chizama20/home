import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  assertOrgActive,
  getActiveMember,
  requireUser,
} from "./lib/access";
import { appError } from "./lib/errors";
import { normalizeSlug, validateOrgName, validateSlug } from "./lib/slug";
import { memberRoleValidator } from "./lib/validators";

// A person belongs to a handful of orgs; this bounds the list query.
const MAX_MEMBERSHIPS = 50;

// Creates an org with the caller as its first active admin. Returns the slug.
export const create = mutation({
  args: { name: v.string(), slug: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    const name = args.name.trim();
    const nameError = validateOrgName(name);
    if (nameError !== null) {
      throw appError("VALIDATION", nameError);
    }

    const slug = normalizeSlug(args.slug);
    const slugError = validateSlug(slug);
    if (slugError !== null) {
      throw appError("VALIDATION", slugError);
    }

    // One org per person: any active membership blocks creating another.
    const existing = await ctx.db
      .query("members")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .first();
    if (existing !== null) {
      throw appError("CONFLICT", "You already belong to an organization");
    }

    const taken = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (taken !== null) {
      throw appError("CONFLICT", "That URL is already taken");
    }

    // Approval gate arrives in Step 5; until then orgs start approved.
    const orgId = await ctx.db.insert("orgs", {
      name,
      slug,
      status: "approved",
      createdBy: userId,
    });
    await ctx.db.insert("members", {
      orgId,
      userId,
      role: "admin",
      status: "active",
    });
    return slug;
  },
});

// The caller's active memberships with the org fields the UI needs.
export const myMemberships = query({
  args: {},
  returns: v.array(
    v.object({
      orgId: v.id("orgs"),
      name: v.string(),
      slug: v.string(),
      role: memberRoleValidator,
    }),
  ),
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const memberships = await ctx.db
      .query("members")
      .withIndex("by_userId_and_status", (q) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .take(MAX_MEMBERSHIPS);

    const result = [];
    for (const membership of memberships) {
      const org = await ctx.db.get("orgs", membership.orgId);
      if (org === null) continue;
      result.push({
        orgId: org._id,
        name: org.name,
        slug: org.slug,
        role: membership.role,
      });
    }
    return result;
  },
});

// The org behind a URL slug, if the caller is an active member. Exact match
// only, so non-canonical URLs return null. Returns the same null for
// "no such org" and "not a member" so slugs can't be probed.
// Throws ORG_INACTIVE only to members of an org that isn't approved.
export const resolveSlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      orgId: v.id("orgs"),
      name: v.string(),
      role: memberRoleValidator,
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);

    const org = await ctx.db
      .query("orgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (org === null) return null;

    const member = await getActiveMember(ctx, org._id, userId);
    if (member === null) return null;

    assertOrgActive(org);
    return { orgId: org._id, name: org.name, role: member.role };
  },
});
