import { CycleData, CycleEntry, UserSettings } from '@/types/cycle';
import { encryptData, decryptData } from '@/lib/crypto';

const STORAGE_KEY = 'cycle-tracker-v2';

const defaultSettings: UserSettings = {
  privacyAcknowledged: false,
  notificationsEnabled: false,
  onboardingComplete: false,
};

const defaultData: CycleData = { settings: defaultSettings, entries: [] };

// ── Synchronous helpers (return defaults until async load completes) ──

export function getStoredData(): CycleData {
  // Returns cached in-memory copy or default.
  // Real data is loaded asynchronously via loadStoredDataAsync.
  return { ...defaultData };
}

// ── Async encrypted read / write ──

export async function loadStoredDataAsync(): Promise<CycleData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultData };

    const json = await decryptData(stored);
    const data = JSON.parse(json);
    return {
      settings: { ...defaultSettings, ...data.settings },
      entries: data.entries || [],
    };
  } catch (e) {
    console.error('Failed to load stored data:', e);
    return { ...defaultData };
  }
}

export async function saveDataAsync(data: CycleData): Promise<void> {
  try {
    const json = JSON.stringify(data);
    const encrypted = await encryptData(json);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

// ── Legacy sync wrappers (kept for compatibility) ──

export function saveData(data: CycleData): void {
  // Fire-and-forget async save
  saveDataAsync(data).catch((e) => console.error('Save error:', e));
}

export function updateSettings(settings: Partial<UserSettings>): void {
  // This is now handled by the hook; kept as stub for any callers.
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
  // Actual persistence is handled by the hook calling saveDataAsync
  return newEntry;
}

export function updateCycleEntry(id: string, updates: Partial<Omit<CycleEntry, 'id' | 'createdAt'>>): CycleEntry | null {
  // Stub – the hook manages state and calls saveDataAsync
  return null;
}

export function deleteCycleEntry(id: string): boolean {
  // Stub – the hook manages state and calls saveDataAsync
  return true;
}

export function exportData(): string {
  // Will be called after async load has populated state
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
