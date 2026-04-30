-- Harden chat rate limit function: enforce caller identity
CREATE OR REPLACE FUNCTION public.check_and_increment_chat_rate_limit(p_user_id uuid, p_max_requests integer DEFAULT 15, p_window_seconds integer DEFAULT 60)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_now timestamptz := now();
  v_record chat_rate_limits%ROWTYPE;
  v_allowed boolean;
  v_remaining integer;
  v_reset_in integer;
  v_caller uuid := auth.uid();
BEGIN
  -- Authentication required and caller must match supplied user_id
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_user_id IS DISTINCT FROM v_caller THEN
    RAISE EXCEPTION 'Forbidden: cannot modify another user''s rate limit';
  END IF;

  INSERT INTO chat_rate_limits (user_id, window_start, request_count)
  VALUES (p_user_id, v_now, 1)
  ON CONFLICT (user_id) DO UPDATE
  SET
    window_start = CASE
      WHEN (v_now - chat_rate_limits.window_start) > make_interval(secs => p_window_seconds)
      THEN v_now
      ELSE chat_rate_limits.window_start
    END,
    request_count = CASE
      WHEN (v_now - chat_rate_limits.window_start) > make_interval(secs => p_window_seconds)
      THEN 1
      ELSE chat_rate_limits.request_count + 1
    END
  RETURNING * INTO v_record;

  v_remaining := GREATEST(0, p_max_requests - v_record.request_count);
  v_reset_in := GREATEST(0, p_window_seconds - EXTRACT(EPOCH FROM (v_now - v_record.window_start))::integer);
  v_allowed := v_record.request_count <= p_max_requests;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'remaining', v_remaining,
    'reset_in', v_reset_in,
    'request_count', v_record.request_count
  );
END;
$function$;

-- Revoke anon execute on all user-callable SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.check_and_increment_chat_rate_limit(uuid, integer, integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.accept_partner_invitation(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_partner_cycle_data(uuid) FROM anon, public;

-- check_invitation_rate_limit is only used internally by accept_partner_invitation; revoke from all client roles
REVOKE EXECUTE ON FUNCTION public.check_invitation_rate_limit() FROM anon, authenticated, public;