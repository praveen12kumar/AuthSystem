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
  Mongoose `CastError`. Service functions that take an id from a route param should
  catch `error.name === 'CastError'` and rewrap it as a `ClientError` (400), the same way
  `ValidationError`/duplicate-key (`11000`) are handled — see `tagService.js`'s
  `handleTagError` for the pattern. This wasn't needed in `userService.js` because every
  id there comes from the JWT, not directly from client input.
- **Referencing another domain's ids in a request body** (e.g. Course's `tags` array):
  Zod only validates shape (well-formed ObjectId string), not existence. The service
  layer must additionally look the ids up via that domain's repository (e.g.
  `tagRepository.findByIds`) and reject if any are missing, before creating/updating the
  referencing document — see `createCourseService` for the reference pattern.
- **Arrays that must be non-empty**: don't rely on Mongoose's `required` — it's a no-op
  on arrays (see the Invariants note in `architecture-context.md`). Use a custom
  `validate` function on the schema field, and mirror it with `.min(1)` in the
  corresponding Zod schema so bad requests are rejected before hitting the DB.
- **Routes that accept a file**: chain `uploadSingle(fieldName)` → `requireFile(fieldName)`
  (if the file is required) → `validate(zodSchema)` → controller, in that order (see
  `routes/v1/courses.js`). Upload the file to Cloudinary from the **service** layer via
  `utils/common/imageUpload.js`'s `uploadImageToCloudinary`, not from the controller —
  same rule as any other external-dependency call. The corresponding Zod schema must use
  `z.coerce.number()` for numeric fields and JSON-string + `z.preprocess()` for array
  fields, since multipart text fields are always strings — see
  `validators/courseSchema.js`.
- **Denormalized back-references** (e.g. `User.courses` mirroring `Course.instructor`):
  update via a dedicated repository method using an atomic `$push`
  (`userRepository.addCourse`), never a fetch-the-array-then-save round trip — avoids
  clobbering concurrent writes to the same array.

## Frontend (`frontend/src`)

- **Folder roles**:
  - `apis/<domain>/index.js` — raw Axios calls, one file per domain. Each function
    wraps `axios.<verb>` in try/catch and re-throws a plain string message (extracted via
    a local `getErrorMessage`), not an `Error` object.
  - `hooks/apis/<domain>/use<Action>.js` — one `useMutation` wrapper per API call,
    following the existing template: destructure `{isPending, isSuccess, error,
    mutateAsync}`, show a `react-hot-toast` toast in both `onSuccess`/`onError`.
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
  the existing ones without a coordinated pass (see `progress-tracker.md`).
- **Routing**: all routes are declared flat in `utils/Routes.jsx`, no nested router
  layout routes — shared layout (`Auth`) is applied by manually wrapping the page
  component in JSX, not via a react-router layout route. Follow this pattern for new
  route groups rather than introducing nested routes.
- **Auth-gated routes**: wrap in `<ProtectedRoute>` from
  `components/molecules/protectRoute/ProtectedRoute.jsx`.
- **Data fetching**: TanStack React Query for all server state. Use `useMutation` for
  writes (current pattern); when read endpoints are added, use `useQuery` with the same
  one-hook-per-call convention.
- No CSS Modules — Tailwind utility classes only, plus the shadcn CSS-variable tokens in
  `index.css`.

## Cross-cutting

- Don't duplicate literals (e.g. the email-regex used independently in both
  `schema/userSchema.js` and `validators/userSchema.js`) — if you're touching one of the
  duplicated copies, consider extracting a shared constant rather than editing just one
  side.
- New domains (Course, Payment, etc.) should follow the exact same layering as the User
  domain end-to-end — there's no shortcut path once a repository/service exists for a
  model.
