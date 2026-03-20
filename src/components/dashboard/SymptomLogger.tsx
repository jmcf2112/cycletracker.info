import { Button } from '@/components/ui/button';

export function SymptomLogger({ onLog }: { onLog: (symptoms: string) => void }) {
  const symptoms = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😤', label: 'Irritable' },
    { emoji: '🤕', label: 'Cramps' },
    { emoji: '😴', label: 'Fatigue' },
    { emoji: '🤢', label: 'Nausea' },
    { emoji: '🤒', label: 'Headache' },
    { emoji: '🍫', label: 'Cravings' },
  ];

  return (
    <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl font-semibold">Today's Log</h3>
      </div>
      
      <Button 
        size="lg"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-2xl mb-6 py-6" 
        onClick={() => onLog("General Log")}
      >
        Log Today's Symptoms
      </Button>

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {symptoms.map(s => (
          <button 
            key={s.label} 
            onClick={() => onLog(`${s.emoji} - ${s.label}`)} 
            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-muted/60 hover:bg-primary-soft hover:text-primary transition-all duration-300 group border border-transparent hover:border-primary/20"
          >
            <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">{s.emoji}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-primary font-medium">{s.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={() => onLog("More Info")}>
          View all symptoms
        </Button>
      </div>
    </div>
  );
}
