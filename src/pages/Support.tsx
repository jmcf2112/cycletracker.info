import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Heart, Coffee, ArrowLeft, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TIERS = [
  {
    id: 'small',
    icon: Coffee,
    label: 'Buy a Coffee',
    amount: '$3',
    description: 'A small gesture that keeps the lights on.',
  },
  {
    id: 'medium',
    icon: Heart,
    label: 'Show Some Love',
    amount: '$5',
    description: 'Help keep the app free for everyone.',
  },
];

export default function Support() {
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const [loading, setLoading] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const confettiRan = useRef(false);

  // Confetti on success
  useEffect(() => {
    if (!isSuccess || confettiRan.current) return;
    confettiRan.current = true;
    // simple CSS confetti via toast
    toast.success('Thank you for your generous donation! 🎉');
  }, [isSuccess]);

  const handleTip = async (tier: string) => {
    setLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { tier },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  const handleCustom = async () => {
    const val = parseFloat(customAmount);
    if (!val || val < 1 || val > 500) {
      toast.error('Please enter an amount between $1 and $500');
      return;
    }
    setLoading('custom');
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { customAmount: val },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center animate-fade-in">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription className="text-base">
              Your donation means the world. You're helping keep Cycle Tracker free and accessible for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full" aria-label="Return to the app">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to App
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
          aria-label="Go back to the main app"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Donate to Cycle Tracker</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Cycle Tracker is a free public-good project. Tips help cover hosting, development and keep the service running.
          </p>
        </div>

        {/* Preset tiers */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {TIERS.map((t) => (
            <Card
              key={t.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => !loading && handleTip(t.id)}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                  <t.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{t.label}</p>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                </div>
                <span className="text-lg font-bold text-foreground shrink-0">
                  {loading === t.id ? '...' : t.amount}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom amount */}
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold text-foreground mb-3">Custom Amount</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  placeholder="10"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pl-7"
                  aria-label="Enter a custom tip amount in dollars"
                />
              </div>
              <Button onClick={handleCustom} disabled={!!loading} aria-label="Send custom tip">
                {loading === 'custom' ? '...' : 'Tip'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Payments are securely processed via Stripe. No account required.
        </p>
      </div>
    </div>
  );
}
