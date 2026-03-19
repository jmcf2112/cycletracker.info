import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CycleEntry } from '@/types/cycle';
import { format, parseISO, startOfToday, subMonths } from 'date-fns';
import { CalendarDays, AlertCircle, Save, Trash2 } from 'lucide-react';

interface LogCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
  editEntry?: CycleEntry;
}

export function LogCycleDialog({ open, onOpenChange, onSave, onDelete, editEntry }: LogCycleDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    editEntry ? parseISO(editEntry.cycleStartDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    editEntry?.cycleEndDate ? parseISO(editEntry.cycleEndDate) : undefined
  );
  const [notes, setNotes] = useState(editEntry?.notes || '');
  const [isAtypical, setIsAtypical] = useState(editEntry?.isAtypical || false);
  const [step, setStep] = useState<'start' | 'end' | 'details'>('start');

  const today = startOfToday();

  const handleSave = () => {
    if (!startDate) return;

    onSave({
      cycleStartDate: format(startDate, 'yyyy-MM-dd'),
      cycleEndDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      notes: notes.trim() || undefined,
      isAtypical,
    });

    // Reset form
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes('');
    setIsAtypical(false);
    setStep('start');
    onOpenChange(false);
  };

  const handleClose = () => {
    setStep('start');
    if (!editEntry) {
      setStartDate(undefined);
      setEndDate(undefined);
      setNotes('');
      setIsAtypical(false);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {editEntry ? 'Edit Cycle' : 'Log New Cycle'}
          </DialogTitle>
          <DialogDescription>
            {step === 'start' && 'When did your period start?'}
            {step === 'end' && 'When did it end? (Optional)'}
            {step === 'details' && 'Any additional details?'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'start' && (
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date > today || date < subMonths(today, 6)}
                className="rounded-xl border"
              />
            </div>
          )}

          {step === 'end' && (
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => 
                  date > today || 
                  (startDate ? date < startDate : false) ||
                  date < subMonths(today, 6)
                }
                className="rounded-xl border"
              />
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any symptoms, moods, or observations..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-warning-soft">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <Label htmlFor="atypical" className="font-medium">Mark as atypical</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Excludes from prediction calculations
                    </p>
                  </div>
                </div>
                <Switch
                  id="atypical"
                  checked={isAtypical}
                  onCheckedChange={setIsAtypical}
                />
              </div>

              <div className="bg-muted rounded-xl p-4 text-sm">
                <p className="font-medium mb-2">Summary</p>
                <p className="text-muted-foreground">
                  Started: {startDate ? format(startDate, 'MMMM d, yyyy') : '—'}
                </p>
                {endDate && (
                  <p className="text-muted-foreground">
                    Ended: {format(endDate, 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {step !== 'start' && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step === 'end' ? 'start' : 'end')}
              className="flex-1"
            >
              Back
            </Button>
          )}

          {step === 'start' && (
            <Button 
              onClick={() => setStep('end')} 
              disabled={!startDate}
              className="flex-1"
            >
              Continue
            </Button>
          )}

          {step === 'end' && (
            <Button onClick={() => setStep('details')} className="flex-1">
              {endDate ? 'Continue' : 'Skip End Date'}
            </Button>
          )}

          {step === 'details' && (
            <>
              {editEntry && onDelete && (
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={handleSave} className="flex-1">
                <Save className="w-4 h-4" />
                {editEntry ? 'Save Changes' : 'Log Cycle'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
