import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getSuggestionsWithProjectDict,
  isWordInProjectDictionary,
} from "../utils/spellcheck";
import type { ProjectDictionary } from "../types";

interface SpellcheckContextMenuProps {
  word: string;
  x: number;
  y: number;
  speller: any; // Speller type from nspell
  onReplace: (oldWord: string, newWord: string) => void;
  onIgnore: (word: string) => void;
  onAdd: (word: string) => void;
  onClose: () => void;
  projectDictionary: ProjectDictionary;
}

export function SpellcheckContextMenu({
  word,
  x,
  y,
  speller,
  onReplace,
  onIgnore,
  onAdd,
  onClose,
  projectDictionary,
}: SpellcheckContextMenuProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sug = getSuggestionsWithProjectDict(speller, word, projectDictionary);
    Promise.resolve(sug).then(setSuggestions);
  }, [word, speller, projectDictionary]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const dictionaryCategory = isWordInProjectDictionary(projectDictionary, word);
  const isInAdded = dictionaryCategory === "added";
  const isInIgnored = dictionaryCategory === "ignored";

  return createPortal(
    <div
      ref={menuRef}
      className="spellcheck-context-menu"
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      {suggestions.length > 0 ? (
        <div className="spellcheck-suggestions">
          <div className="spellcheck-menu-label">Suggestions:</div>
          {suggestions.slice(0, 5).map((suggestion) => (
            <button
              key={suggestion}
              className="spellcheck-suggestion-item"
              onClick={() => {
                onReplace(word, suggestion);
                onClose();
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : (
        <div className="spellcheck-no-suggestions">
          <span className="spellcheck-menu-label">No suggestions</span>
        </div>
      )}

      <div className="spellcheck-menu-divider"></div>

      <button
        className="spellcheck-menu-item"
        onClick={() => {
          onIgnore(word);
          onClose();
        }}
        title="Ignore this word in this project"
      >
        {isInIgnored ? "✓ " : ""}Ignore
      </button>

      <button
        className="spellcheck-menu-item"
        onClick={() => {
          onAdd(word);
          onClose();
        }}
        title="Add to project dictionary"
      >
        {isInAdded ? "✓ " : ""}Add to Dictionary
      </button>
    </div>,
    document.body
  );
}
