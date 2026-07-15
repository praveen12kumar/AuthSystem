# UI Context

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
properties, with light values under `:root` and dark overrides under `.dark`. This is
still the **stock, unmodified shadcn default theme** — every token is a zero-chroma gray
except `--destructive` and the five `--chart-*` colors. No brand colors have been chosen
yet; when they are, add them here as the new canonical values, don't hardcode hex/oklch
values inline in components.

- Radius scale: base `--radius: 0.625rem`, with `--radius-sm/md/lg/xl` derived from it
  in the `@theme inline` block. Use the Tailwind radius utilities (`rounded-md`, etc.),
  not literal values.
- Semantic color tokens to use in components: `background`/`foreground`, `card`,
  `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`,
  `ring`, plus `sidebar-*` and `chart-*` for those specific contexts. Reference them via
  Tailwind utility classes (`bg-primary`, `text-muted-foreground`) rather than raw CSS
  variables.

## Typography

The "Outfit" Google Font is imported at the top of `index.css` but **is not currently
wired into any `font-family` token** — no `--font-sans` override exists in the `@theme`
block, so it's not actually applied globally yet. Treat this as an open item, not a
convention to follow: don't assume Outfit is the active font until a `--font-sans` token
is added.

## Layout Patterns

- Auth pages share one layout shell (`pages/auth/Auth.jsx`): renders `Header` and
  centers its `children`. Applied by wrapping the page's JSX manually per-route
  (`<Auth><XContainer/></Auth>`), not via a react-router layout route — follow this
  pattern for new shared layouts rather than introducing nested router layouts.
- Container/presentational split: route-level `*Container.jsx` pages own state and
  data-fetching hooks; `components/organisms/<domain>/*` are the props-driven views they
  render. See `code-standards.md` for the naming convention (no `Card` suffix going
  forward).
- No CSS Modules, no styled-components — Tailwind utility classes exclusively, using the
  `cn()` helper (`lib/utils.js`, `clsx` + `tailwind-merge`) for conditional class
  composition.
