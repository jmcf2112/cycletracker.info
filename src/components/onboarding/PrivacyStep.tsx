import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Smartphone, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

interface PrivacyStepProps { onNext: () => void; onBack: () => void; }

export function PrivacyStep({ onNext, onBack }: PrivacyStepProps) {
  const features = [
    { icon: Smartphone, title: 'Stored on your device', description: 'All data stays in your browser. Nothing is sent to external servers.' },
    { icon: Shield, title: 'You are in control', description: 'Export your data anytime, or delete everything with one tap.' },
    { icon: Trash2, title: 'No account required', description: 'No email, no sign-up. Your cycle, your business.' },
  ];

  return (
    <Card variant="elevated">
      <CardContent className="pt-8 pb-6">
        <h2 className="font-serif text-2xl font-semibold mb-2 text-center">Your Privacy Matters</h2>
        <p className="text-muted-foreground text-center mb-8">Here is how we keep your data safe</p>
        <div className="space-y-4 mb-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4 p-4 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-primary" /></div>
              <div><h3 className="font-medium mb-0.5">{title}</h3><p className="text-sm text-muted-foreground">{description}</p></div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1"><ArrowLeft className="w-4 h-4" />Back</Button>
          <Button onClick={onNext} className="flex-1">I Understand<ArrowRight className="w-4 h-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}