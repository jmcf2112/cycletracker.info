export interface UserSettings {
  averageCycleOverride?: number;
  privacyAcknowledged: boolean;
  notificationsEnabled: boolean;
  onboardingComplete: boolean;
  typicalCycleLength?: number;
}

export interface CycleEntry {
  id: string;
  cycleStartDate: string;
  cycleEndDate?: string;
  notes?: string;
  isAtypical: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DerivedCycleStats {
  cyclesUsedCount: number;
  averageCycleLength: number;
  cycleLengthStdDev: number;
  lastComputedAt: string;
  recentTrend?: 'shortening' | 'lengthening' | 'stable';
  averagePeriodLength?: number;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface Prediction {
  predictedStartDate: string;
  confidenceLevel: ConfidenceLevel;
  minDate: string;
  maxDate: string;
  cyclesUsedCount: number;
}

export interface CycleData {
  settings: UserSettings;
  entries: CycleEntry[];
}

export type OnboardingStep = 'welcome' | 'privacy' | 'first-cycle' | 'typical-length' | 'complete';