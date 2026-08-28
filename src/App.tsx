import { useCallback, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type {
  ActiveChapter,
  ActiveScene,
  ChapterDetail,
  NoteSummary,
  Project,
  SceneSummary,
  TagDefinition,
} from "./types";
import * as api from "./api";
import {
  Corkboard,
  gridPosition,
  positionToIndex,
  sortScenes,
} from "./components/Corkboard";
import { sceneAwareCollisionDetection } from "./utils/dndCollision";
import { OptionsDialog } from "./components/OptionsDialog";
import { SceneCardPreview } from "./components/SceneCard";
import { PromptDialog } from "./components/PromptDialog";
import { LeftPanel } from "./components/LeftPanel";
import { NoteEditor } from "./components/NoteEditor";
import { SceneEditor } from "./components/SceneEditor";
import { WelcomeScreen } from "./components/WelcomeScreen";
import "./App.css";

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

interface PromptRequest {
  title: string;
  label: string;
  defaultValue?: string;
  confirmLabel?: string;
}

interface DraggedChapter {
  bookId: string;
  chapterId: string;
  title: string;
}

function parseChapterDrag(
  id: string,
): { bookId: string; chapterId: string } | null {
  if (!id.startsWith("chapter-drag:")) return null;
  const [, bookId, chapterId] = id.split(":");
  if (!bookId || !chapterId) return null;
  return { bookId, chapterId };
}

function chapterDropTarget(
  overId: string,
  project: Project,
): { bookId: string; index: number } | null {
  if (overId.startsWith("book-target:") || overId.startsWith("book-chapters-end:")) {
    const bookId = overId.split(":")[1];
    const book = project.books.find((b) => b.id === bookId);
    if (!book) return null;
    return { bookId, index: book.chapters.length };
  }

  if (overId.startsWith("chapter-target:")) {
    const [, bookId, chapterId] = overId.split(":");
    const book = project.books.find((b) => b.id === bookId);
    if (!book) return null;
    const index = book.chapters.findIndex((c) => c.id === chapterId);
    return { bookId, index: index >= 0 ? index : book.chapters.length };
  }

  return null;
}

function App() {
  const [project, setProject] = useState<Project | null>(null);
  const [tags, setTags] = useState<TagDefinition[]>([]);
  const [activeChapter, setActiveChapter] = useState<ActiveChapter | null>(
    null,
  );
  const [chapterDetail, setChapterDetail] = useState<ChapterDetail | null>(
    null,
  );
  const [activeScene, setActiveScene] = useState<ActiveScene | null>(null);
  const [activeDragScene, setActiveDragScene] = useState<SceneSummary | null>(
    null,
  );
  const [activeDragChapter, setActiveDragChapter] =
    useState<DraggedChapter | null>(null);
  const [activeNote, setActiveNote] = useState<NoteSummary | null>(null);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);
  const [corkboardGridCols, setCorkboardGridCols] = useState(4);
  const handleGridColsChange = useCallback((cols: number) => {
    setCorkboardGridCols(cols);
  }, []);
  const [welcomeError, setWelcomeError] = useState<string | null>(null);
  const [welcomeLoading, setWelcomeLoading] = useState(false);
  const [createParentPath, setCreateParentPath] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [promptRequest, setPromptRequest] = useState<PromptRequest | null>(
    null,
  );
  const promptResolveRef = useRef<((value: string | null) => void) | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const requestPrompt = useCallback(
    (request: PromptRequest): Promise<string | null> =>
      new Promise((resolve) => {
        promptResolveRef.current = resolve;
        setPromptRequest(request);
      }),
    [],
  );

  const closePrompt = (value: string | null) => {
    promptResolveRef.current?.(value);
    promptResolveRef.current = null;
    setPromptRequest(null);
  };

  const loadTags = useCallback(async (projectPath: string) => {
    const loaded = await api.listTags(projectPath);
    setTags(loaded);
  }, []);

  const loadChapter = useCallback(
    async (bookId: string, chapterId: string) => {
      if (!project) return;
      const detail = await api.getChapter(project.path, bookId, chapterId);
      setChapterDetail(detail);
      setActiveChapter({ bookId, chapterId });
      setActiveScene(null);
      setActiveNote(null);
    },
    [project],
  );

  const selectNote = useCallback((note: NoteSummary | null) => {
    setActiveNote(note);
    if (note) {
      setActiveChapter(null);
      setChapterDetail(null);
      setActiveScene(null);
    }
  }, []);

  const refreshProject = useCallback(async () => {
    if (!project) return;
    const updated = await api.getProject(project.path);
    setProject(updated);
    if (activeChapter) {
      const detail = await api.getChapter(
        project.path,
        activeChapter.bookId,
        activeChapter.chapterId,
      );
      setChapterDetail(detail);
    }
  }, [project, activeChapter]);

  const handleCreateProject = async () => {
    setWelcomeError(null);
    if (!isTauri()) {
      setWelcomeError("Run the desktop app with: npm run tauri dev");
      return;
    }

    try {
      const parent = await open({
        directory: true,
        multiple: false,
        title: "Choose where to create your project",
      });
      if (!parent) return;

      const parentPath = Array.isArray(parent) ? parent[0] : parent;
      if (!parentPath) return;

      setCreateParentPath(parentPath);
    } catch (error) {
      setWelcomeError(errorMessage(error));
    }
  };

  const finishCreateProject = async (name: string) => {
    if (!createParentPath) return;

    setWelcomeLoading(true);
    setWelcomeError(null);
    setCreateParentPath(null);

    try {
      const safeName = name.trim().replace(/[/\\?%*:|"<>]/g, "-");
      const path = `${createParentPath}/${safeName}`;
      const created = await api.createProject(path, name.trim());
      setProject(created);
      await loadTags(created.path);
    } catch (error) {
      setWelcomeError(errorMessage(error));
    } finally {
      setWelcomeLoading(false);
    }
  };

  const handleOpenProject = async () => {
    setWelcomeError(null);
    if (!isTauri()) {
      setWelcomeError("Run the desktop app with: npm run tauri dev");
      return;
    }

    setWelcomeLoading(true);
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Open a Sortdraft project folder",
      });
      if (!selected) return;

      const projectPath = Array.isArray(selected) ? selected[0] : selected;
      if (!projectPath) return;

      const opened = await api.openProject(projectPath);
      setProject(opened);
      await loadTags(opened.path);
    } catch (error) {
      setWelcomeError(errorMessage(error));
    } finally {
      setWelcomeLoading(false);
    }
  };

  const handleSceneClick = (scene: SceneSummary) => {
    if (!activeChapter) return;
    setActiveScene({
      bookId: activeChapter.bookId,
      chapterId: activeChapter.chapterId,
      sceneId: scene.id,
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);

    if (activeId.startsWith("chapter-drag:")) {
      const parsed = parseChapterDrag(activeId);
      if (!parsed) return;
      const book = project?.books.find((b) => b.id === parsed.bookId);
      const chapter = book?.chapters.find((c) => c.id === parsed.chapterId);
      if (chapter) {
        setActiveDragChapter({
          bookId: parsed.bookId,
          chapterId: parsed.chapterId,
          title: chapter.title,
        });
      }
      return;
    }

    const scene = chapterDetail?.scenes.find((s) => s.id === event.active.id);
    if (scene) setActiveDragScene(scene);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;

    if (activeId.startsWith("chapter-drag:")) {
      setActiveDragChapter(null);
      if (!project || !overId) return;

      const from = parseChapterDrag(activeId);
      const target = chapterDropTarget(overId, project);
      if (!from || !target) return;

      const fromBook = project.books.find((b) => b.id === from.bookId);
      if (!fromBook) return;

      const fromIndex = fromBook.chapters.findIndex((c) => c.id === from.chapterId);
      if (fromIndex < 0) return;

      if (from.bookId === target.bookId && fromIndex === target.index) return;
      if (
        from.bookId === target.bookId &&
        fromIndex < target.index &&
        target.index === fromIndex + 1
      ) {
        return;
      }

      try {
        const result = await api.moveChapter(
          project.path,
          from.bookId,
          target.bookId,
          from.chapterId,
          target.index,
        );
        setProject(result.project);

        if (
          activeChapter?.bookId === from.bookId &&
          activeChapter.chapterId === from.chapterId
        ) {
          setActiveChapter({
            bookId: target.bookId,
            chapterId: result.chapter_id,
          });
          const detail = await api.getChapter(
            project.path,
            target.bookId,
            result.chapter_id,
          );
          setChapterDetail(detail);
        }
      } catch (error) {
        console.error(errorMessage(error));
      }
      return;
    }

    setActiveDragScene(null);
    if (!project || !activeChapter || !chapterDetail || !overId) return;

    const sceneId = activeId;
    const scene = chapterDetail.scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    if (overId.startsWith("chapter-target:")) {
      const [, toBookId, toChapterId] = overId.split(":");
      if (
        toBookId !== activeChapter.bookId ||
        toChapterId !== activeChapter.chapterId
      ) {
        try {
          const targetChapter = await api.getChapter(
            project.path,
            toBookId,
            toChapterId,
          );
          const { col, row } = gridPosition(
            targetChapter.scenes.length,
            corkboardGridCols,
          );
          await api.moveScene(
            project.path,
            activeChapter.bookId,
            activeChapter.chapterId,
            toBookId,
            toChapterId,
            sceneId,
            col,
            row,
          );
          await refreshProject();
        } catch (error) {
          console.error(errorMessage(error));
        }
      }
      return;
    }

    if (overId.startsWith("cell:")) {
      const [, colStr, rowStr] = overId.split(":");
      const newCol = parseInt(colStr, 10);
      const newRow = parseInt(rowStr, 10);

      const sorted = sortScenes(chapterDetail.scenes);
      const fromIndex = sorted.findIndex((s) => s.id === sceneId);
      const toIndex = positionToIndex(newCol, newRow, corkboardGridCols);
      if (fromIndex === -1) return;

      const reordered = [...sorted];
      const [moved] = reordered.splice(fromIndex, 1);
      const clampedIndex = Math.min(toIndex, reordered.length);
      reordered.splice(clampedIndex, 0, moved);

      const updated = reordered.map((s, i) => {
        const pos = gridPosition(i, corkboardGridCols);
        return { ...s, col: pos.col, row: pos.row };
      });

      try {
        const result = await api.reorderScenes(
          project.path,
          activeChapter.bookId,
          activeChapter.chapterId,
          updated.map((s) => ({ id: s.id, col: s.col, row: s.row })),
        );
        setChapterDetail(result);
      } catch (error) {
        console.error(errorMessage(error));
      }
    }
  };

  const activeSceneMeta = activeScene
    ? chapterDetail?.scenes.find((s) => s.id === activeScene.sceneId)
    : null;

  if (!project) {
    return (
      <>
        <WelcomeScreen
          onOpen={handleOpenProject}
          onCreate={handleCreateProject}
          onOpenOptions={() => setShowOptions(true)}
          loading={welcomeLoading}
          error={welcomeError}
        />
        {createParentPath && (
          <PromptDialog
            title="New Project"
            label="Project name"
            defaultValue="My Novel"
            confirmLabel="Create"
            onConfirm={finishCreateProject}
            onCancel={() => setCreateParentPath(null)}
          />
        )}
        {promptRequest && (
          <PromptDialog
            title={promptRequest.title}
            label={promptRequest.label}
            defaultValue={promptRequest.defaultValue}
            confirmLabel={promptRequest.confirmLabel}
            onConfirm={(value) => closePrompt(value)}
            onCancel={() => closePrompt(null)}
          />
        )}
        {showOptions && <OptionsDialog onClose={() => setShowOptions(false)} />}
      </>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={sceneAwareCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="app">
          <LeftPanel
            project={project}
            activeChapter={activeChapter}
            activeNoteId={activeNote?.id ?? null}
            activeDragChapterId={activeDragChapter?.chapterId ?? null}
            isDraggingScene={activeDragScene !== null}
            notesRefreshKey={notesRefreshKey}
            onSelectChapter={loadChapter}
            onSelectNote={selectNote}
            requestPrompt={requestPrompt}
            onOpenOptions={() => setShowOptions(true)}
            onProjectUpdated={(p) => {
              setProject(p);
              if (activeChapter) {
                api
                  .getChapter(
                    p.path,
                    activeChapter.bookId,
                    activeChapter.chapterId,
                  )
                  .then(setChapterDetail);
              }
            }}
          />

          <main className="main">
            {!activeChapter && !activeNote && (
              <div className="empty-state">
                Select a chapter or note to begin
              </div>
            )}

            {activeChapter && chapterDetail && !activeScene && !activeNote && (
              <Corkboard
                projectPath={project.path}
                chapter={chapterDetail}
                tags={tags}
                onTagsChange={setTags}
                onChapterUpdated={setChapterDetail}
                onSceneClick={handleSceneClick}
                activeDragId={activeDragScene?.id ?? null}
                onGridColsChange={handleGridColsChange}
              />
            )}

            {activeScene && activeSceneMeta && !activeNote && (
              <SceneEditor
                projectPath={project.path}
                activeScene={activeScene}
                sceneTitle={activeSceneMeta.title}
                sceneDescription={activeSceneMeta.description}
                onMetaChange={async () => {
                  if (activeChapter) {
                    const detail = await api.getChapter(
                      project.path,
                      activeChapter.bookId,
                      activeChapter.chapterId,
                    );
                    setChapterDetail(detail);
                  }
                }}
                onClose={() => setActiveScene(null)}
              />
            )}

            {activeNote && (
              <NoteEditor
                projectPath={project.path}
                noteId={activeNote.id}
                noteTitle={activeNote.title}
                onClose={() => selectNote(null)}
                onContentSaved={() => setNotesRefreshKey((k) => k + 1)}
              />
            )}
          </main>
        </div>

        <DragOverlay>
          {activeDragScene && (
            <SceneCardPreview scene={activeDragScene} tags={tags} />
          )}
          {activeDragChapter && (
            <div className="sidebar-chapter sidebar-chapter-overlay">
              <span className="sidebar-chapter-grip">⠿</span>
              {activeDragChapter.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {promptRequest && (
        <PromptDialog
          title={promptRequest.title}
          label={promptRequest.label}
          defaultValue={promptRequest.defaultValue}
          confirmLabel={promptRequest.confirmLabel}
          onConfirm={(value) => closePrompt(value)}
          onCancel={() => closePrompt(null)}
        />
      )}

      {showOptions && <OptionsDialog onClose={() => setShowOptions(false)} />}
    </>
  );
}

export default App;
