import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Prediction } from '@/types/cycle';
import { format, parseISO } from 'date-fns';
import { Info, CalendarRange } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PredictionCardProps {
  prediction: Prediction | null;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  if (!prediction) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-primary" />Prediction Window
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Log at least 2 cycles to see predictions</p>
        </CardContent>
      </Card>
    );
  }

  const minDate = parseISO(prediction.minDate);
  const maxDate = parseISO(prediction.maxDate);
  const predictedDate = parseISO(prediction.predictedStartDate);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-primary" />Prediction Window
          <Tooltip>
            <TooltipTrigger asChild><Info className="w-4 h-4 text-muted-foreground cursor-help" aria-label="Prediction details" /></TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Based on your last {prediction.cyclesUsedCount} cycles. The window accounts for natural variation in cycle length.</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{format(minDate, 'MMM d')}</span>
              <span className="font-medium text-foreground">{format(predictedDate, 'MMM d')}</span>
              <span>{format(maxDate, 'MMM d')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-3 h-3 rounded-full bg-primary" />
            <span>Most likely around {format(predictedDate, 'MMMM d')}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Using {prediction.cyclesUsedCount} cycle{prediction.cyclesUsedCount > 1 ? 's' : ''} for this prediction
          </p>
        </div>
      </CardContent>
    </Card>
  );
}