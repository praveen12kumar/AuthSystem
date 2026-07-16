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
  — wired up for Course `thumbnail`; see File Upload Model below.
- **Planned, not yet wired up**: `swagger-autogen` (API docs) — installed but no code
  references it yet `[INFERRED: intent]`.

## System Boundaries

```
Client (React) --axios--> /api/v1/* (Express) --> service layer --> repository layer --> Mongoose models --> MongoDB
                                                 \-> Redis (OTP state only)
                                                 \-> nodemailer (transactional email)
                                                 \-> Cloudinary (image storage, via service layer)
```

- Request layering is strict and consistently followed for User, Tag, Course, and
  Section: `route → validate(zodSchema) middleware → controller → service → repository →
  Mongoose model`. Controllers never call Mongoose directly.
- Course and Section both have full CRUD now. (Course delete cascades to its Sections —
  see Invariants. The "enrolled-student impact" concern that originally deferred Course
  update/delete is currently moot: no enrollment/payment domain is implemented yet, so
  there's nothing to protect against a price/content change — revisit once Payment or
  CourseProgress get built.)
- SubSection/Review/Payment/CourseProgress models exist but have no
  service/repository/controller/route layer yet — only the Mongoose schema exists for
  these today.

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
- **Ownership authorization**: two concrete middlewares (not a generic factory — see
  `code-standards.md`), both requiring `req.user.id === course.instructor` OR
  `req.user.role === 'ADMIN'`, both handling their own `CastError` for a malformed id:
  - `isCourseOwnerOrAdmin` resolves the course from `req.body?.course || req.params.id` —
    the former for Section create (must run after `validate()`, since that's what
    shape-confirms `req.body.course`), the latter for Course update/delete (the route
    param *is* the course id directly, no body dependency). `req.body` really can be
    `undefined` here (not `{}`) for a pure multipart request with no text fields, since
    Express's body-parsers never touch multipart content — confirmed live when a
    thumbnail-only Course update 500'd before the optional-chaining fix.
  - `isSectionOwnerOrAdmin` is for Section update/delete: no course id anywhere in the
    request, so it looks up the section from `req.params.id` first, then that section's
    course.

## File Upload Model

- `multer` (`memoryStorage`, 5MB limit, image-mimetype filter — `req.file.buffer`, never
  written to disk) → Cloudinary, configured once in `libs/cloudinaryConfig.js` from the
  three `CLOUDINARY_*` vars in `config/serverConfig.js`.
  `utils/common/imageUpload.js`'s `uploadImageToCloudinary` base64-encodes the buffer and
  uploads directly (no temp-file cleanup needed); call it from the **service** layer,
  same as any other external-dependency call (Redis, nodemailer).
- **Route order**: `uploadSingle(fieldName)` → `requireFile(fieldName)` (if required) →
  `validate(zodSchema)` → controller. `uploadSingle` must run first — it populates
  `req.body` from the multipart stream, which `validate` then reads. `uploadSingle`
  formats its own 400 on failure (multer reports errors via callback, not a throw, so a
  controller's try/catch never sees them) — same self-contained-error-handling pattern
  as `validate()` itself.
- Any route accepting a file is `multipart/form-data`, not JSON: numeric fields need
  `z.coerce.number()`, array fields need a JSON-encoded string + `z.preprocess` (HTML
  forms can't carry real arrays) — see `validators/courseSchema.js`.

## Invariants

Only things whose violation is a bug — not preferences:

- Controllers never call Mongoose models directly; only services/repositories do.
- Every mutating route runs through `validate(zodSchema)` before the controller executes.
- Passwords are never logged, returned in an API response, or embedded in a JWT payload.
- `req.user` is only trustworthy after `isAuthenticated` has run.
- OTP verification state lives only in Redis; it must never be persisted to MongoDB.
- All Mongoose FK fields referencing `Course` are named `course` (not `courseID`) —
  `courseProgressSchema.js` currently violates this (uses `courseID`, and its unique
  index incorrectly references a `course` field that doesn't exist on that schema) and
  needs fixing; see `progress-tracker.md`.
- Only `ADMIN`/`INSTRUCTOR` may write to Tag, Course, or Section (role gate on every
  write route); reads are public for all three. Course/Section writes additionally
  require course ownership (see Auth Model above) — `ADMIN` bypasses ownership too.
  `course.instructor` is always set server-side from `req.user.id`, never from the body.
- A Course must have a `thumbnail` (Mongoose `required` + route-level `requireFile` on
  create) and at least one existing Tag id (Zod shape-check + a service-layer existence
  check via `tagRepository.findByIds` — a well-formed but nonexistent tag id is rejected).
- **Denormalized back-references sync via `$push`/`$pull`, never fetch-then-save**:
  creating a Course pushes onto `User.courses`; creating a Section pushes onto
  `Course.sections`. Deleting reverses each with `$pull`, and deleting a Course first
  cascades to delete every Section referencing it (`sectionRepository.deleteByCourse`).
  None of this is wrapped in a transaction (none are used anywhere in this codebase) — a
  failure mid-sequence is a known, accepted gap.
- **Cloudinary cleanup is always best-effort**: `safeDeleteCloudinaryImage` swallows its
  own errors — an old thumbnail is deleted only *after* the replacing DB write succeeds,
  and a failed cleanup must never undo an otherwise-successful create/update/delete.
- **Mongoose `required` on an array field never enforces "at least one element"**
  (verified empirically) — arrays default to `[]`, which always satisfies `required`'s
  null/undefined check. Use a custom `validate: (arr) => arr.length > 0` function
  instead (see `code-standards.md` for the reusable convention).

## Architecture Decisions

- **Bearer token is the auth-header standard, not `x-access-token`.**
  Why: conventional JWT header, already preferred by the backend middleware. Frontend
  still sends `x-access-token` — not yet migrated.
- **FK fields referencing Course are named `course`, not `courseID`.**
  Why: matches the majority of existing models (payment, review, section).
- **`schema/` will be renamed to `models/` (not yet done).**
  Why: `schema/*.js` files are Mongoose models, not Zod schemas — the name collides with
  `validators/userSchema.js`, which really is one.
- **No centralized Express error-handling middleware yet.** Every controller repeats an
  identical try/catch (documented convention in `code-standards.md`, not treated as
  broken) — candidate refactor if the duplication gets painful as more domains grow
  their own controllers.
