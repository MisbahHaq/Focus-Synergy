# Focus Synergy

**Track focus loops. Build lasting habits.**

A calm, keyboard-friendly workspace for deep work — timers, habits, seasons, notes, and analytics in one place. No context switching, no clutter.

License: MIT · Built with Tauri · Vanilla JS · Firebase · Rust

## What is Focus Synergy?

Focus Synergy is a productivity dashboard that helps you log deep work sessions, maintain consistency streaks, and audit your focus patterns — all from a single, clean interface.

It's built around one truth: **tracking only works if it's frictionless.**

Sign in with email or Google for real-time cloud sync via Firebase, with offline persistence for when you're on the move. It runs as a website or a native desktop app powered by Tauri.

## Screenshots
<img width="720" height="450" alt="Scene" src="https://github.com/user-attachments/assets/5025512d-946f-4432-8680-3f0631b7c4a9" />


## Features

- **Deep Work Timer** — create *Topics* or *Habits*, then start, pause, and log focused sessions with a live counter and per-item timers. Pinned items stay at the top of your dashboard.
- **Analytics & Highlights** — see time allocation and top focus metrics across your tracked items at a glance.
- **Activity Calendar** — a year-long focus heatmap plus a navigable month calendar showing daily intensity.
- **Seasons Planner** — structured 4–6 week focus blocks with a professional/personal goal, a daily "non-negotiable minimum" micro-habit, a daily energy log (high-energy production vs. low-energy consumption), and an end-of-season retrospective with focus totals and completion stats.
- **Not-Right-Now Backlog** — park ideas, frameworks, and hobbies so they don't distract your current season; promote them into a season in one click.
- **Notes Workspace** — a rich-text notes editor (bold, italic, lists) that auto-saves as you type, with full-text search and a quick-notes sidebar on the dashboard.
- **Data Import / Export** — full JSON backup and per-domain CSV exports via the native Tauri save dialog.
- **Onboarding Tour** — a step-through coachmark tour on first login (replayable from settings) so new users find their way around.
- **Break Reminders** — native desktop + web notifications after a configurable focus threshold.
- **Multi-provider Auth** — Email/Password and Google Sign-In, with an automatic redirect flow inside the Tauri webview.
- **Live Sync** — every change is mirrored to Firestore in real time via snapshot listeners, with offline IndexedDB persistence and a multi-device single-active-timer guarantee.
- **Three-Way Theme** — Light, Dark, and Midnight palettes.
- **Sound Feedback** — subtle audio cues for timer, log, and habit actions.
- **In-App Updates** — silent auto-update checks via the Tauri updater, plus a manual check in Settings.
- **Tiny desktop shell** — Tauri wraps the web app in a native window (~10 MB), far lighter than Electron.
- **Responsive UI** — Tailwind CSS, looks good on phone and desktop.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Shell | Tauri 2 — native window, OS integrations |
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+ modules), Vite build pipeline |
| Styling | Tailwind CSS (compiled via PostCSS), Lucide Icons, Plus Jakarta Sans (Google Fonts) |
| Backend-as-a-Service | Firebase Auth + Cloud Firestore (npm packages) |
| Realtime | Firestore `onSnapshot` listeners per collection |
| Core | Rust — Tauri runtime, IPC, window management, updater, dialog, fs plugins |
| Build Tooling | Node.js, Vite, `@tauri-apps/cli`, Cargo (Rust toolchain) |
| Testing | Vitest (unit), `@firebase/rules-unit-testing` (Firestore rules) |
| CI / Release | GitHub Actions — lint, format, build, cross-platform installers |
| Packaging | MSI + NSIS (Windows) · DMG (macOS) · .deb + AppImage (Linux) |

## Project Structure

```
Focus Synergy/
├── frontend/                # Web app source (Vite root)
│   ├── index.html           # Marketing / landing page
│   ├── dashboard.html       # Authenticated app shell (login, tracker, calendar, notes, seasons)
│   ├── env.js               # Injected Firebase config (generated from .env)
│   ├── css/styles.css       # Compiled Tailwind + theme palettes
│   ├── js/
│   │   ├── app.js           # Core dashboard logic
│   │   ├── main-index.js    # Landing page logic
│   │   ├── modules/         # onboarding, export, retrospective, notifications
│   │   ├── storage/         # FirebaseAdapter, storage factory
│   │   └── utils/           # theme, format, sanitize, state, tauri helpers (+ tests)
│   └── dist/                # Built output (committed; served by the Tauri shell)
├── src-tauri/               # Rust desktop shell
│   ├── src/
│   │   ├── main.rs          # Entry point, calls the library run()
│   │   └── lib.rs           # Tauri builder, plugins (updater, dialog, fs, opener, process)
│   ├── tauri.conf.json      # App config (product name, identifier, window, bundling, updater)
│   ├── Cargo.toml           # Rust package manifest
│   └── Cargo.lock
├── scripts/                 # Node build tooling (all .cjs)
│   ├── build-runner.cjs     # Orchestrates env generation + vite build
│   ├── build-frontend.cjs   # Generates frontend/env.js from .env
│   ├── static-server.cjs    # Local dev server on :5173
│   ├── build-favicon.cjs    # Favicon generation
│   ├── convert-ico.cjs      # ICO conversion
│   ├── generate-screenshots.cjs # Screenshot tooling
│   └── test-rules.cjs       # Firestore rules test suite
├── .github/workflows/       # ci.yml + release.yml (cross-platform builds & releases)
├── package.json             # npm scripts (dev, build, tauri, test, lint, format)
└── README.md
```

## Data Model

Data is stored per-user under `users/{uid}/` in Firestore, one collection per feature:

- `items` — topics and habits with running timers (`accumulatedSeconds`, `startedAt`, `isRunning`)
- `logs` — completed focus sessions (seconds logged per item)
- `notes` — rich-text notes (title + body, auto-saved)
- `seasons` — focus blocks with dev/personal goals and micro-habits
- `backlog` — parked ideas
- `dailyLogs` — per-day energy-mode activity entries
- `habitLogs` — daily micro-habit completion

## Download

| Platform | Architecture | Download |
| --- | --- | --- |
| Windows | x64 | `FocusSynergy_0.1.0_x64-setup.exe` · `FocusSynergy_0.1.0_x64_en-US.msi` |
| macOS | Apple Silicon (M1/M2/M3) | `FocusSynergy_0.1.0_aarch64.dmg` |
| macOS | Intel | `FocusSynergy_0.1.0_x64.dmg` |
| Linux | x86_64 | `FocusSynergy_0.1.0_amd64.deb` · `FocusSynergy_0.1.0_x86_64.AppImage` |

> Build installers yourself with `npm run build:tauri` — artifacts land in `src-tauri/target/release/bundle/`.
>
> Releases are not code-signed on Windows/macOS by default — you may see a SmartScreen/ Gatekeeper warning.

## Build from Source

**Prerequisites:** Rust stable · Node.js 18+ · Cargo on PATH · WebView2 (Windows)

```bash
# 1. Configure Firebase credentials
#    Create a .env file at the repo root with your Firebase project values
#    (see scripts/build-frontend.cjs for the expected FIREBASE_* keys).
#    .env is git-ignored and is the ONLY place secrets live — frontend/env.js
#    is generated from it and is also git-ignored, so no credentials are
#    ever committed.

# 2. Install JS dependencies (Tauri CLI + Vite + Firebase)
npm install

# 3. Generate frontend/env.js from .env
npm run build:env

# 4. Run in dev mode (Vite hot-reload UI + Rust backend)
npm run dev
# or run the Tauri shell with:
npm run dev:tauri
# or double-click dev.bat on Windows

# 5. Build a release binary + installer for your platform
npm run build
# then package the desktop app with:
npm run build:tauri
```

Built artifacts land in `src-tauri/target/release/bundle/`.

### Run the web app only

```bash
# Build the frontend, then serve the compiled output
npm run build
npm run preview
# or run the static dev server directly:
npm run static-server
```

### Desktop-only step (Google Sign-In)

Tauri's webview runs on `http://localhost`. For Google login in the desktop app, add `localhost` to Firebase → **Authentication → Settings → Authorized domains**. The app auto-switches Google login from popup to redirect flow when running in Tauri — no code change needed.

## Contributing

Focus Synergy is open source and contributions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit: `git commit -m 'Add amazing feature'`.
4. Push: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

Please keep the UX calm and low-friction — no feature should add cognitive load to someone mid-focus-session.

## Support

Focus Synergy is free and open-source, built to help you focus better, one session at a time.

## License

MIT © Focus Synergy
