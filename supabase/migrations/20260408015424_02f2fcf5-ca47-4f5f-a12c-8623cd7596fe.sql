
-- Drop the existing overly-permissive update policy
DROP POLICY IF EXISTS "Owners can update their own partner links" ON public.partner_links;

-- Recreate with column-level restrictions: owners cannot change partner_id, owner_id, or share_code
CREATE POLICY "Owners can update their own partner links"
ON public.partner_links
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (
  auth.uid() = owner_id
  AND owner_id IS NOT DISTINCT FROM (SELECT pl.owner_id FROM public.partner_links pl WHERE pl.id = partner_links.id)
  AND partner_id IS NOT DISTINCT FROM (SELECT pl.partner_id FROM public.partner_links pl WHERE pl.id = partner_links.id)
  AND share_code IS NOT DISTINCT FROM (SELECT pl.share_code FROM public.partner_links pl WHERE pl.id = partner_links.id)
);
