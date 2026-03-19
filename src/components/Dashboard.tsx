import { useState } from 'react';
import { useCycleData } from '@/hooks/useCycleData';
import { CycleEntry } from '@/types/cycle';
import { CycleStatus } from './dashboard/CycleStatus';
import { PredictionCard } from './dashboard/PredictionCard';
import { QuickActions } from './dashboard/QuickActions';
import { LogCycleDialog } from './LogCycleDialog';
import { HistoryView } from './history/HistoryView';
import { InsightsView } from './insights/InsightsView';
import { SettingsView } from './settings/SettingsView';
import { Flower2 } from 'lucide-react';

type View = 'home' | 'history' | 'insights' | 'settings';

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

  const [view, setView] = useState<View>('home');
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CycleEntry | undefined>();

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
    setView('home');
  };

  if (view === 'history') {
    return (
      <HistoryView
        entries={entries}
        onEdit={handleEditFromHistory}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'insights') {
    return (
      <InsightsView
        stats={stats}
        entries={entries}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'settings') {
    return (
      <SettingsView
        settings={settings}
        onUpdateSettings={updateSettings}
        onExport={getExportData}
        onDeleteAll={clearAllData}
        onBack={() => setView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen gradient-calm">
      <div className="max-w-lg mx-auto p-4 pb-8">
        {/* Header */}
        <header className="flex items-center justify-center gap-2 py-6">
          <Flower2 className="w-7 h-7 text-primary" />
          <h1 className="font-serif text-2xl font-semibold">Bloom</h1>
        </header>

        <div className="space-y-4 animate-fade-in">
          <CycleStatus
            currentDay={currentCycleDay}
            prediction={prediction}
            inPeriod={inPeriod}
          />

          <PredictionCard prediction={prediction} />

          <QuickActions
            onLogCycle={() => {
              setEditingEntry(undefined);
              setLogDialogOpen(true);
            }}
            onViewHistory={() => setView('history')}
            onViewInsights={() => setView('insights')}
            onOpenSettings={() => setView('settings')}
          />
        </div>

        <LogCycleDialog
          open={logDialogOpen}
          onOpenChange={setLogDialogOpen}
          onSave={handleSaveEntry}
          onDelete={editingEntry ? handleDeleteEntry : undefined}
          editEntry={editingEntry}
        />
      </div>
    </div>
  );
}
