# AI Workflow Rules

## How Work Is Scoped

- A "unit" of work is one feature slice through the full layering — e.g. for a new
  domain: one route + validator + controller + service + repository, or one frontend
  flow: one API wrapper + one hook + one Container + its presentational component. Don't
  build a whole domain's CRUD in one unit; propose the first vertical slice and stop.
- If a request combines unrelated concerns (e.g. "add course creation and fix the auth
  header" in one ask), split it and implement the first piece only, naming the second as
  a follow-up.
- Before implementing, state: the scope of this unit, which context files were read, and
  which invariants from `architecture-context.md` apply.
- Don't invent product behavior not defined in `project-overview.md`. If a requirement
  is ambiguous, propose 2-3 options with trade-offs and wait for a decision rather than
  guessing — then write the resolution into the relevant context file before
  implementing.
- If a requirement is genuinely undecided, record it under Open Questions in
  `progress-tracker.md` and move on rather than inventing an answer.

## Protected Files — Don't Edit Without Explicit Confirmation

- `backend/.env`, `frontend/.env` — secrets; never read contents into a commit or log
  them.
- `backend/package-lock.json`, `frontend/package-lock.json` — only via the package
  manager (`npm install`), never hand-edited.
- `frontend/dist/` — build output, never edited directly.
- Any Mongoose model already in production use (`User` is the only one live today) —
  changing its shape requires a migration plan, not just an edit.

## Before Moving to the Next Unit — Definition of Done

Before reporting a unit as done, walk this checklist explicitly:

1. Does the unit work end to end within its stated scope (not partially, not
   "the happy path only" unless that was the agreed scope)?
2. Was any invariant in `architecture-context.md` violated? If a change intentionally
   revises an invariant, was `architecture-context.md` updated in the same change?
3. Which context files were updated, and why? (If a system boundary, storage decision,
   or convention changed, the corresponding context file must be updated in the same
   change as the code — not later.)
4. Do the linters pass? (`npm run lint` in the relevant package; backend also has
   `npm run format`.)
5. For frontend changes with visible UI impact: was the feature actually exercised in
   the browser (not just linted/typechecked)?

## Verification

- **Backend**: Vitest + supertest + `mongodb-memory-server`, `npm test` (or `npm run
  test:watch`) in `backend/`. Tests hit the real Express `app` (`src/app.js`, imported
  directly — never `src/index.js`, which calls `connectDB()`/`app.listen()` as a side
  effect of import and would connect to the real dev database) over HTTP via
  `supertest`, against a real `mongod` binary running in memory (`tests/setup.js`) —
  Mongoose validators/indexes behave exactly like production, nothing ever touches the
  real dev/prod database. External services (Redis via `@upstash/redis`'s REST client)
  are used for real when cheap and safe to (see `tests/auth/signup.test.js`, which
  exercises real OTP rate-limiting state and cleans its own Redis keys up in
  `afterEach`) — only genuinely costly/noisy externals (actually sending an email via
  nodemailer) get mocked, and only the transport call itself, not the surrounding
  business logic. New domains should extend this pattern (one test file per route
  group under `tests/<domain>/`) rather than introducing a different one. Currently
  covers: Auth (signin, signup, email verification). Not yet covered: everything else
  — see `progress-tracker.md` Next Up for what's next in line.
- **Frontend**: still no automated test suite. For UI changes, run the dev server and
  exercise the flow in a browser (Playwright, per Session Notes) before calling it done.

## Session Discipline

- Read `progress-tracker.md` at the start of a session; report where things left off,
  what's next, and any open questions — then wait for confirmation before implementing.
- Update `progress-tracker.md` at the end of a session (or a natural stopping point):
  Completed, In Progress, Next Up, Open Questions, Architecture Decisions, Session Notes.
  Keep it short — summarize, don't append a changelog entry per session.
