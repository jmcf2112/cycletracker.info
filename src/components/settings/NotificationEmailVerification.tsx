import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle2, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationEmailState {
  email: string | null;
  emailVerified: boolean;
  loading: boolean;
}

export function NotificationEmailVerification() {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationEmailState>({
    email: null,
    emailVerified: false,
    loading: true,
  });
  const [inputEmail, setInputEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    const { data, error } = await supabase
      .from('email_notification_preferences')
      .select('email, email_verified')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setState({
        email: data.email,
        emailVerified: data.email_verified,
        loading: false,
      });
      setInputEmail(data.email || '');
    } else {
      setState({ email: null, emailVerified: false, loading: false });
    }
  };

  const handleSendCode = async () => {
    if (!inputEmail || !inputEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-notification-email', {
        body: { action: 'send', email: inputEmail },
      });

      if (error) {
        toast.error(error.message || 'Failed to send verification code');
      } else {
        toast.success('Verification code sent! Check your inbox.');
        setCodeSent(true);
        setState((prev) => ({ ...prev, email: inputEmail, emailVerified: false }));
      }
    } catch {
      toast.error('Failed to send verification code');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-notification-email', {
        body: { action: 'verify', code: verificationCode },
      });

      if (error) {
        toast.error(error.message || 'Verification failed');
      } else if (data?.verified) {
        toast.success('Email verified successfully!');
        setState((prev) => ({ ...prev, emailVerified: true }));
        setCodeSent(false);
        setVerificationCode('');
      } else {
        toast.error('Verification failed');
      }
    } catch {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (state.loading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          Notification Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Verify an email address to receive health notifications. No health data will be sent to unverified addresses.
        </p>

        {state.emailVerified && state.email ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">{state.email}</span>
            <Badge variant="outline" className="ml-auto border-emerald-500/30 text-emerald-400 text-xs">
              Verified
            </Badge>
          </div>
        ) : null}

        {/* Email input + send code */}
        {!state.emailVerified && !codeSent && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="notif-email">Email address</Label>
              <Input
                id="notif-email"
                type="email"
                placeholder="you@example.com"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleSendCode} disabled={sending} className="w-full">
              {sending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Send Verification Code</>
              )}
            </Button>
          </div>
        )}

        {/* Verification code input */}
        {!state.emailVerified && codeSent && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <strong className="text-foreground">{inputEmail}</strong>
            </p>
            <div className="space-y-2">
              <Label htmlFor="verify-code">Verification Code</Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleVerify} disabled={verifying || verificationCode.length !== 6} className="flex-1">
                {verifying ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</>
                ) : (
                  'Verify'
                )}
              </Button>
              <Button variant="ghost" onClick={() => { setCodeSent(false); setVerificationCode(''); }}>
                Back
              </Button>
            </div>
            <button
              onClick={handleSendCode}
              disabled={sending}
              className="text-xs text-primary hover:underline"
            >
              Resend code
            </button>
          </div>
        )}

        {/* Change email if verified */}
        {state.emailVerified && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setState((prev) => ({ ...prev, emailVerified: false }));
              setCodeSent(false);
              setVerificationCode('');
            }}
          >
            Change email
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
