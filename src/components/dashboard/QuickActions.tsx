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
    <div className="flex gap-3">
      <Button size="lg" onClick={onLogCycle} className="flex-1 h-auto py-3 flex-col gap-1.5">
        <Plus className="w-5 h-5" /><span className="text-xs">Log Cycle</span>
      </Button>
      <Button variant="soft" size="lg" onClick={onViewHistory} className="flex-1 h-auto py-3 flex-col gap-1.5">
        <History className="w-5 h-5" /><span className="text-xs">History</span>
      </Button>
      <Button variant="outline" size="lg" onClick={onViewInsights} className="flex-1 h-auto py-3 flex-col gap-1.5">
        <BarChart3 className="w-5 h-5" /><span className="text-xs">Insights</span>
      </Button>
      <Button variant="ghost" size="lg" onClick={onOpenSettings} className="flex-1 h-auto py-3 flex-col gap-1.5">
        <Settings className="w-5 h-5" /><span className="text-xs">Settings</span>
      </Button>
    </div>
  );
}