# Architecture Context

## Stack

- **Backend**: Node.js (ESM, `"type": "module"`), Express 5, MongoDB via Mongoose 8.
- **Frontend**: React (Vite), react-router-dom v7, TanStack React Query v5, Axios,
  shadcn/ui (new-york style, Tailwind v4 CSS-first config, no `tailwind.config.js`).
- **Auth**: JWT (`jsonwebtoken`), stateless — no server-side sessions.
- **Cache/rate-limiting**: Upstash Redis (REST client, not `ioredis`) — used only for
  OTP state, not for sessions or general caching.
- **Email**: `nodemailer` + `ejs` templates (OTP, password reset).
- **Planned, not yet wired up**: `multer` + `cloudinary` (course content/file upload),
  `swagger-autogen` (API docs) — installed but no code references them yet `[INFERRED: intent]`.

## System Boundaries

```
Client (React) --axios--> /api/v1/* (Express) --> service layer --> repository layer --> Mongoose models --> MongoDB
                                                 \-> Redis (OTP state only)
                                                 \-> nodemailer (transactional email)
```

- Request layering is strict and consistently followed for the User and Tag domains:
  `route → validate(zodSchema) middleware → controller → service → repository → Mongoose model`.
  Controllers never call Mongoose directly.
- Course/Section/SubSection/Review/Payment/CourseProgress models exist but have no
  service/repository/controller/route layer yet — only the Mongoose schema exists for
  these today. Tag was built first (see `progress-tracker.md`) because Course requires
  at least one Tag to exist.

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
- Token creation: `createJWT({ id, email })`, signed with `JWT_SECRET`, expiry from
  `JWT_EXPIRES_IN` env var. Password/hash is never included in the payload or returned
  to the client.
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
  run after `isAuthenticated` on the same route (it depends on `req.user` being set).
  Returns 403 if the role doesn't match. This is the first use of role-based route
  protection in the codebase — apply it to any route that should be restricted beyond
  "logged in," rather than checking `req.user.role` ad hoc inside a controller.

## Invariants

Only things whose violation is a bug — not preferences:

- Controllers never call Mongoose models directly; only services/repositories do.
- Every mutating route that changes user-owned data must run through `validate(zodSchema)`
  before the controller executes.
- Passwords are never logged, returned in an API response, or embedded in a JWT payload.
- `req.user` is only trustworthy after `isAuthenticated` middleware has run — do not read
  `req.user` on a route that doesn't apply that middleware.
- OTP verification state lives only in Redis; it must never be persisted to MongoDB.
- All Mongoose FK fields referencing `Course` are named `course` (not `courseID` /
  other variants) — `courseProgressSchema.js` currently violates this
  (uses `courseID`, and its unique index incorrectly references a `course` field that
  doesn't exist on that schema) and needs fixing; see `progress-tracker.md`.
- Only `ADMIN`/`INSTRUCTOR` roles may create/update/delete a Tag; any request (including
  anonymous) may read tags. Enforced via `isAuthenticated` + `authorize('ADMIN',
  'INSTRUCTOR')` on the write routes in `routes/v1/tags.js` — don't add a Tag write route
  without both.

## Architecture Decisions

- **Bearer token is the auth-header standard, not `x-access-token`.**
  Why: `Authorization: Bearer` is the conventional header for JWT auth and is what the
  backend middleware already prefers; `x-access-token` only exists today because the
  frontend was wired to it first. Frontend needs to switch — tracked as an open item,
  not done yet.
- **FK fields referencing Course are named `course`, not `courseID`.**
  Why: majority of existing models (`payment`, `review`, `section`) already use `course`;
  standardizing on the majority avoids touching more files than necessary.
- **`schema/` will be renamed to `models/` (not yet done).**
  Why: files in `backend/src/schema/` are Mongoose models, not schemas in the Zod sense —
  the current name collides in meaning with `backend/src/validators/userSchema.js`, which
  really is a schema (a Zod validation schema). Renaming to `models/` removes the
  ambiguity at the folder level.
- **No centralized Express error-handling middleware yet.** Every controller repeats an
  identical try/catch. This is documented as the current convention in
  `code-standards.md`, not treated as broken — but flagged as a candidate refactor if the
  duplication becomes painful as more domains (course, payment) get their own controllers.
