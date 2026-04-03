

## Plan: Remove Google and Apple OAuth from Auth Page

### Problem
The Auth.tsx file has broken JSX — there's an orphaned `</>` closing fragment tag (line 117) and `)}` (line 118) without a matching opening fragment or conditional block. This is causing the build errors. The OAuth buttons and separator also need to be fully removed.

### Changes

**File: `src/pages/Auth.tsx`**

1. Remove the `lovable` import (line 3) and `Separator` import (line 9)
2. Remove the `handleOAuth` function (lines 55-60)
3. Remove the entire OAuth section: Google button, Apple button, separator, and the broken fragment/conditional closing tags (lines 103-118)
4. Keep only the email/password form, forgot password link, and sign-in/sign-up toggle

### Result
- Clean email-only authentication (sign in, sign up, forgot password)
- All build errors resolved
- No more references to `@lovable.dev/cloud-auth-js`

