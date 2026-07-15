# Progress Tracker

## Current Phase

Auth and Tag are functionally complete end-to-end (backend). Course has create + read
(list/detail) only — no update/delete yet. Section/SubSection/Payment/Review/
CourseProgress domains have Mongoose models only — no repository/service/controller/
route layer yet.

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
- Course create + read (backend only): `repository/courseRepository.js`,
  `services/courseService.js`, `validators/courseSchema.js`, `controller/courseController.js`,
  `routes/v1/courses.js`, mounted at `/api/v1/courses`. Same role gate as Tag writes;
  `instructor` is always taken from `req.user.id`. Create validates that every submitted
  tag id both is well-formed (Zod) and actually exists (`tagRepository.findByIds`).
  Fixed `courseSchema.js`'s `tags` field to use a custom `validate` function so "at least
  one tag" is actually enforced (previously a no-op — see the general Mongoose-array
  note in `architecture-context.md` Invariants).
- Course `thumbnail` upload: now required (Mongoose + `requireFile` middleware), backed
  by Cloudinary. Added `libs/cloudinaryConfig.js`, `middlewares/uploadMiddleware.js`
  (`uploadSingle`/`requireFile`), and fixed `utils/common/imageUpload.js`, which
  previously assumed `express-fileupload`'s `file.tempFilePath` but this project uses
  `multer` (memory storage, `file.buffer`) — would have thrown on every real upload.
  Course creation is now `multipart/form-data`, not JSON (see `architecture-context.md`
  File Upload Model). Verified fully live end-to-end, including a real Cloudinary
  upload (test image + course created, then both cleaned up via `cloudinary.uploader.destroy`
  and a DB delete).
- Fixed a real bug found while verifying the above: `validate(schema)`
  (`validators/zodValidators.js`) validated the request body but never reassigned
  `req.body` with the parsed result, so `z.coerce`/`.preprocess` transforms were computed
  and discarded — Course's multipart `tags` field arrived at the service as a raw JSON
  string instead of a parsed array, throwing a misleading `CastError`. Fixed to
  `req.body = await schema.parseAsync(req.body)`. Harmless no-op for existing User
  routes (their schemas don't transform anything) — re-verified `signin` still works
  unchanged after the fix.
- Course creation now pushes the new course's id onto `User.courses` for the instructor
  (`userRepository.addCourse`, atomic `$push`) — this was on the model already but never
  wired up. Verified live: `user.courses` contained the new course id after creation.
  Not wrapped in a transaction (none used anywhere in this codebase) — see Invariants in
  `architecture-context.md` for the accepted-gap note.

## In Progress

- Reformatting Mongoose model files (`schema/courseProgressSchema.js`,
  `courseSchema.js`, `tagSchema.js`, `userSchema.js`) to match `.prettierrc`
  (single-quote, no trailing comma) — uncommitted in the working tree as of this
  session. New `paymentSchema.js` also uncommitted.

## Next Up

Pick one (per `ai-workflow-rules.md` scoping rule — one at a time):
- Course update/delete (needs rules for enrolled-student impact, price changes)
- Section/SubSection authoring under a Course (instructor content creation)
- Course search/filter (by tag, price, instructor) — currently `GET /courses` has no
  query params
- Frontend Tag + Course-creation UI (nothing built yet on the frontend for either)
- Payments & checkout (wire up the `Payment` model into a real purchase flow)
- Student enrollment action

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
