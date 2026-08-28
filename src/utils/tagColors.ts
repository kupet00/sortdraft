export const DEFAULT_TAG_COLORS = [
  "#e57373",
  "#64b5f6",
  "#81c784",
  "#ffb74d",
  "#ba68c8",
  "#4db6ac",
] as const;

export function defaultTagColor(index: number): string {
  return DEFAULT_TAG_COLORS[index % DEFAULT_TAG_COLORS.length];
}

export function tagTextColor(background: string): string {
  const hex = background.replace("#", "");
  if (hex.length !== 6) return "#ffffff";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#2c2416" : "#ffffff";
}
