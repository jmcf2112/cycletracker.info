

## Problem

The `index.html` file contains hardcoded references to deleted build artifacts:
- Line 31: `<script type="module" crossorigin src="/assets/index-CYenZCOw.js">`
- Line 32: `<link rel="stylesheet" crossorigin href="/assets/index-D81KfHId.css">`

These files were deleted in the previous cleanup. Vite expects `index.html` to point to the source entry point (`/src/main.tsx`), not compiled output.

## Fix

Replace lines 31-32 in `index.html` with the standard Vite source entry point:

```html
<script type="module" src="/src/main.tsx"></script>
```

Remove the CSS link entirely -- Vite handles CSS injection automatically during dev and build.

## Expected Outcome
- Build succeeds
- Preview renders the app correctly
- Support page displays with `placeholder="1"` and "Support Development" label

