
-- 1. Fix partner_links_partner_view: set security_invoker=true
ALTER VIEW public.partner_links_partner_view SET (security_invoker = true);

-- 2. Fix email verification bypass: replace broad UPDATE policy with restricted one
-- Drop the existing broad UPDATE policy
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.email_notification_preferences;

-- Create restricted UPDATE policy that prevents users from writing to sensitive columns
-- Users can only update non-sensitive fields; email_verified, verification_code, verification_expires_at
-- are managed by the edge function via service_role
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
);

-- Allow service_role to update all columns (for the edge function)
CREATE POLICY "Service role can update all preferences"
ON public.email_notification_preferences
FOR UPDATE
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- 3. Add explicit service_role policies to chat_rate_limits
CREATE POLICY "Service role can manage rate limits"
ON public.chat_rate_limits
FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- 4. Add SELECT policy for partners on partner_links
CREATE POLICY "Partners can view active links they are connected to"
ON public.partner_links
FOR SELECT
TO authenticated
USING (auth.uid() = partner_id AND status = 'active');
