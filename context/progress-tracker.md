# Progress Tracker

## Current Phase

Auth, Tag, Course, and Section are all functionally complete end-to-end (backend), full
CRUD on every one. SubSection/Payment/Review/CourseProgress domains have Mongoose models
only — no repository/service/controller/route layer yet. Deliberately backend-first for
now (frontend UI for Tag/Course/Section is untouched) — see Session Notes.

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
- Course, full CRUD: `repository/courseRepository.js`, `services/courseService.js`,
  `validators/courseSchema.js`, `controller/courseController.js`, `routes/v1/courses.js`,
  mounted at `/api/v1/courses`. Reads are public; writes require `ADMIN`/`INSTRUCTOR` +
  (for update/delete) course ownership via `isCourseOwnerOrAdmin`. `instructor` always
  comes from `req.user.id`. Tags are validated for shape (Zod) and existence
  (`tagRepository.findByIds`); "at least one tag" is enforced via a custom Mongoose
  `validate` (`required` is a no-op on arrays — see Invariants).
- Course `thumbnail`: required, backed by Cloudinary (`multer` memory storage,
  `multipart/form-data`, no temp files — see `architecture-context.md` File Upload
  Model). Update can replace it; delete removes it; both use the newly-added
  `thumbnailPublicId` field to clean up the old Cloudinary image, best-effort
  (`safeDeleteCloudinaryImage`). Deleting a Course cascades: deletes its Sections
  (`sectionRepository.deleteByCourse`) and pulls the id back out of `User.courses`. Fixed
  two real bugs found while first wiring this up: `imageUpload.js` assumed the wrong
  upload middleware's file shape, and `validate()` wasn't propagating Zod's
  coerced/parsed body downstream. Both fixed and verified live (real Cloudinary uploads,
  cleaned up afterward).
- Section, full CRUD: `repository/sectionRepository.js`, `services/sectionService.js`,
  `validators/sectionSchema.js`, `controller/sectionController.js`,
  `routes/v1/sections.js`, mounted at `/api/v1/sections`. Reads are public
  (`GET /sections?course=<id>` to list, `GET /sections/:id` for one). Every write
  requires being the course's own instructor or an `ADMIN` — first ownership checks in
  the codebase: `isCourseOwnerOrAdmin` (create, resolves via `req.body.course`) and
  `isSectionOwnerOrAdmin` (update/delete, resolves by looking up the section first since
  there's no course id in those requests) — deliberately two concrete middlewares, not
  one generalized factory, see `code-standards.md`. Create pushes the new section id
  onto `Course.sections`; delete `$pull`s it back out (`courseRepository.removeSection`).

## In Progress

- Reformatting Mongoose model files (`schema/courseProgressSchema.js`,
  `courseSchema.js`, `tagSchema.js`, `userSchema.js`) to match `.prettierrc`
  (single-quote, no trailing comma) — uncommitted in the working tree as of this
  session. New `paymentSchema.js` also uncommitted.

## Next Up

Pick one (per `ai-workflow-rules.md` scoping rule — one at a time). Decided to keep
building backend before frontend for now:
- SubSection authoring under a Section (instructor content creation) — note
  `subSectionSchema.js`'s `videoUrl`/`duration` fields will need a video-upload design
  decision (Cloudinary video upload + auto-derived duration vs. a plain URL string +
  manual duration) before implementation, same shape of question as Course's thumbnail
- Course search/filter (by tag, price, instructor) — currently `GET /courses` has no
  query params
- Payments & checkout (wire up the `Payment` model into a real purchase flow)
- Student enrollment action
- Frontend UI for Tag/Course/Section (nothing built yet on the frontend for any of them)

## Open Questions

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

Explicit choice: keep building backend domains (Section done; SubSection next) before
touching the frontend at all — the frontend is currently only exercised for Auth. Don't
suggest switching to frontend work unprompted; it's a known gap, not an oversight.
