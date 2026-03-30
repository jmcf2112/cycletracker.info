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
import { Sparkles } from 'lucide-react';
import { QuickActions } from './dashboard/QuickActions';

type View = 'calendar' | 'health' | 'insights' | 'settings';

export function Dashboard() {
  const { entries, settings, stats, prediction, currentCycleDay, inPeriod, addEntry, updateEntry, deleteEntry, updateSettings, getExportData, clearAllData } = useCycleData();

  const [view, setView] = useState<View>('calendar');
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CycleEntry | undefined>();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    // Ensure body has the solid dark background to match the exact #111 or #0a0a0a theme
    document.body.style.backgroundColor = '#201c1e'; // Muted dark background to let the cards pop
  }, []);

  const handleSaveEntry = (entry: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEntry) updateEntry(editingEntry.id, entry);
    else addEntry(entry);
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

  if (view === 'health') return <HistoryView entries={entries} onEdit={handleEditFromHistory} onBack={() => setView('calendar')} />;
  if (view === 'insights') return <InsightsView stats={stats} entries={entries} onBack={() => setView('calendar')} />;
  if (view === 'settings') return <SettingsView settings={settings} onUpdateSettings={updateSettings} onExport={getExportData} onDeleteAll={clearAllData} onBack={() => setView('calendar')} />;

  return (
    <div className="min-h-screen relative pb-28 font-sans text-foreground" style={{ backgroundColor: '#201c1e' }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 xl:px-0 pt-2 lg:pt-8">
        
        <TopNav activeTab={view} onTabSelect={(v: string) => setView(v as View)} />

        <div className="animate-fade-in mt-4 lg:mt-8 w-full">
          <HeroProgress 
            currentDay={currentCycleDay}
            prediction={prediction}
            inPeriod={inPeriod}
          />

          <SymptomLogger onLog={logSymptom} />
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
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#FB7185] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,113,133,0.4)] hover:bg-[#e11d48] hover:scale-105 transition-all duration-300 z-50"
        onClick={() => {
          setEditingEntry(undefined);
          setLogDialogOpen(true);
        }}
      >
        <Sparkles className="w-6 h-6" />
      </button>
    </div>
  );
}
