import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Check, SkipForward } from 'lucide-react';

interface TypicalLengthStepProps { onNext: () => void; onBack: () => void; onSkip: () => void; value?: number; onChange: (length: number) => void; }

export function TypicalLengthStep({ onNext, onBack, onSkip, value, onChange }: TypicalLengthStepProps) {
  const displayValue = value || 28;

  return (
    <Card variant="elevated">
      <CardContent className="pt-8 pb-6">
        <h2 className="font-serif text-2xl font-semibold mb-2 text-center">Typical cycle length?</h2>
        <p className="text-muted-foreground text-center mb-8">Optional: helps improve early predictions</p>
        <div className="bg-muted/50 rounded-2xl p-6 mb-6">
          <div className="text-center mb-6"><span className="text-5xl font-serif font-semibold text-primary">{displayValue}</span><span className="text-xl text-muted-foreground ml-2">days</span></div>
          <Slider value={[displayValue]} onValueChange={([v]) => onChange(v)} min={21} max={40} step={1} className="w-full" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground"><span>21 days</span><span>40 days</span></div>
        </div>
        <p className="text-sm text-muted-foreground text-center mb-6">Most cycles are between 21-35 days. Average is 28 days.</p>
        <div className="space-y-3">
          <Button onClick={onNext} className="w-full"><Check className="w-4 h-4" />Use {displayValue} days</Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1"><ArrowLeft className="w-4 h-4" />Back</Button>
            <Button variant="ghost" onClick={onSkip} className="flex-1">Skip for now<SkipForward className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}