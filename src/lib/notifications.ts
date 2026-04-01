import { supabase } from '@/integrations/supabase/client';

export async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: { to, subject, html },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    console.error('sendNotificationEmail failed:', e);
    return { success: false, error: e.message };
  }
}
