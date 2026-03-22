
-- Drop the existing owner UPDATE policy and recreate with WITH CHECK
DROP POLICY IF EXISTS "Owners can update their own partner links" ON public.partner_links;

CREATE POLICY "Owners can update their own partner links"
ON public.partner_links
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);
