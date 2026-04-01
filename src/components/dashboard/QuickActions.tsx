import { Button } from '@/components/ui/button';
import { Plus, History, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { sendNotificationEmail } from '@/lib/notifications';
import { toast } from 'sonner';

interface QuickActionsProps {
  onLogCycle: () => void;
  onViewHistory: () => void;
  onViewInsights: () => void;
  onOpenSettings: () => void;
}

export function QuickActions({ onLogCycle, onViewHistory, onViewInsights, onOpenSettings }: QuickActionsProps) {
  const { user } = useAuth();

  const notify = async (action: string) => {
    if (!user?.email) return;
    await sendNotificationEmail(
      user.email,
      `Cycle Tracker: ${action}`,
      `<p>You used the <strong>${action}</strong> feature in Cycle Tracker.</p>`,
    );
  };

  return (
    <div className="flex items-stretch gap-2 w-full">
      <Button size="lg" onClick={() => { onLogCycle(); notify('Log Cycle'); }} className="h-auto py-3 flex-col gap-1.5 flex-1">
        <Plus className="w-5 h-5" /><span className="text-xs">Log Cycle</span>
      </Button>
      <Button variant="outline" size="lg" onClick={() => { onViewHistory(); notify('View History'); }} className="h-auto py-3 flex-col gap-1.5 flex-1">
        <History className="w-5 h-5" /><span className="text-xs">History</span>
      </Button>
      <Button variant="outline" size="lg" onClick={() => { onViewInsights(); notify('View Insights'); }} className="h-auto py-3 flex-col gap-1.5 flex-1">
        <BarChart3 className="w-5 h-5" /><span className="text-xs">Insights</span>
      </Button>
      <Button variant="ghost" size="lg" onClick={() => { onOpenSettings(); notify('Settings'); }} className="h-auto py-3 flex-col gap-1.5 flex-1">
        <Settings className="w-5 h-5" /><span className="text-xs">Settings</span>
      </Button>
    </div>
  );
}
