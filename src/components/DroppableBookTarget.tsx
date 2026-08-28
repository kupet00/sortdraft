import { useDroppable } from "@dnd-kit/core";

interface DroppableBookTargetProps {
  bookId: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function DroppableBookTarget({
  bookId,
  disabled = false,
  children,
}: DroppableBookTargetProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `book-target:${bookId}`,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`sidebar-book-header${isOver ? " book-drop-over" : ""}`}
    >
      {children}
    </div>
  );
}
