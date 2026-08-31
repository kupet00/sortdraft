import { useCallback, useEffect, useState } from "react";
import * as api from "../api";
import type { DictionaryWord, ProjectDictionary } from "../types";
import { clearDictionaryCache } from "../utils/spellcheck";

interface DictionaryEditorProps {
  projectPath: string;
  onClose: () => void;
  onDictionaryUpdated: () => void;
}

export function DictionaryEditor({
  projectPath,
  onClose,
  onDictionaryUpdated,
}: DictionaryEditorProps) {
  const [dictionary, setDictionary] = useState<ProjectDictionary>({
    ignored: [],
    added: [],
  });
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState("");
  const [newWordCaseSensitive, setNewWordCaseSensitive] = useState(false);
  const [activeTab, setActiveTab] = useState<"added" | "ignored">("added");
  const [editingWord, setEditingWord] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingCaseSensitive, setEditingCaseSensitive] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getSpellcheckDictionary(projectPath).then((dict) => {
      setDictionary(dict);
      setLoading(false);
    });
  }, [projectPath]);

  const handleAddWord = useCallback(async () => {
    if (!newWord.trim()) return;

    const action = activeTab === "added" ? "add" : "ignore";
    api
      .updateSpellcheckDictionary(
        projectPath,
        action,
        newWord.trim(),
        newWordCaseSensitive,
      )
      .then((dict) => {
        setDictionary(dict);
        setNewWord("");
        setNewWordCaseSensitive(false);
        clearDictionaryCache(projectPath);
        onDictionaryUpdated();
      });
  }, [
    projectPath,
    activeTab,
    newWord,
    newWordCaseSensitive,
    onDictionaryUpdated,
  ]);

  const handleRemoveWord = useCallback(
    (word: string) => {
      const action = activeTab === "added" ? "remove_add" : "remove_ignore";
      api.updateSpellcheckDictionary(projectPath, action, word).then((dict) => {
          clearDictionaryCache(projectPath);
          onDictionaryUpdated();
        setDictionary(dict);
      });
    },
    [projectPath, activeTab, onDictionaryUpdated],
  );

  const handleCaseSensitivityChange = useCallback(
    (entry: DictionaryWord, caseSensitive: boolean) => {
      const action = activeTab === "added" ? "add" : "ignore";
      api
        .updateSpellcheckDictionary(
          projectPath,
          action,
          entry.word,
          caseSensitive,
        )
        .then((dict) => {
          setDictionary(dict);
          clearDictionaryCache(projectPath);
          onDictionaryUpdated();
        });
    },
    [projectPath, activeTab, onDictionaryUpdated],
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editingWord || !editingValue.trim()) return;

    const value = editingValue.trim();
    const removeAction =
      activeTab === "added" ? "remove_add" : "remove_ignore";
    const addAction = activeTab === "added" ? "add" : "ignore";
    if (value === editingWord) {
      setDictionary(
        await api.updateSpellcheckDictionary(
          projectPath,
          addAction,
          value,
          editingCaseSensitive,
        ),
      );
      clearDictionaryCache(projectPath);
      onDictionaryUpdated();
      setEditingWord(null);
      setEditingValue("");
      return;
    }

    await api.updateSpellcheckDictionary(
      projectPath,
      removeAction,
      editingWord,
    );

    setDictionary(
      await api.updateSpellcheckDictionary(
        projectPath,
        addAction,
        value,
        editingCaseSensitive,
      ),
    );
    clearDictionaryCache(projectPath);
    onDictionaryUpdated();
    setEditingWord(null);
    setEditingValue("");
  }, [
    projectPath,
    activeTab,
    editingWord,
    editingValue,
    editingCaseSensitive,
    onDictionaryUpdated,
  ]);

  const currentList = activeTab === "added" ? dictionary.added : dictionary.ignored;

  return (
    <div className="dictionary-editor">
      <div className="dictionary-editor-header">
        <h2>Spellcheck Dictionary</h2>
        <button className="btn btn-ghost" onClick={onClose}>
          ← Back
        </button>
      </div>

      <div className="dictionary-editor-tabs">
        <button
          className={`dictionary-tab${activeTab === "added" ? " active" : ""}`}
          onClick={() => setActiveTab("added")}
        >
          Added Words ({dictionary.added.length})
        </button>
        <button
          className={`dictionary-tab${activeTab === "ignored" ? " active" : ""}`}
          onClick={() => setActiveTab("ignored")}
        >
          Ignored Words ({dictionary.ignored.length})
        </button>
      </div>

      {loading ? (
        <div className="dictionary-editor-loading">Loading...</div>
      ) : (
        <>
          <div className="dictionary-editor-form">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddWord();
                }
              }}
              placeholder={`Add a new ${activeTab === "added" ? "word to dictionary" : "word to ignore"}...`}
              className="dictionary-input"
            />
            <button
              className="btn btn-primary"
              onClick={handleAddWord}
              disabled={!newWord.trim()}
            >
              Add
            </button>
            <label className="dictionary-case-toggle">
              <input
                type="checkbox"
                checked={newWordCaseSensitive}
                onChange={(event) => setNewWordCaseSensitive(event.target.checked)}
              />
              Case sensitive
            </label>
          </div>

          <div className="dictionary-editor-list">
            {currentList.length === 0 ? (
              <div className="dictionary-empty">
                No {activeTab === "added" ? "added words" : "ignored words"} yet
              </div>
            ) : (
              <ul className="dictionary-words">
                {currentList.map((entry) => (
                  <li key={entry.word} className="dictionary-word-item">
                    {editingWord === entry.word ? (
                      <input
                        autoFocus
                        className="dictionary-input"
                        value={editingValue}
                        onChange={(event) => setEditingValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleSaveEdit();
                          if (event.key === "Escape") setEditingWord(null);
                        }}
                      />
                    ) : (
                      <span className="dictionary-word-text">{entry.word}</span>
                    )}
                    <div className="dictionary-word-actions">
                      <label className="dictionary-case-toggle">
                        <input
                          type="checkbox"
                          checked={
                            editingWord === entry.word
                              ? editingCaseSensitive
                              : entry.case_sensitive
                          }
                          onChange={(event) => {
                            if (editingWord === entry.word) {
                              setEditingCaseSensitive(event.target.checked);
                            } else {
                              handleCaseSensitivityChange(
                                entry,
                                event.target.checked,
                              );
                            }
                          }}
                        />
                        Case sensitive
                      </label>
                      {editingWord === entry.word ? (
                        <>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={handleSaveEdit}
                            disabled={!editingValue.trim()}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => {
                              setEditingWord(null);
                              setEditingValue("");
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm"
                            onClick={() => {
                              setEditingWord(entry.word);
                              setEditingValue(entry.word);
                              setEditingCaseSensitive(entry.case_sensitive);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveWord(entry.word)}
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
