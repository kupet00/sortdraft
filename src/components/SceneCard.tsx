import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import type { SceneSummary, TagDefinition } from "../types";
import * as api from "../api";
import { SceneTagContextMenu } from "./SceneTagContextMenu";
import { TagPills } from "./TagPills";

interface SceneCardProps {
  scene: SceneSummary;
  projectPath: string;
  bookId: string;
  chapterId: string;
  tags: TagDefinition[];
  onMetaUpdated: () => void;
  onOpenEditor: () => void;
  onManageTags: () => void;
  isDragging?: boolean;
}

function TextFileIcon() {
  return (
    <svg
      className="scene-card-file-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M8 3h6l4 4v14H8V3z" />
      <path d="M14 3v4h4" />
      <path d="M10 13h6M10 17h4" strokeLinecap="round" />
    </svg>
  );
}

export function SceneCard({
  scene,
  projectPath,
  bookId,
  chapterId,
  tags,
  onMetaUpdated,
  onOpenEditor,
  onManageTags,
  isDragging,
}: SceneCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(scene.title);
  const [description, setDescription] = useState(scene.description);
  const [tagMenu, setTagMenu] = useState<{ x: number; y: number } | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: scene.id,
    data: {
      type: "scene",
      scene,
    },
  });

  useEffect(() => {
    setTitle(scene.title);
    setDescription(scene.description);
  }, [scene.title, scene.description]);

  useEffect(() => {
    if (editing) titleRef.current?.focus();
  }, [editing]);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const saveMeta = async (nextTitle: string, nextDescription: string) => {
    if (!nextTitle.trim()) return;
    await api.updateSceneMeta(
      projectPath,
      bookId,
      chapterId,
      scene.id,
      nextTitle.trim(),
      nextDescription.trim(),
    );
    onMetaUpdated();
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };

  const finishEditing = async () => {
    if (!editing) return;
    setEditing(false);
    if (!title.trim()) {
      setTitle(scene.title);
      setDescription(scene.description);
      return;
    }
    if (title.trim() !== scene.title || description !== scene.description) {
      await saveMeta(title, description);
    }
  };

  const handleHeaderBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (headerRef.current?.contains(e.relatedTarget as Node)) return;
    void finishEditing();
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void finishEditing();
    }
    if (e.key === "Escape") {
      setTitle(scene.title);
      setDescription(scene.description);
      setEditing(false);
    }
  };

  const openEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenEditor();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTagMenu({ x: e.clientX, y: e.clientY });
  };

  const toggleTag = async (tagId: string) => {
    const current = scene.tags ?? [];
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    await api.updateSceneTags(
      projectPath,
      bookId,
      chapterId,
      scene.id,
      next,
    );
    onMetaUpdated();
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="scene-card"
        onContextMenu={handleContextMenu}
      >
        <div className="scene-card-top">
          <div
            ref={headerRef}
            className={`scene-card-header${editing ? " editing" : ""}`}
            onClick={!editing ? startEditing : undefined}
            onBlur={editing ? handleHeaderBlur : undefined}
            onKeyDown={editing ? handleHeaderKeyDown : undefined}
          >
            {editing ? (
              <>
                <input
                  ref={titleRef}
                  className="scene-card-edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Scene title"
                />
                <input
                  className="scene-card-edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description"
                />
              </>
            ) : (
              <>
                <div className="scene-card-title">{scene.title}</div>
                <div className="scene-card-description">
                  {scene.description || "Add description…"}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            className="scene-card-drag"
            aria-label="Drag scene"
            {...listeners}
            {...attributes}
          >
            ⠿
          </button>
        </div>
        {tags.length > 0 && (scene.tags ?? []).length > 0 && (
          <TagPills tags={tags} selectedIds={scene.tags ?? []} />
        )}
        <button
          type="button"
          className="scene-card-file"
          onClick={openEditor}
          aria-label="Open scene"
        >
          <TextFileIcon />
          <span>Open scene</span>
        </button>
      </div>

      {tagMenu && (
        <SceneTagContextMenu
          x={tagMenu.x}
          y={tagMenu.y}
          tags={tags}
          selectedIds={scene.tags ?? []}
          onToggle={toggleTag}
          onManageTags={onManageTags}
          onClose={() => setTagMenu(null)}
        />
      )}
    </>
  );
}

export function SceneCardPreview({
  scene,
  tags = [],
}: {
  scene: SceneSummary;
  tags?: TagDefinition[];
}) {
  return (
    <div className="scene-card scene-card-overlay">
      <div className="scene-card-top">
        <div className="scene-card-header">
          <div className="scene-card-title">{scene.title}</div>
          {scene.description && (
            <div className="scene-card-description">{scene.description}</div>
          )}
        </div>
      </div>
      {tags.length > 0 && (scene.tags ?? []).length > 0 && (
        <TagPills tags={tags} selectedIds={scene.tags ?? []} />
      )}
      <div className="scene-card-file preview">
        <TextFileIcon />
      </div>
    </div>
  );
}
