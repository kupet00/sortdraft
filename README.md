# Sortdraft

Sort your scenes, draft your story. A cross-platform novel writing app. Organize your work as **projects → books → chapters → scenes**, plan chapters on a corkboard with draggable index cards, and export finished books in scene order.

Built with [Tauri](https://tauri.app/) + React. Runs on macOS, Windows, and Linux (including 64-bit Raspberry Pi).

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
| Linux x86_64 | `.deb` and portable `.zip` |
| Linux ARM64 (Raspberry Pi) | `.deb` and portable `.zip` |

Linux builds run on Ubuntu 22.04 (`ubuntu-22.04` and `ubuntu-22.04-arm`) for broad Debian/Ubuntu compatibility, including 64-bit Raspberry Pi OS. The zip contains the extracted `usr/` tree from the `.deb` for portable use; install the `.deb` for system integration. The ARM64 build is for 64-bit OS on Raspberry Pi 4/5 (and other aarch64 Linux), not 32-bit Raspberry Pi OS.

Workflow file: [`.github/workflows/build.yml`](.github/workflows/build.yml)

## Features

- Multiple books per project, each in its own folder
- Chapters with corkboard view — index cards for scenes on a grid
- Drag cards to reorder scenes within a chapter
- Drag cards onto a chapter in the sidebar to move scenes between chapters (even across books)
- Click a card to write/edit the scene
- Right-click cards to assign coloured tags (not included in export)
- Export a book to a single `.txt` file in scene order

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
