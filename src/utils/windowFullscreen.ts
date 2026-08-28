import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

export async function setAppFullscreen(fullscreen: boolean): Promise<void> {
  if (!isTauri()) return;
  try {
    await getCurrentWindow().setFullscreen(fullscreen);
  } catch {
    // Window fullscreen is not available on mobile.
  }
}

export async function isAppFullscreen(): Promise<boolean> {
  if (!isTauri()) return false;
  try {
    return await getCurrentWindow().isFullscreen();
  } catch {
    return false;
  }
}
