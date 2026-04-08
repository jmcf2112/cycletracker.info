## Investigation Findings

### Issue 1: Quick Actions toolbar position

The Quick Actions toolbar **is** at the top of the dashboard content area in the code (line 64-69 in Dashboard.tsx, rendered before HeroProgress). However, looking at the code, the QuickActions component renders as a `grid grid-cols-2` of buttons — it's positioned correctly in the DOM order but may not visually appear "at the top of the page" because it sits below the TopNav. The code change from the previous message was applied correctly. If the user expected it above the TopNav header itself, that's a different placement than what was implemented.  
  
**Diagnosis**: The QuickActions IS rendered before HeroProgress (lines 64-69). It's at the top of the content area, below the TopNav. If the user wants it literally at the very top of the page (above or inside the TopNav), that requires a different approach.

### Issue 2: OAuth disappeared from login/signup pages

**There are no login/signup pages in the codebase.** The project has:

- No Auth page (`/auth`, `/login`, `/signup` — none exist)
- No `useAuth` hook
- No `AuthProvider` context
- No `ProtectedRoute` or `PublicRoute` components
- No `src/integrations/lovable/` directory (no cloud auth module)
- No references to `signInWithOAuth`, `lovable.auth`, or any OAuth flow

The memory file mentions an auth system with `AuthProvider`, `ProtectedRoute`, Google/Apple OAuth, and a profile page at `/profile`, but **none of this code exists in the current codebase**. The authentication system appears to have been completely removed or lost at some point.

The App.tsx routes are only: `/` (Index), `/support` (Support), and `*` (NotFound). The Index page shows onboarding or the Dashboard directly — no auth gate.

## Recommended Plan

### Step 1: Confirm Quick Actions placement intent

Clarify whether the user wants QuickActions above the TopNav header, or if the current position (top of content, below nav) is acceptable.  
  
"Move the Quick Actions toolbar directly above the Cycle Phase Timeline."

### Step 2: Rebuild authentication system

Since auth is completely missing, we need to recreate:

1. **Install `@lovable.dev/cloud-auth-js**` and use the Configure Social Login tool to scaffold the lovable auth module
2. **Create `src/hooks/useAuth.tsx**` — AuthProvider context wrapping Supabase `onAuthStateChange` + `getSession`
3. **Create `src/pages/Auth.tsx**` — Login/signup page with email+password forms and Google/Apple OAuth buttons using `lovable.auth.signInWithOAuth()`
4. **Create `src/components/ProtectedRoute.tsx**` and `src/components/PublicRoute.tsx`** — route guards
5. **Create `src/pages/Profile.tsx**` and `src/pages/ResetPassword.tsx`** — account management
6. **Update `src/App.tsx**` — wrap with AuthProvider, add `/auth`, `/profile`, `/reset-password` routes with appropriate guards
7. **Verify profiles table exists** in the database (check schema)

### Files to create

- `src/hooks/useAuth.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Profile.tsx`
- `src/pages/ResetPassword.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/components/PublicRoute.tsx`

### Files to modify

- `src/App.tsx` — add AuthProvider, new routes
- `src/components/Dashboard.tsx` — optionally move QuickActions placement
- `src/components/dashboard/TopNav.tsx` — wire Sign Out to real `signOut()`