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

Pushing a tag like `v0.1.0` runs **Build and publish**: it produces the artifacts below, creates a GitHub Release, and pushes to itch.io.

The **Build without itch.io** workflow is manual (**Actions → Build without itch.io → Run workflow**). It produces the same artifacts and can create a GitHub Release if you pass a tag, but it never publishes to itch.io. GitHub only shows that Run button after the workflow file is on `main`.

| Platform | Artifacts |
|----------|-----------|
| macOS (Apple Silicon) | `.dmg` |
| Windows | `.exe` installer (NSIS) |
| Linux x86_64 | `.deb` and portable `.zip` |
| Linux ARM64 (Raspberry Pi) | `.deb` and portable `.zip` |

Linux builds run on Ubuntu 22.04 (`ubuntu-22.04` and `ubuntu-22.04-arm`) for broad Debian/Ubuntu compatibility, including 64-bit Raspberry Pi OS. The zip contains the extracted `usr/` tree from the `.deb` for portable use; install the `.deb` for system integration. The ARM64 build is for 64-bit OS on Raspberry Pi 4/5 (and other aarch64 Linux), not 32-bit Raspberry Pi OS.

Workflow files: [`.github/workflows/build.yml`](.github/workflows/build.yml) (tag + itch.io) and [`.github/workflows/build-manual.yml`](.github/workflows/build-manual.yml) (manual, no itch.io).

Tagged releases are also pushed to [itch.io](https://itch.io/) with [butler](https://github.com/itchio/butler).

1. Create a project page on itch.io (the default target is `<github-username>/sortdraft`).
2. Create an API key at [itch.io API keys](https://itch.io/user/settings/api-keys) (the key with source `wharf`).
3. Add it as the repository secret `BUTLER_API_KEY`.
4. If the itch.io URL is not `https://<github-username>.itch.io/sortdraft`, set the repository variable `ITCH_PROJECT` to `username/game`.

| Channel | Artifact |
|---------|----------|
| `osx-arm64` | macOS `.dmg` |
| `windows` | Windows NSIS `.exe` |
| `linux` | Linux x86_64 portable `.zip` |
| `linux-arm64` | Linux ARM64 portable `.zip` |

## Features

### Organization

- Multiple books per project, each in its own folder
- Chapters with corkboard view — index cards for scenes on a grid
- Drag cards to reorder scenes within a chapter
- Drag cards onto a chapter in the sidebar to move scenes between chapters (even across books)
- Drag chapters between books in the sidebar
- Recent projects shown on the welcome screen for quick reopening

### Writing

- Click a card to write/edit the scene, with autosave as you type
- Word count for the current scene
- Adjustable editor page width and font size
- Typewriter mode — keeps the active sentence centered and dims the rest
- Focus mode — distraction-free, fullscreen editing (Escape to exit)

### Timeline

- A separate visual timeline canvas per book for plotting story events
- Add text notes, scene links, or markers as nodes on horizontal/vertical timeline lines
- Drag nodes to reposition them, with snapping for precise alignment
- Pan and zoom the canvas; jump straight to a linked scene from a node

### Notes

- Project-wide notes panel, separate from scenes, for research and planning
- Create, edit, and delete notes with the same autosave as scenes

### Tags

- Right-click cards to assign coloured tags (not included in export)
- Manage all project tags (name and colour) from a dedicated Tags dialog
- Tag pills shown on scene cards for at-a-glance status

### Spellcheck

- Built-in spellcheck with underlines for misspelled words, toggled from the bottom bar
- 15 languages included: Danish, Dutch, English (US), English (UK), French, German, Icelandic, Irish, Italian, Norwegian, Polish, Portuguese, Spanish, Swedish, and Welsh
- Switch languages per session from a dropdown
- Per-project dictionary for added and ignored words, with optional case-sensitive matching

### Settings

- Light and dark themes, or fully customise every UI colour
- Choose from a curated list of writing fonts for the editor, with a live preview
- Independently adjust UI and editor font sizes
- Preferences persist between sessions

### Export

- Export a book to a single `.txt` file in scene order

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
