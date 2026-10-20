// The areas of an org, each a route under /[orgSlug] (PLAN.md §7 navigation).
export const ORG_SECTIONS = [
  "dash",
  "shifts",
  "time",
  "residents",
  "team",
  "settings",
] as const;

export type OrgSection = (typeof ORG_SECTIONS)[number];

// Where an org link points. Dash is the landing page for every role.
export const orgPath = (slug: string, section: OrgSection = "dash") =>
  `/${slug}/${section}`;
