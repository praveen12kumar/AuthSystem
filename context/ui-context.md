# UI Context

## Tooling

`.claude/skills/ui-ux-pro-max` (installed from
[nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill),
MIT-licensed, verified to make no network calls) is available for UI/UX design
guidance — searchable style/color/typography/UX-guideline databases via
`python .claude/skills/ui-ux-pro-max/scripts/search.py`. Useful for auditing existing UI
against accessibility/interaction/animation best practices (`--domain ux`) or generating
a full design system for a genuinely new surface (`--design-system`). Don't use it to
regenerate the app's established brand (violet/Outfit, see Design Tokens below) without
being explicitly asked to re-theme — it's for review/audit and net-new decisions, not for
silently overriding existing ones.

## Component Library

shadcn/ui, `new-york` style, `neutral` base color, CSS variables enabled, Lucide icons
(`frontend/components.json`). Generate new primitives with the shadcn CLI into
`components/ui/` — don't hand-write a primitive that shadcn already provides, and don't
hand-edit generated `components/ui/*` files beyond what the CLI produces (add
project-specific behavior in a wrapping component instead).

Tailwind v4, CSS-first config — there is no `tailwind.config.js`; all theme
customization lives in `frontend/src/index.css`.

## Design Tokens

All color tokens are OKLCH, defined in `frontend/src/index.css` as CSS custom
properties, with light values under `:root` and dark overrides under `.dark`. The brand
color is a violet (`oklch(... 271.9)` hue) applied to `--primary`, `--accent`, and
`--ring` in both light and dark mode — every other token (`secondary`, `muted`, `border`,
etc.) stays zero-chroma gray on purpose (brand accent only, not a full re-theme). Treat
this as the canonical brand color: don't hardcode hex/oklch values inline in components,
add new brand-related tokens here instead.

- Radius scale: base `--radius: 0.625rem`, with `--radius-sm/md/lg/xl` derived from it
  in the `@theme inline` block. Use the Tailwind radius utilities (`rounded-md`, etc.),
  not literal values.
- Semantic color tokens to use in components: `background`/`foreground`, `card`,
  `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`,
  `ring`, plus `sidebar-*` and `chart-*` for those specific contexts. Reference them via
  Tailwind utility classes (`bg-primary`, `text-muted-foreground`) rather than raw CSS
  variables.

## Typography

The "Outfit" Google Font is imported at the top of `index.css` **and is wired in** via
`--font-sans: 'Outfit', ui-sans-serif, system-ui, sans-serif;` in the `@theme inline`
block — it's the active global sans font.

## Animation

`framer-motion` is a project dependency for animation beyond what Tailwind's
`tw-animate-css` utility classes cover (page-load stagger, accordion/list mount-exit).
Import `motion` aliased as `Motion` (`import { motion as Motion } from 'framer-motion'`)
— the flat ESLint config's `no-unused-vars` only auto-exempts capitalized identifiers
(`varsIgnorePattern: '^[A-Z_]'`), and `motion.div`/`motion.header` etc. used only inside
JSX tags aren't otherwise recognized as "used" without `eslint-plugin-react`. Components
imported and used as JSX elements normally (`Button`, `AnimatePresence`) don't need this
since they're already capitalized.

`App.jsx` wraps the whole tree in `<MotionConfig reducedMotion="user">` — every
`Motion.*` animation in the app automatically respects the OS-level
`prefers-reduced-motion` setting for free. Don't add per-component reduced-motion
handling; it's already covered globally.

## Accessibility

- **Icon-only interactive elements need an explicit `aria-label`** (the shadcn `Button`/
  `Input` focus-ring styling already covers visible focus states, but not the accessible
  name). Pattern: `aria-label={`Delete ${item.title}`}` when the label needs to
  disambiguate between repeated rows (see `SectionManager.jsx`, `LessonManager.jsx`,
  `InstructorDashboard.jsx`). A `title` attribute alone is not a reliable substitute —
  it's a tooltip, not consistently exposed as an accessible name.
- **Toggleable filter/selection chips must be real, focusable controls, not a styled
  `<span onClick>`.** The shadcn `Badge` renders a plain `<span>` by default, which
  can't be tabbed to or activated with Enter/Space. For anything clickable, use
  `<Badge asChild>` wrapping a real `<button type="button" aria-pressed={selected}>` —
  see `CourseCatalog.jsx`'s tag filter and `CourseForm.jsx`'s tag selector. (Badges used
  purely as static labels, or already wrapped in a real `<Link>` like Home's
  browse-by-category chips, don't need this — only ones with their own `onClick`.)

## Layout Patterns

- `Header` (`components/molecules/header/Header.jsx`) is `sticky top-0`, not absolutely
  positioned — every page renders it inline as a normal flex child, including
  `pages/auth/Auth.jsx`'s shared shell (`<Header/>` then centered `children` below it).
  It's auth-aware: shows Sign In/Get Started when logged out, an avatar dropdown (Sign
  Out, Change Password, and — only for `INSTRUCTOR`/`ADMIN` — a Dashboard link) when
  logged in.
- Route-level role gating: `ProtectedRoute` (`components/molecules/protectRoute/`)
  accepts an optional `roles` array prop; if the logged-in user's role isn't in it,
  redirect to `/` instead of rendering. Use this for any route beyond "must be logged
  in" (e.g. `/instructor/*`) rather than checking `auth.user.role` inside the page.
- Container/presentational split: route-level `*Container.jsx` pages own state and
  data-fetching hooks; `components/organisms/<domain>/*` are the props-driven views they
  render. See `code-standards.md` for the naming convention (no `Card` suffix going
  forward).
- No CSS Modules, no styled-components — Tailwind utility classes exclusively, using the
  `cn()` helper (`lib/utils.js`, `clsx` + `tailwind-merge`) for conditional class
  composition.
