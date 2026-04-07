
-- 1. Fix email column: prevent direct UPDATE of email via RLS
-- Drop existing restricted UPDATE policy and recreate with email locked
DROP POLICY IF EXISTS "Users can update their own non-sensitive preferences" ON public.email_notification_preferences;

CREATE POLICY "Users can update their own non-sensitive preferences"
ON public.email_notification_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND email_verified = (SELECT email_verified FROM public.email_notification_preferences WHERE user_id = auth.uid())
  AND verification_code IS NOT DISTINCT FROM (SELECT verification_code FROM public.email_notification_preferences WHERE user_id = auth.uid())
  AND verification_expires_at IS NOT DISTINCT FROM (SELECT verification_expires_at FROM public.email_notification_preferences WHERE user_id = auth.uid())
  AND email IS NOT DISTINCT FROM (SELECT email FROM public.email_notification_preferences WHERE user_id = auth.uid())
);

-- 2. Ensure partner_links_partner_view has security_invoker=true
ALTER VIEW public.partner_links_partner_view SET (security_invoker = true);

-- 3. Tighten partner_links INSERT/DELETE policies from public to authenticated
DROP POLICY IF EXISTS "Owners can insert their own partner links" ON public.partner_links;
CREATE POLICY "Owners can insert their own partner links"
ON public.partner_links
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their own partner links" ON public.partner_links;
CREATE POLICY "Owners can delete their own partner links"
ON public.partner_links
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Partners can delete their own connection" ON public.partner_links;
CREATE POLICY "Partners can delete their own connection"
ON public.partner_links
FOR DELETE
TO authenticated
USING (auth.uid() = partner_id AND status = 'active');

-- Also tighten the owner SELECT policy to authenticated
DROP POLICY IF EXISTS "Owners can view their own partner links" ON public.partner_links;
CREATE POLICY "Owners can view their own partner links"
ON public.partner_links
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);
