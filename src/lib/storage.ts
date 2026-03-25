import { CycleData, UserSettings } from '@/types/cycle';
import { encryptData, decryptData } from '@/lib/crypto';

const STORAGE_KEY = 'cycle-tracker-v2';

const defaultSettings: UserSettings = {
  privacyAcknowledged: false,
  notificationsEnabled: false,
  onboardingComplete: false,
};

const defaultData: CycleData = { settings: defaultSettings, entries: [] };

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

export function deleteAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
