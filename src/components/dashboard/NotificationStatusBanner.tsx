import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Mail, MailX, AlertTriangle, Loader2 } from 'lucide-react';

type Status = 'loading' | 'verified' | 'unverified' | 'none';

export function NotificationStatusBanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!user) { setStatus('none'); return; }

    supabase
      .from('email_notification_preferences')
      .select('email, email_verified')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data || !data.email) setStatus('none');
        else if (data.email_verified) setStatus('verified');
        else setStatus('unverified');
      });
  }, [user]);

  if (status === 'loading') return null;

  const config = {
    verified: {
      icon: Mail,
      text: 'Notification email verified',
      classes: 'bg-emerald-500/10 text-emerald-400',
    },
    unverified: {
      icon: AlertTriangle,
      text: 'Notification email not verified — go to Settings to verify',
      classes: 'bg-amber-500/10 text-amber-400',
    },
    none: {
      icon: MailX,
      text: 'No notification email set — add one in Settings',
      classes: 'bg-muted/30 text-muted-foreground',
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-xs font-medium ${config.classes}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.text}</span>
    </div>
  );
}
