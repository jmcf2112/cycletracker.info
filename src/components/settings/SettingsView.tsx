import { useState } from 'react';
import { UserSettings } from '@/types/cycle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Settings, Download, Trash2, Bell, Sliders, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onExport: () => string;
  onDeleteAll: () => void;
  onBack: () => void;
}

export function SettingsView({ settings, onUpdateSettings, onExport, onDeleteAll, onBack }: SettingsViewProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCycleOverride, setShowCycleOverride] = useState(!!settings.averageCycleOverride);

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cycle-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleDelete = () => {
    onDeleteAll();
    setShowDeleteDialog(false);
    toast.success('All data deleted');
    onBack();
  };

  return (
    <div className="min-h-screen gradient-calm p-4">
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="space-y-4">
          <Card variant="elevated">
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" />Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div><Label htmlFor="notifications" className="font-medium">Notifications</Label><p className="text-xs text-muted-foreground mt-0.5">Get reminders before your predicted period</p></div>
                </div>
                <Switch id="notifications" checked={settings.notificationsEnabled} onCheckedChange={(checked) => onUpdateSettings({ notificationsEnabled: checked })} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Sliders className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div><Label htmlFor="override" className="font-medium">Custom cycle length</Label><p className="text-xs text-muted-foreground mt-0.5">Override the calculated average</p></div>
                  </div>
                  <Switch id="override" checked={showCycleOverride} onCheckedChange={(checked) => { setShowCycleOverride(checked); if (!checked) onUpdateSettings({ averageCycleOverride: undefined }); }} />
                </div>
                {showCycleOverride && (
                  <div className="ml-8 p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-between mb-4"><span className="text-2xl font-serif font-semibold">{settings.averageCycleOverride || 28}</span><span className="text-muted-foreground">days</span></div>
                    <Slider value={[settings.averageCycleOverride || 28]} onValueChange={([v]) => onUpdateSettings({ averageCycleOverride: v })} min={21} max={40} step={1} />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground"><span>21</span><span>40</span></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Data Management</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export my data</Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => setShowDeleteDialog(true)}><Trash2 className="w-4 h-4 mr-2" />Delete all data</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" />Privacy</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground leading-relaxed">All your data is stored locally on this device. Nothing is sent to any server. You can export or delete your data at any time.</p></CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground py-4">Bloom v2.0 • Made with care</p>
        </div>
      </div>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete all data?</AlertDialogTitle><AlertDialogDescription>This will permanently delete all your cycle entries and settings. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Everything</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}