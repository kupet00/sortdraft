import { useLayoutEffect, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import type { ActiveChapter, ChapterSummary, Project } from "../types";
import * as api from "../api";
import { DroppableBookTarget } from "./DroppableBookTarget";
import { DroppableChapterListEnd } from "./DroppableChapterListEnd";
import { SidebarChapterRow } from "./SidebarChapterRow";

interface PromptRequest {
  title: string;
  label: string;
  defaultValue?: string;
  confirmLabel?: string;
}

interface SidebarProps {
  project: Project;
  activeChapter: ActiveChapter | null;
  onSelectChapter: (bookId: string, chapterId: string) => void;
  onProjectUpdated: (project: Project) => void;
  onOpenOptions: () => void;
  onCloseProject: () => void;
  requestPrompt: (request: PromptRequest) => Promise<string | null>;
  activeDragChapterId: string | null;
  isDraggingScene: boolean;
  isMobile: boolean;
}

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function Sidebar({
  project,
  activeChapter,
  onSelectChapter,
  onProjectUpdated,
  onOpenOptions,
  onCloseProject,
  requestPrompt,
  activeDragChapterId,
  isDraggingScene,
  isMobile,
}: SidebarProps) {
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(
    () => new Set(project.books.map((b) => b.id)),
  );
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const chapterDropEnabled = activeDragChapterId !== null;

  useLayoutEffect(() => {
    if (!isDraggingScene) return;
    setExpandedBooks(new Set(project.books.map((b) => b.id)));
  }, [isDraggingScene, project.books]);

  const toggleBook = (bookId: string) => {
    setExpandedBooks((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  };

  const promptAndCreate = async (
    label: string,
    action: (title: string) => Promise<Project>,
  ) => {
    setError(null);
    setStatus(null);
    const title = await requestPrompt({
      title: `New ${label}`,
      label: `${label} name`,
      confirmLabel: "Create",
    });
    if (!title?.trim()) return;

    try {
      const updated = await action(title.trim());
      onProjectUpdated(updated);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleExportBook = async (bookId: string, bookTitle: string) => {
    setError(null);
    setStatus(null);
    try {
      let outputPath: string | null;
      if (isMobile) {
        const safeTitle = bookTitle.trim().replace(/[/\\?%*:|"<>]/g, "-") || "export";
        outputPath = `${project.path}/${safeTitle}.txt`;
      } else {
        outputPath = await save({
          defaultPath: `${bookTitle}.txt`,
          filters: [{ name: "Text", extensions: ["txt"] }],
        });
      }
      if (!outputPath) return;
      const saved = await api.exportBook(project.path, bookId, outputPath);
      if (isMobile) {
        setStatus(`Exported to ${saved}`);
      }
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <aside className="sidebar project-tree">
      <div className="sidebar-header">
        <div className="sidebar-header-row">
          <h1>{project.name}</h1>
          <div className="sidebar-header-actions">
            <button className="btn btn-sm sidebar-options-btn" onClick={onOpenOptions}>
              Options
            </button>
            <button className="btn btn-sm sidebar-options-btn" onClick={onCloseProject}>
              Close
            </button>
          </div>
        </div>
        <p className="sidebar-hint">
          Drag scenes onto any chapter. Drag chapters to reorder or move between books.
        </p>
      </div>

      {error && <div className="sidebar-error">{error}</div>}
      {status && <div className="sidebar-status">{status}</div>}

      <div className="sidebar-actions">
        <button
          className="btn btn-sm"
          onClick={() =>
            promptAndCreate("book", (title) =>
              api.createBook(project.path, title),
            )
          }
        >
          + Book
        </button>
      </div>

      <nav className="sidebar-nav">
        {project.books.map((book) => (
          <div key={book.id} className="sidebar-book">
            <DroppableBookTarget
              bookId={book.id}
              disabled={!chapterDropEnabled}
            >
              <button
                className="sidebar-book-toggle"
                onClick={() => toggleBook(book.id)}
              >
                {expandedBooks.has(book.id) ? "▾" : "▸"}
              </button>
              <span className="sidebar-book-title">{book.title}</span>
              <button
                className="btn-icon"
                title="Add chapter"
                onClick={() =>
                  promptAndCreate("chapter", (title) =>
                    api.createChapter(project.path, book.id, title),
                  )
                }
              >
                +
              </button>
              <button
                className="btn-icon"
                title="Export book"
                onClick={() => handleExportBook(book.id, book.title)}
              >
                ↓
              </button>
            </DroppableBookTarget>

            {expandedBooks.has(book.id) && (
              <div className="sidebar-chapters">
                {book.chapters.map((chapter: ChapterSummary) => {
                  const isActive =
                    activeChapter?.bookId === book.id &&
                    activeChapter?.chapterId === chapter.id;
                  return (
                    <SidebarChapterRow
                      key={chapter.id}
                      bookId={book.id}
                      chapter={chapter}
                      isActive={isActive}
                      isDragging={activeDragChapterId === chapter.id}
                      onSelect={() => onSelectChapter(book.id, chapter.id)}
                    />
                  );
                })}
                <DroppableChapterListEnd
                  bookId={book.id}
                  disabled={!chapterDropEnabled}
                />
                {book.chapters.length === 0 && (
                  <div className="sidebar-empty">No chapters yet</div>
                )}
              </div>
            )}
          </div>
        ))}

        {project.books.length === 0 && (
          <div className="sidebar-empty">Create a book to get started</div>
        )}
      </nav>
    </aside>
  );
}
