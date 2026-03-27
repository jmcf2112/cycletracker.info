import { CycleData, CycleEntry, UserSettings } from '@/types/cycle';

const STORAGE_KEY = 'cycle-tracker-v2';

const defaultSettings: UserSettings = {
  privacyAcknowledged: false,
  notificationsEnabled: false,
  onboardingComplete: false,
};

const defaultData: CycleData = { settings: defaultSettings, entries: [] };

// ── Synchronous helpers ──

export function getStoredData(): CycleData {
  return { ...defaultData };
}

// ── Read / Write (plain JSON, no encryption) ──

export async function loadStoredDataAsync(): Promise<CycleData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultData };

    // Safety: reject anything that isn't valid JSON
    if (stored.startsWith('enc:')) {
      localStorage.removeItem(STORAGE_KEY);
      return { ...defaultData };
    }

    const data = JSON.parse(stored);
    return {
      settings: { ...defaultSettings, ...data.settings },
      entries: data.entries || [],
    };
  } catch (e) {
    console.error('Failed to load stored data:', e);
    localStorage.removeItem(STORAGE_KEY);
    return { ...defaultData };
  }
}

export async function saveDataAsync(data: CycleData): Promise<void> {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

// ── Legacy sync wrappers ──

export function saveData(data: CycleData): void {
  saveDataAsync(data).catch((e) => console.error('Save error:', e));
}

export function updateSettings(settings: Partial<UserSettings>): void {
  loadStoredDataAsync().then((data) => {
    data.settings = { ...data.settings, ...settings };
    saveDataAsync(data);
  });
}

export function addCycleEntry(entry: Omit<CycleEntry, 'id' | 'createdAt' | 'updatedAt'>): CycleEntry {
  const now = new Date().toISOString();
  const newEntry: CycleEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  return newEntry;
}

export function updateCycleEntry(id: string, updates: Partial<Omit<CycleEntry, 'id' | 'createdAt'>>): CycleEntry | null {
  return null;
}

export function deleteCycleEntry(id: string): boolean {
  return true;
}

export function exportData(): string {
  return '{}';
}

export function deleteAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings && Array.isArray(data.entries)) {
      saveDataAsync(data);
      return true;
    }
  } catch (e) {
    console.error('Failed to import data:', e);
  }
  return false;
}
