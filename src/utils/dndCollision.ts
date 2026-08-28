import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from "@dnd-kit/core";

function isChapterDrag(activeId: string): boolean {
  return activeId.startsWith("chapter-drag:");
}

function isBookChapterDropTarget(id: string): boolean {
  return id.startsWith("book-target:") || id.startsWith("book-chapters-end:");
}

export const sceneAwareCollisionDetection: CollisionDetection = (args) => {
  const activeId = String(args.active.id);
  const droppableContainers = isChapterDrag(activeId)
    ? args.droppableContainers
    : args.droppableContainers.filter(
        (container) => !isBookChapterDropTarget(String(container.id)),
      );

  const filtered = { ...args, droppableContainers };

  return (
    pointerWithin(filtered) ??
    rectIntersection(filtered) ??
    closestCenter(filtered)
  );
};

export function isSceneDrag(activeId: string): boolean {
  return !isChapterDrag(activeId);
}
