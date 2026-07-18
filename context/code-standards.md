# Code Standards

## Formatting (enforced by tooling — don't hand-format around it)

- Backend: `backend/src/.prettierrc` — semicolons required, single quotes, 2-space
  indent, 80-char width, **no trailing commas**. Run `npm run format` /
  `npm run lint:fix` before committing; several existing model files under
  `schema/` still use double quotes + trailing commas and are known drift being
  cleaned up, not the standard to copy.
- Frontend: ESLint enforces `semi: always`, `quotes: single`, import sorting via
  `eslint-plugin-simple-import-sort` (imports and exports both error-level). Both
  backend and frontend use the same import-sort plugin — keep imports sorted; don't
  hand-order them.
- Both: flat ESLint config (`eslint.config.js`), no `no-console` rule — `console.log`
  is tolerated but prefer removing debug logs before committing rather than leaving
  them commented out.

## Backend (`backend/src`)

**Layering** — always `route → validate(zodSchema) → controller → service → repository → Mongoose model`.
- `routes/v1/<domain>.js` wires the Zod validator middleware and `isAuthenticated` (when
  needed) directly on the route definition, then calls the controller.
- Controllers (`controller/`) stay thin: destructure the request, call one service
  function, wrap the result with `successResponse`/`customErrorResponse` from
  `utils/common/responseObject.js` inside a try/catch. Don't put business logic here.
- Services (`services/`) hold business logic, call repositories, and are responsible for
  translating Mongoose errors (`ValidationError`, duplicate-key `11000`) into the shared
  custom error classes in `utils/errors/`.
- Repositories (`repository/`) are the only layer that touches Mongoose models directly.
  New domains should spread the generic `crudRepository(Model)` factory and add
  domain-specific queries on top, following `userRepository.js`.
- **Naming**: files and functions are camelCase. Service functions get a `Service` suffix
  (`signInService`); controller functions don't (`signin`); repository methods are bare
  verbs (`create`, `getAll`, `getById`, `update`, `delete`).
- **Validation split**: `validators/` holds Zod schemas for request-body shape checks at
  the route boundary (fails fast with a 400, before the controller runs). `schema/`
  (being renamed to `models/` — see `architecture-context.md`) holds Mongoose
  schema/model definitions, which enforce DB-level constraints (`required`, `enum`,
  `unique`, `match`) on save/update. Both layers can reject the same input for different
  reasons — that's expected, not a bug to unify.
- `validate(schema)` (`validators/zodValidators.js`) reassigns `req.body` to the
  **parsed** result, not just pass/fail — so `z.coerce`/`.preprocess`/`.transform` in a
  schema actually take effect downstream, and unknown fields get stripped (Zod's default
  `z.object()` behavior). Controllers and services always see the validated/coerced
  shape, never the raw request body.
- **Errors**: throw `ClientError` (generic 400-class error) or `ValidationError`
  (normalizes validation failures into a flat message list) from
  `utils/errors/`. Every controller catches these itself today — there is no centralized
  Express error-handling middleware (see Architecture Decisions in
  `architecture-context.md` for why this hasn't been changed yet). Follow the existing
  try/catch shape in `userController.js` for new controllers rather than inventing a new
  error-handling style.
- **Response shape**: always return `{ success, err, data, message }` via the three
  helpers in `utils/common/responseObject.js`. Don't hand-roll response objects.
- Enum values on Mongoose schemas are UPPER_SNAKE_CASE (`'ADMIN'`, `'PENDING'`,
  `'SUCCESS'`) except nested sub-document enums like `profile.gender`, which are
  lowercase — follow whichever convention the field you're extending already uses.
- FK fields referencing another model are named after the singular lowercase model name
  (`course`, `user`) — not `<name>ID`. See Architecture Decisions for the one known
  exception being fixed (`courseProgressSchema`'s `courseID`).
- **Authorization beyond "logged in"**: use `authorize(...allowedRoles)` from
  `authMiddleware.js` on the route, chained after `isAuthenticated`
  (`isAuthenticated, authorize('ADMIN', 'INSTRUCTOR'), validate(schema), controllerFn`).
  Don't check `req.user.role` by hand inside a controller — see `tags.js` for the
  reference pattern.
- **Client-supplied Mongoose ids** (route params like `:id`): a malformed id throws a
  `CastError`. Catch `error.name === 'CastError'` and rewrap as a `ClientError` (400),
  same as `ValidationError`/duplicate-key (`11000`) — see `tagService.js`'s
  `handleTagError`. Not needed in `userService.js`, whose ids all come from the JWT.
- **Referencing another domain's ids in a request body** (e.g. Course's `tags`): Zod
  only validates shape, not existence — the service must also look the ids up via that
  domain's repository (`tagRepository.findByIds`) and reject any that are missing, see
  `createCourseService`.
- **Arrays that must be non-empty**: don't rely on Mongoose's `required` — it's a no-op
  on arrays (see the Invariants note in `architecture-context.md`). Use a custom
  `validate` function on the schema field, and mirror it with `.min(1)` in the
  corresponding Zod schema so bad requests are rejected before hitting the DB.
- **Routes that accept a file**: chain `uploadSingle`/`uploadVideoSingle(fieldName)` →
  `requireFile(fieldName)` (only if required) → `validate(zodSchema)` → controller (see
  `routes/v1/courses.js`, `routes/v1/subsections.js`). Upload to Cloudinary from the
  **service** layer, never the controller. The Zod schema needs `z.coerce.number()` for
  numeric fields and JSON-string + `z.preprocess()` for arrays, since multipart text
  fields are always strings — see `validators/courseSchema.js`. A server-derived field
  (like a video's `duration`) has **no** Zod field at all — it never comes from the
  client, so there's nothing to validate.
- **Denormalized back-references** (e.g. `User.courses` mirroring `Course.instructor`):
  update via a dedicated repository method using an atomic `$push`/`$pull`
  (`userRepository.addCourse`/`removeCourse`), never a fetch-the-array-then-save round
  trip — avoids clobbering concurrent writes to the same array.
- **Cascading deletes**: when a parent's delete should remove its children (deleting a
  Course removes its Sections), do it in the service with a dedicated repository method
  (`sectionRepository.deleteByCourse`), not a per-child loop — and do it before deleting
  the parent itself.
- **Best-effort external cleanup**: an operation on an external service (deleting an old
  Cloudinary image/video after a successful replace/delete) must never fail the primary
  operation that already succeeded in the DB. Wrap it in a helper that catches and logs
  its own errors (`safeDeleteCloudinaryImage` in `courseService.js`,
  `safeDeleteCloudinaryVideo` in `subSectionService.js` — same shape, not shared since
  they call different Cloudinary util functions) rather than letting it propagate
  through the normal error-handling path.
- **Ownership checks** (a resource belongs to a specific user, not just "some role"):
  write a concrete middleware per way the owning resource is resolved, chained after
  `isAuthenticated` (+ `validate()` only if it needs `req.body` shape-confirmed first).
  `isCourseOwnerOrAdmin` resolves via `req.body.course || req.params.id` (Section create
  vs. Course update/delete — one function, since both cases are "does req.user own
  *this* course," just sourced from two request locations). `isSubSectionOwnerOrAdmin`
  does the same dual-resolution trick one hop deeper (`req.body.section` for create, or
  look up the SubSection via `req.params.id` for update/delete, then walk up to its
  Section's course). `isSectionOwnerOrAdmin` (Section update/delete only) is a genuinely
  different resolution path and stays separate — don't force every ownership case into
  one parameterized factory, but do reuse one function across call sites checking the
  exact same thing from a different request field.
- **Read-access gates beyond "logged in"** (a resource whose response carries paid
  content, e.g. SubSection's `videoUrl`): write a concrete middleware following the same
  dual-resolution shape as an ownership middleware, but check enrollment OR ownership OR
  `ADMIN`, not ownership alone (`isEnrolledOrOwnerOrAdmin` in `authMiddleware.js`) — a
  student who never paid should never see the underlying resource, only an
  instructor/admin previewing their own content or a student who's actually enrolled.
- **Listing a sub-resource by its parent** (e.g. Sections of a Course): use a query
  param on the flat route (`GET /sections?course=<id>`), not a nested route
  (`/courses/:id/sections`) — keeps every domain's router flat and consistent with
  Tag/Course, rather than mixing two routing styles. The query param name matches the
  FK field name (`course`, not `courseId`).
- **Idempotent set-membership updates** (e.g. enrolling a student): use `$addToSet`, not
  `$push`, when the same write might legitimately be retried (`courseRepository.addStudent`
  guards against a duplicate/retried payment-verification call double-enrolling the same
  user). Reserve `$push` for denormalized back-references that are only ever written once
  per child (`User.courses`, `Course.sections`).
- **External-service secrets used for verification** (e.g. `RAZORPAY_API_SECRET`): only
  ever touch them server-side inside the service layer that needs them
  (`paymentService.js`'s `isSignatureValid`); never log, return, or pass them to the
  frontend. Compare received vs. expected signatures with `crypto.timingSafeEqual`, never
  `===` — a plain string compare leaks timing information about how many leading bytes
  matched.

## Frontend (`frontend/src`)

- **Folder roles**:
  - `apis/<domain>/index.js` — raw Axios calls, one file per domain. Each function
    wraps `axios.<verb>` in try/catch and re-throws a plain string message (extracted via
    a local `getErrorMessage`), not an `Error` object.
  - `hooks/apis/<domain>/use<Name>.js` — one hook per API call (`useMutation` for
    writes, `useQuery` for reads — see Data Fetching below), a `react-hot-toast` toast
    in mutation `onSuccess`/`onError`.
  - `hooks/context/use<Name>.js` — thin `useContext` wrappers.
  - `pages/<domain>/<Name>Container.jsx` — route-level components that own state and
    call hooks/mutations.
  - `components/organisms/<domain>/<Name>.jsx` — presentational, props-driven views
    rendered by a matching Container. **Standard: no `Card` suffix** (e.g. `SignIn`, not
    `SignInCard`) — `SignInCard.jsx`/`SignUpCard.jsx` are known drift to be renamed; new
    components should not use the suffix.
  - `components/molecules/` — small composed pieces used across features (e.g. `Header`,
    `ProtectedRoute`).
  - `components/ui/` — shadcn primitives only; don't hand-edit generated shadcn files
    beyond what `npx shadcn add` produces.
- **Naming**: components are PascalCase files/exports. Hooks are camelCase `use*.js`.
  `hooks/conext/` and `useChnagePassword.js` are known misspellings already referenced
  elsewhere in the codebase — don't propagate the typo into new files, but don't rename
  the existing ones without a coordinated pass (see `progress-tracker.md`). New context
  hooks go in the correctly-spelled `hooks/context/` (e.g. `useTheme.js`) — this means
  there are now two folders (`conext` for `useAuth`, `context` for anything new) until
  the coordinated rename happens; don't merge them opportunistically.
- **Routing**: all routes are declared flat in `utils/Routes.jsx`, no nested router
  layout routes — shared layout (`Auth`) is applied by manually wrapping the page
  component in JSX, not via a react-router layout route. Follow this pattern for new
  route groups rather than introducing nested routes.
- **Auth-gated routes**: wrap in `<ProtectedRoute>` from
  `components/molecules/protectRoute/ProtectedRoute.jsx`.
- **Data fetching**: TanStack React Query for all server state. Query keys are
  `["tags"]` / `["courses"]` / `["course", id]` / `["sections", courseId]` /
  `["subsections", sectionId]`; mutations
  invalidate the relevant key(s) in `onSuccess` (see `useCreateCourse.js`). When a
  mutation needs a parent id purely to invalidate the right key (e.g.
  `useUpdateSection`/`useDeleteSection` need `course` to invalidate
  `["sections", courseId]`), the caller passes it alongside the real payload and the API
  wrapper simply ignores the extra field — don't thread it through as a real request
  parameter.
- **Backend doesn't `.populate()` refs**: Course/Section responses carry raw ObjectId
  strings for `tags`/`instructor`, not embedded documents. Resolve tag names client-side
  by fetching the full tag list once (`useTags`) and building an id→name map; there's no
  public endpoint to resolve an instructor's name from an id, so course cards/detail
  pages don't display an instructor name (see `CourseCard`/`CourseDetail`).
- **Course/Section multipart writes**: `createCourseRequest`/`updateCourseRequest`
  (`apis/course/index.js`) build a `FormData` from a plain object (`buildCourseFormData`)
  — `tags` must be `JSON.stringify`'d before appending, matching the backend's
  `z.preprocess()` expectation. Don't call these with a plain JSON object.
- **Price display is USD-only, presentational**: the `Course` schema has no currency
  field, just a `Number`. `CourseCard`/`CourseDetail`/`InstructorDashboard` hardcode a
  `$` prefix — this is a display assumption, not a stored/validated currency; revisit if
  multi-currency is ever needed. Note this is already inconsistent with Payments, which
  hardcodes `currency: 'INR'` when creating the Razorpay order — the displayed `$` price
  and the actual charged currency don't match; a known gap, not a bug to silently "fix"
  by picking one side without asking.
- **Third-party checkout script loading**: load a vendor's widget script (e.g. Razorpay's
  `checkout.js`) once via a cached-promise helper (`utils/loadRazorpayScript.js`), not
  inline in a component — `window.Razorpay` after the first successful load, a shared
  in-flight promise for concurrent calls, so a second "Enroll" click doesn't inject the
  `<script>` tag twice.
- **Payment orchestration logic lives in the Container, not the organism**: `handleEnroll`
  (script load → create order → open Razorpay checkout → verify on the `handler`
  callback) is all in `CourseDetailContainer.jsx`; `CourseDetail.jsx` only receives
  `isEnrolled`/`onEnroll`/`isEnrolling` props — same Container/presentational split as
  every other domain, no exception for payment flows.

## Cross-cutting

- Don't duplicate literals (e.g. the email-regex used independently in both
  `schema/userSchema.js` and `validators/userSchema.js`) — if you're touching one of the
  duplicated copies, consider extracting a shared constant rather than editing just one
  side.
- New domains (Course, Payment, etc.) should follow the exact same layering as the User
  domain end-to-end — there's no shortcut path once a repository/service exists for a
  model.
