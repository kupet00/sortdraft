import { DEFAULT_EDITOR_FONT_FAMILY } from "./fonts";
import type { AppSettings, ThemeColors } from "./types";
import {
  DEFAULT_EDITOR_FONT_SIZE,
  DEFAULT_PAGE_WIDTH,
  DEFAULT_UI_FONT_SIZE,
} from "./types";

export const lightTheme: ThemeColors = {
  background: "#f5f0e8",
  sidebarBackground: "#2c2416",
  panelBackground: "#241e14",
  cardBackground: "#fffef9",
  editorBackground: "#ffffff",
  textPrimary: "#2c2416",
  textMuted: "#6b5d4d",
  sidebarText: "#e8dfd0",
  accent: "#8b4513",
  accentHover: "#a0522d",
  border: "#d4c9b8",
  corkboard: "#c4a574",
  errorBackground: "#fdecea",
  errorBorder: "#e8b4b0",
  errorText: "#8b2500",
  dialogBackground: "#ffffff",
};

export const darkTheme: ThemeColors = {
  background: "#1c1915",
  sidebarBackground: "#12100d",
  panelBackground: "#0e0c0a",
  cardBackground: "#2a2620",
  editorBackground: "#222018",
  textPrimary: "#ece4d8",
  textMuted: "#a69888",
  sidebarText: "#ddd4c8",
  accent: "#c17a3a",
  accentHover: "#d4894a",
  border: "#3d3830",
  corkboard: "#4a3d2a",
  errorBackground: "#3a2018",
  errorBorder: "#6a3830",
  errorText: "#ffb8a8",
  dialogBackground: "#2a2620",
};

export const themePresets = {
  light: lightTheme,
  dark: darkTheme,
};

export function defaultSettings(): AppSettings {
  return {
    uiFontSize: DEFAULT_UI_FONT_SIZE,
    editorFontSize: DEFAULT_EDITOR_FONT_SIZE,
    editorFontFamily: DEFAULT_EDITOR_FONT_FAMILY,
    pageWidth: DEFAULT_PAGE_WIDTH,
    typewriterMode: false,
    themeMode: "light",
    customColors: { ...lightTheme },
  };
}

export function resolveColors(settings: AppSettings): ThemeColors {
  if (settings.themeMode === "custom") {
    return settings.customColors;
  }
  return themePresets[settings.themeMode];
}
