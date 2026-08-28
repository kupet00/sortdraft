export interface SentenceSpan {
  start: number;
  end: number;
}

export function splitIntoSentences(text: string): SentenceSpan[] {
  if (text.length === 0) {
    return [{ start: 0, end: 0 }];
  }

  const spans: SentenceSpan[] = [];
  let start = 0;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (/[.!?]/.test(ch)) {
      let end = i + 1;
      while (end < text.length && /[ \t]/.test(text[end])) {
        end++;
      }
      spans.push({ start, end });
      start = end;
      i = end;
      continue;
    }

    if (ch === "\n") {
      let end = i + 1;
      spans.push({ start, end });
      start = end;
      i = end;
      continue;
    }

    i++;
  }

  if (start < text.length) {
    spans.push({ start, end: text.length });
  }

  return spans.length > 0 ? spans : [{ start: 0, end: text.length }];
}

export function activeSentenceIndex(
  spans: SentenceSpan[],
  caret: number,
): number {
  if (spans.length === 0) return 0;

  for (let i = spans.length - 1; i >= 0; i--) {
    if (caret >= spans[i].start) return i;
  }

  return 0;
}
