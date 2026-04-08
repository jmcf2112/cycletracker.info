import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flower2, ArrowRight } from 'lucide-react';

interface WelcomeStepProps { onNext: () => void; }

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="h-2 gradient-primary" />
      <CardContent className="pt-10 pb-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center mx-auto mb-6">
          <Flower2 className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-semibold mb-3">Welcome to Cycle Tracker</h1>
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">A simple, private way to understand your cycle and anticipate what's ahead.</p>
        <div className="bg-accent-soft rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-muted-foreground"><strong className="text-foreground">Please note:</strong> This app provides informational tracking only. It is not intended as medical advice or for contraception purposes.</p>
        </div>
        <Button size="lg" onClick={onNext} className="w-full">Get Started<ArrowRight className="w-5 h-5" /></Button>
      </CardContent>
    </Card>
  );
}