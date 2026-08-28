import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SettingsProvider } from "./settings/SettingsContext";
import { applySettings } from "./settings/applySettings";
import { loadSettings } from "./settings/storage";

applySettings(loadSettings());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>,
);
