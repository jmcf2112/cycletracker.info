

# Plan: Mobile PageSpeed 100/100 Polish

## Overview
Five targeted improvements to achieve perfect mobile PageSpeed scores: accessibility labels, color contrast, touch targets, bundle optimization, and build config.

## 1. Accessibility: Add `aria-label` to All Icon-Only Buttons

Every button/interactive element without visible text needs a descriptive `aria-label`. Current state: **zero `aria-label` attributes** in the entire codebase.

**Files and specific buttons to fix:**

- **`Dashboard.tsx`** — Floating action button (Sparkles icon): `aria-label="Log new cycle entry"`
- **`TopNav.tsx`** — 6 icon-only/ambiguous header buttons:
  - Support button: `aria-label="Support"`
  - Globe button: `aria-label="Change language"`
  - Moon button: `aria-label="Toggle dark mode"`
  - User button: `aria-label="Account"`
  - Sign Out button: `aria-label="Sign out"`
  - Bell button: `aria-label="Notifications"`
- **`LogCycleDialog.tsx`** — Delete button (Trash2 icon only): `aria-label="Delete cycle entry"`
- **`InsightsView.tsx`** — Info tooltip trigger: add `aria-label="More information"`
- **`PredictionCard.tsx`** — Info tooltip trigger: add `aria-label="Prediction details"`
- **`SymptomLogger.tsx`** — Each symptom chip button: `aria-label="Log {label} symptom"`
- **`HistoryView.tsx`** — Each history row button: `aria-label="Edit cycle starting {date}"`
- **`HeroProgress.tsx`** — Decorative icons (Moon, Flower2, Star, Sun): add `aria-hidden="true"` since they're purely decorative

## 2. Color Contrast: Darken Key Theme Colors for WCAG AA (4.5:1)

Current problematic colors in dark mode against `#201c1e` / dark card backgrounds:

| Variable | Current HSL | Issue | New HSL |
|---|---|---|---|
| `--muted-foreground` (dark) | `20 10% 60%` | Gray text too light on dark bg | `20 10% 68%` |
| `--primary` (dark) | `350 50% 70%` | Pink on dark bg borderline | `350 55% 72%` |
| Hardcoded `text-zinc-400` | `#a1a1aa` | Used in HeroProgress, SymptomLogger | Replace with `text-zinc-300` |
| Hardcoded `text-zinc-500` | `#71717a` | Used in SymptomLogger helper text | Replace with `text-zinc-400` |
| Hardcoded `text-zinc-300` | `#d4d4d8` | Already passes — no change | — |

Changes in `src/index.css` (dark mode block) and specific component files where hardcoded Tailwind zinc classes are used.

## 3. Touch Targets: Ensure 48x48px Minimum on Mobile

**Files to update:**

- **`TopNav.tsx`** — All header icon buttons: add `min-w-[48px] min-h-[48px]` and proper padding/gap
- **`SymptomLogger.tsx`** — Symptom chips: add `min-h-[48px]` 
- **`HistoryView.tsx`** — History row buttons: already `h-12` (48px) for the icon, but add `min-h-[48px]` to the outer button
- **`Dashboard.tsx`** — FAB already 64px, passes
- **`OnboardingFlow.tsx`** — Progress dots: these are non-interactive `div`s, so no change needed
- **`SettingsView.tsx`** — Back button: add `min-h-[48px]`; export/delete buttons already full-width and tall enough

## 4. Performance: Remove Unused JS / Optimize Imports

- **`Index.tsx`**: imports `format` from `date-fns` but never uses it — remove
- **`CycleStatus.tsx`**: imported but never rendered in `Dashboard.tsx` — not imported, OK
- **`PredictionCard.tsx`**: imported but never rendered in `Dashboard.tsx` — not imported, OK  
- **`QuickActions.tsx`**: defined but never imported anywhere — can be removed entirely (dead code)
- **`NavLink.tsx`**: defined but never imported by any component — can be removed entirely
- **`src/App.css`**: sets `#root` styles but overridden by index.css/Tailwind — remove file and its import (if any)
- **Vite `manualChunks`**: Split `date-fns`, `framer-motion`, and `recharts` (if present) into separate chunks to reduce main bundle

## 5. Build Optimization: Vite Production Config

Update `vite.config.ts`:
- Add `build.sourcemap: false` for production (no source maps shipped to users)
- Add `build.rollupOptions.output.manualChunks` to split vendor libraries
- Add `build.target: 'es2020'` for modern output
- Add `build.cssMinify: 'lightningcss'` if available, or keep default

```text
vite.config.ts additions:
  build: {
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'date-fns': ['date-fns'],
          'framer-motion': ['framer-motion'],
        }
      }
    }
  }
```

## Files Modified (Summary)

| File | Changes |
|---|---|
| `src/index.css` | Darken 2 CSS variables in dark mode |
| `src/components/Dashboard.tsx` | aria-label on FAB |
| `src/components/dashboard/TopNav.tsx` | aria-labels + touch target sizing on all header buttons |
| `src/components/dashboard/HeroProgress.tsx` | aria-hidden on decorative icons, fix zinc colors |
| `src/components/dashboard/SymptomLogger.tsx` | aria-labels on chips, touch targets, fix zinc colors |
| `src/components/LogCycleDialog.tsx` | aria-label on delete button |
| `src/components/insights/InsightsView.tsx` | aria-label on info icon |
| `src/components/dashboard/PredictionCard.tsx` | aria-label on info icon |
| `src/components/history/HistoryView.tsx` | aria-labels on row buttons, touch targets |
| `src/components/settings/SettingsView.tsx` | Touch target on back button |
| `src/pages/Index.tsx` | Remove unused `format` import |
| `vite.config.ts` | Build optimization config |
| Delete `src/components/dashboard/QuickActions.tsx` | Dead code |
| Delete `src/components/NavLink.tsx` | Dead code |
| Delete `src/App.css` | Unused stylesheet |

