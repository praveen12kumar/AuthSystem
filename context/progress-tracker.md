# Progress Tracker

## Current Phase

Auth, Tag, Course, Section, SubSection, and Payment/Enrollment are all functionally
complete end-to-end, backend **and** frontend. Instructors upload a real lesson video per
section and can rename/replace-video/delete it; students watch it inline on the course
detail page and can now actually buy a course via Razorpay Checkout, with the course
detail page's Enroll button showing a real "✓ Enrolled" state afterward. Review/
CourseProgress are still open (see Next Up).

## Completed

- Full auth flow: signup, OTP email verification, signin, forgot/reset/change password,
  backed by JWT + Redis-based OTP state machine.
- Frontend auth UI: signin/signup/OTP/forgot/change/reset password pages, protected
  route, `AuthContext` + `useAuth`, React Query mutation hooks per auth action.
- Context system set up: `project-overview.md`, `architecture-context.md`,
  `code-standards.md`, `ui-context.md`, `ai-workflow-rules.md`, this tracker, and root
  `CLAUDE.md` index.
- **Tag, Course, Section, SubSection (lesson) — full CRUD, backend and frontend, all
  four domains.** Layering is consistent throughout: `route → validate(zodSchema) →
  controller → service → repository → Mongoose model`; reads public, writes require
  `authorize('ADMIN', 'INSTRUCTOR')` + course ownership. Ownership middlewares
  (`authMiddleware.js`) resolve up the chain to the owning Course from whatever id shape
  each route has available — `isCourseOwnerOrAdmin`, `isSectionOwnerOrAdmin`,
  `isSubSectionOwnerOrAdmin` — see `code-standards.md` for the dual-resolution pattern.
  Course thumbnails and lesson videos both go through Cloudinary (`multer` memory
  storage, no temp files) with best-effort cleanup of the old asset on
  replace/delete (`safeDeleteCloudinaryImage`/`Video`) and denormalized back-references
  kept in sync via atomic `$push`/`$pull` (`User.courses`, `Course.sections`,
  `Section.subSections`) — see `architecture-context.md` Invariants. Deleting a Course
  cascades to its Sections; a lesson's `duration` is always Cloudinary-derived, never
  client-supplied.
- Frontend: `Home`, `CourseCatalogContainer` (search + tag filter), `CourseDetailContainer`
  (curriculum accordion with inline lesson video playback), `InstructorDashboardContainer`
  (role-gated via `ProtectedRoute`'s `roles` prop), `CourseFormContainer` +
  `SectionManager` + `LessonManager` (nested create/rename/replace/delete for course →
  sections → lessons, same interaction vocabulary throughout: inline rename, AlertDialog
  delete confirm). Brand color (violet) + Outfit font wired into `index.css`,
  `framer-motion` for animation (see `ui-context.md`).
- **Two real bugs found via live Playwright verification** (not caught by curl-only
  testing): (1) `signInService` returned `{firstName, lastName, email, avatar, token}` —
  no `id`/`role` — silently breaking every role-gated frontend check even though the JWT
  itself had both; fixed by adding them to the response body. (2) `libs/cloudinaryConfig.js`
  imported the `cloudinary` package's legacy **v1** default export, which silently
  ignores `resource_type` and always uploads as an image — video uploads failed "Invalid
  image file" until switched to `cloudinaryPkg.v2`. Both fixed and re-verified live.
- **UI accessibility/quality audit** using the newly-installed `ui-ux-pro-max` skill (see
  `ui-context.md` Tooling) — a polish pass, not a re-theme: kept the existing brand and
  page structure. `App.jsx` now wraps the tree in `<MotionConfig reducedMotion="user">`
  so every animation respects OS-level reduced-motion automatically. Tag-filter/select
  chips were a styled `<span onClick>` (shadcn `Badge`'s default render) — not
  keyboard-focusable at all; now `<Badge asChild>` wrapping a real
  `<button aria-pressed>`. Added missing `aria-label`s to icon-only buttons throughout.
  Fixed the default `<title>frontend</title>`. Live-verified with Playwright. Deliberately
  left Auth pages and full 44px touch-target sizing untouched (see Open Questions).
- **Fixed a real security bug the user found manually**: `GET /api/v1/subsections` and
  `GET /api/v1/subsections/:id` had no `isAuthenticated` check — any anonymous visitor
  (not even logged in) could fetch a lesson's real `videoUrl` and watch or download it,
  discoverable via the native `<video controls>` element's "⋮" overflow menu (Chromium
  adds a Download option there by default) or just by calling the API directly. Root
  cause: SubSection reads copied the "reads are public" pattern from Tag/Course/Section
  without accounting for the fact that a lesson's response carries actual paid content
  (the video), not just browsable metadata. Fixed by requiring login on both routes; per
  explicit product decision, this is an **interim** policy (any authenticated user can
  watch, not just enrolled ones) since enrollment doesn't exist yet — see
  `architecture-context.md` Invariants. Also added `controlsList="nodownload"` +
  `onContextMenu` prevention on the `<video>` element as UI friction (not real
  protection on its own). Live-verified: anonymous request now 401s, a logged-in
  non-owner `STUDENT` still gets 200 (matches the agreed interim policy), frontend
  degrades to the existing "no lessons" empty state when logged out rather than crashing.
- **Payments/Enrollment — full Razorpay Standard Checkout integration, backend and
  frontend.** `POST /payments/orders` creates a Razorpay order with a server-computed
  amount (never client-supplied) and a `PENDING` `Payment` record; the frontend opens
  Razorpay's Checkout.js widget, and on completion posts the gateway's response to
  `POST /payments/verify`, which recomputes the HMAC-SHA256 signature
  (`crypto.timingSafeEqual`, not `===`) as the sole source of truth for success, then
  enrolls the student via an idempotent `$addToSet` on `Course.studentsEnrolled`. See
  `architecture-context.md` Payment Model for the full flow and
  `code-standards.md` for the `$addToSet` vs. `$push` and secret-handling conventions.
  `CourseDetailContainer`/`CourseDetail` now show a real "✓ Enrolled" state instead of
  the old placeholder toast. **Fully live-verified**: a genuine Razorpay test-mode
  payment was driven end-to-end via Playwright (real order, real Checkout UI, real OTP
  step, real signature verification, real `studentsEnrolled` update), then all resulting
  test artifacts (Payment records, test enrollment) were cleaned up. Two real bugs caught
  during this build: Razorpay's `receipt` field has an undocumented-until-hit 40-char
  cap (`course_${courseId}_${Date.now()}` was too long); this specific test account
  rejects generic international test cards, domestic test Mastercard
  `5267 3181 8797 5449` works. **Not yet done as part of this feature** (see Next Up):
  no webhook handler (a payment that succeeds on Razorpay's side but never reaches
  `/payments/verify` — closed tab, network drop — leaves the `Payment` stuck `PENDING`
  and the user unenrolled).
- **Tightened the SubSection video-read gate from "any logged-in user" to real
  enrollment**, now that Payment/Enrollment exists to check against — the follow-up the
  interim policy above was always waiting on. `isEnrolledOrOwnerOrAdmin`
  (`authMiddleware.js`) now requires `course.studentsEnrolled` membership, course
  ownership, or `ADMIN` on both SubSection read routes; the frontend
  (`CourseDetail.jsx`) only renders `LessonList` when `isOwner || isEnrolled`, showing an
  "Enroll to unlock" message otherwise instead of a misleading empty state. Found this
  gap because the user, logged in as a non-enrolled student
  (`kunalkmeshram19@gmail.com`), reported they could still play course videos — live
  verification confirmed the old behavior (200) and the fix (403 for non-enrolled, 200
  for enrolled/owner/admin) directly against the real dev database.

## In Progress

- Nothing actively in progress. Payment/Enrollment (see Completed) is built and
  live-verified but not yet committed/pushed.

## Next Up

Pick one (per `ai-workflow-rules.md` scoping rule — one at a time):
- Course search/filter is currently client-side only (catalog page filters an
  already-fetched full course list) — `GET /courses` has no server-side query params;
  revisit if the catalog needs to scale past fetch-everything
- Payment webhook handling — right now a payment can succeed on Razorpay's side but
  never get recorded here if the client never calls `/payments/verify` (closed tab,
  network drop mid-flow); a Razorpay webhook would let the backend confirm success
  independent of the client. No webhook signature-verification exists yet.
- USD-vs-INR mismatch: displayed course prices are hardcoded `$`, but the Razorpay order
  is always created in `currency: 'INR'` at the raw numeric price — the amount actually
  charged doesn't match the displayed currency symbol. Needs a product decision (convert
  displayed price, or store/charge in the currency actually displayed) before fixing.
- A "My Purchases" / order history page for students (Payment records exist but aren't
  surfaced anywhere in the UI yet)

## Open Questions

- The accessibility audit found most interactive elements are 32-36px (shadcn's default
  `sm`/`icon-sm` button sizes), below the 44×44px touch-target guideline. Left as-is
  since fixing it site-wide would be a real visual-density change, not a quick polish —
  revisit if mobile usability actually becomes a complaint, rather than pre-emptively.
- The same audit only covered Tag/Course/Section/SubSection UI (what's been actively
  built) — Auth pages (signin/signup/OTP/forgot-password) weren't in scope and may have
  similar gaps (untested).
- Should `swagger-autogen` (API docs) be wired up now, or is it for a later phase? It's
  installed but unreferenced.
- Should the frontend switch to sending `Authorization: Bearer <token>` now (matching
  the chosen standard in `architecture-context.md`), or stay on `x-access-token` until
  a broader auth cleanup pass?
- Timeline for fixing known drift (see Architecture Decisions below) — bundle into one
  cleanup pass, or fix opportunistically while touching nearby code?

## Architecture Decisions

- **Auth header standard: `Authorization: Bearer <token>`**, not `x-access-token`.
  Reason: conventional JWT header; backend middleware already prefers it. Frontend still
  sends `x-access-token` — not yet migrated.
- **Course FK fields are named `course`, not `courseID`.**
  Reason: matches the majority of existing models (payment, review, section).
  `courseProgressSchema.js` still uses `courseID` (and has a related index bug
  referencing a non-existent `course` field) — not yet fixed.
- **`schema/` will become `models/`**, and `validators/userSchema.js` stays put.
  Reason: `schema/*.js` files are Mongoose models, not schemas in the Zod sense; the
  shared name with `validators/userSchema.js` (a Zod schema) is confusing. Rename not
  yet done.
- **Presentational auth components drop the `Card` suffix.**
  Reason: 4 of 6 existing components (`ForgotPassword`, `ChangePassword`,
  `OneTimePassword`, `ResetPassword`) already have no suffix; `SignInCard`/`SignUpCard`
  are the minority and will be renamed to match. Not yet done.

## Session Notes

A fresh session can resume by reading this file plus `architecture-context.md`'s
Architecture Decisions section — the four decisions above are agreed standards that
existing code doesn't fully follow yet. Don't "fix" them opportunistically mid-unrelated
task; they were deliberately deferred to a dedicated cleanup pass (see Open Questions).

Backend-first phase is over: user explicitly greenlit frontend work ("free hand...
surprise me") and Tag/Course/Section/SubSection now have real UI (see Completed).

**Playwright is available for real browser verification** (no project-level run skill
exists yet — installed fresh into the scratchpad dir each time via `npm install
playwright` + `npx playwright install chromium`, not added to either package.json).
Mint a JWT directly (`jsonwebtoken.sign({id, email, role}, JWT_SECRET)`, no password
needed) and either call the API directly for backend checks, or seed `localStorage`
(`user`/`token` keys, matching `AuthContext`'s shape exactly) via
`context.addInitScript()` before navigating, for frontend checks under a real role. This
approach has now caught two real bugs that curl-only testing missed: the `signInService`
missing `id`/`role`, and the Cloudinary v1/v2 default-export bug — both were invisible to
API-shape testing alone because they only mattered once the actual browser/UI/SDK path
was exercised. Keep reaching for it before calling a frontend change done.
