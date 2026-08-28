mod notes;
mod platform;
mod project;
mod tags;

use notes::{
    create_note, delete_note, get_note_content, list_notes, update_note_content, CreateNoteRequest,
    CreateNoteResult, DeleteNoteRequest, ListNotesRequest, NoteContentRequest, NoteSummary,
    UpdateNoteContentRequest,
};
use project::{
    create_book, create_chapter, create_project, create_scene, delete_scene, export_book,
    get_chapter, get_project, get_scene_content, move_chapter, move_scene, open_project,
    rename_book, rename_chapter, rename_scene, reorder_chapters, reorder_scenes,
    update_scene_content, update_scene_meta, CreateBookRequest, CreateChapterRequest,
    CreateProjectRequest, CreateSceneRequest, DeleteSceneRequest, ExportBookRequest,
    GetChapterRequest, GetSceneContentRequest, MoveChapterRequest, MoveChapterResult,
    MoveSceneRequest, Project, ChapterDetail, RenameBookRequest, RenameChapterRequest,
    RenameSceneRequest, ReorderChaptersRequest, ReorderScenesRequest, UpdateSceneContentRequest,
    UpdateSceneMetaRequest,
};
use platform::{LocalProject, RuntimeInfo};
use tags::{
    create_tag, delete_tag, list_tags, update_scene_tags, update_tag, CreateTagRequest,
    DeleteTagRequest, ListTagsRequest, TagDefinition, UpdateSceneTagsRequest, UpdateTagRequest,
};
use tauri::AppHandle;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            create_project_cmd,
            open_project_cmd,
            get_project_cmd,
            create_book_cmd,
            create_chapter_cmd,
            create_scene_cmd,
            get_chapter_cmd,
            get_scene_content_cmd,
            update_scene_content_cmd,
            update_scene_meta_cmd,
            reorder_scenes_cmd,
            move_scene_cmd,
            delete_scene_cmd,
            export_book_cmd,
            rename_book_cmd,
            rename_chapter_cmd,
            rename_scene_cmd,
            reorder_chapters_cmd,
            move_chapter_cmd,
            list_notes_cmd,
            create_note_cmd,
            get_note_content_cmd,
            update_note_content_cmd,
            delete_note_cmd,
            list_tags_cmd,
            create_tag_cmd,
            update_tag_cmd,
            delete_tag_cmd,
            update_scene_tags_cmd,
            runtime_info_cmd,
            list_local_projects_cmd,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn create_project_cmd(req: CreateProjectRequest) -> Result<Project, String> {
    create_project(req)
}

#[tauri::command]
fn open_project_cmd(path: String) -> Result<Project, String> {
    open_project(&path)
}

#[tauri::command]
fn get_project_cmd(path: String) -> Result<Project, String> {
    get_project(&path)
}

#[tauri::command]
fn create_book_cmd(req: CreateBookRequest) -> Result<Project, String> {
    create_book(req)
}

#[tauri::command]
fn create_chapter_cmd(req: CreateChapterRequest) -> Result<Project, String> {
    create_chapter(req)
}

#[tauri::command]
fn create_scene_cmd(req: CreateSceneRequest) -> Result<ChapterDetail, String> {
    create_scene(req)
}

#[tauri::command]
fn get_chapter_cmd(req: GetChapterRequest) -> Result<ChapterDetail, String> {
    get_chapter(req)
}

#[tauri::command]
fn get_scene_content_cmd(req: GetSceneContentRequest) -> Result<String, String> {
    get_scene_content(req)
}

#[tauri::command]
fn update_scene_content_cmd(req: UpdateSceneContentRequest) -> Result<(), String> {
    update_scene_content(req)
}

#[tauri::command]
fn update_scene_meta_cmd(req: UpdateSceneMetaRequest) -> Result<ChapterDetail, String> {
    update_scene_meta(req)
}

#[tauri::command]
fn reorder_scenes_cmd(req: ReorderScenesRequest) -> Result<ChapterDetail, String> {
    reorder_scenes(req)
}

#[tauri::command]
fn move_scene_cmd(req: MoveSceneRequest) -> Result<Project, String> {
    move_scene(req)
}

#[tauri::command]
fn delete_scene_cmd(req: DeleteSceneRequest) -> Result<ChapterDetail, String> {
    delete_scene(req)
}

#[tauri::command]
fn export_book_cmd(req: ExportBookRequest) -> Result<String, String> {
    export_book(req)
}

#[tauri::command]
fn rename_book_cmd(req: RenameBookRequest) -> Result<Project, String> {
    rename_book(req)
}

#[tauri::command]
fn rename_chapter_cmd(req: RenameChapterRequest) -> Result<Project, String> {
    rename_chapter(req)
}

#[tauri::command]
fn rename_scene_cmd(req: RenameSceneRequest) -> Result<ChapterDetail, String> {
    rename_scene(req)
}

#[tauri::command]
fn reorder_chapters_cmd(req: ReorderChaptersRequest) -> Result<Project, String> {
    reorder_chapters(req)
}

#[tauri::command]
fn move_chapter_cmd(req: MoveChapterRequest) -> Result<MoveChapterResult, String> {
    move_chapter(req)
}

#[tauri::command]
fn list_notes_cmd(req: ListNotesRequest) -> Result<Vec<NoteSummary>, String> {
    list_notes(&req.project_path)
}

#[tauri::command]
fn create_note_cmd(req: CreateNoteRequest) -> Result<CreateNoteResult, String> {
    create_note(req)
}

#[tauri::command]
fn get_note_content_cmd(req: NoteContentRequest) -> Result<String, String> {
    get_note_content(req)
}

#[tauri::command]
fn update_note_content_cmd(req: UpdateNoteContentRequest) -> Result<(), String> {
    update_note_content(req)
}

#[tauri::command]
fn delete_note_cmd(req: DeleteNoteRequest) -> Result<Vec<NoteSummary>, String> {
    delete_note(req)
}

#[tauri::command]
fn list_tags_cmd(req: ListTagsRequest) -> Result<Vec<TagDefinition>, String> {
    list_tags(&req.project_path)
}

#[tauri::command]
fn create_tag_cmd(req: CreateTagRequest) -> Result<Vec<TagDefinition>, String> {
    create_tag(req)
}

#[tauri::command]
fn update_tag_cmd(req: UpdateTagRequest) -> Result<Vec<TagDefinition>, String> {
    update_tag(req)
}

#[tauri::command]
fn delete_tag_cmd(req: DeleteTagRequest) -> Result<Vec<TagDefinition>, String> {
    delete_tag(req)
}

#[tauri::command]
fn update_scene_tags_cmd(req: UpdateSceneTagsRequest) -> Result<ChapterDetail, String> {
    update_scene_tags(req)
}

#[tauri::command]
fn runtime_info_cmd(app: AppHandle) -> Result<RuntimeInfo, String> {
    platform::runtime_info(&app)
}

#[tauri::command]
fn list_local_projects_cmd(app: AppHandle) -> Result<Vec<LocalProject>, String> {
    platform::list_local_projects(&app)
}
