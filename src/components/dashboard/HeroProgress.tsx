import { Card, CardContent } from '@/components/ui/card';
import { Prediction } from '@/types/cycle';
import { Moon, Flower2, Star, Sun } from 'lucide-react';

interface HeroProgressProps {
  currentDay: number | null;
  prediction: Prediction | null;
  inPeriod: boolean;
}

export function HeroProgress({ currentDay, prediction, inPeriod }: HeroProgressProps) {
  const isMenstrual = inPeriod;
  const isFollicular = !inPeriod && currentDay && currentDay <= 13;
  const isOvulatory = currentDay && currentDay > 13 && currentDay <= 16;
  const isLuteal = currentDay && currentDay > 16;

  let phaseName = 'No Data';
  if (currentDay) {
    if (isMenstrual) phaseName = 'Menstrual Phase';
    else if (isFollicular) phaseName = 'Follicular Phase';
    else if (isOvulatory) phaseName = 'Ovulatory Phase';
    else if (isLuteal) phaseName = 'Luteal Phase';
  }

  const daysLeft = currentDay ? Math.max(0, 28 - currentDay) : 0;
  const progressPercent = currentDay ? Math.min((currentDay / 28) * 100, 100) : 0;
  
  const radius = 130;
  const strokeWidth = 36;
  const center = 160;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke dasharrays for segments (based on standard 28-day cycle proportions)
  const pMenstrual = (5 / 28) * circumference; 
  const pFollicular = (8 / 28) * circumference; 
  const pOvulatory = (3 / 28) * circumference; 
  const pLuteal = (12 / 28) * circumference; 

  // The glowing dot's coordinates
  const angle = (progressPercent / 100) * 360;
  const radian = (angle - 90) * (Math.PI / 180);
  const dotX = center + radius * Math.cos(radian);
  const dotY = center + radius * Math.sin(radian);

  return (
    <Card className="bg-[#1a1718] border-none shadow-xl rounded-3xl overflow-hidden mt-6">
      <CardContent className="flex flex-col items-center justify-center p-12">
        <div className="relative w-[320px] h-[320px] flex items-center justify-center">
          
          {/* Background Segmented Track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            {/* Luteal Segment (purple, covers 100% of the circle, placed at back) */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#C4B5FD" strokeWidth={strokeWidth} strokeLinecap="round" />
            
            {/* Ovulatory Segment (Yellow) */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#FDE047" strokeWidth={strokeWidth} 
              strokeDasharray={`${pOvulatory + pFollicular + pMenstrual} ${circumference}`} strokeLinecap="round" />
            
            {/* Follicular Segment (Mint/Teal) */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#99F6E4" strokeWidth={strokeWidth} 
              strokeDasharray={`${pFollicular + pMenstrual} ${circumference}`} strokeLinecap="round" />
            
            {/* Menstrual Segment (Pink) */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#FB7185" strokeWidth={strokeWidth} 
              strokeDasharray={`${pMenstrual} ${circumference}`} strokeLinecap="round" />
          </svg>

          {/* Current Progress Dot */}
          {currentDay && (
            <div className="absolute w-[24px] h-[24px] rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] border-[6px] border-primary z-20 transition-all duration-1000"
                 style={{ left: `${dotX - 12}px`, top: `${dotY - 12}px` }} />
          )}

          {/* Floating Icons */}
          <Moon className="absolute text-primary w-4 h-4" style={{ top: '10px', right: '40px' }} />
          <Flower2 className="absolute text-[#99F6E4] w-4 h-4" style={{ bottom: '40px', right: '20px' }} />
          <Star className="absolute text-[#FDE047] w-4 h-4" style={{ bottom: '0px', left: '160px' }} />
          <Sun className="absolute text-[#C4B5FD] w-5 h-5" style={{ top: '120px', left: '5px' }} />

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h2 className="text-5xl font-sans font-bold text-white mb-1 shadow-sm">Day {currentDay || '—'}</h2>
            <p className="text-base text-zinc-300 mb-1">{phaseName}</p>
            {currentDay && (
              <p className="text-sm font-medium text-zinc-400">{daysLeft} days left</p>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-14 flex-wrap justify-center">
          <LegendItem color="bg-[#FB7185]" label="Menstrual" />
          <LegendItem color="bg-[#99F6E4]" label="Follicular" />
          <LegendItem color="bg-[#FDE047]" label="Ovulatory" />
          <LegendItem color="bg-[#C4B5FD]" label="Luteal" />
        </div>
      </CardContent>
    </Card>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-xs text-zinc-400 font-medium">{label}</span>
    </div>
  );
}
