import { useCallback, useEffect, useState } from "react";
import type { NoteSummary } from "../types";
import * as api from "../api";

interface PromptRequest {
  title: string;
  label: string;
  defaultValue?: string;
  confirmLabel?: string;
}

interface NotesPanelProps {
  projectPath: string;
  activeNoteId: string | null;
  onSelectNote: (note: NoteSummary | null) => void;
  requestPrompt: (request: PromptRequest) => Promise<string | null>;
  refreshKey?: number;
}

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function NotesPanel({
  projectPath,
  activeNoteId,
  onSelectNote,
  requestPrompt,
  refreshKey = 0,
}: NotesPanelProps) {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshNotes = useCallback(async () => {
    try {
      const list = await api.listNotes(projectPath);
      setNotes(list);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [projectPath]);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes, refreshKey]);

  const handleCreate = async () => {
    setError(null);
    const title = await requestPrompt({
      title: "New Note",
      label: "Note name",
      defaultValue: "Untitled note",
      confirmLabel: "Create",
    });
    if (!title?.trim()) return;

    try {
      const result = await api.createNote(projectPath, title.trim());
      setNotes(result.notes);
      onSelectNote(result.notes.find((n) => n.id === result.created_id) ?? null);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleDelete = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    try {
      const list = await api.deleteNote(projectPath, noteId);
      setNotes(list);
      if (activeNoteId === noteId) onSelectNote(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="notes-panel">
      <div className="notes-panel-header">
        <h2>Notes</h2>
        <button className="btn btn-sm" onClick={handleCreate}>
          +
        </button>
      </div>
      <p className="notes-panel-hint">Not included in book exports</p>
      {error && <div className="notes-panel-error">{error}</div>}
      <ul className="notes-list">
        {notes.map((note) => (
          <li key={note.id}>
            <button
              type="button"
              className={`notes-list-item${activeNoteId === note.id ? " active" : ""}`}
              onClick={() => onSelectNote(note)}
            >
              <span className="notes-list-title">{note.title}</span>
              <span
                className="btn-icon notes-delete"
                title="Delete note"
                role="button"
                tabIndex={0}
                onClick={(e) => handleDelete(note.id, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleDelete(note.id, e as unknown as React.MouseEvent);
                  }
                }}
              >
                ×
              </span>
            </button>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="notes-empty">No notes yet</li>
        )}
      </ul>
    </div>
  );
}
