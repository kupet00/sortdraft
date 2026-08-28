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
  activeNoteId: string | null;
  activeDragChapterId: string | null;
  isDraggingScene: boolean;
  notesRefreshKey: number;
  onSelectChapter: (bookId: string, chapterId: string) => void;
  onSelectNote: (note: NoteSummary | null) => void;
  onProjectUpdated: (project: Project) => void;
  onOpenOptions: () => void;
  onCloseProject: () => void;
  requestPrompt: (request: PromptRequest) => Promise<string | null>;
  isMobile: boolean;
}

export function LeftPanel({
  project,
  activeChapter,
  activeNoteId,
  activeDragChapterId,
  isDraggingScene,
  notesRefreshKey,
  onSelectChapter,
  onSelectNote,
  onProjectUpdated,
  onOpenOptions,
  onCloseProject,
  requestPrompt,
  isMobile,
}: LeftPanelProps) {
  return (
    <div className="left-column">
      <div className="project-panel">
        <Sidebar
          project={project}
          activeChapter={activeChapter}
          onSelectChapter={onSelectChapter}
          requestPrompt={requestPrompt}
          activeDragChapterId={activeDragChapterId}
          isDraggingScene={isDraggingScene}
          onProjectUpdated={onProjectUpdated}
          onOpenOptions={onOpenOptions}
          onCloseProject={onCloseProject}
          isMobile={isMobile}
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
