import { useState, useEffect, useCallback } from 'react';
import { CycleData, CycleEntry, UserSettings } from '@/types/cycle';
import { loadStoredDataAsync, saveDataAsync, deleteAllData } from '@/lib/storage';
import { calculateStats, calculatePrediction, getCurrentCycleDay, isInPeriod } from '@/lib/predictions';
import { supabase } from '@/integrations/supabase/client';

const defaultSettings: UserSettings = {
  privacyAcknowledged: false,
  notificationsEnabled: false,
  onboardingComplete: false,
};

const defaultData: CycleData = { settings: defaultSettings, entries: [] };

export function useCycleData() {
  const [data, setData] = useState<CycleData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredDataAsync().then((loaded) => {
      setData(loaded);
      setIsLoading(false);
    });
  }, []);

  // Persist whenever data changes (skip initial default)
  const hasLoaded = !isLoading;
  useEffect(() => {
    if (hasLoaded) {
      saveDataAsync(data);
    }
  }, [data, hasLoaded]);

  const refresh = useCallback(() => {
    loadStoredDataAsync().then(setData);
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const addEntry = useCallback((entry: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEntry: CycleEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setData((prev) => {
      const entries = [...prev.entries, newEntry].sort(
        (a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime(),
      );
      return { ...prev, entries };
    });

    // Send transactional email for new cycle entry
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'cycle-entry-logged',
            recipientEmail: user.email,
            idempotencyKey: `cycle-entry-${newEntry.id}`,
            templateData: { cycleStartDate: newEntry.cycleStartDate },
          },
        });
      }
    });

    return newEntry;
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<Omit<CycleEntry, 'id' | 'createdAt'>>) => {
    let updated: CycleEntry | null = null;
    setData((prev) => {
      const index = prev.entries.findIndex((e) => e.id === id);
      if (index === -1) return prev;
      const entries = [...prev.entries];
      entries[index] = { ...entries[index], ...updates, updatedAt: new Date().toISOString() };
      updated = entries[index];
      entries.sort((a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime());
      return { ...prev, entries };
    });
    return updated;
  }, []);

  const deleteEntry = useCallback((id: string) => {
    let found = false;
    setData((prev) => {
      const entries = prev.entries.filter((e) => {
        if (e.id === id) { found = true; return false; }
        return true;
      });
      return { ...prev, entries };
    });
    return found;
  }, []);

  const clearAllData = useCallback(() => {
    deleteAllData();
    setData(defaultData);
  }, []);

  const getExportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const stats = calculateStats(data.entries, data.settings.averageCycleOverride);
  const prediction = calculatePrediction(data.entries, data.settings.averageCycleOverride);
  const currentCycleDay = getCurrentCycleDay(data.entries);
  const inPeriod = isInPeriod(data.entries);

  return {
    data,
    settings: data.settings,
    entries: data.entries,
    stats,
    prediction,
    currentCycleDay,
    inPeriod,
    isLoading,
    updateSettings,
    addEntry,
    updateEntry,
    deleteEntry,
    clearAllData,
    getExportData,
    refresh,
  };
}
