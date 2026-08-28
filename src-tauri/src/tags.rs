use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;

use crate::project::{chapter_dir, read_json, write_json, ChapterMeta};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagDefinition {
    pub id: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct TagsFile {
    tags: Vec<TagDefinition>,
}

#[derive(Debug, Deserialize)]
pub struct ListTagsRequest {
    pub project_path: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTagRequest {
    pub project_path: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTagRequest {
    pub project_path: String,
    pub tag_id: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Deserialize)]
pub struct DeleteTagRequest {
    pub project_path: String,
    pub tag_id: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSceneTagsRequest {
    pub project_path: String,
    pub book_id: String,
    pub chapter_id: String,
    pub scene_id: String,
    pub tags: Vec<String>,
}

fn tags_path(project: &Path) -> PathBuf {
    project.join("tags.json")
}

fn books_dir(project: &Path) -> PathBuf {
    project.join("books")
}

fn unique_tag_id() -> String {
    format!("tag-{}", &Uuid::new_v4().simple().to_string()[..8])
}

fn load_tags_file(project_path: &str) -> Result<TagsFile, String> {
    let path = tags_path(&PathBuf::from(project_path));
    if !path.exists() {
        return Ok(TagsFile { tags: vec![] });
    }
    read_json(&path)
}

fn save_tags_file(project_path: &str, file: &TagsFile) -> Result<(), String> {
    write_json(&tags_path(&PathBuf::from(project_path)), file)
}

pub fn init_tags_file(project_path: &str) -> Result<(), String> {
    let path = tags_path(&PathBuf::from(project_path));
    if path.exists() {
        return Ok(());
    }
    save_tags_file(project_path, &TagsFile { tags: vec![] })
}

pub fn list_tags(project_path: &str) -> Result<Vec<TagDefinition>, String> {
    Ok(load_tags_file(project_path)?.tags)
}

pub fn create_tag(req: CreateTagRequest) -> Result<Vec<TagDefinition>, String> {
    let name = req.name.trim();
    if name.is_empty() {
        return Err("Tag name cannot be empty".into());
    }

    let mut file = load_tags_file(&req.project_path)?;
    let id = unique_tag_id();
    file.tags.push(TagDefinition {
        id,
        name: name.to_string(),
        color: req.color,
    });
    save_tags_file(&req.project_path, &file)?;
    Ok(file.tags)
}

pub fn update_tag(req: UpdateTagRequest) -> Result<Vec<TagDefinition>, String> {
    let name = req.name.trim();
    if name.is_empty() {
        return Err("Tag name cannot be empty".into());
    }

    let mut file = load_tags_file(&req.project_path)?;
    let tag = file
        .tags
        .iter_mut()
        .find(|t| t.id == req.tag_id)
        .ok_or_else(|| "Tag not found".to_string())?;
    tag.name = name.to_string();
    tag.color = req.color;
    save_tags_file(&req.project_path, &file)?;
    Ok(file.tags)
}

fn remove_tag_from_all_scenes(project_path: &str, tag_id: &str) -> Result<(), String> {
    let root = PathBuf::from(project_path);
    let books_path = books_dir(&root);
    if !books_path.exists() {
        return Ok(());
    }

    for book_entry in fs::read_dir(&books_path).map_err(|e| e.to_string())? {
        let book_entry = book_entry.map_err(|e| e.to_string())?;
        if !book_entry.path().is_dir() {
            continue;
        }
        let chapters_path = book_entry.path().join("chapters");
        if !chapters_path.exists() {
            continue;
        }

        for chapter_entry in fs::read_dir(&chapters_path).map_err(|e| e.to_string())? {
            let chapter_entry = chapter_entry.map_err(|e| e.to_string())?;
            if !chapter_entry.path().is_dir() {
                continue;
            }
            let chapter_json = chapter_entry.path().join("chapter.json");
            let mut meta: ChapterMeta = read_json(&chapter_json)?;
            let mut changed = false;
            for scene in &mut meta.scenes {
                let before = scene.tags.len();
                scene.tags.retain(|id| id != tag_id);
                if scene.tags.len() != before {
                    changed = true;
                }
            }
            if changed {
                write_json(&chapter_json, &meta)?;
            }
        }
    }

    Ok(())
}

pub fn delete_tag(req: DeleteTagRequest) -> Result<Vec<TagDefinition>, String> {
    let mut file = load_tags_file(&req.project_path)?;
    let before = file.tags.len();
    file.tags.retain(|t| t.id != req.tag_id);
    if file.tags.len() == before {
        return Err("Tag not found".into());
    }
    remove_tag_from_all_scenes(&req.project_path, &req.tag_id)?;
    save_tags_file(&req.project_path, &file)?;
    Ok(file.tags)
}

pub fn update_scene_tags(
    req: UpdateSceneTagsRequest,
) -> Result<crate::project::ChapterDetail, String> {
    use crate::project::{get_chapter, GetChapterRequest};

    let root = PathBuf::from(&req.project_path);
    let chapter_json = chapter_dir(&root, &req.book_id, &req.chapter_id).join("chapter.json");
    let mut meta: ChapterMeta = read_json(&chapter_json)?;

    let file = load_tags_file(&req.project_path)?;
    for tag_id in &req.tags {
        if !file.tags.iter().any(|t| t.id == *tag_id) {
            return Err(format!("Unknown tag: {tag_id}"));
        }
    }

    let scene = meta
        .scenes
        .iter_mut()
        .find(|s| s.id == req.scene_id)
        .ok_or_else(|| "Scene not found".to_string())?;
    scene.tags = req.tags;
    write_json(&chapter_json, &meta)?;

    get_chapter(GetChapterRequest {
        project_path: req.project_path,
        book_id: req.book_id,
        chapter_id: req.chapter_id,
    })
}
