

# Plan: Force Rebuild to Show Google & Apple Sign-In Buttons

The `Auth.tsx` file already contains the Google and Apple sign-in buttons with the correct `lovable.auth.signInWithOAuth()` calls. The preview is serving a cached/stale build.

## What I'll Do

Make a trivial whitespace change to `src/pages/Auth.tsx` (add a comment) to force Vite to rebuild and serve the updated code. No functional changes needed — the social login buttons are already implemented.

## Files Modified
| File | Change |
|---|---|
| `src/pages/Auth.tsx` | Add a rebuild trigger comment |

