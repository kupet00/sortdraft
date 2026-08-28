import { useMemo } from "react";
import { COLOR_LABELS, type ThemeColors } from "../settings/types";
import {
  availableEditorFonts,
  resolveEditorFontStack,
} from "../settings/fonts";
import { useSettings } from "../settings/SettingsContext";

interface OptionsDialogProps {
  onClose: () => void;
}

export function OptionsDialog({ onClose }: OptionsDialogProps) {
  const {
    settings,
    setUiFontSize,
    setEditorFontSize,
    setEditorFontFamily,
    setTypewriterMode,
    setThemeMode,
    setCustomColor,
    resetToDefaults,
  } = useSettings();

  const editorFonts = useMemo(
    () => availableEditorFonts(settings.editorFontFamily),
    [settings.editorFontFamily],
  );
  const editorFontStack = resolveEditorFontStack(settings.editorFontFamily);

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog options-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="options-header">
          <h3>Options</h3>
          <button className="btn btn-ghost options-close" onClick={onClose}>
            Close
          </button>
        </div>

        <section className="options-section">
          <h4>Fonts</h4>
          <label className="options-select">
            <span>Editor font</span>
            <select
              value={settings.editorFontFamily}
              onChange={(e) => setEditorFontFamily(e.target.value)}
              style={{ fontFamily: editorFontStack }}
            >
              {editorFonts.map((font) => (
                <option
                  key={font.id}
                  value={font.id}
                  style={{ fontFamily: font.stack }}
                >
                  {font.label}
                </option>
              ))}
            </select>
          </label>
          <p className="options-font-preview" style={{ fontFamily: editorFontStack }}>
            The writer sat at the desk and began a new scene.
          </p>
          <label className="options-range">
            <span>UI font size</span>
            <div className="options-range-controls">
              <input
                type="range"
                min={12}
                max={24}
                value={settings.uiFontSize}
                onChange={(e) => setUiFontSize(Number(e.target.value))}
              />
              <span className="options-range-value">{settings.uiFontSize}px</span>
            </div>
          </label>
          <label className="options-range">
            <span>Editor font size</span>
            <div className="options-range-controls">
              <input
                type="range"
                min={12}
                max={32}
                value={settings.editorFontSize}
                onChange={(e) => setEditorFontSize(Number(e.target.value))}
              />
              <span className="options-range-value">{settings.editorFontSize}px</span>
            </div>
          </label>
          <label className="options-checkbox">
            <input
              type="checkbox"
              checked={settings.typewriterMode}
              onChange={(e) => setTypewriterMode(e.target.checked)}
            />
            <span>Typewriter mode in scene editor</span>
          </label>
        </section>

        <section className="options-section">
          <h4>Theme</h4>
          <div className="options-theme-modes">
            {(["light", "dark", "custom"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`btn options-theme-btn${settings.themeMode === mode ? " active" : ""}`}
                onClick={() => setThemeMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {settings.themeMode === "custom" && (
          <section className="options-section options-colors">
            <h4>Custom colours</h4>
            <div className="options-color-grid">
              {(Object.keys(COLOR_LABELS) as Array<keyof ThemeColors>).map((key) => (
                <label key={key} className="options-color-field">
                  <span>{COLOR_LABELS[key]}</span>
                  <input
                    type="color"
                    value={settings.customColors[key]}
                    onChange={(e) => setCustomColor(key, e.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>
        )}

        <div className="options-footer">
          <button type="button" className="btn" onClick={resetToDefaults}>
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
