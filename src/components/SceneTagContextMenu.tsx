import { useEffect, useRef } from "react";
import type { TagDefinition } from "../types";
import { tagTextColor } from "../utils/tagColors";

interface SceneTagContextMenuProps {
  x: number;
  y: number;
  tags: TagDefinition[];
  selectedIds: string[];
  onToggle: (tagId: string) => void;
  onManageTags: () => void;
  onClose: () => void;
}

export function SceneTagContextMenu({
  x,
  y,
  tags,
  selectedIds,
  onToggle,
  onManageTags,
  onClose,
}: SceneTagContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleScroll = () => onClose();

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    menu.style.left = `${Math.min(x, maxX)}px`;
    menu.style.top = `${Math.min(y, maxY)}px`;
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="scene-tag-menu"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="scene-tag-menu-title">Tags</div>
      {tags.length === 0 ? (
        <div className="scene-tag-menu-empty">No tags yet</div>
      ) : (
        <ul className="scene-tag-menu-list">
          {tags.map((tag) => {
            const selected = selectedIds.includes(tag.id);
            return (
              <li key={tag.id}>
                <button
                  type="button"
                  className={`scene-tag-menu-item${selected ? " selected" : ""}`}
                  onClick={() => onToggle(tag.id)}
                >
                  <span
                    className="scene-tag-menu-check"
                    aria-hidden
                  >
                    {selected ? "✓" : ""}
                  </span>
                  <span
                    className="scene-tag-menu-swatch"
                    style={{ backgroundColor: tag.color }}
                    aria-hidden
                  />
                  <span
                    className="scene-tag-menu-label"
                    style={
                      selected
                        ? {
                            backgroundColor: tag.color,
                            color: tagTextColor(tag.color),
                          }
                        : undefined
                    }
                  >
                    {tag.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        className="scene-tag-menu-manage"
        onClick={() => {
          onClose();
          onManageTags();
        }}
      >
        Manage tags…
      </button>
    </div>
  );
}
