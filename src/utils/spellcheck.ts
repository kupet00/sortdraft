import nspell from "nspell";
import * as api from "../api";
import type { ProjectDictionary } from "../types";

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
  suggest(word: string): string[];
}

const spellerCache = new Map<string, Promise<Speller>>();
const dictionaryCache = new Map<string, Promise<ProjectDictionary>>();

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

export function loadProjectDictionary(projectPath: string): Promise<ProjectDictionary> {
  let pending = dictionaryCache.get(projectPath);
  if (!pending) {
    pending = api.getSpellcheckDictionary(projectPath);
    dictionaryCache.set(projectPath, pending);
  }
  return pending;
}

export function clearDictionaryCache(projectPath: string): void {
  dictionaryCache.delete(projectPath);
}

export async function getSuggestions(
  speller: Speller,
  word: string,
): Promise<string[]> {
  return speller.suggest(word);
}

export function isWordInProjectDictionary(
  dictionary: ProjectDictionary,
  word: string,
): "added" | "ignored" | null {
  const matches = (entry: { word: string; case_sensitive: boolean }) =>
    entry.case_sensitive
      ? entry.word === word
      : entry.word.toLocaleLowerCase() === word.toLocaleLowerCase();

  if (dictionary.added.some(matches)) return "added";
  if (dictionary.ignored.some(matches)) return "ignored";
  return null;
}

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  const matrix: number[][] = [];

  for (let i = 0; i <= bLower.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= aLower.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bLower.length; i++) {
    for (let j = 1; j <= aLower.length; j++) {
      if (bLower[i - 1] === aLower[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[bLower.length][aLower.length];
}

export async function getSuggestionsWithProjectDict(
  speller: Speller,
  word: string,
  projectDictionary?: ProjectDictionary,
): Promise<string[]> {
  const suggestions = await getSuggestions(speller, word);

  if (!projectDictionary || projectDictionary.added.length === 0) {
    return suggestions;
  }

  // Include the canonical spelling when a case-sensitive dictionary entry only
  // differs in capitalization, then include nearby dictionary suggestions.
  const projectSuggestions = projectDictionary.added
    .map((entry) => ({
      word: entry.word,
      distance: levenshteinDistance(word, entry.word),
      isCaseCorrection:
        entry.case_sensitive &&
        entry.word !== word &&
        entry.word.toLocaleLowerCase() === word.toLocaleLowerCase(),
    }))
    .filter(
      (item) =>
        item.isCaseCorrection || (item.distance <= 2 && item.distance > 0),
    )
    .sort(
      (a, b) =>
        Number(b.isCaseCorrection) - Number(a.isCaseCorrection) ||
        a.distance - b.distance,
    )
    .map((item) => item.word)
    .slice(0, 3); // Limit to 3 project suggestions

  // Combine and deduplicate
  const combined = [...projectSuggestions, ...suggestions];
  return Array.from(new Set(combined)).slice(0, 5);
}

export function findMisspelledSpans(
  speller: Speller,
  text: string,
  projectDictionary?: ProjectDictionary,
): WordSpan[] {
  const misspelled: WordSpan[] = [];
  for (const span of tokenizeWords(text)) {
    const word = text.slice(span.start, span.end);
    if (/^\d+$/.test(word)) continue;

    // Check if word is in project dictionary
    if (projectDictionary) {
      const inDict = isWordInProjectDictionary(projectDictionary, word);
      if (inDict !== null) continue; // Word is in dictionary (either added or ignored)
    }

    if (!speller.correct(word)) {
      misspelled.push(span);
    }
  }
  return misspelled;
}
