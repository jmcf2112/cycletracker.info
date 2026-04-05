import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the user has a verified notification email before sending.
 * Returns the verified email, or null if unverified/missing.
 */
async function getVerifiedNotificationEmail(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('email_notification_preferences')
    .select('email, email_verified')
    .eq('user_id', userId)
    .maybeSingle();

  if (data?.email && data?.email_verified) {
    return data.email;
  }
  return null;
}

export async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user to check verification status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const verifiedEmail = await getVerifiedNotificationEmail(user.id);
    if (!verifiedEmail) {
      console.warn('Notification email not verified — skipping send');
      return { success: false, error: 'Notification email not verified' };
    }

    // Always send to the verified notification email
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: { to: verifiedEmail, subject, html },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    console.error('sendNotificationEmail failed:', e);
    return { success: false, error: e.message };
  }
}
