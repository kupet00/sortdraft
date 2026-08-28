import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../api";

interface NoteEditorProps {
  projectPath: string;
  noteId: string;
  noteTitle: string;
  onClose: () => void;
  onContentSaved: () => void;
}

export function NoteEditor({
  projectPath,
  noteId,
  noteTitle,
  onClose,
  onContentSaved,
}: NoteEditorProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getNoteContent(projectPath, noteId).then((text) => {
      if (!cancelled) {
        setContent(text);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectPath, noteId]);

  const saveContent = useCallback(
    (text: string) => {
      api.updateNoteContent(projectPath, noteId, text).then(onContentSaved);
    },
    [projectPath, noteId, onContentSaved],
  );

  const handleChange = (text: string) => {
    setContent(text);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveContent(text), 500);
  };

  return (
    <div className="note-editor">
      <div className="note-editor-header">
        <button className="btn btn-ghost" onClick={onClose}>
          ← Back
        </button>
        <h2>{noteTitle}</h2>
      </div>
      {loading ? (
        <div className="note-editor-loading">Loading…</div>
      ) : (
        <textarea
          className="note-content"
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Write your note here…"
          autoFocus
        />
      )}
    </div>
  );
}
