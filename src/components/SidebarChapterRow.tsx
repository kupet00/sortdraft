import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ChapterSummary } from "../types";

interface SidebarChapterRowProps {
  bookId: string;
  chapter: ChapterSummary;
  isActive: boolean;
  isDragging: boolean;
  onSelect: () => void;
}

export function SidebarChapterRow({
  bookId,
  chapter,
  isActive,
  isDragging,
  onSelect,
}: SidebarChapterRowProps) {
  const dragId = `chapter-drag:${bookId}:${chapter.id}`;
  const dropId = `chapter-target:${bookId}:${chapter.id}`;

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
  } = useDraggable({
    id: dragId,
    data: { type: "chapter", bookId, chapterId: chapter.id, title: chapter.title },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: dropId });

  const setRef = (node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setRef}
      style={style}
      className={`sidebar-chapter${isActive ? " active" : ""}${isOver ? " drop-over" : ""}`}
      {...listeners}
      {...attributes}
    >
      <button className="sidebar-chapter-btn" onClick={onSelect}>
        <span className="sidebar-chapter-grip" aria-hidden>
          ⠿
        </span>
        {chapter.title}
        <span className="scene-count">{chapter.scene_count}</span>
      </button>
    </div>
  );
}
