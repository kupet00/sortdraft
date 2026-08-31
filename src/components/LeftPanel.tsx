import type { ActiveChapter, NoteSummary, Project } from "../types";
import { NotesPanel } from "./NotesPanel";
import { Sidebar } from "./Sidebar";

interface PromptRequest {
  title: string;
  label: string;
  defaultValue?: string;
  confirmLabel?: string;
}

interface LeftPanelProps {
  project: Project;
  activeChapter: ActiveChapter | null;
  isTimelineActive: boolean;
  activeNoteId: string | null;
  activeDragChapterId: string | null;
  isDraggingScene: boolean;
  notesRefreshKey: number;
  onSelectChapter: (bookId: string, chapterId: string) => void;
  onSelectTimeline: () => void;
  onSelectNote: (note: NoteSummary | null) => void;
  onProjectUpdated: (project: Project) => void;
  onOpenOptions: () => void;
  requestPrompt: (request: PromptRequest) => Promise<string | null>;
  isDictionaryActive: boolean;
  onSelectDictionary: () => void;
}

export function LeftPanel({
  project,
  activeChapter,
  isTimelineActive,
  activeNoteId,
  activeDragChapterId,
  isDraggingScene,
  notesRefreshKey,
  onSelectChapter,
  onSelectTimeline,
  onSelectNote,
  onProjectUpdated,
  onOpenOptions,
  requestPrompt,
  isDictionaryActive,
  onSelectDictionary,
}: LeftPanelProps) {
  return (
    <div className="left-column">
      <div className="project-panel">
        <Sidebar
          project={project}
          activeChapter={activeChapter}
          isTimelineActive={isTimelineActive}
          onSelectChapter={onSelectChapter}
          onSelectTimeline={onSelectTimeline}
          requestPrompt={requestPrompt}
          activeDragChapterId={activeDragChapterId}
          isDraggingScene={isDraggingScene}
          onProjectUpdated={onProjectUpdated}
          onOpenOptions={onOpenOptions}
                  isDictionaryActive={isDictionaryActive}
                  onSelectDictionary={onSelectDictionary}
        />
      </div>
      <NotesPanel
        projectPath={project.path}
        activeNoteId={activeNoteId}
        onSelectNote={onSelectNote}
        requestPrompt={requestPrompt}
        refreshKey={notesRefreshKey}
      />
    </div>
  );
}
