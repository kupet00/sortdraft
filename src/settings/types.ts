export type ThemeMode = "light" | "dark" | "custom";

export interface ThemeColors {
  background: string;
  sidebarBackground: string;
  panelBackground: string;
  cardBackground: string;
  editorBackground: string;
  textPrimary: string;
  textMuted: string;
  sidebarText: string;
  accent: string;
  accentHover: string;
  border: string;
  corkboard: string;
  errorBackground: string;
  errorBorder: string;
  errorText: string;
  dialogBackground: string;
}

export interface AppSettings {
  uiFontSize: number;
  editorFontSize: number;
  pageWidth: number;
  typewriterMode: boolean;
  themeMode: ThemeMode;
  customColors: ThemeColors;
}

export const DEFAULT_UI_FONT_SIZE = 15;
export const DEFAULT_EDITOR_FONT_SIZE = 17;
export const DEFAULT_PAGE_WIDTH = 680;
export const MIN_PAGE_WIDTH = 400;

export const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  background: "Main background",
  sidebarBackground: "Sidebar background",
  panelBackground: "Notes panel background",
  cardBackground: "Card background",
  editorBackground: "Editor background",
  textPrimary: "Primary text",
  textMuted: "Muted text",
  sidebarText: "Sidebar text",
  accent: "Accent",
  accentHover: "Accent hover",
  border: "Borders",
  corkboard: "Corkboard",
  errorBackground: "Error background",
  errorBorder: "Error border",
  errorText: "Error text",
  dialogBackground: "Dialog background",
};
