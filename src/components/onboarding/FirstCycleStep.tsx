import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ArrowRight, ArrowLeft, CalendarDays } from 'lucide-react';
import { format, parseISO, startOfToday, subMonths } from 'date-fns';

interface FirstCycleStepProps { onNext: () => void; onBack: () => void; value?: string; onChange: (date: string) => void; }

export function FirstCycleStep({ onNext, onBack, value, onChange }: FirstCycleStepProps) {
  const selectedDate = value ? parseISO(value) : undefined;
  const today = startOfToday();
  const handleSelect = (date: Date | undefined) => { if (date) onChange(format(date, 'yyyy-MM-dd')); };

  return (
    <Card variant="elevated">
      <CardContent className="pt-8 pb-6">
        <div className="w-14 h-14 rounded-full bg-primary-soft flex items-center justify-center mx-auto mb-4"><CalendarDays className="w-7 h-7 text-primary" /></div>
        <h2 className="font-serif text-2xl font-semibold mb-2 text-center">When did your last period start?</h2>
        <p className="text-muted-foreground text-center mb-6">This helps us calculate predictions</p>
        <div className="flex justify-center mb-6">
          <Calendar mode="single" selected={selectedDate} onSelect={handleSelect} disabled={(date) => date > today || date < subMonths(today, 3)} className="rounded-xl border bg-background p-3" />
        </div>
        {selectedDate && <p className="text-center text-sm text-muted-foreground mb-4">Selected: <span className="font-medium text-foreground">{format(selectedDate, 'MMMM d, yyyy')}</span></p>}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1"><ArrowLeft className="w-4 h-4" />Back</Button>
          <Button onClick={onNext} disabled={!value} className="flex-1">Continue<ArrowRight className="w-4 h-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}