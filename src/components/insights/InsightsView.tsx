import { DerivedCycleStats, CycleEntry } from '@/types/cycle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, BarChart3, Clock, Activity, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface InsightsViewProps {
  stats: DerivedCycleStats;
  entries: CycleEntry[];
  onBack: () => void;
}

export function InsightsView({ stats, entries, onBack }: InsightsViewProps) {
  const hasEnoughData = stats.cyclesUsedCount >= 2;

  const getTrendIcon = () => {
    switch (stats.recentTrend) {
      case 'shortening': return <TrendingDown className="w-5 h-5 text-success" />;
      case 'lengthening': return <TrendingUp className="w-5 h-5 text-warning" />;
      default: return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTrendText = () => {
    switch (stats.recentTrend) {
      case 'shortening': return 'Cycles getting shorter';
      case 'lengthening': return 'Cycles getting longer';
      default: return 'Cycle length stable';
    }
  };

  const getVariabilityLabel = () => {
    if (stats.cycleLengthStdDev <= 2) return { label: 'Very regular', color: 'text-success' };
    if (stats.cycleLengthStdDev <= 4) return { label: 'Regular', color: 'text-success' };
    if (stats.cycleLengthStdDev <= 6) return { label: 'Somewhat variable', color: 'text-warning' };
    return { label: 'Variable', color: 'text-accent' };
  };

  const variability = getVariabilityLabel();

  return (
    <div className="min-h-screen gradient-calm p-4">
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="space-y-4">
          <Card variant="elevated">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Your Insights</CardTitle></CardHeader>
            <CardContent>
              {!hasEnoughData ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4"><BarChart3 className="w-8 h-8 text-muted-foreground" /></div>
                  <h3 className="font-medium mb-2">Not enough data yet</h3>
                  <p className="text-sm text-muted-foreground">Log at least 2 cycles to see your personalized insights</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="p-4 rounded-xl bg-primary-soft">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span className="text-sm font-medium">Average Cycle</span></div>
                      <Tooltip><TooltipTrigger><Info className="w-4 h-4 text-muted-foreground" /></TooltipTrigger><TooltipContent><p>Based on {stats.cyclesUsedCount} logged cycles</p></TooltipContent></Tooltip>
                    </div>
                    <div className="flex items-baseline gap-1"><span className="text-3xl font-serif font-semibold">{Math.round(stats.averageCycleLength)}</span><span className="text-muted-foreground">days</span></div>
                  </div>
                  {stats.averagePeriodLength && (
                    <div className="p-4 rounded-xl bg-accent-soft">
                      <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-accent" /><span className="text-sm font-medium">Average Period</span></div>
                      <div className="flex items-baseline gap-1"><span className="text-3xl font-serif font-semibold">{Math.round(stats.averagePeriodLength)}</span><span className="text-muted-foreground">days</span></div>
                    </div>
                  )}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium">Cycle Regularity</span></div>
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-semibold ${variability.color}`}>{variability.label}</span>
                      <span className="text-sm text-muted-foreground">±{stats.cycleLengthStdDev.toFixed(1)} days</span>
                    </div>
                  </div>
                  {stats.recentTrend && (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">{getTrendIcon()}<span className="text-sm font-medium">Recent Trend</span></div>
                      <p className="text-muted-foreground">{getTrendText()}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Info className="w-4 h-4 text-muted-foreground" />How predictions work</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We calculate your average cycle length from your logged periods (excluding any marked as atypical). The prediction window accounts for natural variation in your cycle. The more cycles you log, the more accurate predictions become.
              </p>
            </CardContent>
          </Card>
          <div className="text-center text-sm text-muted-foreground py-2">Based on {entries.length} total entries • {stats.cyclesUsedCount} cycles analyzed</div>
        </div>
      </div>
    </div>
  );
}