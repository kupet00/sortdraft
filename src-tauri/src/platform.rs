use serde::Serialize;
use std::fs;
use std::path::Path;
use tauri::{AppHandle, Manager};

use crate::project::ProjectMeta;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeInfo {
    pub mobile: bool,
    pub projects_root: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalProject {
    pub path: String,
    pub name: String,
}

pub fn runtime_info(app: &AppHandle) -> Result<RuntimeInfo, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let projects = dir.join("projects");
    fs::create_dir_all(&projects).map_err(|e| e.to_string())?;
    Ok(RuntimeInfo {
        mobile: cfg!(mobile),
        projects_root: projects.to_string_lossy().into_owned(),
    })
}

pub fn list_local_projects(app: &AppHandle) -> Result<Vec<LocalProject>, String> {
    let root = runtime_info(app)?.projects_root;
    let root = Path::new(&root);
    if !root.exists() {
        return Ok(vec![]);
    }

    let mut entries: Vec<_> = fs::read_dir(root)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .collect();
    entries.sort_by_key(|e| e.file_name());

    let mut projects = Vec::new();
    for entry in entries {
        let path = entry.path();
        let project_json = path.join("project.json");
        if !project_json.exists() {
            continue;
        }
        let meta: ProjectMeta = crate::project::read_json(&project_json)?;
        projects.push(LocalProject {
            path: path.to_string_lossy().into_owned(),
            name: meta.name,
        });
    }
    Ok(projects)
}
