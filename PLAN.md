# Group Home — The Plan

> **One living doc.** What we're building, where we are, what's next, and the rules.
> Read **§0** to pick up immediately. Update it at the end of every work session.

---

## 0. ▶ Pick up here

| | |
|---|---|
| **Current step** | **Step 2 — Sidebar shell** |
| **Next action** | senior-architect does the after-the-fact Step 1 final review; then Step 2 starts (mostly frontend-god) |
| **Then** | frontend-god builds the shell → Baba tests → review → commit |
| **Branch** | `develop` |
| **Last commit** | Step 1 — org creation (see `git log`) |
| **Blocked on** | nothing |
| **Last updated** | Oct 11, 2026 |

**Waiting on Baba**
- nothing right now

---

## 1. Progress

| Step | What | Status |
|---|---|---|
| 0 | Housekeeping (Google auth, proxy rename, tokens) | ✅ Done — `389b17b` |
| 1 | Org admin creates an org | ✅ Done |
| 2 | Sidebar shell | 🔨 **Current** |
| 3 | Homes + audit + full access layer | ⬜ |
| 4 | Team and invites | ⬜ |
| 5 | Org approval | ⬜ |
| 6a | Shifts — model and week grid | ⬜ |
| 6b | Shifts — publish and notify | ⬜ |
| 6c | Shifts — open shifts and requests | ⬜ |
| 7 | Availability and time off | ⬜ |
| 8 | Time clock | ⬜ |
| 9 | Timesheets | ⬜ |
| 10 | Residents and launch readiness | ⬜ |
| 11 | Daily logs | ⬜ |

Legend: ✅ done · 🔨 in progress · ⬜ not started · ⛔ blocked

---

## 2. How we work

### The team

| Who | Does | Edits files? |
|---|---|---|
| **Baba** | Decisions, credentials/env vars, manual click-through testing, approves commits | — |
| **Claude (main session)** | Coordinates, runs agents, small chores, keeps this doc updated, commits | Yes |
| **backend-demon** | All Convex/backend code | Yes |
| **frontend-god** | All UI | Yes |
| **senior-architect** | Reviews each half before the next starts | No (read-only) |

Agents live in `.claude/agents/` (local only, never committed).

### The loop for every step

1. **backend-demon** builds the backend for the step
2. **senior-architect** reviews it — *before* any UI is built
3. **frontend-god** builds the UI against the backend's API
4. **Baba** walks the Done-when list by hand
5. **senior-architect** final review; typecheck, lint, build (and tests from Step 3) pass
6. **Claude** commits on `develop`, ticks the boxes here, updates §0

### Rules

- **One step at a time.** Each step works end to end before the next starts. Don't build ahead.
- **Git:** commit on `develop`. `main` stays deployable and only gets merged from `develop`. Never commit `.claude/`.
- **Each step ends green:** `bunx tsc --noEmit`, `bun run lint`, `bun run build`, tests.
- **Small UX calls:** do what Homebase does. **Data, security, business calls:** ask Baba.
- **Read before writing:** `node_modules/next/dist/docs/` (Next 16 differs) and `convex/_generated/ai/guidelines.md`.

### Updating this doc

- Finishing a task → tick its box.
- Finishing a step → mark it ✅ in §1 with the commit hash, move `🔨 Current` to the next step, update §0.
- New decision → add a row to §11.
- Review finding that's deferred → add it to §12 under the step it belongs to.
- Anything waiting on Baba → put it in §0 "Waiting on Baba".

---

## 3. Steps

### Step 0 — Housekeeping ✅

- [x] Fix Google OAuth (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, redirect URI `https://unique-bandicoot-232.convex.site/api/auth/callback/google`)
- [x] Rename `src/middleware.ts` → `src/proxy.ts`
- [x] Navy color tokens in `globals.css`
- [x] Replace hardcoded colors in auth screens with tokens
- [x] `develop` branch

---

### Step 1 — Org admin creates an org ✅

**Goal:** a signed-in user with no org creates one, becomes its admin, and lands on the org's page.

#### Backend — backend-demon

**Schema (`convex/schema.ts`)**

```ts
orgs: defineTable({
  name: v.string(),
  slug: v.string(),
  status: v.union(
    v.literal("pending"), v.literal("approved"),
    v.literal("rejected"), v.literal("suspended"),
  ),
  createdBy: v.id("users"),
}).index("by_slug", ["slug"]),

members: defineTable({
  orgId: v.id("orgs"),
  userId: v.id("users"),
  role: v.union(v.literal("admin"), v.literal("staff")),
  status: v.union(v.literal("active"), v.literal("deactivated")),
})
  .index("by_userId_and_status", ["userId", "status"])
  .index("by_orgId", ["orgId"])
  .index("by_orgId_and_userId", ["orgId", "userId"]),
```

- Org `status` → `"approved"` on create for now (approval gate is Step 5).
- Member `status` → `"active"` on create. Members are never deleted, only deactivated.
- `primaryHomeId` comes in Step 3 (needs `homes`).
- Don't touch the `users` table — Convex Auth needs its index names.

**Errors (`convex/lib/errors.ts`)** — `ConvexError({ code, message })` with the codes in §5.

**Access (`convex/lib/access.ts`)**
- `requireUser(ctx)` → `getAuthUserId`; null → `UNAUTHENTICATED`
- `requireMember(ctx, orgId)`, in order:
  1. `requireUser`
  2. member via `by_orgId_and_userId`; missing or not `active` → `FORBIDDEN`
  3. org `status !== "approved"` → `ORG_INACTIVE`
  4. return `{ userId, member, org }`

**Functions (`convex/orgs.ts`)**

| Function | Kind | Does |
|---|---|---|
| `orgs.create` | mutation | Args `name`, `slug`. Caller already has an active membership → `CONFLICT` (one org per person). Validates slug, creates org (`approved`), adds caller as active `admin`. Returns the slug. |
| `orgs.myMemberships` | query | My active orgs: `orgId`, `name`, `slug`, `role`. Bounded with `.take(n)`. |
| `orgs.resolveSlug` | query | `{ orgId, name, role }` if I'm an active member, else `null` — same `null` for "doesn't exist" and "not a member" so slugs can't be probed. |

**Slug rules** (shared in `convex/lib/slug.ts`, used by server and form): 3–40 chars, `^[a-z0-9]+(?:-[a-z0-9]+)*$` (no leading, trailing or double hyphens), unique. Reserved: `auth`, `onboarding`, `admin`, `api`, `settings`, `invite`, `new`, `pending`. Taken → `CONFLICT`; invalid/reserved → `VALIDATION`. `resolveSlug` matches exactly (an uppercase URL → `null` → redirected to the canonical one).

**Org name:** trimmed, 2–80 chars.

A user whose only membership is deactivated may create a new org (e.g. a former employee starting their own business).

#### Frontend — frontend-god

```
src/features/orgs/
  api/        use-my-memberships.ts, use-resolve-slug.ts, use-create-org.ts
  components/ create-org-form.tsx
src/lib/errors.ts   shared error mapper: codes → friendly messages (also plain-string auth errors)
```

- **`/onboarding`** — org name; slug auto-fills and stays editable. Submit → `orgs.create` → `/[slug]`. Already in an org → redirect to it.
- **`/`** — no org → `/onboarding`; otherwise → my org's `/[slug]`. (Picker comes in Step 4.)
- **`/[orgSlug]`** — placeholder: org name, my role, `<UserButton />`. `resolveSlug` null → `/`.
- Loading and error states on every page.
- Import slug/name rules from `convex/lib/slug.ts` — never a separate client slugify.
- Every org hook passes `"skip"` unless `useConvexAuth().isAuthenticated` (the queries throw `UNAUTHENTICATED` when signed out).
- Map errors on `err.data.code`, with a fallback for plain-string auth errors.
- Carry-over fixes (from Step 0 review): sign-in/sign-up toggle `<span onClick>` → real button; `String(err.data)` in `sign-up-card.tsx` → shared error mapper.

#### Tasks

- [x] backend-demon: schema, `errors.ts`, `access.ts`, `orgs.ts` (pushed to dev, uncommitted)
- [x] senior-architect: backend review — approved with changes
- [x] backend-demon: review fixes (`by_userId_and_status`, shared `lib/slug.ts`, exact-match `resolveSlug`, shared validators)
- [x] frontend-god: hooks, error mapper, form, three pages, carry-over fixes (uncommitted)
- [x] Baba: manual test (second account in a private window) — all passed
- [ ] senior-architect: final review (Baba chose to commit first; review runs after)
- [x] Commit on `develop`

#### Done when

- [x] New user signs in → lands on `/onboarding`
- [x] Creating an org → lands on `/[slug]`, shows org name and "admin"
- [x] Refresh stays on the org page
- [x] Taken or reserved slug shows a clear error on the form
- [x] User who already has an org can't create a second one
- [x] Second user visiting your slug gets redirected away
- [x] Signing out from the org page shows no error
- [x] Every function has arg and return validators
- [x] Typecheck, lint, build pass

---

### Step 2 — Sidebar shell 🔨

**Goal:** the app frame every later feature drops into. Mostly frontend-god.

- `[orgSlug]/layout.tsx` resolves the org once, guards membership, renders navy rail + header
- Rail: Dash, Shifts, Time, Residents, Team (admins only), Settings — empty pages
- Active item state, collapsed rail on small screens, user menu at the bottom (skeleton, not spinner)
- Light/dark toggle wired to the tokens (`suppressHydrationWarning` on `<html>`)
- Decide sidebar tokens on the real rail (see §12)
- Residents page stays empty — no resident names, even fake

**Done when:** every rail item routes · staff don't see Team · works at 375px · dark mode looks right

---

### Step 3 — Homes + audit + full access layer

**Goal:** admins manage homes; the security layer becomes the full version. **Don't split this step** — it's what prevents another cross-org leak.

- Add deps: `convex-helpers`, `luxon`, `convex-test`, `vitest`
- Tables: `homes`, `auditLog`; add `members.primaryHomeId`
- `convex/lib/timezones.ts`, `convex/lib/audit.ts`
- `access.ts` → `orgQuery` / `orgMutation` / `adminQuery` / `adminMutation` + `getOwned` (`NOT_FOUND` for other orgs' docs)
- ESLint `no-restricted-imports` on `convex/_generated/server` outside `convex/lib/` (allow-list: `users.ts`, `auth.ts`, onboarding)
- Settings → Homes: list, add, edit, archive (not the last active home)
- Home switcher in the header
- Onboarding also asks for the first home (name + time zone)
- Tests: cross-org → `FORBIDDEN`; other org's doc → `NOT_FOUND`; staff on admin mutation → `FORBIDDEN`; last-admin protection holds

**Done when:** homes CRUD works with audit rows · cross-org tests pass

---

### Step 4 — Team and invites

- Add dep: `resend`
- `invites` table — store a hash of the token, never the token
- Team page: list, invite (role + primary home), resend/revoke, change role, set primary home, deactivate
- `/invite/[token]`: sign up or sign in, then join
- Password reset + email verification (same email setup)
- `/` becomes an org picker for users in more than one org
- Invite acceptance looks up `by_orgId_and_userId` first and **reactivates** a deactivated row instead of inserting a second one (a duplicate would lock the person out)

**Done when:**
- [ ] Invited staff can join and only see staff screens
- [ ] Email verification is on **before** invites go live
- [ ] Accepting needs the token **and** a verified email matching the invite
- [ ] No mutation can leave an org with zero active admins

---

### Step 5 — Org approval

- New orgs start `pending` (one-line change — check already lives in `requireMember`)
- `myMemberships` returns org `status`; `resolveSlug` returns a tagged result (e.g. `{ kind: "inactive", status }`) instead of throwing `ORG_INACTIVE`, so `/` and `/[orgSlug]` render the pending screen instead of hitting the error boundary. Mutations keep throwing.
- Add to `orgs`: `reviewedBy?`, `reviewedAt?`, `reviewNote?`, `by_status` index
- Pending screen after onboarding, updates live when approved
- `platformAdmins` table; `platform.grant` internal mutation from the CLI
- `/admin/orgs`: list by status, approve, reject with note, suspend; rejected can resubmit

**Done when:** pending org can't reach any `[orgSlug]` page · approval flips it live without refresh

---

### Step 6 — Shifts (6a → 6b → 6c)

**Rule first:** a shift belongs to the home-local day of its `startsAt`. Duration = `endsAt - startsAt` in ms, never from clock times (overnight shifts are 7 or 9 h on DST nights). Free-form start/end — no shift-type enum.

- **6a — Model and week grid:** `shifts` table, week view by home (rows = members, columns = days), click to add, overlap check (`CONFLICT`), copy last week
- **6b — Publish and notify:** draft vs published, publish the week, staff only see published, notifications
- **6c — Open shifts and requests:** claim open shifts, drop/trade requests, admin approval queue

**Done when:** admin builds, publishes and fills a week across three homes · staff see and request changes

---

### Step 7 — Availability and time off
- Staff set weekly availability and request time off; admin approves/denies
- Schedule builder warns when assigning someone unavailable or on approved time off

### Step 8 — Time clock
- Clock in/out from the staff Dash, tied to the current shift
- Clock-in window around shift start (minutes TBD)
- Cron flags missed clock-outs; admin edits punches with a required note (audited)

### Step 9 — Timesheets
- Punches → hours per pay period; admin reviews, fixes, approves
- CSV export for payroll (confirm hours-only is what Precious AFC's payroll wants)

### Step 10 — Residents and launch readiness
- Residents grouped by home
- Convex Professional + BAA, Resend BAA
- Production deploy, backups reviewed, real-data migration plan, final security pass

### Step 11 — Daily logs
- Logs attach to a shift and a resident (after residents: every log is PHI)
- Later twist (from Giv): required logs before clock-out

---

## 4. The product

**Group Home** is a workforce and operations platform for Adult Foster Care operators. It starts with the core of Homebase — scheduling, time clock, timesheets, time off — then grows into what general tools don't cover: residents, care logs, compliance.

- **First customer:** Precious AFC Home, Inc. — three Michigan homes: **Merritt**, **Dixie**, **Southfield**
- **Long-term:** multi-tenant SaaS for many AFC operators
- **Production software:** real staff data, later resident health information
- **Owner:** Baba — owner, primary developer, decision-maker

| | Homebase | Giv | Group Home |
|---|---|---|---|
| Focus | Hourly workforce | IDD / group home care | Workforce first, AFC second |
| Our approach | Copy patterns and UX | Borrow ideas, differentiate | Ship the base, layer AFC twists |

**Why the rebuild:** the old version had two overlapping shift systems, a cross-org leak in `homeAccess.ts`, a signup bypass, and no time zone handling.

### Tenancy

```
Org (an operator, e.g. Precious AFC Home)
 ├── Homes (Merritt, Dixie, Southfield) — each has its own time zone
 ├── Members (a user's role in this org: admin | staff, active | deactivated)
 │     └── primary home (schedulable at any home in the org)
 └── Everything else — always tagged with orgId
```

- **User** = a login. **Member** = that user's role in one org.
- **One org created per person** for now. Multiple locations = homes in one org. Joining other orgs via invite is fine.
- URLs scoped by slug: `/precious-afc/shifts`
- Org lifecycle: `pending` → `approved` (or `rejected` → resubmit) → can be `suspended`

### Roles
Admin and Staff only. Manager comes later.

---

## 5. Security rules (non-negotiable)

1. **Identity from the server only** — `getAuthUserId(ctx)`. Never trust `userId`, `role`, `orgId` or `actorId` from the client.
2. **One access layer** — all checks in `convex/lib/access.ts`. From Step 3, no org function uses raw `query`/`mutation` (ESLint-enforced).
3. **Ownership check on every fetch by ID** — `getOwned` → `NOT_FOUND` (not `FORBIDDEN`) for other orgs' docs.
4. **Validators everywhere** — args and returns. Return only what the screen needs.
5. **Role checks on the server** — hiding a button isn't security.
6. **Users table** — keep Convex Auth's index names; org data lives in `members`.
7. **Last-admin protection** — no org ever has zero active admins.
8. **Never look up users by email with `.unique()`** — same email can exist twice (password + Google) until verification is on.

### Error codes

`throw new ConvexError({ code, message })` — the client maps codes to friendly text.

| Code | When |
|---|---|
| `UNAUTHENTICATED` | not signed in |
| `FORBIDDEN` | not a member, deactivated, or wrong role |
| `ORG_INACTIVE` | org pending, rejected or suspended |
| `NOT_FOUND` | missing, or belongs to another org |
| `VALIDATION` | bad input |
| `CONFLICT` | duplicate slug, second org, last admin, overlapping shift |

---

## 6. Data rules

- **Time:** UTC milliseconds. Each home's IANA `timezone` decides display **and** "what day is it here" (weeks, overnight shifts, pay periods). Never compute day boundaries in UTC. Luxon for zone math.
- **Soft delete only:** homes `archivedAt`, members `status: "deactivated"`.
- **Audit log (Step 3+):** append-only, every org-data mutation writes a row, never passwords/tokens, six-year retention.
- **Indexes:** every org-owned table has `orgId` + `by_orgId`. Names include every field (`by_orgId_and_userId`). `.withIndex()`, never `.filter()` on a full table. Bound every list.
- **Fake data only** until the Convex BAA is signed. No resident names anywhere until Step 10.

### Data model by step

| Table | Step | Key fields | Indexes |
|---|---|---|---|
| `users` | — | name, firstName, lastName, email, image | Convex Auth's |
| `orgs` | 1 | name, slug, status, createdBy · reviewedBy?, reviewedAt?, reviewNote? (Step 5) | `by_slug` · `by_status` (Step 5) |
| `members` | 1 | orgId, userId, role, status · primaryHomeId? (Step 3) | `by_userId_and_status`, `by_orgId`, `by_orgId_and_userId` |
| `homes` | 3 | orgId, name, address?, timezone, archivedAt? | `by_orgId` |
| `auditLog` | 3 | orgId, actorId, action, table, docId, before?, after? | `by_orgId` |
| `invites` | 4 | orgId, email, role, homeId?, tokenHash, expiresAt, acceptedAt?, invitedBy | `by_orgId`, `by_tokenHash`, `by_email` |
| `platformAdmins` | 5 | userId | `by_userId` |
| `shifts` | 6 | orgId, homeId, memberId?, startsAt, endsAt, status, note?, publishedAt? | `by_orgId_and_startsAt`, `by_homeId_and_startsAt`, `by_memberId_and_startsAt` |
| `shiftRequests` | 6 | orgId, type, shiftId, requesterId, targetMemberId?, status, decidedBy? | `by_orgId_and_status`, `by_shiftId` |
| `availability` | 7 | orgId, memberId, weekday, startMin, endMin, kind | `by_memberId` |
| `timeOff` | 7 | orgId, memberId, startsAt, endsAt, reason?, status, decidedBy? | `by_orgId_and_status`, `by_memberId_and_startsAt` |
| `punches` | 8 | orgId, homeId, memberId, shiftId?, clockInAt, clockOutAt?, editedBy?, editNote? | `by_memberId_and_clockInAt`, `by_orgId_and_clockInAt`, `by_shiftId` |
| `timesheets` | 9 | orgId, memberId, periodStart, periodEnd, status, approvedBy? | `by_orgId_and_periodStart` |
| `residents` | 10 | orgId, homeId, name, (TBD) | `by_orgId`, `by_homeId` |
| `dailyLogs` | 11 | orgId, residentId, shiftId, authorMemberId, (TBD) | `by_residentId`, `by_shiftId` |

Only add a table when its step starts.

---

## 7. Design system

**Look:** Homebase-style layout — left rail, clean header, dense but friendly. Light default, dark toggle, navy base. Tokens live in `src/app/globals.css`.

| Token | Light | Dark |
|---|---|---|
| background / foreground | `#F5F7FA` / `#13203A` | `#0B1526` / `#E6EBF3` |
| card, popover | `#FFFFFF` | `#12233F` |
| primary / -foreground | `#1F3A66` / `#FFFFFF` | `#8DB0EC` / `#0B1526` |
| secondary, muted | `#EEF1F6` | `#1A2B47` |
| muted-foreground | `#5B6880` | `#9AA7BD` |
| accent / -foreground | `#E8EEF8` / `#1F3A66` | `#1F3559` / `#E6EBF3` |
| destructive | `#B91C1C` | `#F87171` |
| border, input | `#E2E7EF` | `#22365A` |
| ring | `#1F3A66` | `#8DB0EC` |
| sidebar / -foreground | `#12233F` / `#B8C3D6` | `#0E1C33` / `#9AA7BD` |
| sidebar-accent / -border | `#1F3559` | `#1A2B47` |
| success / warning | `#15803D` / `#B45309` | `#4ADE80` / `#FBBF24` |
| sidebar-primary, sidebar-ring | *decide in Step 2* | *decide in Step 2* |

**Rules**
- **Tokens only** — `bg-primary`, `text-muted-foreground`. Never hex or `text-blue-600`.
- **Color is earned** — navy = actions/brand, green = done/clocked in, amber = warning/late, red = urgent. Nothing else.
- Status badges are semantic only.
- Plus Jakarta Sans, 13–14px body, ~20px semibold titles.
- `rounded-md` / `rounded-lg`, never `rounded-2xl`. Flat — no gradients, no heavy shadows.
- Every screen: loading, empty, error, success states. Works at 375px.

**Navigation**

| Rail | Admin | Staff | Contents |
|---|---|---|---|
| Dash | ✓ | ✓ | Admin: who's on, open shifts, requests. Staff: next shift, clock in. |
| Shifts | ✓ | ✓ | Admin: week builder, publish. Staff: my shifts, open shifts. |
| Time | ✓ | ✓ | Admin: timesheets, missed clock-outs. Staff: clock in/out, hours. |
| Residents | ✓ | ✓ | By home |
| Team | ✓ | — | Members, invites, roles |
| Settings | ✓ | ✓ | Admin: org, homes. Everyone: profile, theme. |

Header: page title + home switcher.

### Homebase behaviors to copy
- Draft → publish in one action, notifies staff
- Open shifts can be claimed; trades/drops go through admin
- Who's working now is one glance from Dash
- Clock in is the biggest button during a shift
- Timesheets show scheduled vs actual, edits tracked
- Notifications: email + in-app (no SMS)

---

## 8. Tech stack and layout

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3.8, App Router, Turbopack — **read `node_modules/next/dist/docs/`** |
| UI | React 19, Tailwind v4, shadcn/ui on Base UI (base-nova), lucide-react, Plus Jakarta Sans |
| Backend | Convex — **read `convex/_generated/ai/guidelines.md`** |
| Auth | Convex Auth (Password, Google) |
| Planned | Resend (Step 4), Luxon + convex-helpers + convex-test + Vitest (Step 3) |
| Package manager | bun |
| Convex dev deployment | `unique-bandicoot-232` |

**Pattern:** each feature = `src/features/<name>/` (`api/` hooks + `components/`) + `convex/<name>.ts`. Pages in `app/` stay thin. Components call hooks, never `useQuery(api…)` directly.

```
src/app/  auth/  onboarding/  invite/[token]/  admin/  [orgSlug]/{dash,shifts,time,residents,team,settings}
src/features/  auth/ orgs/ homes/ team/ shifts/ time/ residents/
src/components/  ui/ (shadcn only)  shell/ (rail, header, home switcher)
convex/lib/  access.ts  audit.ts  errors.ts  timezones.ts
convex/  orgs  homes  members  invites  platform  shifts  shiftRequests  availability  timeOff  punches  timesheets  residents  logs  crons
```

**Conventions:** kebab-case files, PascalCase components, camelCase Convex verbs (`create`, `list`, `setRole`). No dead code. Forms disable while submitting and show errors inline.

---

## 9. Compliance

- **PHI** = resident data. Treat the whole app as sensitive.
- **BAAs before real resident data:** Convex (Professional+), Resend, any vendor touching PHI.
- Michigan: LARA licensing, DWIHN standards; keep data FHIR R4-friendly.
- HIPAA status and legal questions → a real lawyer.

---

## 10. Open questions

- Shift trades: admin approval or auto between staff? *(default: admin approval)*
- GPS check on clock-in? *(default: none)*
- Clock-in window length?
- Pay periods: weekly, biweekly, semimonthly?
- Platform admins besides Baba?
- Next app hosting (Vercel?) and whether it needs a BAA
- Can rejected orgs resubmit forever?
- Does Michigan LARA require awake overnight staff / minimum ratios? (affects future coverage rules)

---

## 11. Decisions log

| Date | Decision |
|---|---|
| — | Homebase-style workforce base first, AFC features after |
| — | Multi-tenant from day one: org → homes → members |
| — | Next.js 16 + Convex + Convex Auth, fresh repo |
| — | Admin and Staff roles only for now |
| — | Staff have a primary home but are schedulable anywhere in the org |
| — | Staff see all residents, grouped by home |
| — | Free-form shifts, no AM/PM/Overnight enum; no daily shift gate |
| — | Wages not stored in the base system |
| — | Notifications: email + in-app |
| — | Web first, mobile-friendly; native later |
| — | Create-org signup with platform-admin approval; self-serve later behind a flag |
| — | Navy base, light default + dark mode |
| Oct 11, 2026 | One created org per person for now |
| Oct 11, 2026 | Daily logs moved after residents (Step 11) — they're PHI |
| Oct 11, 2026 | Index names include every field (`by_orgId_and_userId`) |
| Oct 11, 2026 | `/` goes to your org until Step 4, then a picker |
| Oct 11, 2026 | Commit directly on `develop`; `.claude/` never tracked; `PLAN.md` is committed |
| Oct 11, 2026 | Team: backend-demon, frontend-god, senior-architect (review) |
| Oct 11, 2026 | Product name is "Home" for now |
| Oct 11, 2026 | Shared error mapper lives in `src/lib/errors.ts` (used by every feature) |

---

## 12. Deferred fixes

Findings from reviews, parked under the step that fixes them.

**Step 1**
- [x] Sign-in/sign-up toggle is `<span onClick>` — not keyboard reachable → `<button type="button">`
- [x] `String(err.data)` in `sign-up-card.tsx` → shared error mapper (keep handling plain-string auth errors)

**Step 2**
- [ ] Sidebar tokens: `--sidebar-ring: #8DB0EC` (approved). `--sidebar-primary`: white vs `#8DB0EC` — decide on the real rail (architect leans `#8DB0EC` / fg `#12233F`). Add result to §7.
- [ ] `md:w-[550px]` on auth screen → `max-w-md`
- [ ] Spinner in user-button → skeleton
- [ ] Dark mode: card `#12233F` vs auth background `#0E1C33` very close — check
- [ ] `shadow-lg` in `components/ui/dropdown-menu.tsx`

**Step 4**
- [ ] Account linking: password + Google with the same email = two users. Solved by email verification before invites.

**Step 3** (with the error/wrapper work)
- [ ] Add optional `field` to `AppErrorData` (`{ code, message, field?: "name" | "slug" }`); the create-org form currently routes server errors to fields by matching message text

**Needs Baba**
- [x] Product name for the browser tab → "Home" for now

**Anytime**
- [x] Stray `C:\Users\Chi\package.json` / `package-lock.json` → moved to `C:\Users\Chi\stray-npm-backup\`
- [x] `.gitattributes` for line endings (LF)

---

## 13. Later backlog

**AFC:** required logs before clock-out · certifications with expiry alerts · resident-specific training · MAR with sign-off · incidents with escalation (needs Manager) · vitals, appointments, documents · resident funds ledger · safety checks, training management

**Workforce:** Manager role · announcements · shift tasks/checklists · payroll via Check · labor cost (needs wages) · native mobile + push

**Integrations:** Epic FHIR R4 · openFDA · OCR document import

---

## 14. Session log

Newest first. One or two lines per session.

- **Oct 11, 2026** — Step 1 done: orgs + members, access layer, onboarding, org page; Baba's manual test passed. App titled "Home".
- **Oct 11, 2026** — Merged the two planning docs into this `PLAN.md`. Built the agent team. Step 0 done (Google auth fixed, proxy rename, navy tokens) → `389b17b` on `develop`. Next: Step 1 backend.
