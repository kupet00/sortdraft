# Sortdraft

Sort your scenes, draft your story. A cross-platform novel writing app. Organize your work as **projects → books → chapters → scenes**, plan chapters on a corkboard with draggable index cards, and export finished books in scene order.

Built with [Tauri](https://tauri.app/) + React. Runs on macOS, Windows, and Linux.

## Project structure on disk

```
My Novel/
  project.json
  tags.json
  books/
    my-book/
      book.json
      chapters/
        opening/
          chapter.json      # scene metadata, corkboard positions, order
          scenes/
            scene-abc123.txt
            scene-def456.txt
```

Scene order for export follows corkboard layout: top-to-bottom, left-to-right.

## Development

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

### CI builds (GitHub Actions)

Pushing a tag like `v0.1.0` or running the **Build** workflow manually produces:

| Platform | Artifacts |
|----------|-----------|
| macOS (Apple Silicon) | `.dmg` |
| Windows | `.exe` installer (NSIS) |
| Linux | `.deb` and portable `.zip` |

Linux builds run on `ubuntu-22.04` for broad Debian/Ubuntu compatibility. The zip contains the extracted `usr/` tree from the `.deb` for portable use; install the `.deb` for system integration.

Workflow file: [`.github/workflows/build.yml`](.github/workflows/build.yml)

## Features

- Multiple books per project, each in its own folder
- Chapters with corkboard view — index cards for scenes on a grid
- Drag cards to reorder scenes within a chapter
- Drag cards onto a chapter in the sidebar to move scenes between chapters (even across books)
- Click a card to write/edit the scene
- Right-click cards to assign coloured tags (not included in export)
- Export a book to a single `.txt` file in scene order
