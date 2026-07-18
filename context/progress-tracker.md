# Progress Tracker

## Current Phase

Auth, Tag, Course, Section, and SubSection are all functionally complete end-to-end,
backend **and** frontend, full CRUD on every one. Instructors upload a real lesson video
per section and can rename/replace-video/delete it; students watch it inline on the
course detail page. Payment/Review/CourseProgress are still open (see Next Up).
Enrollment/checkout is intentionally a disabled "coming soon" affordance on the course
detail page, not a real flow — Payment isn't wired up.

## Completed

- Full auth flow: signup, OTP email verification, signin, forgot/reset/change password,
  backed by JWT + Redis-based OTP state machine.
- Frontend auth UI: signin/signup/OTP/forgot/change/reset password pages, protected
  route, `AuthContext` + `useAuth`, React Query mutation hooks per auth action.
- Context system set up: `project-overview.md`, `architecture-context.md`,
  `code-standards.md`, `ui-context.md`, `ai-workflow-rules.md`, this tracker, and root
  `CLAUDE.md` index.
- Tag, full CRUD, backend and frontend (create is exposed inline via `CreateTagDialog`
  during course authoring; no standalone tag-management page). Reads public; writes
  require `authorize('ADMIN', 'INSTRUCTOR')` — the first role-based route protection in
  the codebase.
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
- Frontend for Tag/Course/Section: brand color (violet) + Outfit font wired into
  `index.css` (see `ui-context.md`), `framer-motion` added for animation. New pages:
  `Home` (hero + featured courses + browse-by-tag), `CourseCatalogContainer` (search +
  tag filter), `CourseDetailContainer` (curriculum accordion, sticky enroll card),
  `InstructorDashboardContainer` (my courses, role-gated via `ProtectedRoute`'s new
  `roles` prop), `CourseFormContainer` (create/edit with thumbnail preview + tag
  multi-select + inline tag creation) and its embedded `SectionManager` (add/rename/
  delete sections). `Header` redesigned: sticky, auth-aware nav with an avatar dropdown.
  Live-verified end-to-end against the real backend/Cloudinary (mint-JWT + temporary
  role elevation on a real account, reverted after; all test data cleaned up and cascade
  delete re-confirmed).
- **Fixed a real bug found via Playwright verification**: `signInService`
  (`backend/src/services/userService.js`) returned `{firstName, lastName, email, avatar,
  token}` — no `id` or `role` — even though the JWT itself already encoded both. This
  silently broke every role-gated frontend feature for real signed-in users (Header's
  Dashboard link, `ProtectedRoute`'s `roles` check, Instructor Dashboard's ownership
  filter, Course Detail's "Manage this course" button all read `auth.user.id`/`.role`,
  which were always `undefined`). Fixed by adding both fields to the returned object;
  verified live against the real `/signin` endpoint with a throwaway test user (deleted
  after).
- SubSection (lesson), full CRUD, backend and frontend: `repository/
  subSectionRepository.js`, `services/subSectionService.js`, `validators/
  subSectionSchema.js`, `controller/subSectionController.js`, `routes/v1/subsections.js`,
  mounted at `/api/v1/subsections`. Video uploads via a dedicated `uploadVideoSingle`
  multer instance (100MB, `video/*`) and `utils/common/videoUpload.js`
  (`resource_type: 'video'`); `duration` is always Cloudinary-derived, never
  client-supplied (resolved the open design question from last session). Ownership via
  the new `isSubSectionOwnerOrAdmin` (resolves `req.body.section` → Section → Course).
  Frontend: `LessonManager` (instructor, embedded per-section in `SectionManager`, upload
  form + lesson list) and `LessonList` (student, inside `CourseDetail`'s curriculum
  accordion, click-to-play inline `<video>`).
  **Found and fixed a real bug**: `libs/cloudinaryConfig.js` imported the `cloudinary`
  package's default export, which is its legacy **v1** API — it silently ignores
  `resource_type` and always uploads as an image (a real video upload failed "Invalid
  image file" until switched to `cloudinaryPkg.v2`). Diagnosed by hitting the Cloudinary
  SDK directly outside Express, confirmed with a genuinely valid test video (encoded via
  Playwright's bundled ffmpeg + a `jpeg-js`-encoded frame, since no video tooling exists
  natively in this environment). Fully live-verified after the fix: real video upload
  through the real UI, correct auto-derived duration, playback confirmed in a headless
  browser (`readyState: 4`), plus a regression check that image thumbnail upload still
  works. All test data cleaned up (Cloudinary assets, DB records, temporary role grant).
- SubSection update/delete: rename-only updates leave the video untouched; sending a new
  `video` file replaces it and best-effort-cleans up the old Cloudinary asset
  (`safeDeleteCloudinaryVideo`), same pattern as Course's thumbnail. Delete removes the
  lesson, `$pull`s it from `Section.subSections`, and cleans up its video. Extended
  `isSubSectionOwnerOrAdmin` to the same dual-resolution shape as `isCourseOwnerOrAdmin`
  (body field for create, params-id lookup for update/delete). Frontend: `LessonManager`
  gained inline rename, a "replace video" upload button, and a delete confirm dialog —
  same interaction vocabulary as `SectionManager`'s `SectionRow`. Live-verified via curl
  (rename-only leaves video unchanged; replace produces a new `videoPublicId` and the old
  one is confirmed gone from Cloudinary; delete confirmed gone from both DB and
  Cloudinary) and via Playwright driving the real UI. One test-only gotcha hit along the
  way: two consecutive mutations that show the *same* toast text
  ("Lesson updated successfully") make toast-text a bad completion signal for the second
  one — a lingering toast from the first action can satisfy `waitForSelector` before the
  second mutation actually finishes. Use `page.waitForResponse()` on the specific network
  call instead when actions share toast copy.

## In Progress

- Reformatting Mongoose model files (`schema/courseProgressSchema.js`,
  `courseSchema.js`, `tagSchema.js`, `userSchema.js`) to match `.prettierrc`
  (single-quote, no trailing comma) — uncommitted in the working tree as of this
  session. New `paymentSchema.js` also uncommitted.

## Next Up

Pick one (per `ai-workflow-rules.md` scoping rule — one at a time):
- Course search/filter is currently client-side only (catalog page filters an
  already-fetched full course list) — `GET /courses` has no server-side query params;
  revisit if the catalog needs to scale past fetch-everything
- Payments & checkout (wire up the `Payment` model into a real purchase flow) — the
  course detail page's "Enroll" button is a placeholder toast today
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
