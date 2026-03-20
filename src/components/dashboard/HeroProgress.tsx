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
  let ringColor = 'hsl(var(--primary))'; // Default to primary pink
  let textColor = 'text-primary';
  
  if (!currentDay) {
    phaseName = 'No Data';
    ringColor = 'hsl(var(--muted))';
    textColor = 'text-muted-foreground';
  } else if (isMenstrual) {
    phaseName = 'Menstrual Phase';
    ringColor = 'hsl(var(--primary))'; // Pink
    textColor = 'text-primary';
  } else if (isFollicular) {
    phaseName = 'Follicular Phase';
    ringColor = '#2dd4bf'; // Teal
    textColor = 'text-teal-400';
  } else if (isOvulatory) {
    phaseName = 'Ovulatory Phase';
    ringColor = '#fbbf24'; // Amber
    textColor = 'text-amber-400';
  } else if (isLuteal) {
    phaseName = 'Luteal Phase';
    ringColor = '#c084fc'; // Purple
    textColor = 'text-purple-400';
  }

  const progressPercent = currentDay ? Math.min((currentDay / 28) * 100, 100) : 0;
  
  // Create a stunning, glossy conic gradient
  const conicStyle = currentDay ? {
    background: `conic-gradient(${ringColor} ${progressPercent}%, hsl(var(--muted)/0.3) 0%)`
  } : { background: 'hsl(var(--muted)/0.3)' };

  return (
    <Card className="border-none shadow-none bg-transparent pt-4">
      <CardContent className="flex flex-col items-center justify-center p-0 sm:p-4">
        
        {/* The Pretty Donut Ring */}
        <div className="relative w-[300px] h-[300px] rounded-full flex items-center justify-center shadow-[0_0_50px_-15px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-in-out" 
             style={conicStyle}>
          
          {/* Inner Hole (creates the donut) */}
          <div className="w-[260px] h-[260px] rounded-full bg-[#0a0a0a] border-[8px] border-[#0a0a0a] shadow-inner flex flex-col items-center justify-center z-10 relative overflow-hidden">
            
            {/* Soft background glow based on phase color */}
            <div className="absolute inset-0 opacity-20 blur-3xl" style={{ backgroundColor: ringColor }} />
            
            {/* Center Content */}
            <div className="relative z-20 flex flex-col items-center justify-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-2 drop-shadow-sm">Cycle Day</p>
              <h2 className="text-8xl font-serif font-semibold text-white tracking-tighter mb-2 filter drop-shadow-md">{currentDay || '—'}</h2>
              <p className={`text-base font-semibold ${textColor} tracking-wide`}>{phaseName}</p>
            </div>
          </div>
          
          {/* Subtle outer glass ring */}
          <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />
        </div>

        {/* Legend */}
        <div className="flex gap-5 mt-12 flex-wrap justify-center bg-[#111] shadow-xl px-8 py-4 rounded-full border border-white/5">
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
      <div className={`w-3.5 h-3.5 rounded-full ${color} shadow-sm ring-2 ring-white/10`} />
      <span className="text-xs text-zinc-300 font-medium tracking-wide">{label}</span>
    </div>
  );
}
