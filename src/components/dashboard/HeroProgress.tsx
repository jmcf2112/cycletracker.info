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
  let ringColor = 'border-primary';
  
  if (!currentDay) {
    phaseName = 'No Data';
    ringColor = 'border-muted';
  } else if (isMenstrual) {
    phaseName = 'Menstrual Phase';
    ringColor = 'border-primary';
  } else if (isFollicular) {
    phaseName = 'Follicular Phase';
    ringColor = 'border-teal-400';
  } else if (isOvulatory) {
    phaseName = 'Ovulatory Phase';
    ringColor = 'border-amber-400';
  } else if (isLuteal) {
    phaseName = 'Luteal Phase';
    ringColor = 'border-purple-400';
  }

  const progressPercent = currentDay ? Math.min((currentDay / 28) * 100, 100) : 0;
  
  // Create the conic gradient manually via style
  // We use standard tailwind colors for the track, but need a custom conic for the progress
  const conicStyle = currentDay ? {
    background: `conic-gradient(currentColor ${progressPercent}%, transparent 0%)`
  } : { background: 'transparent' };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex items-center justify-center">
          
          {/* Background Track */}
          <div className="absolute inset-0 rounded-full border-[10px] md:border-[16px] border-muted/50" />
          
          {/* Foreground Progress */}
          <div 
            className={`absolute inset-0 rounded-full border-[10px] md:border-[16px] ${ringColor} transition-all duration-1000 ease-out z-10`}
            style={{ 
              clipPath: `polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%)`,
              transform: `rotate(${progressPercent * 3.6}deg)`
            }} 
          />

          <div
             className={`absolute inset-0 rounded-full border-[10px] md:border-[16px] border-transparent transition-all z-20`}
             style={{
               borderTopColor: 'currentColor',
               borderRightColor: progressPercent > 25 ? 'currentColor' : 'transparent',
               borderBottomColor: progressPercent > 50 ? 'currentColor' : 'transparent',
               borderLeftColor: progressPercent > 75 ? 'currentColor' : 'transparent',
               color: ringColor.includes('primary') ? 'hsl(var(--primary))' : 
                      ringColor.includes('teal') ? '#2dd4bf' :
                      ringColor.includes('amber') ? '#fbbf24' : '#c084fc',
               clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
             }}
          />
          
          <div className="absolute inset-0 block rounded-full" style={conicStyle} />

          {/* Center Element */}
          <div className="absolute inset-[15px] md:inset-[20px] rounded-full bg-card shadow-elevated flex flex-col items-center justify-center z-30">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Cycle Day</p>
            <h2 className="text-7xl font-serif font-medium text-foreground mb-1">{currentDay || '—'}</h2>
            <p className="text-sm font-medium text-primary">{phaseName}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-8 flex-wrap justify-center bg-card shadow-sm px-6 py-3 rounded-full border border-border">
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
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-full ${color} shadow-sm`} />
      <span className="text-xs text-foreground font-medium">{label}</span>
    </div>
  );
}
