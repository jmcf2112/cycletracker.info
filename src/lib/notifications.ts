import { supabase } from '@/integrations/supabase/client';

export async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string,
  action?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'action-notification',
        recipientEmail: to,
        idempotencyKey: `action-${action || 'unknown'}-${Date.now()}`,
        templateData: { action: action || subject },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    console.error('sendNotificationEmail failed:', e);
    return { success: false, error: e.message };
  }
}
