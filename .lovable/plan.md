
Goal: fix the Support page so the custom amount input shows placeholder "1" in the live preview instead of the stale "10".

What I found
- In the current source, `src/pages/Support.tsx` already has:
  - `label: 'Support Development'`
  - `placeholder="1"`
- There are no remaining `placeholder="10"` matches in `src`.
- The `/support` route points directly to `src/pages/Support.tsx`, so the source is correct.
- The likely issue is stale built output in `public/assets/Support-CSikK-Om.js` / preview caching, not the React source itself.

Implementation plan
1. Re-apply the placeholder update in `src/pages/Support.tsx` and verify the exact JSX block for the custom amount input.
2. Refresh the generated preview/build output so the `/support` page stops serving the stale asset that still shows `10`.
3. Verify the support route is rendering the updated bundle and that both edits are visible:
   - “Support Development”
   - custom amount placeholder `1`
4. If the stale asset persists, trace whether the preview is loading an older chunk or cached deployment artifact and force regeneration of the support chunk.
5. Do a quick end-to-end visual check on `/support` in the preview after regeneration.

Technical details
- Source of truth: `src/pages/Support.tsx`
- Route mapping confirmed in `src/App.tsx`
- Suspected stale compiled asset: `public/assets/Support-CSikK-Om.js`

Expected outcome
- The Support page input placeholder displays `1`
- The first tip tier reads `Support Development`
- The preview matches the current source code

<lov-actions>
<lov-suggestion message="Test the support page end-to-end in the preview and confirm the placeholder now shows 1 and the Support Development label appears correctly.">Verify that it works</lov-suggestion>
<lov-suggestion message="Force-refresh the support page build output and clear any stale preview asset so the updated placeholder and label render correctly.">Refresh the preview build</lov-suggestion>
<lov-suggestion message="Add stronger validation and inline error messaging to the custom tip amount input for values outside $1 to $500.">Improve tip validation</lov-suggestion>
</lov-actions>
