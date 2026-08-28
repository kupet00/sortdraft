# Sortdraft

Sort your scenes, draft your story. A cross-platform novel writing app. Organize your work as **projects → books → chapters → scenes**, plan chapters on a corkboard with draggable index cards, and export finished books in scene order.

Built with [Tauri](https://tauri.app/) + React. Runs on macOS, Windows, Linux (including 64-bit Raspberry Pi), and Android.

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

### Android

Android builds use the same codebase. Projects live in the app's on-device storage (there is no desktop-style folder picker). Export writes a `.txt` file next to the project.

You need [Android Studio](https://developer.android.com/studio) (SDK, NDK, and JDK 17+), with `JAVA_HOME`, `ANDROID_HOME`, and `NDK_HOME` set. Then:

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
npm run android:init         # once, generates src-tauri/gen/android
npm run android:build        # APK for 64-bit ARM devices
```

Sideload the APK from `src-tauri/gen/android/app/build/outputs/apk/`. For Google Play, build an Android App Bundle instead:

```bash
npm run tauri android build -- --aab
```

Use `npm run android:dev` with an emulator or USB-connected device for live reload.

### CI builds (GitHub Actions)

Pushing a tag like `v0.1.0` runs **Build and publish**: it produces the artifacts below, creates a GitHub Release, and pushes to itch.io.

The **Build without itch.io** workflow is manual (**Actions → Build without itch.io → Run workflow**). It produces the same artifacts and can create a GitHub Release if you pass a tag, but it never publishes to itch.io. GitHub only shows that Run button after the workflow file is on `main`.

| Platform | Artifacts |
|----------|-----------|
| macOS (Apple Silicon) | `.dmg` |
| Windows | `.exe` installer (NSIS) |
| Linux x86_64 | `.deb` and portable `.zip` |
| Linux ARM64 (Raspberry Pi) | `.deb` and portable `.zip` |
| Android (64-bit ARM) | `.apk` |

Linux builds run on Ubuntu 22.04 (`ubuntu-22.04` and `ubuntu-22.04-arm`) for broad Debian/Ubuntu compatibility, including 64-bit Raspberry Pi OS. The zip contains the extracted `usr/` tree from the `.deb` for portable use; install the `.deb` for system integration. The ARM64 build is for 64-bit OS on Raspberry Pi 4/5 (and other aarch64 Linux), not 32-bit Raspberry Pi OS. The Android APK is for 64-bit ARM phones and tablets.

Workflow files: [`.github/workflows/build.yml`](.github/workflows/build.yml) (tag + itch.io) and [`.github/workflows/build-manual.yml`](.github/workflows/build-manual.yml) (manual, no itch.io).

Tagged releases are also pushed to [itch.io](https://itch.io/) with [butler](https://github.com/itchio/butler).

1. Create a project page on itch.io (the default target is `<github-username>/sortdraft`).
2. Create an API key at [itch.io API keys](https://itch.io/user/settings/api-keys) (the key with source `wharf`).
3. Add it as the repository secret `BUTLER_API_KEY`.
4. If the itch.io URL is not `https://<github-username>.itch.io/sortdraft`, set the repository variable `ITCH_PROJECT` to `username/game`.
5. Optional, for a stable Android signing key: create a keystore (`keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload`), then add secrets `ANDROID_KEY_BASE64` (output of `base64 -i upload-keystore.jks`), `ANDROID_KEY_PASSWORD`, and `ANDROID_KEY_ALIAS`. Without these, CI still produces an installable APK signed with a throwaway debug key.

| Channel | Artifact |
|---------|----------|
| `osx-arm64` | macOS `.dmg` |
| `windows` | Windows NSIS `.exe` |
| `linux` | Linux x86_64 portable `.zip` |
| `linux-arm64` | Linux ARM64 portable `.zip` |
| `android` | Android `.apk` |

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
