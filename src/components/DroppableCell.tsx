import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

interface DroppableCellProps {
  id: string;
  children: ReactNode;
}

export function DroppableCell({ id, children }: DroppableCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`corkboard-cell${isOver ? " corkboard-cell-over" : ""}`}
    >
      {children}
    </div>
  );
}
