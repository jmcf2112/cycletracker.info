
-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.email_notification_preferences;

-- Recreate with restrictions: sensitive fields must be default/safe values on insert
CREATE POLICY "Users can insert their own preferences"
ON public.email_notification_preferences
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND email_verified = false
  AND verification_code IS NULL
  AND verification_expires_at IS NULL
);
