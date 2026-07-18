# Architecture Context

## Stack

- **Backend**: Node.js (ESM, `"type": "module"`), Express 5, MongoDB via Mongoose 8.
- **Frontend**: React (Vite), react-router-dom v7, TanStack React Query v5, Axios,
  shadcn/ui (new-york style, Tailwind v4 CSS-first config, no `tailwind.config.js`).
- **Auth**: JWT (`jsonwebtoken`), stateless — no server-side sessions.
- **Cache/rate-limiting**: Upstash Redis (REST client, not `ioredis`) — used only for
  OTP state, not for sessions or general caching.
- **Email**: `nodemailer` + `ejs` templates (OTP, password reset).
- **File upload**: `multer` (memory storage, not disk) + `cloudinary` (image storage/CDN)
  — wired up for Course `thumbnail` and User `avatar`; see File Upload Model below.
- **Payments**: `razorpay` (Standard Checkout) — order creation server-side, payment
  confirmation client-side via the Checkout.js widget, success verified server-side via
  HMAC-SHA256 signature check. See Payment Model below.
- **Planned, not yet wired up**: `swagger-autogen` (API docs) — installed but no code
  references it yet `[INFERRED: intent]`.

## System Boundaries

```
Client (React) --axios--> /api/v1/* (Express) --> service layer --> repository layer --> Mongoose models --> MongoDB
                                                 \-> Redis (OTP state only)
                                                 \-> nodemailer (transactional email)
                                                 \-> Cloudinary (image storage, via service layer)
                                                 \-> Razorpay (order create + signature verification, via service layer)
```

- Request layering is strict and consistently followed for User, Tag, Course, Section,
  SubSection, Payment, and Review: `route → validate(zodSchema) middleware → controller
  → service → repository → Mongoose model`. Controllers never call Mongoose directly.
- Course, Section, SubSection, Payment, CourseProgress, and Review all have full
  CRUD/flow layers now — every domain in the original data model is wired up end to end.

## Storage Model

- Single MongoDB database. Dev: `mongoose.connect(`${DEV_DB_URL}/EdTech`)`
  (`backend/src/config/dbConfig.js`, DB name `EdTech` is hardcoded for dev). Prod:
  connects to `PROD_DB_URL` directly (DB name expected to already be in that URL).
- All models use `{ timestamps: true }`.
- Relations are modeled via Mongoose `ObjectId` refs (`ref: "User"`, `ref: "Course"`, etc.),
  not embedding.
- Redis holds only ephemeral OTP/rate-limit state, all key-prefixed and TTL'd:
  `otp:<email>`, `otp_cooldown:<email>`, `otp_request_count:<email>`,
  `otp_spam_lock:<email>`, `otp_lock:<email>`, `otp_attempts:<email>`,
  `otp_verified:<email>`. Nothing else is cached in Redis today.

## Auth Model

- **Token transport standard: `Authorization: Bearer <token>`.** The backend middleware
  (`authMiddleware.js`) supports this as the preferred branch and falls back to
  `x-access-token` for compatibility — but the frontend currently only sends
  `x-access-token`, which is a known deviation from the standard (tracked in
  `progress-tracker.md`, not yet fixed).
- Token creation: `createJWT({ id, email, role })`, signed with `JWT_SECRET`, expiry from
  `JWT_EXPIRES_IN` env var. Password/hash is never included in the payload or returned
  to the client. `signInService`'s response body also includes `id`/`role` alongside the
  token (not just inside the JWT) — the frontend never decodes the JWT client-side, so
  anything the UI needs (role-gating, ownership checks) must be in the plain response.
- Token verification re-fetches the user from the DB on every authenticated request
  (`userRepository.getById(decoded.id)`) to confirm the account still exists — auth
  doesn't trust the JWT payload alone for anything beyond `id`/`email`.
- No refresh tokens. No logout endpoint yet. Expiry is handled passively (next protected
  request/render just treats the user as logged out) — there is no 401 interceptor that
  redirects automatically.
- Passwords hashed with `bcryptjs` (`genSalt(10)` + `hash`), compared inline with
  `bcrypt.compare` at each call site (signin, reset-password) — no shared
  `comparePassword` helper exists yet.
- OTP (signup verification, forgot-password) is entirely Redis-backed, no DB writes:
  5-min OTP validity, 1-min resend cooldown, spam lock after 2 requests within the
  window, attempt lock after 3 failed verifications.
- Frontend stores `{ user, token }` in `localStorage` (not cookies) and mirrors the
  token onto the shared Axios instance's default headers via a `useEffect` in
  `AuthContext` (not an Axios interceptor).
- **Role-based authorization**: `authorize(...allowedRoles)` in `authMiddleware.js`
  (added alongside the Tag domain) checks `req.user.role` against an allow-list and must
  run after `isAuthenticated` on the same route. Returns 403 if the role doesn't match.
  Apply it to any route restricted beyond "logged in," rather than checking
  `req.user.role` ad hoc inside a controller.
- **Ownership authorization**: concrete middlewares (not a generic factory — see
  `code-standards.md`), all ultimately requiring `req.user.id === course.instructor` OR
  `req.user.role === 'ADMIN'`, each handling its own `CastError` for a malformed id:
  - `isCourseOwnerOrAdmin` resolves the course from `req.body?.course || req.params.id` —
    the former for Section create (must run after `validate()`), the latter for Course
    update/delete. `req.body` really can be `undefined` here (not `{}`) for a pure
    multipart request with no text fields — confirmed live when a thumbnail-only Course
    update 500'd before an optional-chaining fix.
  - `isSectionOwnerOrAdmin` (Section update/delete) looks up the section from
    `req.params.id` first, then that section's course.
  - `isSubSectionOwnerOrAdmin` resolves the section from `req.body?.section` (create) or
    by looking up the SubSection via `req.params.id` first (update/delete) — same
    dual-resolution shape as `isCourseOwnerOrAdmin`, one hop deeper (SubSection →
    Section → Course).
- **User management (`ADMIN`-only, not `authorize('ADMIN', 'INSTRUCTOR')` like most other
  write routes)**: `GET /users` lists every user (`userRepository.getAllExcludingPassword`
  — dedicated method, not the generic `crudRepository.getAll`, same password-exclusion
  discipline as the Profile domain). `PUT /users/:id/role` changes a user's role, with a
  single guard: **a caller can never change their own role**
  (`updateUserRoleService`). This one check is also what keeps the system from ever
  being left with zero admins through this endpoint — since the route itself requires
  the caller to already be `ADMIN`, and the caller can never target themselves, demoting
  "the last admin" would require the caller to be a *second*, distinct admin, meaning
  there were always at least two. No separate "last admin" count check exists — it was
  written once, found to be unreachable given the above, and deliberately removed rather
  than left in as dead code.

## File Upload Model

- `multer` (`memoryStorage`, never written to disk) → Cloudinary, configured once in
  `libs/cloudinaryConfig.js` from the three `CLOUDINARY_*` vars in `config/serverConfig.js`.
  **Must import `cloudinaryPkg.v2`, not the package's default export** — the `cloudinary`
  npm package's default is its legacy v1 API, which silently ignores `resource_type` and
  always uploads as an image (confirmed live: a real video upload with
  `resource_type: 'video'` failed "Invalid image file" under the default import, and
  succeeded with the correct `duration` once switched to `.v2`).
- Two separate multer instances in `uploadMiddleware.js`: `uploadSingle` (images, 5MB,
  `image/*` filter) and `uploadVideoSingle` (videos, 100MB, `video/*` filter) — different
  limits/filters, so don't share one instance. Both format their own 400 on failure
  (multer reports errors via callback, not a throw) and both pair with the same
  `requireFile(fieldName)`.
- `utils/common/imageUpload.js` / `videoUpload.js` base64-encode the buffer and upload
  directly (no temp-file cleanup needed); call from the **service** layer, same as any
  other external-dependency call. Video uploads pass `resource_type: 'video'` and read
  `duration` (seconds) straight from Cloudinary's response — never client-supplied (see
  Invariants).
- **Route order**: `uploadSingle`/`uploadVideoSingle` → `requireFile` (if required) →
  `validate(zodSchema)` → ownership middleware (if any) → controller. The upload
  middleware must run first — it populates `req.body` from the multipart stream, which
  `validate` then reads, and ownership checks need the validated body.
- Any route accepting a file is `multipart/form-data`, not JSON: numeric fields need
  `z.coerce.number()`, array fields need a JSON-encoded string + `z.preprocess` (HTML
  forms can't carry real arrays) — see `validators/courseSchema.js`.
- **Optional file uploads** (a course thumbnail on update, a user's avatar) follow the
  same `uploadSingle(fieldName)` → `validate(zodSchema)` → controller order as required
  ones, just without `requireFile` — `req.file` is simply `undefined` when the client
  didn't attach one, and the service branches on that (`if (avatarFile) { ... }`) rather
  than treating it as an error.

## Profile Model

- `GET /users/me` / `PUT /users/me` (both `isAuthenticated`, no ownership middleware
  needed — the target is always `req.user.id`, never a route param) are the User
  domain's read/update surface beyond auth (signup/signin/password). `PUT` accepts
  `firstName`/`lastName` plus the previously-unused `profile` sub-document
  (`about`/`phoneNumber`/`gender`/`dob`) and an optional `avatar` file, all independently
  optional — only fields actually sent get written (`updateProfileService` builds a
  sparse `$set` using dot-paths like `'profile.about'`, so omitted fields are left
  untouched rather than overwritten with `undefined`).
- **Both endpoints explicitly `.select('-password')`** via dedicated repository methods
  (`getProfileById`, `updateProfile`) rather than reusing the generic
  `crudRepository`'s `getById`/`update` (which return the full document, hash included —
  already true of some older User flows like `resetPasswordService`, a known
  pre-existing gap this domain deliberately doesn't propagate into new code).
- Avatar upload reuses the exact Course-thumbnail pattern: `uploadImageToCloudinary` /
  best-effort `safeDeleteCloudinaryImage` of the old one (own copy in `userService.js`,
  not shared — same reasoning as `subSectionService.js`'s copy, see Invariants). A
  user's first avatar is the auto-generated `ui-avatars.com` placeholder
  (`userSchema.js`'s `pre('save')` hook) and has no `avatarPublicId`, so it's simply
  never sent to Cloudinary for cleanup — only real uploads are.
- Frontend syncs the header/dropdown avatar and name immediately after a successful
  profile save by merging the response into `auth.user` and `localStorage['user']`
  directly (`ProfileContainer`), rather than waiting on a full re-login — the JWT itself
  is never re-issued for a profile edit, only the locally-cached display fields change.

## Payment Model

- **Flow**: `POST /payments/orders {course}` (authenticated) → service loads the course,
  rejects if the caller is the course's own instructor or already in
  `studentsEnrolled`, computes `finalPrice` from `course.price`/`discount` server-side,
  creates a Razorpay order (`amount` in paise, `currency: 'INR'`), and writes a `Payment`
  document with `status: 'PENDING'`. The response (`orderId`, `amount`, `currency`,
  `keyId`) is handed to the Razorpay Checkout.js widget on the frontend
  (`loadRazorpayScript` + `new window.Razorpay({...}).open()`), which drives the actual
  card/UPI/bank flow entirely outside this app.
- On completion, Razorpay's client-side `handler` callback receives
  `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` and the frontend posts
  it straight to `POST /payments/verify` — this callback is **not trusted on its own**,
  it only triggers the real check.
- **Server-side signature verification is the only source of truth for "did this payment
  succeed."** `isSignatureValid` (`paymentService.js`) recomputes
  `HMAC-SHA256(orderId|paymentId, RAZORPAY_API_SECRET)` and compares it to the received
  signature with `crypto.timingSafeEqual` (never `===`, to avoid a timing side-channel).
  A mismatch flips the `Payment` to `status: 'FAILED'` and returns 400; a match flips it
  to `SUCCESS`, records `gatewayPaymentId`/`gatewaySignature`, and enrolls the student.
- Enrollment itself is `courseRepository.addStudent` using Mongo's `$addToSet` (not
  `$push`) on `Course.studentsEnrolled` — deliberately idempotent so a duplicate/retried
  verify call can never double-enroll the same user.
- **No webhook handler yet**: verification only happens when the frontend calls
  `/payments/verify` after Checkout.js's `handler` fires. A payment that succeeds on
  Razorpay's side but never reaches this endpoint (closed tab, network drop) leaves the
  `Payment` stuck at `PENDING` and the user unenrolled — a known gap, see
  `progress-tracker.md`.
- Razorpay `receipt` is capped at 40 chars by Razorpay itself — built as
  `rcpt_${courseId.slice(-8)}_${Date.now()}`, not the full 24-char ObjectId.
- `GET /payments/my` (authenticated) lists the caller's own `status: 'SUCCESS'` payments
  — a `PENDING`/`FAILED` order never shows up as a "purchase." The frontend
  (`MyPurchasesContainer`) resolves each payment's `course` id against the full course
  list (`useCourses`), the same id→map pattern used for tag names elsewhere — there is
  still no backend `.populate()`.
- **Instructor earnings**: the platform takes a commission (`PLATFORM_COMMISSION_PERCENT`
  in `serverConfig.js`, env-configurable, default 20) on every sale. `verifyPaymentService`
  snapshots `platformFeePercent`/`platformFee`/`instructorEarning` onto the `Payment`
  document **at the moment it flips to `SUCCESS`** — a later change to the commission env
  var never rewrites past earnings, since each payment carries its own rate. `GET
  /payments/earnings` (`isAuthenticated`, `authorize('INSTRUCTOR', 'ADMIN')`) sums
  `instructorEarning` across the caller's own courses' `SUCCESS` payments
  (`courseRepository.getByInstructor` → `paymentRepository.getByCourses`), returning a
  total plus a per-course breakdown. Payments recorded before this feature existed have
  no `instructorEarning` snapshot and are treated as `0` in the sum, not guessed —
  there's no way to know what commission rate would have applied retroactively.
- Earnings are displayed in real ₹ (`IndianRupee`/`formatINR` in `EarningsSummary.jsx`),
  not the `$` used for course-price display elsewhere — this is deliberate, not
  inconsistency-by-accident: course prices are a known cosmetic `$`/`₹` mismatch (see
  `code-standards.md`), but real revenue numbers shown to an instructor need to be
  actually correct, not follow the cosmetic convention.

## Progress Model

- `CourseProgress` tracks one document per `(user, course)` pair (unique index),
  holding `completedSubSections: [ObjectId]`. There is no "percent" field stored — it's
  always computed on read (`courseProgressService.buildProgressSummary`): total lesson
  count comes from summing `section.subSections.length` across the course's sections
  (no separate SubSection count query), completed count from
  `completedSubSections.length`.
- `GET /course-progress?course=<id>` and `POST /course-progress/complete
  {course, subSection}` both use the same eligibility rule as SubSection reads (enrolled
  student, owning instructor, or `ADMIN` — see `isEnrolledOrOwnerOrAdmin`), checked
  inline in the service rather than a route middleware, since this is per-user data (not
  a shared resource with one reusable ownership check).
- Marking complete is an upsert (`findOneAndUpdate` with `upsert: true`) using
  `$addToSet`, matching the idempotency pattern used for enrollment — replaying the same
  mark-complete call is always safe.
- `markLessonCompleteService` independently re-verifies the given `subSection` actually
  belongs to the given `course` (walks `subSection → section → section.course`) — the
  two ids come from the client in the same request body, so a mismatched pair must be
  rejected rather than trusted.
- **Course Player** (`pages/course/CoursePlayerContainer.jsx`, routes
  `/courses/:id/learn` and `/courses/:id/learn/:subSectionId`): the actual place lessons
  play and progress gets tracked, replacing the old inline-video-in-accordion pattern on
  the course detail page. Fetches every section's lessons in parallel
  (`useCourseLessons`, one `useQueries` entry per section against the same
  `GET /subsections?section=<id>` endpoint and query key `LessonList` uses, so the cache
  is shared) and flattens them into one ordered list for the sidebar. No `subSectionId`
  in the URL → redirects (`navigate(..., {replace:true})`) to the first lesson once
  loaded, so `/learn` always resolves to a real lesson. The `<video>` element's `onEnded`
  auto-calls mark-complete; a manual "Mark as complete" button covers the case where a
  student doesn't watch to the end. Route is behind `ProtectedRoute` (any logged-in
  user) — the actual enrollment check happens inside `CoursePlayer` itself (`canView`,
  same `isOwner || isEnrolled` logic as `CourseDetail`), showing a locked screen rather
  than attempting playback for a non-enrolled visitor.

## Review Model

- One review per `(user, course)` pair (unique index, same shape as `CourseProgress`) —
  `rating` (1–5, required) plus an optional `comment`. `GET /reviews?course=<id>` is
  public (like Tag/Course/Section reads); `POST /reviews`, `PUT /reviews/:id`, `DELETE
  /reviews/:id` require `isAuthenticated`.
- **Who can post a review**: the caller must be enrolled in the course (`ADMIN` bypasses
  the enrollment check, same rule as the Progress/SubSection domains) **and must not be
  the course's own instructor**, regardless of role — an `ADMIN` who happens to also be
  the instructor of record is still blocked from reviewing their own course. This second
  check is unconditional, unlike the enrollment bypass. `isReviewOwnerOrAdmin`
  (`authMiddleware.js`) separately gates *update/delete* to the review's own author (or
  `ADMIN`) — a completely different ownership shape than "course instructor," since a
  review belongs to whoever wrote it, not to the course.
- **Denormalized reviewer identity**: `reviewerName`/`reviewerAvatar` are snapshotted
  onto the `Review` document at creation time, not resolved via a join — this codebase
  never does Mongoose `.populate()`, and unlike Tag (small, fully public, listable via
  `useTags`), `User` isn't a browsable domain and has no `GET /users` endpoint, so
  there's no cheap way to resolve "who wrote this" client-side the way `CourseCard`
  resolves tag names. The tradeoff: a reviewer's displayed name/avatar reflects what
  they were at post time, not their current profile — accepted, matches how most
  real-world review systems actually behave.
- **`Course.averageRating`/`numberOfRatings` are recomputed after every
  create/update/delete**, not maintained incrementally — `recomputeCourseRatingStats`
  (`reviewService.js`) refetches all of a course's reviews and averages them in JS
  (rounded to 1 decimal), the same "fetch and sum" style `courseProgressService` uses
  for completion percentages rather than a Mongo aggregation pipeline. Simple and
  correct at this scale; would need revisiting if a course ever had thousands of reviews.
- A duplicate `POST /reviews` for a course the user already reviewed hits the unique
  index and surfaces as a clean 400 ("use update instead"), not a raw Mongo duplicate-key
  error — same `error.code === 11000` handling pattern used in `userService.js`.

## Invariants

Only things whose violation is a bug — not preferences:

- Controllers never call Mongoose models directly; only services/repositories do.
- Every mutating route runs through `validate(zodSchema)` before the controller executes.
- Passwords are never logged, returned in an API response, or embedded in a JWT payload.
- `req.user` is only trustworthy after `isAuthenticated` has run.
- OTP verification state lives only in Redis; it must never be persisted to MongoDB.
- All Mongoose FK fields referencing `Course` are named `course` (not `courseID`).
- Only `ADMIN`/`INSTRUCTOR` may write to Tag, Course, or Section (role gate on every
  write route); reads are public for all three. Course/Section writes additionally
  require course ownership (see Auth Model above) — `ADMIN` bypasses ownership too.
  `course.instructor` is always set server-side from `req.user.id`, never from the body.
- **SubSection reads require `isAuthenticated` — they are the one exception to "reads are
  public."** A lesson's response carries the real, playable `videoUrl` (the paid content
  itself), not just browsable metadata, so it can't follow the same public-read pattern
  as Tag/Course/Section titles. Originally shipped as a fully public route by copying
  that pattern without carving out the exception — found live (any logged-out visitor
  could fetch and download lesson videos) and fixed by requiring login. This was
  originally an **interim** gate (any authenticated user could watch any lesson,
  regardless of enrollment) until Payment/Enrollment existed to check against. Now that
  it does (see Payment Model below), the gate is real: `isEnrolledOrOwnerOrAdmin`
  (`authMiddleware.js`) resolves the lesson's course (via `req.query.section` for the
  list route, or by looking up the subsection via `req.params.id` for the single-lesson
  route, then walking `subsection → section → course`) and requires the caller be in
  `course.studentsEnrolled`, the course's own instructor, or an `ADMIN` — a logged-in
  non-enrolled `STUDENT` now gets 403, not 200. Live-verified against the real dashboard
  DB: a non-enrolled student → 403 on both routes; the same student after being enrolled,
  the course's instructor, and an `ADMIN` → 200 on all three. The frontend mirrors this:
  `CourseDetail.jsx`'s syllabus accordion only renders `LessonList` (which hits the
  gated endpoint) when `isOwner || isEnrolled`; otherwise it shows an "Enroll to unlock
  this section's lessons" message instead of silently degrading to an empty "coming
  soon" state. `LessonList` itself no longer plays video inline — each row is a `Link`
  into the dedicated Course Player route (`/courses/:id/learn/:subSectionId`, see
  Progress Model below); actual playback and progress tracking live there, not on the
  marketing/detail page.
- A Course must have a `thumbnail` (Mongoose `required` + route-level `requireFile` on
  create) and at least one existing Tag id (Zod shape-check + a service-layer existence
  check via `tagRepository.findByIds` — a well-formed but nonexistent tag id is rejected).
- **Denormalized back-references sync via `$push`/`$pull`, never fetch-then-save**:
  creating a Course pushes onto `User.courses`; creating a Section pushes onto
  `Course.sections`. Deleting reverses each with `$pull`, and deleting a Course first
  cascades to delete every Section referencing it (`sectionRepository.deleteByCourse`).
  None of this is wrapped in a transaction (none are used anywhere in this codebase) — a
  failure mid-sequence is a known, accepted gap.
- **Cloudinary cleanup is always best-effort**: `safeDeleteCloudinaryImage` /
  `safeDeleteCloudinaryVideo` swallow their own errors — an old thumbnail/video is
  deleted only *after* the replacing DB write succeeds, and a failed cleanup must never
  undo an otherwise-successful create/update/delete.
- **Mongoose `required` on an array field never enforces "at least one element"**
  (verified empirically) — arrays default to `[]`, which always satisfies `required`'s
  null/undefined check. Use a custom `validate: (arr) => arr.length > 0` function
  instead (see `code-standards.md` for the reusable convention).
- **A lesson's `duration` is always Cloudinary-derived, never accepted from the client**
  — `createSubSectionSchema` has no `duration` field at all; the service reads it off
  the video upload response. Don't add a manual-duration input on the frontend.
- **A payment's `amount` is always server-computed from `course.price`/`discount`, never
  accepted from the client** — `createOrderSchema` has no `amount` field; accepting one
  would let a client name their own price. See Payment Model above.
- **Payment success is only ever established by server-side HMAC signature
  verification**, never by trusting the client-reported Razorpay `handler` callback on
  its own — see Payment Model above.
- An instructor cannot purchase their own course (`createOrderService` checks
  `course.instructor === userId`), and a user already in `course.studentsEnrolled`
  cannot open a second order for the same course.

## Architecture Decisions

- **Bearer token is the auth-header standard, not `x-access-token`.**
  Why: conventional JWT header, already preferred by the backend middleware. Frontend
  still sends `x-access-token` — not yet migrated.
- **FK fields referencing Course are named `course`, not `courseID`.**
  Why: matches the majority of existing models (payment, review, section).
  `courseProgressSchema.js` used to be the one exception (`courseID`, plus a unique index
  that referenced a `course` field that didn't exist on the schema) — fixed when the
  CourseProgress domain was built out; the collection was empty at the time, so no
  migration was needed.
- **`schema/` will be renamed to `models/` (not yet done).**
  Why: `schema/*.js` files are Mongoose models, not Zod schemas — the name collides with
  `validators/userSchema.js`, which really is one.
- **No centralized Express error-handling middleware yet.** Every controller repeats an
  identical try/catch (documented convention in `code-standards.md`, not treated as
  broken) — candidate refactor if the duplication gets painful as more domains grow
  their own controllers.
