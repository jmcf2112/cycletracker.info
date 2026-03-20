import { Card, CardContent } from '@/components/ui/card';
import { Prediction } from '@/types/cycle';

interface HeroProgressProps {
  currentDay: number | null;
  prediction: Prediction | null;
  inPeriod: boolean;
}

export function HeroProgress({ currentDay, prediction, inPeriod }: HeroProgressProps) {
  const isMenstrual = inPeriod;
  const isFollicular = !inPeriod && currentDay && currentDay < 14;
  const isOvulatory = currentDay && currentDay >= 14 && currentDay <= 16;
  const isLuteal = currentDay && currentDay > 16;

  let phaseName = 'Unknown Phase';
  let ringColor = 'text-primary';
  
  if (!currentDay) {
    phaseName = 'No Data';
    ringColor = 'text-muted-foreground';
  } else if (isMenstrual) {
    phaseName = 'Menstrual Phase';
    ringColor = 'text-primary';
  } else if (isFollicular) {
    phaseName = 'Follicular Phase';
    ringColor = 'text-teal-400';
  } else if (isOvulatory) {
    phaseName = 'Ovulatory Phase';
    ringColor = 'text-amber-400';
  } else if (isLuteal) {
    phaseName = 'Luteal Phase';
    ringColor = 'text-purple-400';
  }

  const progressPercent = currentDay ? Math.min((currentDay / 28) * 100, 100) : 0;
  
  // SVG Circle calculations
  const radius = 130;
  const strokeWidth = 20;
  const center = 160;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="relative w-[320px] h-[320px] flex items-center justify-center">
          
          {/* Beautiful SVG Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 filter drop-shadow-md">
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/30"
            />
            {/* Foreground Animated Progress */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${ringColor} transition-all duration-1000 ease-out`}
            />
          </svg>

          {/* Inner Glow Center Element */}
          <div className="absolute inset-0 m-auto w-[220px] h-[220px] rounded-full bg-card/80 backdrop-blur-sm shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] border border-border/50 flex flex-col items-center justify-center z-30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Cycle Day</p>
            <h2 className="text-7xl font-serif font-semibold text-foreground tracking-tighter mb-1 filter drop-shadow-sm">{currentDay || '—'}</h2>
            <p className={`text-sm font-medium ${ringColor}`}>{phaseName}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-10 flex-wrap justify-center bg-card shadow-sm px-6 py-3 rounded-full border border-border">
          <LegendItem color="bg-primary" label="Menstrual" />
          <LegendItem color="bg-teal-400" label="Follicular" />
          <LegendItem color="bg-amber-400" label="Ovulatory" />
          <LegendItem color="bg-purple-400" label="Luteal" />
        </div>
      </CardContent>
    </Card>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} shadow-sm ring-1 ring-border/50`} />
      <span className="text-xs text-foreground font-medium">{label}</span>
    </div>
  );
}
