import { useState, useEffect } from 'react';
import { useCycleData } from '@/hooks/useCycleData';
import { CycleEntry } from '@/types/cycle';
import { HeroProgress } from './dashboard/HeroProgress';
import { SymptomLogger } from './dashboard/SymptomLogger';
import { TopNav } from './dashboard/TopNav';
import { LogCycleDialog } from './LogCycleDialog';
import { HistoryView } from './history/HistoryView';
import { InsightsView } from './insights/InsightsView';
import { SettingsView } from './settings/SettingsView';
import { Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type View = 'calendar' | 'health' | 'insights' | 'settings';

export function Dashboard() {
  const {
    entries,
    settings,
    stats,
    prediction,
    currentCycleDay,
    inPeriod,
    addEntry,
    updateEntry,
    deleteEntry,
    updateSettings,
    getExportData,
    clearAllData,
  } = useCycleData();

  const [view, setView] = useState<View>('calendar');
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CycleEntry | undefined>();
  const [viewCalendarList, setViewCalendarList] = useState(false); // Toggle to show full calendar

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleSaveEntry = (entry: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEntry) {
      updateEntry(editingEntry.id, entry);
    } else {
      addEntry(entry);
    }
    setEditingEntry(undefined);
  };

  const handleDeleteEntry = () => {
    if (editingEntry) {
      deleteEntry(editingEntry.id);
      setEditingEntry(undefined);
      setLogDialogOpen(false);
    }
  };

  const handleEditFromHistory = (entry: CycleEntry) => {
    setEditingEntry(entry);
    setLogDialogOpen(true);
  };

  const logSymptom = (symptom: string) => {
    setEditingEntry(undefined);
    setLogDialogOpen(true);
  };

  if (view === 'health') {
    return <HistoryView entries={entries} onEdit={handleEditFromHistory} onBack={() => setView('calendar')} />;
  }

  if (view === 'insights') {
    return <InsightsView stats={stats} entries={entries} onBack={() => setView('calendar')} />;
  }

  if (view === 'settings') {
    return <SettingsView settings={settings} onUpdateSettings={updateSettings} onExport={getExportData} onDeleteAll={clearAllData} onBack={() => setView('calendar')} />;
  }

  return (
    <div className="min-h-screen bg-background relative pb-28 font-sans">
      <div className="max-w-lg mx-auto px-4 pt-2">
        <TopNav activeTab={view} onTabSelect={(v: string) => setView(v as View)} />

        <div className="space-y-8 animate-fade-in mt-2">
          
          <HeroProgress 
            currentDay={currentCycleDay}
            prediction={prediction}
            inPeriod={inPeriod}
          />

          <SymptomLogger onLog={logSymptom} />

          {/* Cycle Calendar Toggle Header */}
          <div className="flex items-center justify-between mt-8 mb-4">
            <h3 className="font-serif text-xl font-semibold">Cycle Calendar</h3>
            <div className="bg-muted/50 p-1 rounded-xl flex">
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${!viewCalendarList ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setViewCalendarList(false)}
              >
                Calendar
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${viewCalendarList ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setViewCalendarList(true)}
              >
                List
              </button>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col items-center justify-center text-center min-h-[200px]">
            {viewCalendarList ? (
              <div className="w-full">
                <Button variant="outline" className="w-full mb-4" onClick={() => setView('health')}>
                  View Full History
                </Button>
                {entries.length === 0 && <p className="text-muted-foreground text-sm">No cycles logged yet.</p>}
                {entries.slice(0, 3).map(entry => (
                  <div key={entry.id} className="text-left text-sm py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 px-2 rounded-md" onClick={() => handleEditFromHistory(entry)}>
                     {new Date(entry.cycleStartDate).toLocaleDateString()} {entry.cycleEndDate && ` - ${new Date(entry.cycleEndDate).toLocaleDateString()}`}
                  </div>
                ))}
              </div>
            ) : (
                <div className="w-full">
                   {/* Placeholder for the Monthly Calendar component */}
                   <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                     <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                   </div>
                   <p className="text-muted-foreground font-medium mb-4">Monthly Calendar</p>
                   <Button variant="secondary" size="sm" onClick={() => setView('health')}>View Cycle History</Button>
                </div>
            )}
          </div>
        </div>

        <LogCycleDialog
          open={logDialogOpen}
          onOpenChange={setLogDialogOpen}
          onSave={handleSaveEntry}
          onDelete={editingEntry ? handleDeleteEntry : undefined}
          editEntry={editingEntry}
        />
      </div>

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-elevated hover:bg-primary/90 transition-transform hover:scale-105 z-50 focus:outline-none focus:ring-4 focus:ring-primary/20"
        onClick={() => {
          setEditingEntry(undefined);
          setLogDialogOpen(true);
        }}
      >
        <Sparkles className="w-6 h-6 fill-current" />
      </button>
    </div>
  );
}
