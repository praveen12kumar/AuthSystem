# Project Context

Read `context/ai-workflow-rules.md` before any implementation work.

## Context Files

- `context/project-overview.md` — what we're building, scope, success criteria
- `context/architecture-context.md` — stack, boundaries, storage, auth, invariants
- `context/code-standards.md` — language and framework conventions
- `context/ui-context.md` — design tokens, typography, layout patterns
- `context/progress-tracker.md` — current state; update after every meaningful change

## Loading Rules

Read only the files relevant to the current task. Do not load all five by default.

- Any implementation work → `ai-workflow-rules.md` + `progress-tracker.md`
- Backend / API / data → `architecture-context.md` + `code-standards.md`
- UI work → `ui-context.md` + `code-standards.md`
- Scope or "should we build X" questions → `project-overview.md`

## Standing Rules

- Do not invent product behavior that is not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before
  implementing.
- If a requirement is missing, add it to Open Questions in `progress-tracker.md`.
- Update the relevant context file in the same change as the code that made it stale.
