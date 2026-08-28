use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NoteSummary {
    pub id: String,
    pub title: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CreateNoteResult {
    pub notes: Vec<NoteSummary>,
    pub created_id: String,
}

#[derive(Debug, Deserialize)]
pub struct ListNotesRequest {
    pub project_path: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoteRequest {
    pub project_path: String,
    pub title: String,
}

#[derive(Debug, Deserialize)]
pub struct NoteContentRequest {
    pub project_path: String,
    pub note_id: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNoteContentRequest {
    pub project_path: String,
    pub note_id: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct DeleteNoteRequest {
    pub project_path: String,
    pub note_id: String,
}

fn notes_dir(project: &Path) -> PathBuf {
    project.join("notes")
}

fn note_file(project: &Path, note_id: &str) -> PathBuf {
    notes_dir(project).join(format!("{note_id}.txt"))
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

fn unique_id() -> String {
    format!("note-{}", &Uuid::new_v4().simple().to_string()[..8])
}

fn title_from_id(id: &str) -> String {
    id.replace('-', " ")
}

pub fn ensure_notes_dir(project_path: &str) -> Result<(), String> {
    fs::create_dir_all(notes_dir(&PathBuf::from(project_path))).map_err(|e| e.to_string())
}

pub fn list_notes(project_path: &str) -> Result<Vec<NoteSummary>, String> {
    ensure_notes_dir(project_path)?;
    let root = PathBuf::from(project_path);
    let dir = notes_dir(&root);
    if !dir.exists() {
        return Ok(vec![]);
    }

    let mut entries: Vec<_> = fs::read_dir(&dir)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.path()
                .extension()
                .is_some_and(|ext| ext == "txt")
        })
        .collect();
    entries.sort_by_key(|e| e.file_name());

    let notes = entries
        .into_iter()
        .filter_map(|entry| {
            let path = entry.path();
            let id = path.file_stem()?.to_string_lossy().to_string();
            let content = fs::read_to_string(&path).unwrap_or_default();
            let title = content
                .lines()
                .find(|line| !line.trim().is_empty())
                .map(|line| {
                    let trimmed = line.trim();
                    if trimmed.len() > 48 {
                        format!("{}…", &trimmed[..48])
                    } else {
                        trimmed.to_string()
                    }
                })
                .unwrap_or_else(|| title_from_id(&id));
            Some(NoteSummary { id, title })
        })
        .collect();

    Ok(notes)
}

pub fn create_note(req: CreateNoteRequest) -> Result<CreateNoteResult, String> {
    let root = PathBuf::from(&req.project_path);
    ensure_notes_dir(&req.project_path)?;

    let base_slug = slugify(&req.title);
    let id = if base_slug.is_empty() {
        unique_id()
    } else {
        let mut candidate = base_slug.clone();
        let mut n = 1;
        while note_file(&root, &candidate).exists() {
            candidate = format!("{base_slug}-{n}");
            n += 1;
        }
        candidate
    };

    fs::write(note_file(&root, &id), "").map_err(|e| e.to_string())?;
    Ok(CreateNoteResult {
        notes: list_notes(&req.project_path)?,
        created_id: id,
    })
}

pub fn get_note_content(req: NoteContentRequest) -> Result<String, String> {
    let root = PathBuf::from(&req.project_path);
    let path = note_file(&root, &req.note_id);
    if !path.exists() {
        return Err("Note not found".into());
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

pub fn update_note_content(req: UpdateNoteContentRequest) -> Result<(), String> {
    let root = PathBuf::from(&req.project_path);
    let path = note_file(&root, &req.note_id);
    if !path.exists() {
        return Err("Note not found".into());
    }
    fs::write(&path, req.content).map_err(|e| e.to_string())
}

pub fn delete_note(req: DeleteNoteRequest) -> Result<Vec<NoteSummary>, String> {
    let root = PathBuf::from(&req.project_path);
    let path = note_file(&root, &req.note_id);
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    list_notes(&req.project_path)
}
