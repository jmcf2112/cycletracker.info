-- Lock down SECURITY DEFINER functions that should not be callable by anon/authenticated clients.
-- These are server-side queue/maintenance helpers invoked only by service_role edge functions.
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_invitation_attempts() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- Ensure service_role retains access
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_invitation_attempts() TO service_role;

-- Hide intended_email_hash from partner SELECT visibility on partner_links.
-- Replace the partner SELECT policy with one that nulls out the hash via a view-friendly approach.
-- Since RLS can't restrict columns, we revoke direct column access for the partner side.
REVOKE SELECT (intended_email_hash) ON public.partner_links FROM authenticated, anon, public;
-- Owners still need to see/update it; grant column access back to owners via separate grant
GRANT SELECT (intended_email_hash) ON public.partner_links TO postgres, service_role;
