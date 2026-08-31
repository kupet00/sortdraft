import { useCallback, useEffect, useRef, useState } from "react";
import type { Project, Timeline, TimelineNode } from "../types";
import * as api from "../api";

interface TimelineCanvasProps {
  project: Project;
  requestPrompt: (request: {
    title: string;
    label: string;
    defaultValue?: string;
    confirmLabel?: string;
  }) => Promise<string | null>;
  onOpenScene: (bookId: string, chapterId: string, sceneId: string) => void;
}

interface SceneOption {
  bookId: string;
  chapterId: string;
  sceneId: string;
  label: string;
}

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface ChapterOption {
  bookId: string;
  chapterId: string;
  label: string;
}

const LINE_SNAP_DISTANCE = 28;
const NODE_LINE_OFFSET = 36;
const NODE_MARKER_OFFSET = 90;

function isVerticalLine(node: TimelineNode): boolean {
  return node.orientation === "vertical";
}

function lockedLineIds(node: TimelineNode): string[] {
  return node.line_ids ?? (node.line_id ? [node.line_id] : []);
}

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function TimelineCanvas({
  project,
  requestPrompt,
  onOpenScene,
}: TimelineCanvasProps) {
  const [timeline, setTimeline] = useState<Timeline>({ nodes: [] });
  const [selectedScene, setSelectedScene] = useState("");
  const [nodeToConvert, setNodeToConvert] = useState<TimelineNode | null>(null);
  const [isCreatingScene, setIsCreatingScene] = useState(false);
  const [isCreatingLine, setIsCreatingLine] = useState(false);
  const [convertedLabel, setConvertedLabel] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [lineLabel, setLineLabel] = useState("");
  const [lineColor, setLineColor] = useState("#8b4513");
  const [lineOrientation, setLineOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [snapLineIds, setSnapLineIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<Timeline>({ nodes: [] });
  const viewportRef = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });
  const panRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const draggedNodeRef = useRef<{ id: string; offsetX: number; offsetY: number; moved: boolean } | null>(null);
  const draggedLineRef = useRef<{ id: string; offset: number } | null>(null);
  const [viewport, setViewport] = useState<Viewport>(viewportRef.current);

  const chapterOptions: ChapterOption[] = project.books.flatMap((book) =>
    book.chapters.map((chapter) => ({
      bookId: book.id,
      chapterId: chapter.id,
      label: `${book.title} / ${chapter.title}`,
    })),
  );

  const updateViewport = (next: Viewport) => {
    viewportRef.current = next;
    setViewport(next);
  };

  const loadTimeline = useCallback(async () => {
    try {
      const loaded = await api.getTimeline(project.path);
      timelineRef.current = loaded;
      setTimeline(loaded);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [project.path]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const saveTimeline = async (next: Timeline) => {
    timelineRef.current = next;
    setTimeline(next);
    try {
      await api.saveTimeline(project.path, next);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const getSceneOptions = useCallback(async (): Promise<SceneOption[]> => {
    const chapters = project.books.flatMap((book) =>
      book.chapters.map(async (chapter) => {
        const detail = await api.getChapter(project.path, book.id, chapter.id);
        return detail.scenes.map((scene) => ({
          bookId: book.id,
          chapterId: chapter.id,
          sceneId: scene.id,
          label: `${book.title} / ${chapter.title} / ${scene.title}`,
        }));
      }),
    );
    return (await Promise.all(chapters)).flat();
  }, [project]);

  const [availableScenes, setAvailableScenes] = useState<SceneOption[]>([]);

  useEffect(() => {
    getSceneOptions().then(setAvailableScenes).catch((err) => setError(errorMessage(err)));
  }, [getSceneOptions]);

  const addTextNode = async () => {
    const label = await requestPrompt({
      title: "New Timeline Node",
      label: "Node label",
      confirmLabel: "Add",
    });
    if (!label?.trim()) return;
    await saveTimeline({
      nodes: [...timeline.nodes, { id: crypto.randomUUID(), kind: "text", label: label.trim(), x: 100, y: 100 }],
    });
  };

  const addSceneNode = async () => {
    const scene = availableScenes.find((item) => item.sceneId === selectedScene);
    if (!scene) return;
    await saveTimeline({
      nodes: [...timeline.nodes, {
        id: crypto.randomUUID(), kind: "scene", label: scene.label,
        x: 140, y: 140, book_id: scene.bookId, chapter_id: scene.chapterId, scene_id: scene.sceneId,
      }],
    });
    setSelectedScene("");
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, node: TimelineNode) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { x, y, zoom } = viewportRef.current;
    draggedNodeRef.current = {
      id: node.id,
      offsetX: (event.clientX - rect.left - x) / zoom - node.x,
      offsetY: (event.clientY - rect.top - y) / zoom - node.y,
      moved: false,
    };
    setSnapLineIds([]);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragged = draggedNodeRef.current;
    const canvas = canvasRef.current;
    if (!dragged || !canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const { x: viewportX, y: viewportY, zoom } = viewportRef.current;
    const x = (event.clientX - bounds.left - viewportX) / zoom - dragged.offsetX;
    const y = (event.clientY - bounds.top - viewportY) / zoom - dragged.offsetY;
    dragged.moved = true;
    const next = { nodes: timelineRef.current.nodes.map((node) => node.id === dragged.id ? { ...node, x, y } : node) };
    const movedNode = next.nodes.find((node) => node.id === dragged.id);
    const lines = next.nodes.filter((node) => node.kind === "line");
    const horizontal = lines.filter((line) => !isVerticalLine(line)).sort((first, second) =>
      Math.abs(movedNode!.y + NODE_LINE_OFFSET - first.y) - Math.abs(movedNode!.y + NODE_LINE_OFFSET - second.y),
    )[0];
    const vertical = lines.filter(isVerticalLine).sort((first, second) =>
      Math.abs(movedNode!.x + NODE_MARKER_OFFSET - first.x) - Math.abs(movedNode!.x + NODE_MARKER_OFFSET - second.x),
    )[0];
    setSnapLineIds([
      ...(horizontal && Math.abs(movedNode!.y + NODE_LINE_OFFSET - horizontal.y) <= LINE_SNAP_DISTANCE ? [horizontal.id] : []),
      ...(vertical && Math.abs(movedNode!.x + NODE_MARKER_OFFSET - vertical.x) <= LINE_SNAP_DISTANCE ? [vertical.id] : []),
    ]);
    timelineRef.current = next;
    setTimeline(next);
  };

  const handlePointerUp = async (node: TimelineNode) => {
    const dragged = draggedNodeRef.current;
    draggedNodeRef.current = null;
    setSnapLineIds([]);
    if (!dragged) return;
    if (dragged.moved) {
      const movedNode = timelineRef.current.nodes.find((item) => item.id === node.id);
      const lines = timelineRef.current.nodes.filter((item) => item.kind === "line");
      const horizontal = lines.filter((line) => !isVerticalLine(line)).sort((first, second) =>
        Math.abs(movedNode!.y + NODE_LINE_OFFSET - first.y) - Math.abs(movedNode!.y + NODE_LINE_OFFSET - second.y),
      )[0];
      const vertical = lines.filter(isVerticalLine).sort((first, second) =>
        Math.abs(movedNode!.x + NODE_MARKER_OFFSET - first.x) - Math.abs(movedNode!.x + NODE_MARKER_OFFSET - second.x),
      )[0];
      const lineIds = [
        ...(horizontal && Math.abs(movedNode!.y + NODE_LINE_OFFSET - horizontal.y) <= LINE_SNAP_DISTANCE ? [horizontal.id] : []),
        ...(vertical && Math.abs(movedNode!.x + NODE_MARKER_OFFSET - vertical.x) <= LINE_SNAP_DISTANCE ? [vertical.id] : []),
      ];
      await saveTimeline({
        nodes: timelineRef.current.nodes.map((item) => item.id !== node.id ? item : {
          ...item,
          x: vertical && lineIds.includes(vertical.id) ? vertical.x - NODE_MARKER_OFFSET : item.x,
          y: horizontal && lineIds.includes(horizontal.id) ? horizontal.y - NODE_LINE_OFFSET : item.y,
          line_id: undefined,
          line_ids: lineIds.length ? lineIds : undefined,
        }),
      });
    } else if (node.kind === "scene" && node.book_id && node.chapter_id && node.scene_id) {
      onOpenScene(node.book_id, node.chapter_id, node.scene_id);
    } else if (node.kind === "text") {
      setSelectedChapter(chapterOptions[0]?.chapterId ?? "");
      setConvertedLabel(node.label);
      setNodeToConvert(node);
    }
  };

  const deleteNode = async (id: string) => {
    await saveTimeline({ nodes: timeline.nodes.filter((node) => node.id !== id) });
  };

  const createTimelineScene = async () => {
    const label = convertedLabel.trim();
    const chapter = chapterOptions.find((item) => item.chapterId === selectedChapter);
    if (!chapter || !label) return;

    try {
      const before = await api.getChapter(project.path, chapter.bookId, chapter.chapterId);
      const existingIds = new Set(before.scenes.map((scene) => scene.id));
      const updated = await api.createScene(
        project.path,
        chapter.bookId,
        chapter.chapterId,
        label,
        "",
      );
      const created = updated.scenes.find((scene) => !existingIds.has(scene.id));
      if (!created) throw new Error("The new scene could not be identified");

      await saveTimeline({
        nodes: nodeToConvert
          ? timelineRef.current.nodes.map((node) => node.id === nodeToConvert.id ? {
              ...node,
              kind: "scene",
              label,
              book_id: chapter.bookId,
              chapter_id: chapter.chapterId,
              scene_id: created.id,
            } : node)
          : [...timelineRef.current.nodes, {
              id: crypto.randomUUID(),
              kind: "scene",
              label,
              x: 140,
              y: 140,
              book_id: chapter.bookId,
              chapter_id: chapter.chapterId,
              scene_id: created.id,
            }],
      });
      setAvailableScenes((scenes) => [...scenes, {
        bookId: chapter.bookId,
        chapterId: chapter.chapterId,
        sceneId: created.id,
        label: `${chapter.label} / ${created.title}`,
      }]);
      setNodeToConvert(null);
      setIsCreatingScene(false);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const startCreatingScene = () => {
    setSelectedChapter(chapterOptions[0]?.chapterId ?? "");
    setConvertedLabel("");
    setIsCreatingScene(true);
  };

  const addLine = async () => {
    const label = lineLabel.trim();
    if (!label) return;
    await saveTimeline({
      nodes: [...timelineRef.current.nodes, {
        id: crypto.randomUUID(),
        kind: "line",
        label,
        color: lineColor,
        x: 0,
        y: 200,
        orientation: lineOrientation,
      }],
    });
    setIsCreatingLine(false);
  };

  const startCreatingLine = () => {
    setLineLabel("");
    setLineColor("#8b4513");
    setIsCreatingLine(true);
  };

  const startCreatingMarker = () => {
    setLineLabel("");
    setLineColor("#426b54");
    setLineOrientation("vertical");
    setIsCreatingLine(true);
  };

  const handleLinePointerDown = (event: React.PointerEvent<HTMLDivElement>, line: TimelineNode) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const { x, y, zoom } = viewportRef.current;
    draggedLineRef.current = {
      id: line.id,
      offset: isVerticalLine(line)
        ? (event.clientX - bounds.left - x) / zoom - line.x
        : (event.clientY - bounds.top - y) / zoom - line.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleLinePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragged = draggedLineRef.current;
    const canvas = canvasRef.current;
    if (!dragged || !canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const { x, y, zoom } = viewportRef.current;
    const line = timelineRef.current.nodes.find((node) => node.id === dragged.id);
    if (!line) return;
    const nextPosition = isVerticalLine(line)
      ? (event.clientX - bounds.left - x) / zoom - dragged.offset
      : (event.clientY - bounds.top - y) / zoom - dragged.offset;
    const delta = nextPosition - (isVerticalLine(line) ? line.x : line.y);
    const next = {
      nodes: timelineRef.current.nodes.map((node) => {
        if (node.id === dragged.id) return isVerticalLine(line) ? { ...node, x: nextPosition } : { ...node, y: nextPosition };
        if (lockedLineIds(node).includes(dragged.id)) {
          return isVerticalLine(line) ? { ...node, x: node.x + delta } : { ...node, y: node.y + delta };
        }
        return node;
      }),
    };
    timelineRef.current = next;
    setTimeline(next);
  };

  const handleLinePointerUp = async () => {
    if (!draggedLineRef.current) return;
    draggedLineRef.current = null;
    await saveTimeline(timelineRef.current);
  };

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 2) return;
    panRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    const current = viewportRef.current;
    updateViewport({
      ...current,
      x: current.x + event.clientX - pan.x,
      y: current.y + event.clientY - pan.y,
    });
    panRef.current = { ...pan, x: event.clientX, y: event.clientY };
  };

  const handleCanvasPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (panRef.current?.pointerId === event.pointerId) panRef.current = null;
  };

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const current = viewportRef.current;
    const zoom = Math.min(2.5, Math.max(0.25, current.zoom * (event.deltaY < 0 ? 1.1 : 0.9)));
    const worldX = (event.clientX - bounds.left - current.x) / current.zoom;
    const worldY = (event.clientY - bounds.top - current.y) / current.zoom;
    updateViewport({
      zoom,
      x: event.clientX - bounds.left - worldX * zoom,
      y: event.clientY - bounds.top - worldY * zoom,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  return (
    <section className="timeline">
      <header className="timeline-header">
        <div><p>Story map</p><h2>Timeline</h2></div>
        <div className="timeline-actions">
          <button className="btn" onClick={addTextNode}>Add event</button>
          <button className="btn" onClick={startCreatingLine}>Add timeline</button>
          <button className="btn" onClick={startCreatingMarker}>Add marker</button>
          <button className="btn" onClick={startCreatingScene}>Create scene</button>
          <select value={selectedScene} onChange={(event) => setSelectedScene(event.target.value)} aria-label="Scene to add">
            <option value="">Choose a scene</option>
            {availableScenes.map((scene) => <option key={`${scene.chapterId}-${scene.sceneId}`} value={scene.sceneId}>{scene.label}</option>)}
          </select>
          <button className="btn" onClick={addSceneNode} disabled={!selectedScene}>Add scene</button>
        </div>
      </header>
      {error && <div className="timeline-error">{error}</div>}
      {(nodeToConvert || isCreatingScene) && (
        <div className="dialog-backdrop" onClick={() => { setNodeToConvert(null); setIsCreatingScene(false); }}>
          <div className="dialog" onClick={(event) => event.stopPropagation()}>
            <h3>{nodeToConvert ? "Convert to Scene" : "Create Scene"}</h3>
            <label className="dialog-label">
              Scene title
              <input value={convertedLabel} onChange={(event) => setConvertedLabel(event.target.value)} autoFocus />
            </label>
            <p className="timeline-dialog-copy">The scene is added at the end of the selected chapter.</p>
            <label className="dialog-label">
              Chapter
              <select value={selectedChapter} onChange={(event) => setSelectedChapter(event.target.value)}>
                {chapterOptions.map((chapter) => (
                  <option key={`${chapter.bookId}-${chapter.chapterId}`} value={chapter.chapterId}>{chapter.label}</option>
                ))}
              </select>
            </label>
            {chapterOptions.length === 0 && <p className="timeline-dialog-copy">Create a chapter before converting this node.</p>}
            <div className="dialog-actions">
              <button type="button" className="btn" onClick={() => { setNodeToConvert(null); setIsCreatingScene(false); }}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={createTimelineScene} disabled={!selectedChapter || !convertedLabel.trim()}>Create scene</button>
            </div>
          </div>
        </div>
      )}
      {isCreatingLine && (
        <div className="dialog-backdrop" onClick={() => setIsCreatingLine(false)}>
          <div className="dialog" onClick={(event) => event.stopPropagation()}>
            <h3>{lineOrientation === "vertical" ? "Add Marker" : "Add Timeline"}</h3>
            <label className="dialog-label">
              Label
              <input value={lineLabel} onChange={(event) => setLineLabel(event.target.value)} autoFocus />
            </label>
            <label className="dialog-label timeline-color-label">
              Color
              <input type="color" value={lineColor} onChange={(event) => setLineColor(event.target.value)} />
            </label>
            <div className="dialog-actions">
              <button type="button" className="btn" onClick={() => setIsCreatingLine(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={addLine} disabled={!lineLabel.trim()}>{lineOrientation === "vertical" ? "Add marker" : "Add timeline"}</button>
            </div>
          </div>
        </div>
      )}
      <div
        className="timeline-canvas"
        ref={canvasRef}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
      >
        {timeline.nodes.length === 0 && <p className="timeline-empty">Add a note or a scene, then arrange it freely.</p>}
        <div className="timeline-world" style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` }}>
          {timeline.nodes.filter((node) => node.kind === "line").map((line) => (
            <div key={line.id} className={`timeline-line${isVerticalLine(line) ? " vertical" : ""}${snapLineIds.includes(line.id) ? " snap-target" : ""}`} style={{ left: isVerticalLine(line) ? line.x : undefined, top: isVerticalLine(line) ? undefined : line.y, "--timeline-line-color": line.color ?? "#8b4513" } as React.CSSProperties}>
              <div className="timeline-line-handle" onPointerDown={(event) => handleLinePointerDown(event, line)} onPointerMove={handleLinePointerMove} onPointerUp={handleLinePointerUp}>
                <span>{line.label}</span>
                <button title="Delete line" aria-label={`Delete ${line.label}`} onClick={() => deleteNode(line.id)}>×</button>
              </div>
            </div>
          ))}
          {timeline.nodes.filter((node) => node.kind !== "line").map((node) => (
            <div key={node.id} className={`timeline-node ${node.kind}${lockedLineIds(node).length ? " locked" : ""}${draggedNodeRef.current?.id === node.id && snapLineIds.length ? " snap-ready" : ""}`} style={{ left: node.x, top: node.y }} onPointerDown={(event) => handlePointerDown(event, node)} onPointerMove={handlePointerMove} onPointerUp={() => handlePointerUp(node)}>
              <span>{node.label}</span>
              <button title="Delete node" aria-label={`Delete ${node.label}`} onClick={() => deleteNode(node.id)}>×</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}