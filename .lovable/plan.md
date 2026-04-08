

# Add Google & Apple OAuth to Auth Page

## Overview
Add Google and Apple sign-in buttons to the existing Auth card, using the Lovable Cloud managed OAuth via `lovable.auth.signInWithOAuth()`.

## Changes

### `src/pages/Auth.tsx`
1. Import `lovable` from `@/integrations/lovable/index`
2. Add a `handleOAuthSignIn` function for Google/Apple that calls `lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin })`
3. Add two OAuth buttons (Google and Apple) with recognizable icons below the email form, separated by a "or continue with" divider
4. Show OAuth buttons on both sign-in and sign-up views (hide during forgot-password flow)
5. Handle loading state and error toasts for OAuth attempts

### Visual Layout
- After the email/password form and before the sign-in/sign-up toggle text
- A horizontal divider with "or" text
- Two full-width buttons stacked: "Continue with Google" and "Continue with Apple"
- Inline SVG icons for Google (colored G logo) and Apple (apple icon)

### Memory Update
Update auth memory to reflect that Google and Apple OAuth are now re-enabled via Lovable Cloud managed OAuth.

