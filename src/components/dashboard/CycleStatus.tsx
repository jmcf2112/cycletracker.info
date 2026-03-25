import { Card, CardContent } from '@/components/ui/card';
import { Prediction } from '@/types/cycle';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Circle, TrendingUp, Calendar } from 'lucide-react';

interface CycleStatusProps {
  currentDay: number | null;
  prediction: Prediction | null;
  inPeriod: boolean;
}

export function CycleStatus({ currentDay, prediction, inPeriod }: CycleStatusProps) {
  const today = new Date();
  
  const getPredictionText = () => {
    if (!prediction) return null;
    const predictedDate = parseISO(prediction.predictedStartDate);
    const daysUntil = differenceInDays(predictedDate, today);
    if (daysUntil < 0) return { label: 'Expected', value: `${Math.abs(daysUntil)} days ago`, sublabel: 'Period may be late' };
    if (daysUntil === 0) return { label: 'Expected', value: 'Today', sublabel: 'Period may start today' };
    if (daysUntil <= 3) return { label: 'Expected in', value: `${daysUntil} day${daysUntil > 1 ? 's' : ''}`, sublabel: 'Period coming soon' };
    return { label: 'Expected in', value: `${daysUntil} days`, sublabel: format(predictedDate, 'MMMM d') };
  };

  const predictionInfo = getPredictionText();

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="h-1.5 gradient-primary" />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Cycle</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-serif font-semibold">Day {currentDay || '—'}</span>
              {inPeriod && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-soft text-primary">
                  <Circle className="w-2 h-2 fill-current" />Period
                </span>
              )}
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary flex items-center justify-center"
              style={{ background: currentDay ? `conic-gradient(hsl(var(--primary)) ${(currentDay / 28) * 100}%, transparent 0%)` : 'transparent' }}>
              <div className="w-8 h-8 rounded-full bg-card" />
            </div>
          </div>
        </div>
        {predictionInfo && (
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{predictionInfo.label}</p>
                <p className="text-lg font-semibold">{predictionInfo.value}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{predictionInfo.sublabel}</p>
                {prediction && <ConfidenceBadge level={prediction.confidenceLevel} />}
              </div>
            </div>
          </div>
        )}
        {!currentDay && !prediction && (
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-muted-foreground">Log your first cycle to see predictions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConfidenceBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const config = {
    low: { label: 'Low confidence', className: 'bg-warning-soft text-warning-foreground' },
    medium: { label: 'Medium confidence', className: 'bg-accent-soft text-accent-foreground' },
    high: { label: 'High confidence', className: 'bg-success-soft text-success-foreground' },
  };
  const { label, className } = config[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${className}`}>
      <TrendingUp className="w-3 h-3" />{label}
    </span>
  );
}