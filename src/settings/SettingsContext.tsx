import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applySettings } from "./applySettings";
import { isEditorFontId } from "./fonts";
import { loadSettings, saveSettings } from "./storage";
import { defaultSettings, themePresets } from "./themes";
import type { AppSettings, ThemeColors, ThemeMode } from "./types";
import { MIN_PAGE_WIDTH } from "./types";

interface SettingsContextValue {
  settings: AppSettings;
  activeColors: ThemeColors;
  setUiFontSize: (size: number) => void;
  setEditorFontSize: (size: number) => void;
  setEditorFontFamily: (family: string) => void;
  setPageWidth: (width: number) => void;
  setTypewriterMode: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setCustomColor: (key: keyof ThemeColors, value: string) => void;
  resetCustomColors: () => void;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const setUiFontSize = useCallback(
    (size: number) => update({ uiFontSize: Math.min(24, Math.max(12, size)) }),
    [update],
  );

  const setEditorFontSize = useCallback(
    (size: number) =>
      update({ editorFontSize: Math.min(32, Math.max(12, size)) }),
    [update],
  );

  const setEditorFontFamily = useCallback(
    (family: string) => {
      if (!isEditorFontId(family)) return;
      update({ editorFontFamily: family });
    },
    [update],
  );

  const setPageWidth = useCallback(
    (width: number) =>
      update({
        pageWidth: Math.max(MIN_PAGE_WIDTH, width),
      }),
    [update],
  );

  const setTypewriterMode = useCallback(
    (enabled: boolean) => update({ typewriterMode: enabled }),
    [update],
  );

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setSettings((prev) => {
      if (mode === "custom" && prev.themeMode !== "custom") {
        const base = prev.themeMode === "dark" ? "dark" : "light";
        return {
          ...prev,
          themeMode: mode,
          customColors: { ...themePresets[base] },
        };
      }
      return { ...prev, themeMode: mode };
    });
  }, []);

  const setCustomColor = useCallback((key: keyof ThemeColors, value: string) => {
    setSettings((prev) => ({
      ...prev,
      themeMode: "custom",
      customColors: { ...prev.customColors, [key]: value },
    }));
  }, []);

  const resetCustomColors = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      themeMode: "light",
      customColors: { ...themePresets.light },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings());
  }, []);

  const activeColors = useMemo(() => {
    if (settings.themeMode === "custom") return settings.customColors;
    return themePresets[settings.themeMode];
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      activeColors,
      setUiFontSize,
      setEditorFontSize,
      setEditorFontFamily,
      setPageWidth,
      setTypewriterMode,
      setThemeMode,
      setCustomColor,
      resetCustomColors,
      resetToDefaults,
    }),
    [
      settings,
      activeColors,
      setUiFontSize,
      setEditorFontSize,
      setEditorFontFamily,
      setPageWidth,
      setTypewriterMode,
      setThemeMode,
      setCustomColor,
      resetCustomColors,
      resetToDefaults,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
