import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "../settings/SettingsContext";
import type { ActiveScene } from "../types";
import { MIN_PAGE_WIDTH } from "../settings/types";
import {
  activeSentenceIndex,
  splitIntoSentences,
} from "../utils/sentences";
import { measureSentenceCenter } from "../utils/caretPosition";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isAppFullscreen, setAppFullscreen } from "../utils/windowFullscreen";
import * as api from "../api";

const EDITOR_PADDING = "1.5rem";

function maxPageWidthForWindow(bodyWidth: number): number {
  const usable = Math.max(200, (bodyWidth > 0 ? bodyWidth : window.innerWidth) - 8);
  const windowCap = Math.floor(window.innerWidth * (2 / 3));
  const preferred = Math.max(MIN_PAGE_WIDTH, Math.min(windowCap, usable));
  return Math.min(preferred, usable);
}

interface SceneEditorProps {
  projectPath: string;
  activeScene: ActiveScene;
  sceneTitle: string;
  sceneDescription: string;
  onMetaChange: () => void;
  onClose: () => void;
}

export function SceneEditor({
  projectPath,
  activeScene,
  sceneTitle,
  sceneDescription,
  onMetaChange,
  onClose,
}: SceneEditorProps) {
  const { settings, setTypewriterMode, setEditorFontSize, setPageWidth } =
    useSettings();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState(sceneTitle);
  const [description, setDescription] = useState(sceneDescription);
  const [loading, setLoading] = useState(true);
  const [caret, setCaret] = useState(0);
  const [maxPageWidth, setMaxPageWidth] = useState(() =>
    maxPageWidthForWindow(0),
  );
  const [focusMode, setFocusMode] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const typewriterMode = settings.typewriterMode;
  const pageWidth = settings.pageWidth;
  const effectivePageWidth = Math.min(pageWidth, maxPageWidth);
  const sentences = useMemo(() => splitIntoSentences(content), [content]);
  const activeIndex = activeSentenceIndex(sentences, caret);

  useEffect(() => {
    setTitle(sceneTitle);
    setDescription(sceneDescription);
  }, [sceneTitle, sceneDescription]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getSceneContent(
        projectPath,
        activeScene.bookId,
        activeScene.chapterId,
        activeScene.sceneId,
      )
      .then((text) => {
        if (!cancelled) {
          setContent(text);
          setCaret(text.length);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [projectPath, activeScene]);

  useEffect(() => {
    setFocusMode(false);
  }, [projectPath, activeScene]);

  useEffect(() => {
    void setAppFullscreen(focusMode);
    return () => {
      void setAppFullscreen(false);
    };
  }, [focusMode]);

  useEffect(() => {
    if (!focusMode || !isTauri()) return;

    let cancelled = false;
    let unlisten: (() => void) | undefined;

    void getCurrentWindow()
      .onResized(async () => {
        if (cancelled) return;
        if (!(await isAppFullscreen())) setFocusMode(false);
      })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {
        // Window events are not available on mobile.
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [focusMode]);

  useEffect(() => {
    if (!focusMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setFocusMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusMode]);

  useEffect(() => {
    const updateMaxWidth = () => {
      const bodyWidth = bodyRef.current?.clientWidth ?? 0;
      setMaxPageWidth(maxPageWidthForWindow(bodyWidth));
    };

    updateMaxWidth();
    window.addEventListener("resize", updateMaxWidth);

    const body = bodyRef.current;
    const observer = body ? new ResizeObserver(updateMaxWidth) : null;
    if (body && observer) observer.observe(body);

    return () => {
      window.removeEventListener("resize", updateMaxWidth);
      observer?.disconnect();
    };
  }, [loading]);

  const syncScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const backdrop = backdropRef.current;
    if (!textarea || !backdrop) return;
    backdrop.scrollTop = textarea.scrollTop;
    backdrop.scrollLeft = textarea.scrollLeft;
  }, []);

  const centerActiveSentence = useCallback(() => {
    if (!typewriterMode) return;

    const textarea = textareaRef.current;
    const backdrop = backdropRef.current;
    const body = bodyRef.current;
    if (!textarea || !backdrop || !body) return;

    const span = sentences[activeIndex];
    if (!span) return;

    const halfView = body.clientHeight / 2;
    const edgePadding = `${halfView}px`;

    textarea.style.paddingTop = edgePadding;
    textarea.style.paddingBottom = edgePadding;
    backdrop.style.paddingTop = edgePadding;
    backdrop.style.paddingBottom = edgePadding;

    const sentenceCenter = measureSentenceCenter(textarea, content, span);
    textarea.scrollTop = Math.max(0, sentenceCenter - halfView);
    syncScroll();
  }, [typewriterMode, sentences, activeIndex, content, syncScroll]);

  useEffect(() => {
    if (!focusMode) return;
    textareaRef.current?.focus();
    if (typewriterMode) {
      requestAnimationFrame(() => centerActiveSentence());
    }
  }, [focusMode, typewriterMode, centerActiveSentence]);

  const resetTypewriterPadding = useCallback(() => {
    const textarea = textareaRef.current;
    const backdrop = backdropRef.current;
    if (!textarea || !backdrop) return;

    textarea.style.paddingTop = EDITOR_PADDING;
    textarea.style.paddingBottom = EDITOR_PADDING;
    backdrop.style.paddingTop = EDITOR_PADDING;
    backdrop.style.paddingBottom = EDITOR_PADDING;
  }, []);

  useEffect(() => {
    if (!typewriterMode || loading) {
      resetTypewriterPadding();
      return;
    }

    const frame = requestAnimationFrame(() => centerActiveSentence());
    return () => cancelAnimationFrame(frame);
  }, [
    typewriterMode,
    loading,
    activeIndex,
    content,
    centerActiveSentence,
    resetTypewriterPadding,
    pageWidth,
    maxPageWidth,
    settings.editorFontSize,
    focusMode,
  ]);

  useEffect(() => {
    if (!typewriterMode || loading) return;

    const body = bodyRef.current;
    if (!body) return;

    const observer = new ResizeObserver(() => centerActiveSentence());
    observer.observe(body);
    return () => observer.disconnect();
  }, [typewriterMode, loading, centerActiveSentence, pageWidth, maxPageWidth]);

  const updateCaret = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    setCaret(textarea.selectionStart);
    if (typewriterMode) {
      requestAnimationFrame(() => centerActiveSentence());
    } else {
      syncScroll();
    }
  }, [typewriterMode, centerActiveSentence, syncScroll]);

  const saveContent = useCallback(
    (text: string) => {
      api.updateSceneContent(
        projectPath,
        activeScene.bookId,
        activeScene.chapterId,
        activeScene.sceneId,
        text,
      );
    },
    [projectPath, activeScene],
  );

  const saveMeta = useCallback(
    (t: string, d: string) => {
      api
        .updateSceneMeta(
          projectPath,
          activeScene.bookId,
          activeScene.chapterId,
          activeScene.sceneId,
          t,
          d,
        )
        .then(() => onMetaChange());
    },
    [projectPath, activeScene, onMetaChange],
  );

  const handleContentChange = (text: string) => {
    setContent(text);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveContent(text), 500);
    requestAnimationFrame(updateCaret);
  };

  const handleTitleChange = (t: string) => {
    setTitle(t);
    if (metaTimer.current) clearTimeout(metaTimer.current);
    metaTimer.current = setTimeout(() => saveMeta(t, description), 500);
  };

  const handleDescriptionChange = (d: string) => {
    setDescription(d);
    if (metaTimer.current) clearTimeout(metaTimer.current);
    metaTimer.current = setTimeout(() => saveMeta(title, d), 500);
  };

  const wordCount = countWords(content);

  const bottomBar = (
    <EditorBottomBar
      wordCount={wordCount}
      maxPageWidth={maxPageWidth}
      effectivePageWidth={effectivePageWidth}
      editorFontSize={settings.editorFontSize}
      onPageWidthChange={setPageWidth}
      onEditorFontSizeChange={setEditorFontSize}
    />
  );

  return (
    <div className={`scene-editor${focusMode ? " focus-mode" : ""}`}>
      {!focusMode && (
        <div className="scene-editor-header">
          <button className="btn btn-ghost scene-editor-back" onClick={onClose}>
            ← Back to corkboard
          </button>
          <div className="scene-editor-header-meta">
            <input
              className="scene-title-input"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Scene title"
            />
            <input
              className="scene-description-input"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Short description"
            />
          </div>
          <div className="scene-editor-header-actions">
            <button
              type="button"
              className={`btn btn-sm scene-typewriter-toggle${typewriterMode ? " active" : ""}`}
              onClick={() => setTypewriterMode(!typewriterMode)}
            >
              Typewriter
            </button>
            <button
              type="button"
              className={`btn btn-sm scene-focus-toggle${focusMode ? " active" : ""}`}
              onClick={() => setFocusMode(true)}
            >
              Focus
            </button>
          </div>
        </div>
      )}
      {loading ? (
        <div className="scene-editor-loading">Loading…</div>
      ) : (
        <>
          <div className="scene-editor-body" ref={bodyRef}>
            <div className="scene-editor-page-column">
              <div
                className="scene-editor-page"
                style={{ maxWidth: `${effectivePageWidth}px` }}
              >
                <div className="scene-editor-page-inner">
                  {typewriterMode && (
                    <div
                      ref={backdropRef}
                      className="scene-editor-backdrop"
                      aria-hidden
                    >
                      {sentences.map((span, index) => (
                        <span
                          key={`${span.start}-${span.end}-${index}`}
                          className={
                            index === activeIndex
                              ? "sentence-active"
                              : "sentence-dimmed"
                          }
                        >
                          {content.slice(span.start, span.end)}
                        </span>
                      ))}
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    className={`scene-content${typewriterMode ? " typewriter-mode" : ""}`}
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    onSelect={updateCaret}
                    onKeyUp={updateCaret}
                    onClick={updateCaret}
                    onScroll={syncScroll}
                    placeholder="Write your scene here…"
                    spellCheck
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </div>
          {!focusMode && bottomBar}
          {focusMode && (
            <div className="scene-editor-focus-dock" aria-label="Editor controls">
              {bottomBar}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface EditorBottomBarProps {
  wordCount: number;
  maxPageWidth: number;
  effectivePageWidth: number;
  editorFontSize: number;
  onPageWidthChange: (width: number) => void;
  onEditorFontSizeChange: (size: number) => void;
}

function EditorBottomBar({
  wordCount,
  maxPageWidth,
  effectivePageWidth,
  editorFontSize,
  onPageWidthChange,
  onEditorFontSizeChange,
}: EditorBottomBarProps) {
  return (
    <div className="scene-editor-footer">
      <div className="scene-editor-footer-controls">
        <label className="scene-editor-slider">
          <span>Page width</span>
          <input
            type="range"
            min={MIN_PAGE_WIDTH}
            max={maxPageWidth}
            value={effectivePageWidth}
            onChange={(e) => onPageWidthChange(Number(e.target.value))}
          />
          <span className="scene-editor-slider-value">
            {effectivePageWidth}px
          </span>
        </label>
        <label className="scene-editor-slider">
          <span>Font size</span>
          <input
            type="range"
            min={12}
            max={32}
            value={editorFontSize}
            onChange={(e) => onEditorFontSizeChange(Number(e.target.value))}
          />
          <span className="scene-editor-slider-value">{editorFontSize}px</span>
        </label>
      </div>
      <div className="scene-editor-footer-stats">
        {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
      </div>
    </div>
  );
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
