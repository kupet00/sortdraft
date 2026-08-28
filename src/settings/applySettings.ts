import type { AppSettings, ThemeColors } from "./types";
import { resolveColors } from "./themes";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return { r, g, b };
}

function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
}

function overlay(color: string, alpha: number, light = "#ffffff", dark = "#000000"): string {
  const base = isDarkColor(color) ? light : dark;
  const rgb = hexToRgb(base);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function applyColorVars(root: HTMLElement, colors: ThemeColors): void {
  const entries: Record<string, string> = {
    "--bg": colors.background,
    "--bg-sidebar": colors.sidebarBackground,
    "--bg-panel": colors.panelBackground,
    "--bg-card": colors.cardBackground,
    "--bg-editor": colors.editorBackground,
    "--text": colors.textPrimary,
    "--text-muted": colors.textMuted,
    "--text-sidebar": colors.sidebarText,
    "--accent": colors.accent,
    "--accent-hover": colors.accentHover,
    "--border": colors.border,
    "--cork": colors.corkboard,
    "--error-bg": colors.errorBackground,
    "--error-border": colors.errorBorder,
    "--error-text": colors.errorText,
    "--dialog-bg": colors.dialogBackground,
    "--cork-text": overlay(colors.corkboard, 0.55, colors.textPrimary, colors.textPrimary),
    "--btn-hover": overlay(colors.background, 0.08),
    "--btn-sidebar-bg": overlay(colors.sidebarBackground, 0.08, "#ffffff", "#ffffff"),
    "--btn-sidebar-border": overlay(colors.sidebarBackground, 0.15, "#ffffff", "#ffffff"),
    "--btn-sidebar-hover": overlay(colors.sidebarBackground, 0.14, "#ffffff", "#ffffff"),
    "--sidebar-hover": overlay(colors.sidebarBackground, 0.06, "#ffffff", "#ffffff"),
    "--sidebar-active": overlay(colors.sidebarBackground, 0.1, "#ffffff", "#ffffff"),
    "--sidebar-error-bg": overlay(colors.errorText, 0.15, colors.errorBackground, colors.errorBackground),
    "--sidebar-error-border": overlay(colors.errorText, 0.35, colors.errorBorder, colors.errorBorder),
    "--sidebar-error-text": colors.errorText,
    "--drop-highlight": overlay(colors.accent, 0.4, colors.accent, colors.accent),
    "--drop-outline": overlay(colors.sidebarText, 0.5, "#ffffff", "#ffffff"),
    "--cell-border": overlay(colors.corkboard, 0.35, colors.textPrimary, colors.textPrimary),
    "--cell-drop-bg": overlay(colors.corkboard, 0.25, "#ffffff", "#ffffff"),
    "--cell-drop-border": overlay(colors.corkboard, 0.55, colors.textPrimary, colors.textPrimary),
    "--card-shadow": `0 2px 8px ${overlay(colors.textPrimary, 0.12)}`,
    "--card-shadow-hover": `0 4px 16px ${overlay(colors.textPrimary, 0.18)}`,
    "--card-overlay-shadow": `0 8px 24px ${overlay(colors.textPrimary, 0.25)}`,
    "--dialog-backdrop": overlay(colors.textPrimary, 0.45),
    "--dialog-shadow": `0 8px 32px ${overlay(colors.textPrimary, 0.2)}`,
    "--accent-subtle": overlay(colors.accent, 0.08),
    "--cork-btn-bg": overlay(colors.corkboard, 0.7, "#ffffff", "#ffffff"),
    "--sidebar-divider": overlay(colors.sidebarBackground, 0.08, "#ffffff", "#ffffff"),
    "--sidebar-panel-divider": overlay(colors.sidebarBackground, 0.1, "#ffffff", "#ffffff"),
    "--app-divider": overlay(colors.textPrimary, 0.15),
    "--editor-footer-bg": overlay(colors.editorBackground, 0.5, colors.background, colors.background),
    "--note-editor-bg": overlay(colors.editorBackground, 0.35, colors.background, colors.background),
    "--shadow": `0 2px 8px ${overlay(colors.textPrimary, 0.12)}`,
  };

  for (const [key, value] of Object.entries(entries)) {
    root.style.setProperty(key, value);
  }
}

export function applySettings(settings: AppSettings): void {
  const root = document.documentElement;
  const colors = resolveColors(settings);

  applyColorVars(root, colors);
  root.style.setProperty("--font-size-ui", `${settings.uiFontSize}px`);
  root.style.setProperty("--font-size-editor", `${settings.editorFontSize}px`);
  root.style.colorScheme = settings.themeMode === "dark" ? "dark" : "light";
}
