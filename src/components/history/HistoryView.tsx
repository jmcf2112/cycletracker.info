import { useState } from 'react';
import { CycleEntry } from '@/types/cycle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Calendar, Edit2, AlertTriangle, ChevronRight, ArrowLeft } from 'lucide-react';

interface HistoryViewProps {
  entries: CycleEntry[];
  onEdit: (entry: CycleEntry) => void;
  onBack: () => void;
}

export function HistoryView({ entries, onEdit, onBack }: HistoryViewProps) {
  if (entries.length === 0) {
    return (
      <div className="min-h-screen gradient-calm p-4">
        <div className="max-w-lg mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          <Card variant="elevated" className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-serif text-xl font-semibold mb-2">No cycles logged yet</h2>
              <p className="text-muted-foreground">Your cycle history will appear here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const entriesWithLength = entries.map((entry, index) => {
    if (index === entries.length - 1) return { ...entry, cycleLength: null };
    const nextEntry = entries[index + 1];
    const cycleLength = differenceInDays(parseISO(entry.cycleStartDate), parseISO(nextEntry.cycleStartDate));
    return { ...entry, cycleLength };
  });

  return (
    <div className="min-h-screen gradient-calm p-4">
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" />Cycle History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {entriesWithLength.map((entry) => (
                <button key={entry.id} onClick={() => onEdit(entry)} aria-label={`Edit cycle starting ${format(parseISO(entry.cycleStartDate), 'MMMM d, yyyy')}`} className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors text-left min-h-[48px]">
                  <div className="w-12 h-12 rounded-xl bg-primary-soft flex flex-col items-center justify-center">
                    <span className="text-lg font-semibold text-primary">{format(parseISO(entry.cycleStartDate), 'd')}</span>
                    <span className="text-[10px] text-primary uppercase">{format(parseISO(entry.cycleStartDate), 'MMM')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{format(parseISO(entry.cycleStartDate), 'MMMM d, yyyy')}</span>
                      {entry.isAtypical && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-warning-soft text-warning-foreground">
                          <AlertTriangle className="w-3 h-3" />Atypical
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {entry.cycleEndDate && <span>{differenceInDays(parseISO(entry.cycleEndDate), parseISO(entry.cycleStartDate)) + 1} day period</span>}
                      {entry.cycleLength && (<>{entry.cycleEndDate && <span>•</span>}<span>{entry.cycleLength} day cycle</span></>)}
                    </div>
                    {entry.notes && <p className="text-xs text-muted-foreground truncate mt-1">{entry.notes}</p>}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}