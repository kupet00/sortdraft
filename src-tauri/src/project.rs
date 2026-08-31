use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;

// ── Data types ──────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMeta {
    pub name: String,
    pub version: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BookMeta {
    pub id: String,
    pub title: String,
    #[serde(default)]
    pub chapter_order: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SceneMeta {
    pub id: String,
    pub title: String,
    pub description: String,
    pub col: u32,
    pub row: u32,
    #[serde(default)]
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChapterMeta {
    pub id: String,
    pub title: String,
    pub scenes: Vec<SceneMeta>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SceneSummary {
    pub id: String,
    pub title: String,
    pub description: String,
    pub col: u32,
    pub row: u32,
    #[serde(default)]
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChapterSummary {
    pub id: String,
    pub title: String,
    pub scene_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BookSummary {
    pub id: String,
    pub title: String,
    pub chapters: Vec<ChapterSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub path: String,
    pub name: String,
    pub books: Vec<BookSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChapterDetail {
    pub book_id: String,
    pub book_title: String,
    pub id: String,
    pub title: String,
    pub scenes: Vec<SceneSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimelineNodeKind {
    Text,
    Scene,
    Line,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineNode {
    pub id: String,
    pub kind: TimelineNodeKind,
    pub label: String,
    pub x: f64,
    pub y: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub book_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub chapter_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scene_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub orientation: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Timeline {
    #[serde(default)]
    pub nodes: Vec<TimelineNode>,
}

// ── Request types ─────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateProjectRequest {
    pub path: String,
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateBookRequest {
    pub project_path: String,
    pub title: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateChapterRequest {
    pub project_path: String,
    pub book_id: String,
    pub title: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateSceneRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_id: String,
    pub title: String,
    pub description: String,
}

#[derive(Debug, Deserialize)]
pub struct GetChapterRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_id: String,
}

#[derive(Debug, Deserialize)]
pub struct GetSceneContentRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_id: String,
    pub scene_id: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSceneContentRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_id: String,
    pub scene_id: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSceneMetaRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_id: String,
    pub scene_id: String,
    pub title: String,
    pub description: String,
    #[serde(default)]
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct ScenePosition {
    pub id: String,
    pub col: u32,
    pub row: u32,
}

#[derive(Debug, Deserialize)]
pub struct ReorderScenesRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_id: String,
    pub scenes: Vec<ScenePosition>,
}

#[derive(Debug, Deserialize)]
pub struct MoveSceneRequest {
    pub project_path: String,
    pub from_book_id: String,
    pub from_chapter_id: String,
    pub to_book_id: String,
    pub to_chapter_id: String,
    pub scene_id: String,
    pub col: u32,
    pub row: u32,
}

#[derive(Debug, Deserialize)]
pub struct DeleteSceneRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_id: String,
    pub scene_id: String,
}

#[derive(Debug, Deserialize)]
pub struct ExportBookRequest {
    pub project_path: String,
    pub book_id: String,
    pub output_path: String,
}

#[derive(Debug, Deserialize)]
pub struct RenameBookRequest {
    pub project_path: String,
    pub book_id: String,
    pub title: String,
}

#[derive(Debug, Deserialize)]
pub struct RenameChapterRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_id: String,
    pub title: String,
}

#[derive(Debug, Deserialize)]
pub struct RenameSceneRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_id: String,
    pub scene_id: String,
    pub title: String,
}

#[derive(Debug, Deserialize)]
pub struct ReorderChaptersRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct MoveChapterRequest {
    pub project_path: String,
    pub from_book_id: String,
    pub to_book_id: String,
    pub chapter_id: String,
    pub to_index: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct MoveChapterResult {
    pub project: Project,
    pub chapter_id: String,
}

#[derive(Debug, Deserialize)]
pub struct TimelineRequest {
    pub project_path: String,
}

#[derive(Debug, Deserialize)]
pub struct SaveTimelineRequest {
    pub project_path: String,
    pub timeline: Timeline,
}

// ── Path helpers ──────────────────────────────────────────────────────────────

fn books_dir(project: &Path) -> PathBuf {
    project.join("books")
}

fn book_dir(project: &Path, book_id: &str) -> PathBuf {
    books_dir(project).join(book_id)
}

fn chapters_dir(project: &Path, book_id: &str) -> PathBuf {
    book_dir(project, book_id).join("chapters")
}

pub(crate) fn chapter_dir(project: &Path, book_id: &str, chapter_id: &str) -> PathBuf {
    chapters_dir(project, book_id).join(chapter_id)
}

fn scenes_dir(project: &Path, book_id: &str, chapter_id: &str) -> PathBuf {
    chapter_dir(project, book_id, chapter_id).join("scenes")
}

fn scene_file(project: &Path, book_id: &str, chapter_id: &str, scene_id: &str) -> PathBuf {
    scenes_dir(project, book_id, chapter_id).join(format!("{scene_id}.txt"))
}

fn timeline_file(project: &Path) -> PathBuf {
    project.join("timeline.json")
}

fn slugify(input: &str) -> String {
    let slug: String = input
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect();
    slug.split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

fn unique_id(prefix: &str) -> String {
    format!("{prefix}-{}", &Uuid::new_v4().simple().to_string()[..8])
}

pub(crate) fn read_json<T: for<'de> Deserialize<'de>>(path: &Path) -> Result<T, String> {
    let content = fs::read_to_string(path).map_err(|e| format!("Failed to read {}: {e}", path.display()))?;
    serde_json::from_str(&content).map_err(|e| format!("Failed to parse {}: {e}", path.display()))
}

pub(crate) fn write_json<T: Serialize>(path: &Path, value: &T) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {e}"))?;
    }
    let content = serde_json::to_string_pretty(value).map_err(|e| format!("Failed to serialize: {e}"))?;
    fs::write(path, content).map_err(|e| format!("Failed to write {}: {e}", path.display()))
}

fn scene_order(scenes: &[SceneMeta]) -> Vec<SceneMeta> {
    let mut sorted = scenes.to_vec();
    sorted.sort_by(|a, b| a.row.cmp(&b.row).then(a.col.cmp(&b.col)));
    sorted
}

fn chapter_ids_on_disk(root: &Path, book_id: &str) -> Result<Vec<String>, String> {
    let chapters_path = chapters_dir(root, book_id);
    if !chapters_path.exists() {
        return Ok(vec![]);
    }

    let mut entries: Vec<_> = fs::read_dir(&chapters_path)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .collect();
    entries.sort_by_key(|e| e.file_name());

    let mut ids = Vec::new();
    for entry in entries {
        let ch_meta: ChapterMeta = read_json(&entry.path().join("chapter.json"))?;
        ids.push(ch_meta.id);
    }
    Ok(ids)
}

fn resolve_chapter_order(stored: &[String], on_disk: &[String]) -> Vec<String> {
    let mut ordered = Vec::new();
    for id in stored {
        if on_disk.contains(id) && !ordered.contains(id) {
            ordered.push(id.clone());
        }
    }
    for id in on_disk {
        if !ordered.contains(id) {
            ordered.push(id.clone());
        }
    }
    ordered
}

fn read_book_meta(root: &Path, book_id: &str) -> Result<BookMeta, String> {
    read_json(&book_dir(root, book_id).join("book.json"))
}

fn write_book_meta(root: &Path, book_id: &str, meta: &BookMeta) -> Result<(), String> {
    write_json(&book_dir(root, book_id).join("book.json"), meta)
}

fn load_chapter_summaries(root: &Path, book_id: &str) -> Result<Vec<ChapterSummary>, String> {
    let book_meta = read_book_meta(root, book_id)?;
    let on_disk = chapter_ids_on_disk(root, book_id)?;
    let order = resolve_chapter_order(&book_meta.chapter_order, &on_disk);

    let mut chapters = Vec::new();
    for chapter_id in order {
        let ch_meta: ChapterMeta =
            read_json(&chapter_dir(root, book_id, &chapter_id).join("chapter.json"))?;
        chapters.push(ChapterSummary {
            id: ch_meta.id,
            title: ch_meta.title,
            scene_count: ch_meta.scenes.len(),
        });
    }
    Ok(chapters)
}

fn set_book_chapter_order(
    root: &Path,
    book_id: &str,
    chapter_ids: Vec<String>,
) -> Result<(), String> {
    let on_disk = chapter_ids_on_disk(root, book_id)?;
    for id in &chapter_ids {
        if !on_disk.contains(id) {
            return Err(format!("Chapter not found: {id}"));
        }
    }
    if chapter_ids.len() != on_disk.len() {
        return Err("Chapter order must include every chapter in the book".into());
    }

    let mut book_meta = read_book_meta(root, book_id)?;
    book_meta.chapter_order = chapter_ids;
    write_book_meta(root, book_id, &book_meta)
}

// ── Project operations ────────────────────────────────────────────────────────

pub fn create_project(req: CreateProjectRequest) -> Result<Project, String> {
    let path = PathBuf::from(&req.path);
    if path.exists() {
        let entries: Vec<_> = fs::read_dir(&path)
            .map_err(|e| e.to_string())?
            .filter_map(|e| e.ok())
            .collect();
        if !entries.is_empty() && !path.join("project.json").exists() {
            return Err("Directory is not empty".into());
        }
    }

    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    fs::create_dir_all(books_dir(&path)).map_err(|e| e.to_string())?;
    fs::create_dir_all(path.join("notes")).map_err(|e| e.to_string())?;

    let meta = ProjectMeta {
        name: req.name.clone(),
        version: 1,
    };
    write_json(&path.join("project.json"), &meta)?;
    crate::tags::init_tags_file(&req.path)?;

    Ok(Project {
        path: req.path,
        name: req.name,
        books: vec![],
    })
}

pub fn open_project(path: &str) -> Result<Project, String> {
    get_project(path)
}

pub fn get_project(path: &str) -> Result<Project, String> {
    let root = PathBuf::from(path);
    let project_json = root.join("project.json");
    if !project_json.exists() {
        return Err(
            "This folder is not a Sortdraft project (project.json not found).".into(),
        );
    }
    let meta: ProjectMeta = read_json(&project_json)?;
    let mut books = Vec::new();

    let books_path = books_dir(&root);
    if books_path.exists() {
        let mut book_entries: Vec<_> = fs::read_dir(&books_path)
            .map_err(|e| e.to_string())?
            .filter_map(|e| e.ok())
            .filter(|e| e.path().is_dir())
            .collect();
        book_entries.sort_by_key(|e| e.file_name());

        for entry in book_entries {
            let book_path = entry.path();
            let book_meta: BookMeta = read_json(&book_path.join("book.json"))?;
            let chapters = load_chapter_summaries(&root, &book_meta.id)?;

            books.push(BookSummary {
                id: book_meta.id,
                title: book_meta.title,
                chapters,
            });
        }
    }

    Ok(Project {
        path: path.to_string(),
        name: meta.name,
        books,
    })
}

pub fn get_timeline(req: TimelineRequest) -> Result<Timeline, String> {
    let path = timeline_file(Path::new(&req.project_path));
    if !path.exists() {
        return Ok(Timeline::default());
    }
    read_json(&path)
}

pub fn save_timeline(req: SaveTimelineRequest) -> Result<Timeline, String> {
    let path = timeline_file(Path::new(&req.project_path));
    write_json(&path, &req.timeline)?;
    Ok(req.timeline)
}

pub fn create_book(req: CreateBookRequest) -> Result<Project, String> {
    let root = PathBuf::from(&req.project_path);
    let base_slug = slugify(&req.title);
    let id = if base_slug.is_empty() {
        unique_id("book")
    } else {
        let mut candidate = base_slug.clone();
        let mut n = 1;
        while book_dir(&root, &candidate).exists() {
            candidate = format!("{base_slug}-{n}");
            n += 1;
        }
        candidate
    };

    let dir = book_dir(&root, &id);
    fs::create_dir_all(dir.join("chapters")).map_err(|e| e.to_string())?;

    let meta = BookMeta {
        id: id.clone(),
        title: req.title,
        chapter_order: vec![],
    };
    write_json(&dir.join("book.json"), &meta)?;

    get_project(&req.project_path)
}

pub fn create_chapter(req: CreateChapterRequest) -> Result<Project, String> {
    let root = PathBuf::from(&req.project_path);
    let base_slug = slugify(&req.title);
    let id = if base_slug.is_empty() {
        unique_id("chapter")
    } else {
        let mut candidate = base_slug.clone();
        let mut n = 1;
        while chapter_dir(&root, &req.book_id, &candidate).exists() {
            candidate = format!("{base_slug}-{n}");
            n += 1;
        }
        candidate
    };

    let dir = chapter_dir(&root, &req.book_id, &id);
    fs::create_dir_all(dir.join("scenes")).map_err(|e| e.to_string())?;

    let meta = ChapterMeta {
        id: id.clone(),
        title: req.title,
        scenes: vec![],
    };
    write_json(&dir.join("chapter.json"), &meta)?;

    let mut book_meta = read_book_meta(&root, &req.book_id)?;
    book_meta.chapter_order.push(id.clone());
    write_book_meta(&root, &req.book_id, &book_meta)?;

    get_project(&req.project_path)
}

pub fn create_scene(req: CreateSceneRequest) -> Result<ChapterDetail, String> {
    let root = PathBuf::from(&req.project_path);
    let chapter_path = chapter_dir(&root, &req.book_id, &req.chapter_id);
    let chapter_json = chapter_path.join("chapter.json");

    let mut meta: ChapterMeta = read_json(&chapter_json)?;
    let scene_id = unique_id("scene");

    let max_row = meta.scenes.iter().map(|s| s.row).max().unwrap_or(0);
    let col = meta.scenes.iter().filter(|s| s.row == max_row).count() as u32;

    let scene = SceneMeta {
        id: scene_id.clone(),
        title: req.title,
        description: req.description,
        col,
        row: max_row,
        tags: vec![],
    };

    meta.scenes.push(scene);
    write_json(&chapter_json, &meta)?;

    let scene_path = scene_file(&root, &req.book_id, &req.chapter_id, &scene_id);
    fs::write(&scene_path, "").map_err(|e| e.to_string())?;

    get_chapter(GetChapterRequest {
        project_path: req.project_path,
        book_id: req.book_id,
        chapter_id: req.chapter_id,
    })
}

pub fn get_chapter(req: GetChapterRequest) -> Result<ChapterDetail, String> {
    let root = PathBuf::from(&req.project_path);
    let book_meta: BookMeta = read_json(&book_dir(&root, &req.book_id).join("book.json"))?;
    let chapter_meta: ChapterMeta =
        read_json(&chapter_dir(&root, &req.book_id, &req.chapter_id).join("chapter.json"))?;

    let scenes: Vec<SceneSummary> = scene_order(&chapter_meta.scenes)
        .into_iter()
        .map(|s| SceneSummary {
            id: s.id,
            title: s.title,
            description: s.description,
            col: s.col,
            row: s.row,
            tags: s.tags,
        })
        .collect();

    Ok(ChapterDetail {
        book_id: req.book_id,
        book_title: book_meta.title,
        id: chapter_meta.id,
        title: chapter_meta.title,
        scenes,
    })
}

pub fn get_scene_content(req: GetSceneContentRequest) -> Result<String, String> {
    let root = PathBuf::from(&req.project_path);
    let path = scene_file(&root, &req.book_id, &req.chapter_id, &req.scene_id);
    fs::read_to_string(&path).map_err(|e| format!("Failed to read scene: {e}"))
}

pub fn update_scene_content(req: UpdateSceneContentRequest) -> Result<(), String> {
    let root = PathBuf::from(&req.project_path);
    let path = scene_file(&root, &req.book_id, &req.chapter_id, &req.scene_id);
    fs::write(&path, req.content).map_err(|e| e.to_string())
}

pub fn update_scene_meta(req: UpdateSceneMetaRequest) -> Result<ChapterDetail, String> {
    let root = PathBuf::from(&req.project_path);
    let chapter_path = chapter_dir(&root, &req.book_id, &req.chapter_id);
    let chapter_json = chapter_path.join("chapter.json");

    let mut meta: ChapterMeta = read_json(&chapter_json)?;
    let scene = meta
        .scenes
        .iter_mut()
        .find(|s| s.id == req.scene_id)
        .ok_or_else(|| "Scene not found".to_string())?;

    scene.title = req.title;
    scene.description = req.description;
    if let Some(tags) = req.tags {
        scene.tags = tags;
    }
    write_json(&chapter_json, &meta)?;

    get_chapter(GetChapterRequest {
        project_path: req.project_path,
        book_id: req.book_id,
        chapter_id: req.chapter_id,
    })
}

pub fn reorder_scenes(req: ReorderScenesRequest) -> Result<ChapterDetail, String> {
    let root = PathBuf::from(&req.project_path);
    let chapter_path = chapter_dir(&root, &req.book_id, &req.chapter_id);
    let chapter_json = chapter_path.join("chapter.json");

    let mut meta: ChapterMeta = read_json(&chapter_json)?;

    for pos in &req.scenes {
        if let Some(scene) = meta.scenes.iter_mut().find(|s| s.id == pos.id) {
            scene.col = pos.col;
            scene.row = pos.row;
        }
    }

    write_json(&chapter_json, &meta)?;

    get_chapter(GetChapterRequest {
        project_path: req.project_path,
        book_id: req.book_id,
        chapter_id: req.chapter_id,
    })
}

pub fn move_scene(req: MoveSceneRequest) -> Result<Project, String> {
    let root = PathBuf::from(&req.project_path);

    let from_chapter_path = chapter_dir(&root, &req.from_book_id, &req.from_chapter_id);
    let to_chapter_path = chapter_dir(&root, &req.to_book_id, &req.to_chapter_id);

    let from_json = from_chapter_path.join("chapter.json");
    let to_json = to_chapter_path.join("chapter.json");

    let mut from_meta: ChapterMeta = read_json(&from_json)?;
    let scene_idx = from_meta
        .scenes
        .iter()
        .position(|s| s.id == req.scene_id)
        .ok_or_else(|| "Scene not found in source chapter".to_string())?;
    let mut scene = from_meta.scenes.remove(scene_idx);
    write_json(&from_json, &from_meta)?;

    let from_file = scene_file(
        &root,
        &req.from_book_id,
        &req.from_chapter_id,
        &req.scene_id,
    );
    let to_file = scene_file(
        &root,
        &req.to_book_id,
        &req.to_chapter_id,
        &req.scene_id,
    );

    fs::create_dir_all(scenes_dir(
        &root,
        &req.to_book_id,
        &req.to_chapter_id,
    ))
    .map_err(|e| e.to_string())?;

    fs::rename(&from_file, &to_file).map_err(|e| format!("Failed to move scene file: {e}"))?;

    scene.col = req.col;
    scene.row = req.row;

    let mut to_meta: ChapterMeta = read_json(&to_json)?;
    to_meta.scenes.push(scene);
    write_json(&to_json, &to_meta)?;

    get_project(&req.project_path)
}

pub fn delete_scene(req: DeleteSceneRequest) -> Result<ChapterDetail, String> {
    let root = PathBuf::from(&req.project_path);
    let chapter_path = chapter_dir(&root, &req.book_id, &req.chapter_id);
    let chapter_json = chapter_path.join("chapter.json");

    let mut meta: ChapterMeta = read_json(&chapter_json)?;
    meta.scenes.retain(|s| s.id != req.scene_id);
    write_json(&chapter_json, &meta)?;

    let file = scene_file(&root, &req.book_id, &req.chapter_id, &req.scene_id);
    if file.exists() {
        fs::remove_file(&file).map_err(|e| e.to_string())?;
    }

    get_chapter(GetChapterRequest {
        project_path: req.project_path,
        book_id: req.book_id,
        chapter_id: req.chapter_id,
    })
}

pub fn export_book(req: ExportBookRequest) -> Result<String, String> {
    let root = PathBuf::from(&req.project_path);
    let book_path = book_dir(&root, &req.book_id);
    let book_meta: BookMeta = read_json(&book_path.join("book.json"))?;

    let mut output = String::new();
    output.push_str(&book_meta.title);
    output.push_str("\n\n");

    let chapters_path = book_path.join("chapters");
    if chapters_path.exists() {
        let order = {
            let on_disk = chapter_ids_on_disk(&root, &req.book_id)?;
            let book_meta: BookMeta = read_json(&book_path.join("book.json"))?;
            resolve_chapter_order(&book_meta.chapter_order, &on_disk)
        };

        for chapter_id in order {
            let ch_meta: ChapterMeta =
                read_json(&chapter_dir(&root, &req.book_id, &chapter_id).join("chapter.json"))?;

            output.push_str(&format!("# {}\n\n", ch_meta.title));

            for scene in scene_order(&ch_meta.scenes) {
                let scene_path = scene_file(&root, &req.book_id, &ch_meta.id, &scene.id);
                if scene_path.exists() {
                    let content = fs::read_to_string(&scene_path).unwrap_or_default();
                    if !content.trim().is_empty() {
                        output.push_str(&content);
                        if !content.ends_with('\n') {
                            output.push('\n');
                        }
                        output.push('\n');
                    }
                }
            }
        }
    }

    fs::write(&req.output_path, &output).map_err(|e| e.to_string())?;
    Ok(req.output_path)
}

pub fn rename_book(req: RenameBookRequest) -> Result<Project, String> {
    let root = PathBuf::from(&req.project_path);
    let book_json = book_dir(&root, &req.book_id).join("book.json");
    let mut meta: BookMeta = read_json(&book_json)?;
    meta.title = req.title;
    write_json(&book_json, &meta)?;
    get_project(&req.project_path)
}

pub fn rename_chapter(req: RenameChapterRequest) -> Result<Project, String> {
    let root = PathBuf::from(&req.project_path);
    let chapter_json = chapter_dir(&root, &req.book_id, &req.chapter_id).join("chapter.json");
    let mut meta: ChapterMeta = read_json(&chapter_json)?;
    meta.title = req.title;
    write_json(&chapter_json, &meta)?;
    get_project(&req.project_path)
}

pub fn reorder_chapters(req: ReorderChaptersRequest) -> Result<Project, String> {
    let root = PathBuf::from(&req.project_path);
    set_book_chapter_order(&root, &req.book_id, req.chapter_ids)?;
    get_project(&req.project_path)
}

pub fn move_chapter(req: MoveChapterRequest) -> Result<MoveChapterResult, String> {
    let root = PathBuf::from(&req.project_path);
    let mut effective_id = req.chapter_id.clone();

    if req.from_book_id == req.to_book_id {
        let on_disk = chapter_ids_on_disk(&root, &req.from_book_id)?;
        let book_meta = read_book_meta(&root, &req.from_book_id)?;
        let mut order = resolve_chapter_order(&book_meta.chapter_order, &on_disk);

        let from_index = order
            .iter()
            .position(|id| id == &req.chapter_id)
            .ok_or_else(|| "Chapter not found in source book".to_string())?;

        order.remove(from_index);
        let to_index = req.to_index.min(order.len());
        order.insert(to_index, req.chapter_id.clone());

        set_book_chapter_order(&root, &req.from_book_id, order)?;
    } else {
        let from_path = chapter_dir(&root, &req.from_book_id, &req.chapter_id);
        if !from_path.exists() {
            return Err("Chapter not found in source book".into());
        }

        let mut to_path = chapter_dir(&root, &req.to_book_id, &effective_id);
        if to_path.exists() {
            effective_id = unique_id("chapter");
            let mut ch_meta: ChapterMeta = read_json(&from_path.join("chapter.json"))?;
            ch_meta.id = effective_id.clone();
            write_json(&from_path.join("chapter.json"), &ch_meta)?;
            to_path = chapter_dir(&root, &req.to_book_id, &effective_id);
        }

        fs::create_dir_all(chapters_dir(&root, &req.to_book_id)).map_err(|e| e.to_string())?;
        fs::rename(&from_path, &to_path)
            .map_err(|e| format!("Failed to move chapter directory: {e}"))?;

        let from_on_disk = chapter_ids_on_disk(&root, &req.from_book_id)?;
        let from_meta = read_book_meta(&root, &req.from_book_id)?;
        let mut from_order = resolve_chapter_order(&from_meta.chapter_order, &from_on_disk);
        from_order.retain(|id| id != &req.chapter_id);
        set_book_chapter_order(&root, &req.from_book_id, from_order)?;

        let to_on_disk = chapter_ids_on_disk(&root, &req.to_book_id)?;
        let to_meta = read_book_meta(&root, &req.to_book_id)?;
        let mut to_order = resolve_chapter_order(&to_meta.chapter_order, &to_on_disk);
        to_order.retain(|id| id != &effective_id);
        let to_index = req.to_index.min(to_order.len());
        to_order.insert(to_index, effective_id.clone());
        set_book_chapter_order(&root, &req.to_book_id, to_order)?;
    }

    Ok(MoveChapterResult {
        project: get_project(&req.project_path)?,
        chapter_id: effective_id,
    })
}

pub fn rename_scene(req: RenameSceneRequest) -> Result<ChapterDetail, String> {
    let root = PathBuf::from(&req.project_path);
    let chapter_json = chapter_dir(&root, &req.book_id, &req.chapter_id).join("chapter.json");
    let meta: ChapterMeta = read_json(&chapter_json)?;
    let description = meta
        .scenes
        .iter()
        .find(|s| s.id == req.scene_id)
        .map(|s| s.description.clone())
        .unwrap_or_default();
    let tags = meta
        .scenes
        .iter()
        .find(|s| s.id == req.scene_id)
        .map(|s| s.tags.clone())
        .unwrap_or_default();

    update_scene_meta(UpdateSceneMetaRequest {
        project_path: req.project_path,
        book_id: req.book_id,
        chapter_id: req.chapter_id,
        scene_id: req.scene_id,
        title: req.title,
        description,
        tags: Some(tags),
    })
}
