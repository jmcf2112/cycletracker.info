DROP POLICY IF EXISTS "Users can update their own non-sensitive preferences" ON public.email_notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.email_notification_preferences;

ALTER TABLE public.email_notification_preferences
  DROP COLUMN IF EXISTS verification_code,
  DROP COLUMN IF EXISTS verification_expires_at;

CREATE POLICY "Users can update their own non-sensitive preferences"
ON public.email_notification_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND email_verified = (
    SELECT p.email_verified FROM public.email_notification_preferences p WHERE p.user_id = auth.uid()
  )
  AND NOT (email IS DISTINCT FROM (
    SELECT p.email FROM public.email_notification_preferences p WHERE p.user_id = auth.uid()
  ))
);

CREATE POLICY "Users can insert their own preferences"
ON public.email_notification_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND email_verified = false);