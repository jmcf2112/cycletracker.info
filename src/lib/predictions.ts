import { CycleEntry, ConfidenceLevel, DerivedCycleStats, Prediction } from '@/types/cycle';
import { addDays, differenceInDays, parseISO } from 'date-fns';

const MIN_CYCLES_FOR_PREDICTION = 2;
const IDEAL_CYCLES_FOR_PREDICTION = 6;
const DEFAULT_CYCLE_LENGTH = 28;

export function calculateCycleLengths(entries: CycleEntry[]): number[] {
  const sortedEntries = [...entries]
    .filter(e => !e.isAtypical)
    .sort((a, b) => new Date(a.cycleStartDate).getTime() - new Date(b.cycleStartDate).getTime());

  const lengths: number[] = [];
  for (let i = 1; i < sortedEntries.length; i++) {
    const days = differenceInDays(
      parseISO(sortedEntries[i].cycleStartDate),
      parseISO(sortedEntries[i - 1].cycleStartDate)
    );
    if (days > 0 && days <= 60) {
      lengths.push(days);
    }
  }
  return lengths;
}

export function calculatePeriodLengths(entries: CycleEntry[]): number[] {
  return entries
    .filter(e => e.cycleEndDate && !e.isAtypical)
    .map(e => differenceInDays(parseISO(e.cycleEndDate!), parseISO(e.cycleStartDate)) + 1)
    .filter(days => days > 0 && days <= 14);
}

export function calculateStats(entries: CycleEntry[], overrideLength?: number): DerivedCycleStats {
  const cycleLengths = calculateCycleLengths(entries);
  const periodLengths = calculatePeriodLengths(entries);
  
  const n = cycleLengths.length;
  const average = n > 0 
    ? cycleLengths.reduce((a, b) => a + b, 0) / n 
    : (overrideLength || DEFAULT_CYCLE_LENGTH);

  const stdDev = n > 1
    ? Math.sqrt(cycleLengths.reduce((sum, len) => sum + Math.pow(len - average, 2), 0) / (n - 1))
    : 3;

  let recentTrend: 'shortening' | 'lengthening' | 'stable' | undefined;
  if (cycleLengths.length >= 6) {
    const recent = cycleLengths.slice(-3);
    const previous = cycleLengths.slice(-6, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / 3;
    const prevAvg = previous.reduce((a, b) => a + b, 0) / 3;
    const diff = recentAvg - prevAvg;
    if (diff < -2) recentTrend = 'shortening';
    else if (diff > 2) recentTrend = 'lengthening';
    else recentTrend = 'stable';
  }

  const avgPeriod = periodLengths.length > 0
    ? periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
    : undefined;

  return {
    cyclesUsedCount: n,
    averageCycleLength: Math.round(average * 10) / 10,
    cycleLengthStdDev: Math.round(stdDev * 10) / 10,
    lastComputedAt: new Date().toISOString(),
    recentTrend,
    averagePeriodLength: avgPeriod ? Math.round(avgPeriod * 10) / 10 : undefined,
  };
}

export function getConfidenceLevel(cyclesUsed: number, stdDev: number): ConfidenceLevel {
  if (cyclesUsed < MIN_CYCLES_FOR_PREDICTION) return 'low';
  if (cyclesUsed >= IDEAL_CYCLES_FOR_PREDICTION && stdDev <= 3) return 'high';
  if (cyclesUsed >= 3 && stdDev <= 5) return 'medium';
  return 'low';
}

export function calculatePrediction(
  entries: CycleEntry[], 
  overrideLength?: number
): Prediction | null {
  const sortedEntries = [...entries]
    .sort((a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime());

  if (sortedEntries.length === 0) return null;

  const lastEntry = sortedEntries[0];
  const stats = calculateStats(entries, overrideLength);
  
  const cycleLength = overrideLength || stats.averageCycleLength;
  const uncertainty = Math.max(stats.cycleLengthStdDev, 2);

  const lastStart = parseISO(lastEntry.cycleStartDate);
  const predictedStart = addDays(lastStart, Math.round(cycleLength));
  
  const windowDays = Math.ceil(uncertainty * 1.5);
  const minDate = addDays(predictedStart, -windowDays);
  const maxDate = addDays(predictedStart, windowDays);

  return {
    predictedStartDate: predictedStart.toISOString(),
    confidenceLevel: getConfidenceLevel(stats.cyclesUsedCount, stats.cycleLengthStdDev),
    minDate: minDate.toISOString(),
    maxDate: maxDate.toISOString(),
    cyclesUsedCount: stats.cyclesUsedCount,
  };
}

export function getCurrentCycleDay(entries: CycleEntry[]): number | null {
  const sortedEntries = [...entries]
    .sort((a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime());

  if (sortedEntries.length === 0) return null;

  const lastStart = parseISO(sortedEntries[0].cycleStartDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysSinceStart = differenceInDays(today, lastStart);
  
  if (daysSinceStart > 60 || daysSinceStart < 0) return null;
  
  return daysSinceStart + 1;
}

export function isInPeriod(entries: CycleEntry[]): boolean {
  const sortedEntries = [...entries]
    .sort((a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime());

  if (sortedEntries.length === 0) return false;

  const lastEntry = sortedEntries[0];
  if (!lastEntry.cycleEndDate) {
    const daysSinceStart = differenceInDays(new Date(), parseISO(lastEntry.cycleStartDate));
    return daysSinceStart >= 0 && daysSinceStart < 5;
  }

  const today = new Date();
  const start = parseISO(lastEntry.cycleStartDate);
  const end = parseISO(lastEntry.cycleEndDate);
  
  return today >= start && today <= end;
}