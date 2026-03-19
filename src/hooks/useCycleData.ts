import { useState, useEffect, useCallback } from 'react';
import { CycleData, CycleEntry, UserSettings } from '@/types/cycle';
import { 
  getStoredData, 
  saveData, 
  addCycleEntry, 
  updateCycleEntry, 
  deleteCycleEntry,
  deleteAllData,
  exportData,
} from '@/lib/storage';
import { calculateStats, calculatePrediction, getCurrentCycleDay, isInPeriod } from '@/lib/predictions';

export function useCycleData() {
  const [data, setData] = useState<CycleData>(() => getStoredData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setData(getStoredData());
    setIsLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setData(getStoredData());
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setData(prev => {
      const newData = {
        ...prev,
        settings: { ...prev.settings, ...updates },
      };
      saveData(newData);
      return newData;
    });
  }, []);

  const addEntry = useCallback((entry: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry = addCycleEntry(entry);
    refresh();
    return newEntry;
  }, [refresh]);

  const updateEntry = useCallback((id: string, updates: Partial<Omit<CycleEntry, 'id' | 'createdAt'>>) => {
    const updated = updateCycleEntry(id, updates);
    refresh();
    return updated;
  }, [refresh]);

  const deleteEntry = useCallback((id: string) => {
    const success = deleteCycleEntry(id);
    refresh();
    return success;
  }, [refresh]);

  const clearAllData = useCallback(() => {
    deleteAllData();
    refresh();
  }, [refresh]);

  const getExportData = useCallback(() => {
    return exportData();
  }, []);

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