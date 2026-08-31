// Copies hunspell dictionary files from node_modules into public/dictionaries
// so they can be fetched at runtime by the in-app spellchecker.
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "..", "public", "dictionaries");

const languages = [
  { code: "en", package: "dictionary-en" },
  { code: "en-gb", package: "dictionary-en-gb" },
  { code: "fr", package: "dictionary-fr" },
  { code: "de", package: "dictionary-de" },
  { code: "es", package: "dictionary-es" },
  { code: "nl", package: "dictionary-nl" },
  { code: "da", package: "dictionary-da" },
  { code: "nb", package: "dictionary-nb" },
  { code: "is", package: "dictionary-is" },
  { code: "sv", package: "dictionary-sv" },
  { code: "pl", package: "dictionary-pl" },
  { code: "it", package: "dictionary-it" },
  { code: "ga", package: "dictionary-ga" },
  { code: "cy", package: "dictionary-cy" },
  { code: "pt", package: "dictionary-pt" },
];

for (const { code, package: pkg } of languages) {
  const { default: dictionary } = await import(pkg);
  const dir = path.join(outDir, code);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.aff"), dictionary.aff);
  await writeFile(path.join(dir, "index.dic"), dictionary.dic);
  console.log(`wrote dictionary for ${code}`);
}
