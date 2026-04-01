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
    <div className="grid grid-cols-4 gap-3">
      <Button size="lg" onClick={onLogCycle} className="h-auto py-3 flex-col gap-1.5 flex-1">
        <Plus className="w-5 h-5" /><span className="text-xs">Log Cycle</span>
      </Button>
      <Button variant="soft" size="lg" onClick={onViewHistory} className="h-auto py-3 flex-col gap-1.5 flex-1">
        <History className="w-5 h-5" /><span className="text-xs">History</span>
      </Button>
      <Button variant="outline" size="lg" onClick={onViewInsights} className="h-auto py-3 flex-col gap-1.5 flex-1">
        <BarChart3 className="w-5 h-5" /><span className="text-xs">Insights</span>
      </Button>
      <Button variant="ghost" size="lg" onClick={onOpenSettings} className="h-auto py-3 flex-col gap-1.5 flex-1">
        <Settings className="w-5 h-5" /><span className="text-xs">Settings</span>
      </Button>
    </div>
  );
}