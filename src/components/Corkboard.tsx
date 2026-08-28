import { useEffect, useRef, useState } from "react";
import type { ChapterDetail, SceneSummary, TagDefinition } from "../types";
import * as api from "../api";
import { DroppableCell } from "./DroppableCell";
import { SceneCard } from "./SceneCard";
import { TagsDialog } from "./TagsDialog";

export const MIN_CELL_WIDTH = 180;
export const CELL_HEIGHT = 160;
export const GRID_GAP = 16;

interface CorkboardProps {
  projectPath: string;
  chapter: ChapterDetail;
  tags: TagDefinition[];
  onTagsChange: (tags: TagDefinition[]) => void;
  onChapterUpdated: (chapter: ChapterDetail) => void;
  onSceneClick: (scene: SceneSummary) => void;
  activeDragId: string | null;
  onGridColsChange: (cols: number) => void;
}

export function computeGridCols(width: number): number {
  return Math.max(1, Math.floor((width + GRID_GAP) / (MIN_CELL_WIDTH + GRID_GAP)));
}

export function gridPosition(
  index: number,
  cols: number,
): { col: number; row: number } {
  return { col: index % cols, row: Math.floor(index / cols) };
}

export function positionToIndex(col: number, row: number, cols: number): number {
  return row * cols + col;
}

export function sortScenes(scenes: SceneSummary[]): SceneSummary[] {
  return [...scenes].sort((a, b) =>
    a.row !== b.row ? a.row - b.row : a.col - b.col,
  );
}

export function Corkboard({
  projectPath,
  chapter,
  tags,
  onTagsChange,
  onChapterUpdated,
  onSceneClick,
  activeDragId,
  onGridColsChange,
}: CorkboardProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [gridRows, setGridRows] = useState(3);
  const gridRef = useRef<HTMLDivElement>(null);

  const sortedScenes = sortScenes(chapter.scenes);

  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    const updateLayout = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      const cols = computeGridCols(width);
      const contentRows = Math.max(1, Math.ceil(sortedScenes.length / cols));
      const minRows = Math.max(
        1,
        Math.floor((height + GRID_GAP) / (CELL_HEIGHT + GRID_GAP)),
      );
      const rows = Math.max(contentRows, minRows);

      setGridCols(cols);
      setGridRows(rows);
      onGridColsChange(cols);
    };

    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    observer.observe(element);
    return () => observer.disconnect();
  }, [sortedScenes.length, onGridColsChange]);

  const sceneAt = (col: number, row: number) => {
    const index = row * gridCols + col;
    return sortedScenes[index] ?? null;
  };

  const handleAddScene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const result = await api.createScene(
      projectPath,
      chapter.book_id,
      chapter.id,
      newTitle.trim(),
      newDescription.trim(),
    );
    onChapterUpdated(result);
    setNewTitle("");
    setNewDescription("");
    setShowAddForm(false);
  };

  return (
    <div className="corkboard">
      <div className="corkboard-header">
        <div>
          <div className="corkboard-book">{chapter.book_title}</div>
          <h2>{chapter.title}</h2>
        </div>
        <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Scene"}
        </button>
      </div>

      {showTagsDialog && (
        <TagsDialog
          projectPath={projectPath}
          tags={tags}
          onTagsChange={async (updated) => {
            onTagsChange(updated);
            const detail = await api.getChapter(
              projectPath,
              chapter.book_id,
              chapter.id,
            );
            onChapterUpdated(detail);
          }}
          onClose={() => setShowTagsDialog(false)}
        />
      )}

      {showAddForm && (
        <form className="add-scene-form" onSubmit={handleAddScene}>
          <input
            placeholder="Scene title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <input
            placeholder="Short description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>
      )}

      <div className="corkboard-body" ref={gridRef}>
        <div
          className="corkboard-grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(${MIN_CELL_WIDTH}px, 1fr))`,
            gridTemplateRows: `repeat(${gridRows}, minmax(${CELL_HEIGHT}px, 1fr))`,
            gap: GRID_GAP,
          }}
        >
          {Array.from({ length: gridRows * gridCols }).map((_, i) => {
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const scene = sceneAt(col, row);
            return (
              <DroppableCell key={`cell:${col}:${row}`} id={`cell:${col}:${row}`}>
                {scene && (
                  <SceneCard
                    scene={scene}
                    projectPath={projectPath}
                    bookId={chapter.book_id}
                    chapterId={chapter.id}
                    tags={tags}
                    onMetaUpdated={() =>
                      api
                        .getChapter(projectPath, chapter.book_id, chapter.id)
                        .then(onChapterUpdated)
                    }
                    onOpenEditor={() => onSceneClick(scene)}
                    onManageTags={() => setShowTagsDialog(true)}
                    isDragging={activeDragId === scene.id}
                  />
                )}
              </DroppableCell>
            );
          })}
        </div>
      </div>
    </div>
  );
}
