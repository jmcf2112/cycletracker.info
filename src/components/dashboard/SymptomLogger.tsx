import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function SymptomLogger({ onLog }: { onLog: (symptoms: string) => void }) {
  const symptoms = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😤', label: 'Irritable' },
    { emoji: '🤕', label: 'Cramps' },
    { emoji: '🤯', label: 'Headache' },
    { emoji: '😴', label: 'Fatigue' },
    { emoji: '💨', label: 'Bloating' },
    { emoji: '💧', label: 'Light' },
    { emoji: '🩸', label: 'Heavy' },
  ];

  return (
    <div className="bg-[#1a1718] rounded-[32px] p-6 md:p-8 shadow-xl border-none mt-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-serif text-[22px] font-bold tracking-tight text-white mb-0">Today's Log</h3>
        <Button 
          className="bg-[#FB7185] hover:bg-[#FB7185]/90 text-white font-medium rounded-xl h-11 px-6 shadow-md transition-transform active:scale-95" 
          onClick={() => onLog("General Log")}
        >
          <Calendar className="w-4 h-4 mr-2" /> Log Today's Symptoms
        </Button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        {symptoms.map(s => (
          <button 
            key={s.label}
            aria-label={`Log ${s.label} symptom`}
            onClick={() => onLog(`${s.emoji} - ${s.label}`)} 
            className="flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#262425] hover:bg-[#333132] transition-colors border border-transparent hover:border-white/5 min-h-[48px]"
          >
            <span className="text-lg lg:text-xl leading-none drop-shadow-sm" aria-hidden="true">{s.emoji}</span>
            <span className="text-sm text-zinc-300 font-medium tracking-wide leading-none">{s.label}</span>
          </button>
        ))}
      </div>
      
      <p className="mt-2 text-[13.5px] text-zinc-400 font-medium tracking-wide">
        Track your symptoms, mood, and flow to get personalized insights.
      </p>
    </div>
  );
}
