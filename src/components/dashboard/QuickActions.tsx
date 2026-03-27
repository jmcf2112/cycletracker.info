import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, History, BarChart3, Settings } from 'lucide-react';

interface QuickActionsProps {
  onLogCycle: () => void;
  onViewHistory: () => void;
  onViewInsights: () => void;
  onOpenSettings: () => void;
}

export function QuickActions({ onLogCycle, onViewHistory, onViewInsights, onOpenSettings }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button size="lg" onClick={onLogCycle} className="h-auto py-4 flex-col gap-2">
        <Plus className="w-6 h-6" /><span>Log Cycle</span>
      </Button>
      <Button variant="soft" size="lg" onClick={onViewHistory} className="h-auto py-4 flex-col gap-2">
        <History className="w-6 h-6" /><span>History</span>
      </Button>
      <Button variant="outline" size="lg" onClick={onViewInsights} className="h-auto py-4 flex-col gap-2">
        <BarChart3 className="w-6 h-6" /><span>Insights</span>
      </Button>
      <Button variant="ghost" size="lg" onClick={onOpenSettings} className="h-auto py-4 flex-col gap-2">
        <Settings className="w-6 h-6" /><span>Settings</span>
      </Button>
    </div>
  );
}