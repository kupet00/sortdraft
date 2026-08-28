import { useEffect, useState } from "react";
import type { TagDefinition } from "../types";
import * as api from "../api";
import { defaultTagColor } from "../utils/tagColors";

interface TagsDialogProps {
  projectPath: string;
  tags: TagDefinition[];
  onTagsChange: (tags: TagDefinition[]) => void;
  onClose: () => void;
}

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function TagsDialog({
  projectPath,
  tags,
  onTagsChange,
  onClose,
}: TagsDialogProps) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(defaultTagColor(tags.length));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setBusy(true);
    setError(null);
    try {
      const updated = await api.createTag(projectPath, name, newColor);
      onTagsChange(updated);
      setNewName("");
      setNewColor(defaultTagColor(updated.length));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (tag: TagDefinition, name: string, color: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed === tag.name && color === tag.color) return;

    setBusy(true);
    setError(null);
    try {
      const updated = await api.updateTag(projectPath, tag.id, trimmed, color);
      onTagsChange(updated);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (tagId: string) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await api.deleteTag(projectPath, tagId);
      onTagsChange(updated);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog tags-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="options-header">
          <h3>Tags</h3>
          <button className="btn btn-ghost options-close" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="tags-dialog-hint">
          Tags appear on scene cards for organisation. They are not included in book exports.
        </p>

        {error && <div className="dialog-error">{error}</div>}

        <div className="tags-list">
          {tags.length === 0 && (
            <p className="tags-empty">No tags yet. Create one below.</p>
          )}
          {tags.map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              disabled={busy}
              onSave={handleUpdate}
              onDelete={() => handleDelete(tag.id)}
            />
          ))}
        </div>

        <form className="tags-add-form" onSubmit={handleCreate}>
          <input
            placeholder="New tag name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={busy}
          />
          <input
            type="color"
            className="tags-color-input"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            disabled={busy}
            aria-label="Tag colour"
          />
          <button type="submit" className="btn btn-primary" disabled={busy || !newName.trim()}>
            Add tag
          </button>
        </form>
      </div>
    </div>
  );
}

interface TagRowProps {
  tag: TagDefinition;
  disabled: boolean;
  onSave: (tag: TagDefinition, name: string, color: string) => void;
  onDelete: () => void;
}

function TagRow({ tag, disabled, onSave, onDelete }: TagRowProps) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);

  useEffect(() => {
    setName(tag.name);
    setColor(tag.color);
  }, [tag.name, tag.color]);

  return (
    <div className="tags-row">
      <span
        className="tags-row-swatch"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <input
        className="tags-row-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => onSave(tag, name, color)}
        disabled={disabled}
      />
      <input
        type="color"
        className="tags-color-input"
        value={color}
        onChange={(e) => {
          const next = e.target.value;
          setColor(next);
          onSave(tag, name, next);
        }}
        disabled={disabled}
        aria-label={`Colour for ${tag.name}`}
      />
      <button
        type="button"
        className="btn btn-ghost tags-row-delete"
        onClick={onDelete}
        disabled={disabled}
        aria-label={`Delete ${tag.name}`}
      >
        Delete
      </button>
    </div>
  );
}
