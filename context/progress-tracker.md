# Progress Tracker

## Current Phase

Auth and Tag are functionally complete end-to-end (backend). Course/Payment/Review/
CourseProgress domains have Mongoose models only — no repository/service/controller/
route layer yet. Tag was built first because Course creation requires at least one
existing Tag to attach.

## Completed

- Full auth flow: signup, OTP email verification, signin, forgot/reset/change password,
  backed by JWT + Redis-based OTP state machine.
- Frontend auth UI: signin/signup/OTP/forgot/change/reset password pages, protected
  route, `AuthContext` + `useAuth`, React Query mutation hooks per auth action.
- Context system set up: `project-overview.md`, `architecture-context.md`,
  `code-standards.md`, `ui-context.md`, `ai-workflow-rules.md`, this tracker, and root
  `CLAUDE.md` index.
- Tag CRUD API (backend only — no frontend yet): `repository/tagRepository.js`,
  `services/tagService.js`, `validators/tagSchema.js`, `controller/tagController.js`,
  `routes/v1/tags.js`, mounted at `/api/v1/tags`. Reads are public; writes require
  `isAuthenticated` + the new `authorize('ADMIN', 'INSTRUCTOR')` middleware (first use of
  role-based route protection in the codebase — see `architecture-context.md`).

## In Progress

- Reformatting Mongoose model files (`schema/courseProgressSchema.js`,
  `courseSchema.js`, `tagSchema.js`, `userSchema.js`) to match `.prettierrc`
  (single-quote, no trailing comma) — uncommitted in the working tree as of this
  session. New `paymentSchema.js` also uncommitted.

## Next Up

Frontend Tag UI (list/create for instructors) is the natural next slice, then pick one
of (per `ai-workflow-rules.md` scoping rule — one at a time, not all three):
- Course browsing & enrollment (read side: list/search/detail + enroll action)
- Course creation (instructor authoring: course → section → subsection)
- Payments & checkout (wire up the `Payment` model into a real purchase flow)

## Known Bugs

- `courseSchema.js`'s `tags` field (`required: [true, ...]` on the array element) does
  **not** enforce "Course must have at least one tag" — an empty `tags: []` currently
  passes Mongoose validation (verified directly: `validateSync()` on an empty array
  produces no error). Needs a real min-length check (e.g. a custom `validate` function)
  when Course write endpoints are built — don't assume the existing `required` already
  covers this.

## Open Questions

- Should `multer`/`cloudinary` (file upload) and `swagger-autogen` (API docs) be wired
  up now, or are they for a later phase? They're installed but unreferenced.
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
