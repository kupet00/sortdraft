import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

export async function setAppFullscreen(fullscreen: boolean): Promise<void> {
  if (!isTauri()) return;
  await getCurrentWindow().setFullscreen(fullscreen);
}

export async function isAppFullscreen(): Promise<boolean> {
  if (!isTauri()) return false;
  return getCurrentWindow().isFullscreen();
}
