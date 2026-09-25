# Foreman ledger

- Baseline commit: `5a53bd9cd46889a6913248c021fc8a25637c4ad7`
- Run: Milimani brand palette + light/dark theme + toggle
- Foreman: Opus 4.7
- Mode: Full (Agent tool + shell)

## Tasks

| id | task | seat | status |
|----|------|------|--------|
| T1 | New palette + light/dark CSS vars in globals.css | inline | PENDING |
| T2 | ThemeToggle client component | inline | PENDING |
| T3 | Wire toggle into header + no-flash script in layout | inline | PENDING |
| T4 | Audit all storefront + admin components, swap hardcoded slate/white for semantic tokens | sonnet worker | PENDING |
| T5 | Build + smoke test + screenshots both modes | inline | PENDING |
| T6 | Sync to Victor's Mac | inline | PENDING |

## Write sets

- T1: `src/app/globals.css`
- T2: `src/components/ui/theme-toggle.tsx` (new)
- T3: `src/app/layout.tsx`, `src/components/storefront/site-header.tsx`
- T4: many `.tsx` files under `src/` — token swaps only (no logic changes)

T4 runs after T1–T3 so it has the new tokens available.
