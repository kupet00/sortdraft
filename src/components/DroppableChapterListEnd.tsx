import { useDroppable } from "@dnd-kit/core";

interface DroppableChapterListEndProps {
  bookId: string;
  disabled?: boolean;
}

export function DroppableChapterListEnd({
  bookId,
  disabled = false,
}: DroppableChapterListEndProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `book-chapters-end:${bookId}`,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`sidebar-chapters-end${isOver ? " drop-over" : ""}`}
    />
  );
}
