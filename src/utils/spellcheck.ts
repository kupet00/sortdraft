import nspell from "nspell";

export interface WordSpan {
  start: number;
  end: number;
}

const WORD_PATTERN = /[\p{L}\p{M}]+(?:['\u2019-][\p{L}\p{M}]+)*/gu;

export function tokenizeWords(text: string): WordSpan[] {
  const spans: WordSpan[] = [];
  for (const match of text.matchAll(WORD_PATTERN)) {
    spans.push({ start: match.index, end: match.index + match[0].length });
  }
  return spans;
}

export interface SpellCheckLanguage {
  code: string;
  label: string;
}

export const SPELLCHECK_LANGUAGES: SpellCheckLanguage[] = [
  { code: "da", label: "Danish" },
  { code: "nl", label: "Dutch" },
  { code: "en-gb", label: "English (UK)" },
  { code: "en", label: "English (US)" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "is", label: "Icelandic" },
  { code: "ga", label: "Irish" },
  { code: "it", label: "Italian" },
  { code: "nb", label: "Norwegian" },
  { code: "pl", label: "Polish" },
  { code: "pt", label: "Portuguese" },
  { code: "es", label: "Spanish" },
  { code: "sv", label: "Swedish" },
  { code: "cy", label: "Welsh" },
];

export const DEFAULT_SPELLCHECK_LANGUAGE = "en";

export function isSpellCheckLanguage(value: string): boolean {
  return SPELLCHECK_LANGUAGES.some((lang) => lang.code === value);
}

interface Speller {
  correct(word: string): boolean;
}

const spellerCache = new Map<string, Promise<Speller>>();

export function loadSpeller(languageCode: string): Promise<Speller> {
  let pending = spellerCache.get(languageCode);
  if (!pending) {
    pending = (async () => {
      const [aff, dic] = await Promise.all([
        fetch(`/dictionaries/${languageCode}/index.aff`).then((r) => r.text()),
        fetch(`/dictionaries/${languageCode}/index.dic`).then((r) => r.text()),
      ]);
      return nspell(aff, dic);
    })();
    spellerCache.set(languageCode, pending);
  }
  return pending;
}

export function findMisspelledSpans(
  speller: Speller,
  text: string,
): WordSpan[] {
  const misspelled: WordSpan[] = [];
  for (const span of tokenizeWords(text)) {
    const word = text.slice(span.start, span.end);
    if (/^\d+$/.test(word)) continue;
    if (!speller.correct(word)) {
      misspelled.push(span);
    }
  }
  return misspelled;
}
