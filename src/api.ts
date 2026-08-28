import { invoke } from "@tauri-apps/api/core";
import type {
  ChapterDetail,
  CreateNoteResult,
  LocalProject,
  MoveChapterResult,
  NoteSummary,
  Project,
  RuntimeInfo,
  ScenePosition,
  TagDefinition,
} from "./types";

export async function createProject(
  path: string,
  name: string,
): Promise<Project> {
  return invoke("create_project_cmd", { req: { path, name } });
}

export async function openProject(path: string): Promise<Project> {
  return invoke("open_project_cmd", { path });
}

export async function getProject(path: string): Promise<Project> {
  return invoke("get_project_cmd", { path });
}

export async function createBook(
  projectPath: string,
  title: string,
): Promise<Project> {
  return invoke("create_book_cmd", {
    req: { project_path: projectPath, title },
  });
}

export async function createChapter(
  projectPath: string,
  bookId: string,
  title: string,
): Promise<Project> {
  return invoke("create_chapter_cmd", {
    req: { project_path: projectPath, book_id: bookId, title },
  });
}

export async function createScene(
  projectPath: string,
  bookId: string,
  chapterId: string,
  title: string,
  description: string,
): Promise<ChapterDetail> {
  return invoke("create_scene_cmd", {
    req: {
      project_path: projectPath,
      book_id: bookId,
      chapter_id: chapterId,
      title,
      description,
    },
  });
}

export async function getChapter(
  projectPath: string,
  bookId: string,
  chapterId: string,
): Promise<ChapterDetail> {
  return invoke("get_chapter_cmd", {
    req: { project_path: projectPath, book_id: bookId, chapter_id: chapterId },
  });
}

export async function getSceneContent(
  projectPath: string,
  bookId: string,
  chapterId: string,
  sceneId: string,
): Promise<string> {
  return invoke("get_scene_content_cmd", {
    req: {
      project_path: projectPath,
      book_id: bookId,
      chapter_id: chapterId,
      scene_id: sceneId,
    },
  });
}

export async function updateSceneContent(
  projectPath: string,
  bookId: string,
  chapterId: string,
  sceneId: string,
  content: string,
): Promise<void> {
  return invoke("update_scene_content_cmd", {
    req: {
      project_path: projectPath,
      book_id: bookId,
      chapter_id: chapterId,
      scene_id: sceneId,
      content,
    },
  });
}

export async function updateSceneMeta(
  projectPath: string,
  bookId: string,
  chapterId: string,
  sceneId: string,
  title: string,
  description: string,
  tags?: string[],
): Promise<ChapterDetail> {
  return invoke("update_scene_meta_cmd", {
    req: {
      project_path: projectPath,
      book_id: bookId,
      chapter_id: chapterId,
      scene_id: sceneId,
      title,
      description,
      tags: tags ?? null,
    },
  });
}

export async function updateSceneTags(
  projectPath: string,
  bookId: string,
  chapterId: string,
  sceneId: string,
  tags: string[],
): Promise<ChapterDetail> {
  return invoke("update_scene_tags_cmd", {
    req: {
      project_path: projectPath,
      book_id: bookId,
      chapter_id: chapterId,
      scene_id: sceneId,
      tags,
    },
  });
}

export async function listTags(projectPath: string): Promise<TagDefinition[]> {
  return invoke("list_tags_cmd", { req: { project_path: projectPath } });
}

export async function createTag(
  projectPath: string,
  name: string,
  color: string,
): Promise<TagDefinition[]> {
  return invoke("create_tag_cmd", {
    req: { project_path: projectPath, name, color },
  });
}

export async function updateTag(
  projectPath: string,
  tagId: string,
  name: string,
  color: string,
): Promise<TagDefinition[]> {
  return invoke("update_tag_cmd", {
    req: { project_path: projectPath, tag_id: tagId, name, color },
  });
}

export async function deleteTag(
  projectPath: string,
  tagId: string,
): Promise<TagDefinition[]> {
  return invoke("delete_tag_cmd", {
    req: { project_path: projectPath, tag_id: tagId },
  });
}

export async function reorderScenes(
  projectPath: string,
  bookId: string,
  chapterId: string,
  scenes: ScenePosition[],
): Promise<ChapterDetail> {
  return invoke("reorder_scenes_cmd", {
    req: {
      project_path: projectPath,
      book_id: bookId,
      chapter_id: chapterId,
      scenes,
    },
  });
}

export async function moveScene(
  projectPath: string,
  fromBookId: string,
  fromChapterId: string,
  toBookId: string,
  toChapterId: string,
  sceneId: string,
  col: number,
  row: number,
): Promise<Project> {
  return invoke("move_scene_cmd", {
    req: {
      project_path: projectPath,
      from_book_id: fromBookId,
      from_chapter_id: fromChapterId,
      to_book_id: toBookId,
      to_chapter_id: toChapterId,
      scene_id: sceneId,
      col,
      row,
    },
  });
}

export async function deleteScene(
  projectPath: string,
  bookId: string,
  chapterId: string,
  sceneId: string,
): Promise<ChapterDetail> {
  return invoke("delete_scene_cmd", {
    req: {
      project_path: projectPath,
      book_id: bookId,
      chapter_id: chapterId,
      scene_id: sceneId,
    },
  });
}

export async function exportBook(
  projectPath: string,
  bookId: string,
  outputPath: string,
): Promise<string> {
  return invoke("export_book_cmd", {
    req: { project_path: projectPath, book_id: bookId, output_path: outputPath },
  });
}

export async function renameBook(
  projectPath: string,
  bookId: string,
  title: string,
): Promise<Project> {
  return invoke("rename_book_cmd", {
    req: { project_path: projectPath, book_id: bookId, title },
  });
}

export async function renameChapter(
  projectPath: string,
  bookId: string,
  chapterId: string,
  title: string,
): Promise<Project> {
  return invoke("rename_chapter_cmd", {
    req: {
      project_path: projectPath,
      book_id: bookId,
      chapter_id: chapterId,
      title,
    },
  });
}

export async function reorderChapters(
  projectPath: string,
  bookId: string,
  chapterIds: string[],
): Promise<Project> {
  return invoke("reorder_chapters_cmd", {
    req: {
      project_path: projectPath,
      book_id: bookId,
      chapter_ids: chapterIds,
    },
  });
}

export async function moveChapter(
  projectPath: string,
  fromBookId: string,
  toBookId: string,
  chapterId: string,
  toIndex: number,
): Promise<MoveChapterResult> {
  return invoke("move_chapter_cmd", {
    req: {
      project_path: projectPath,
      from_book_id: fromBookId,
      to_book_id: toBookId,
      chapter_id: chapterId,
      to_index: toIndex,
    },
  });
}

export async function listNotes(projectPath: string): Promise<NoteSummary[]> {
  return invoke("list_notes_cmd", { req: { project_path: projectPath } });
}

export async function createNote(
  projectPath: string,
  title: string,
): Promise<CreateNoteResult> {
  return invoke("create_note_cmd", {
    req: { project_path: projectPath, title },
  });
}

export async function getNoteContent(
  projectPath: string,
  noteId: string,
): Promise<string> {
  return invoke("get_note_content_cmd", {
    req: { project_path: projectPath, note_id: noteId },
  });
}

export async function updateNoteContent(
  projectPath: string,
  noteId: string,
  content: string,
): Promise<void> {
  return invoke("update_note_content_cmd", {
    req: { project_path: projectPath, note_id: noteId, content },
  });
}

export async function deleteNote(
  projectPath: string,
  noteId: string,
): Promise<NoteSummary[]> {
  return invoke("delete_note_cmd", {
    req: { project_path: projectPath, note_id: noteId },
  });
}

export async function getRuntimeInfo(): Promise<RuntimeInfo> {
  return invoke("runtime_info_cmd");
}

export async function listLocalProjects(): Promise<LocalProject[]> {
  return invoke("list_local_projects_cmd");
}
