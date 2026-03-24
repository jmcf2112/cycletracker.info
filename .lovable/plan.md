

# Plan: Force Rebuild — Trivial Touch to Auth.tsx

Add a single comment line to `src/pages/Auth.tsx` to trigger Vite's rebuild. The Google and Apple sign-in buttons are already coded — they just need the build cache to refresh.

## Change
| File | What |
|---|---|
| `src/pages/Auth.tsx` | Add `// rebuild` comment on line 1 |

No functional changes. Just a cache-bust.

