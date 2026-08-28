import { COLOR_LABELS, type ThemeColors } from "../settings/types";
import { useSettings } from "../settings/SettingsContext";

interface OptionsDialogProps {
  onClose: () => void;
}

export function OptionsDialog({ onClose }: OptionsDialogProps) {
  const {
    settings,
    setUiFontSize,
    setEditorFontSize,
    setTypewriterMode,
    setThemeMode,
    setCustomColor,
    resetToDefaults,
  } = useSettings();

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
          <h4>Font sizes</h4>
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
