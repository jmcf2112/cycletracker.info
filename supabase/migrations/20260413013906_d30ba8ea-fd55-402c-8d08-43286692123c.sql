-- Revoke SELECT on sensitive verification columns from anon and authenticated roles
-- This ensures verification codes are never returned to the client, even though RLS allows the row
REVOKE SELECT (verification_code, verification_expires_at) ON public.email_notification_preferences FROM anon, authenticated;

-- Ensure service_role retains full access (it has superuser-like privileges by default, but be explicit)
GRANT SELECT (verification_code, verification_expires_at) ON public.email_notification_preferences TO service_role;