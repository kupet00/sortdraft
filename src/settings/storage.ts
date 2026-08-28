import type { AppSettings } from "./types";
import { defaultSettings } from "./themes";

const STORAGE_KEY = "sortdraft-settings";

export function loadSettings(): AppSettings {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem("writer-settings");
      if (raw) localStorage.setItem(STORAGE_KEY, raw);
    }
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...defaultSettings(),
      ...parsed,
      customColors: {
        ...defaultSettings().customColors,
        ...parsed.customColors,
      },
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
