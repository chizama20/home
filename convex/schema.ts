import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server"
import { v } from "convex/values";
import { memberRoleValidator, memberStatusValidator } from "./lib/validators";

const schema = defineSchema({
    ...authTables,
    // Extends Convex Auth's users table. The "email" and "phone" index names
    // are required by Convex Auth, so they must stay as they are.
    users: defineTable({
        name: v.optional(v.string()),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
    })
        .index("email", ["email"])
        .index("phone", ["phone"]),

    // An operator (e.g. Precious AFC Home). Slugs are normalized and unique,
    // enforced in orgs.create.
    orgs: defineTable({
        name: v.string(),
        slug: v.string(),
        status: v.union(
            v.literal("pending"),
            v.literal("approved"),
            v.literal("rejected"),
            v.literal("suspended"),
        ),
        createdBy: v.id("users"),
    }).index("by_slug", ["slug"]),

    // A user's role in one org. Never deleted, only deactivated.
    // At most one row per (orgId, userId).
    members: defineTable({
        orgId: v.id("orgs"),
        userId: v.id("users"),
        role: memberRoleValidator,
        status: memberStatusValidator,
    })
        .index("by_userId_and_status", ["userId", "status"])
        .index("by_orgId", ["orgId"])
        .index("by_orgId_and_userId", ["orgId", "userId"]),
});

export default schema;
