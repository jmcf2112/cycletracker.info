import { CycleData, CycleEntry, UserSettings } from '@/types/cycle';

const STORAGE_KEY = 'cycle-tracker-v2';

const defaultSettings: UserSettings = {
  privacyAcknowledged: false,
  notificationsEnabled: false,
  onboardingComplete: false,
};

export function getStoredData(): CycleData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        settings: { ...defaultSettings, ...data.settings },
        entries: data.entries || [],
      };
    }
  } catch (e) {
    console.error('Failed to parse stored data:', e);
  }
  return { settings: defaultSettings, entries: [] };
}

export function saveData(data: CycleData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function updateSettings(settings: Partial<UserSettings>): void {
  const data = getStoredData();
  data.settings = { ...data.settings, ...settings };
  saveData(data);
}

export function addCycleEntry(entry: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>): CycleEntry {
  const data = getStoredData();
  const now = new Date().toISOString();
  const newEntry: CycleEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.entries.push(newEntry);
  data.entries.sort((a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime());
  saveData(data);
  return newEntry;
}

export function updateCycleEntry(id: string, updates: Partial<Omit<CycleEntry, 'id' | 'createdAt'>>): CycleEntry | null {
  const data = getStoredData();
  const index = data.entries.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  data.entries[index] = {
    ...data.entries[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  data.entries.sort((a, b) => new Date(b.cycleStartDate).getTime() - new Date(a.cycleStartDate).getTime());
  saveData(data);
  return data.entries[index];
}

export function deleteCycleEntry(id: string): boolean {
  const data = getStoredData();
  const index = data.entries.findIndex(e => e.id === id);
  if (index === -1) return false;
  
  data.entries.splice(index, 1);
  saveData(data);
  return true;
}

export function exportData(): string {
  const data = getStoredData();
  return JSON.stringify(data, null, 2);
}

export function deleteAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings && Array.isArray(data.entries)) {
      saveData(data);
      return true;
    }
  } catch (e) {
    console.error('Failed to import data:', e);
  }
  return false;
}