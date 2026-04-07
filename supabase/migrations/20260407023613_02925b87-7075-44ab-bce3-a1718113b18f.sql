
-- Restrict SELECT on email_notification_preferences to authenticated users only
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.email_notification_preferences;

CREATE POLICY "Users can view their own preferences"
ON public.email_notification_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
