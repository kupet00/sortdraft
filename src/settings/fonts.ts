export interface EditorFont {
  id: string;
  label: string;
  family: string;
  stack: string;
  detectFamilies?: string[];
  alwaysAvailable?: boolean;
}

export const DEFAULT_EDITOR_FONT_FAMILY = "georgia";

export const EDITOR_FONTS: EditorFont[] = [
  {
    id: "georgia",
    label: "Georgia",
    family: "Georgia",
    stack: '"Georgia", "Times New Roman", serif',
    alwaysAvailable: true,
  },
  {
    id: "times",
    label: "Times New Roman",
    family: "Times New Roman",
    stack: '"Times New Roman", Times, serif',
    alwaysAvailable: true,
  },
  {
    id: "palatino",
    label: "Palatino",
    family: "Palatino",
    stack: 'Palatino, "Palatino Linotype", "Book Antiqua", serif',
    detectFamilies: ["Palatino", "Palatino Linotype", "Book Antiqua"],
  },
  {
    id: "baskerville",
    label: "Baskerville",
    family: "Baskerville",
    stack: 'Baskerville, "Baskerville Old Face", "Times New Roman", serif',
    detectFamilies: ["Baskerville", "Baskerville Old Face"],
  },
  {
    id: "garamond",
    label: "Garamond",
    family: "Garamond",
    stack: 'Garamond, "Apple Garamond", Palatino, serif',
    detectFamilies: ["Garamond", "Apple Garamond"],
  },
  {
    id: "charter",
    label: "Charter",
    family: "Charter",
    stack: 'Charter, "Bitstream Charter", Georgia, serif',
    detectFamilies: ["Charter", "Bitstream Charter"],
  },
  {
    id: "iowan",
    label: "Iowan Old Style",
    family: "Iowan Old Style",
    stack: '"Iowan Old Style", Palatino, Georgia, serif',
  },
  {
    id: "new-york",
    label: "New York",
    family: "New York",
    stack: '"New York", "Iowan Old Style", Georgia, serif',
  },
  {
    id: "cambria",
    label: "Cambria",
    family: "Cambria",
    stack: "Cambria, Georgia, serif",
  },
  {
    id: "helvetica",
    label: "Helvetica",
    family: "Helvetica Neue",
    stack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    alwaysAvailable: true,
  },
  {
    id: "system",
    label: "System UI",
    family: "system-ui",
    stack: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    alwaysAvailable: true,
  },
  {
    id: "courier",
    label: "Courier",
    family: "Courier New",
    stack: '"Courier New", Courier, monospace',
    alwaysAvailable: true,
  },
  {
    id: "typewriter",
    label: "American Typewriter",
    family: "American Typewriter",
    stack: '"American Typewriter", "Courier New", serif',
  },
  {
    id: "menlo",
    label: "Menlo",
    family: "Menlo",
    stack: 'Menlo, Consolas, "Liberation Mono", monospace',
    detectFamilies: ["Menlo", "Consolas", "Liberation Mono"],
  },
];

const TEST_STRING = "abcdefghijklmnopqrstuvwxyz0123456789";

function textWidth(font: string): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = `72px ${font}`;
  return ctx.measureText(TEST_STRING).width;
}

export function isFontInstalled(family: string): boolean {
  const quoted = `"${family.replace(/"/g, "")}"`;
  return (["monospace", "serif", "sans-serif"] as const).some((base) => {
    return textWidth(`${quoted}, ${base}`) !== textWidth(base);
  });
}

export function isEditorFontId(id: string): boolean {
  return EDITOR_FONTS.some((font) => font.id === id);
}

export function resolveEditorFontStack(id: string): string {
  const font = EDITOR_FONTS.find((entry) => entry.id === id);
  return (
    font?.stack ??
    EDITOR_FONTS.find((entry) => entry.id === DEFAULT_EDITOR_FONT_FAMILY)!.stack
  );
}

export function availableEditorFonts(selectedId?: string): EditorFont[] {
  const installed = EDITOR_FONTS.filter((font) => {
    if (font.alwaysAvailable) return true;
    const families = font.detectFamilies ?? [font.family];
    return families.some(isFontInstalled);
  });
  if (selectedId && !installed.some((font) => font.id === selectedId)) {
    const selected = EDITOR_FONTS.find((font) => font.id === selectedId);
    if (selected) return [selected, ...installed];
  }
  return installed;
}
