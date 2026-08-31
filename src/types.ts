export interface SceneSummary {
  id: string;
  title: string;
  description: string;
  col: number;
  row: number;
  tags: string[];
}

export interface TagDefinition {
  id: string;
  name: string;
  color: string;
}

export interface ChapterSummary {
  id: string;
  title: string;
  scene_count: number;
}

export interface BookSummary {
  id: string;
  title: string;
  chapters: ChapterSummary[];
}

export interface Project {
  path: string;
  name: string;
  books: BookSummary[];
}

export interface ChapterDetail {
  book_id: string;
  book_title: string;
  id: string;
  title: string;
  scenes: SceneSummary[];
}

export interface ScenePosition {
  id: string;
  col: number;
  row: number;
}

export interface ActiveScene {
  bookId: string;
  chapterId: string;
  sceneId: string;
}

export interface MoveChapterResult {
  project: Project;
  chapter_id: string;
}

export interface ActiveChapter {
  bookId: string;
  chapterId: string;
}

export interface NoteSummary {
  id: string;
  title: string;
}

export interface CreateNoteResult {
  notes: NoteSummary[];
  created_id: string;
}

export type TimelineNodeKind = "text" | "scene" | "line";

export interface TimelineNode {
  id: string;
  kind: TimelineNodeKind;
  label: string;
  x: number;
  y: number;
  book_id?: string;
  chapter_id?: string;
  scene_id?: string;
  color?: string;
  line_id?: string;
  line_ids?: string[];
  orientation?: "horizontal" | "vertical";
}

export interface Timeline {
  nodes: TimelineNode[];
}

export interface DictionaryWord {
  word: string;
  case_sensitive: boolean;
}

export interface ProjectDictionary {
  ignored: DictionaryWord[];
  added: DictionaryWord[];
}
