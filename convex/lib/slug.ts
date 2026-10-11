// Org name and slug rules, shared by orgs.create (server) and the create-org
// form (client) so both enforce the same thing. Keep this module free of
// server imports so it can be bundled into the Next.js app.

export const ORG_NAME_MIN = 2;
export const ORG_NAME_MAX = 80;

export const SLUG_MIN = 3;
export const SLUG_MAX = 40;
// Lowercase letters and digits in hyphen-separated groups: no leading,
// trailing or doubled hyphens.
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Top-level routes and words an org slug must never shadow.
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "auth",
  "onboarding",
  "admin",
  "api",
  "settings",
  "invite",
  "new",
  "pending",
]);

export function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

// Error message for an invalid org name, or null when valid.
// Expects the name already trimmed.
export function validateOrgName(name: string): string | null {
  if (name.length < ORG_NAME_MIN || name.length > ORG_NAME_MAX) {
    return `Organization name must be ${ORG_NAME_MIN}-${ORG_NAME_MAX} characters`;
  }
  return null;
}

// Error message for an invalid slug, or null when valid. Expects the slug
// already normalized. Uniqueness is checked only on the server.
export function validateSlug(slug: string): string | null {
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX) {
    return `URL must be ${SLUG_MIN}-${SLUG_MAX} characters`;
  }
  if (!SLUG_PATTERN.test(slug)) {
    return "URL can only use lowercase letters, numbers and single hyphens between them";
  }
  if (RESERVED_SLUGS.has(slug)) {
    return "That URL is reserved. Try another one";
  }
  return null;
}

// A slug suggestion from an org name, e.g. "Precious AFC Home, Inc." ->
// "precious-afc-home-inc". Always matches SLUG_PATTERN when non-empty; it may
// still be too short or reserved, so run validateSlug on the result.
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, SLUG_MAX)
    .replace(/^-+|-+$/g, "");
}
