# FocusHub

**Track focus loops. Build lasting habits.**

A calm, keyboard-friendly workspace for deep work — timers, habits, seasons, notes, and analytics in one place. No context switching, no clutter.

License: MIT · Built with Tauri · Vanilla JS · Firebase · Rust

Download · Ko-fi

## What is FocusHub?

FocusHub is a productivity dashboard that helps you log deep work sessions, maintain consistency streaks, and audit your focus patterns — all from a single, clean interface.

It's built around one truth: **tracking only works if it's frictionless.**

No account setup friction — sign in with email or Google and your data syncs in real time via Firebase. It runs as a website or as a tiny native desktop app powered by Tauri.

##  Features

- **Instant capture** — add a topic or habit and press Enter. Two seconds, no mouse.
- **Deep Work Timer** — start, pause, and log sessions per topic or habit with a live counter.
- **Analytics Dashboard** — time allocation breakdowns with visual progress bars.
- **Activity Calendar** — year-round focus heatmap and monthly calendar showing daily intensity.
- **Seasons Planner** — structured 4–6 week focus blocks with professional/personal goals and daily energy logging.
- **Notes Workspace** — rich-text notes editor that auto-saves as you type.
- **Multi-provider Auth** — Email/Password and Google Sign-In.
- **Live Sync** — every change mirrored to Firestore across devices in real time.
- **Tiny desktop shell** — Tauri wraps the web app in a native window (~10 MB), far lighter than Electron.
- **Responsive UI** — Tailwind CSS, looks good on phone and desktop.

## Built for focus

Most productivity apps are built for people who just need a nudge. FocusHub is built for people whose attention is the scarce resource — so capturing and reviewing must be near-zero friction.

Concretely, this means:

| What most apps do | What FocusHub does |
| --- | --- |
| Scatter features across menus | One dashboard, everything one click away |
| Force manual time logging | Live timer with one-tap log |
| Hide long-term trends | Year heatmap + monthly calendar front and center |
| Big, heavy desktop apps (Electron) | Tiny native Tauri shell (~10 MB) |
| Lose data between devices | Real-time Firestore sync |
| Require a server to function | Desktop app runs fully offline-capable via cached assets |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Shell | Tauri 2 — native window, OS integrations |
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+ modules) |
| Styling | Tailwind CSS (CDN), Lucide Icons (CDN), Google Fonts |
| Backend-as-a-Service | Firebase Auth + Firestore (loaded via ESM CDN) |
| Core | Rust — Tauri runtime, IPC, window management |
| Build Tooling | Node.js, `@tauri-apps/cli`, Cargo (Rust toolchain) |
| Packaging | MSI + NSIS (Windows) · DMG (macOS) · .deb + AppImage (Linux) |

## Download

| Platform | Architecture | Download |
| --- | --- | --- |
| Windows | x64 | `FocusHub_0.1.0_x64-setup.exe` · `FocusHub_0.1.0_x64_en-US.msi` |
| macOS | Apple Silicon (M1/M2/M3) | `FocusHub_0.1.0_aarch64.dmg` |
| macOS | Intel | `FocusHub_0.1.0_x64.dmg` |
| Linux | x86_64 | `FocusHub_0.1.0_amd64.deb` · `FocusHub_0.1.0_x86_64.AppImage` |

> Build installers yourself with `npm run tauri build` — artifacts land in `src-tauri/target/release/bundle/`.
>
> Releases are not code-signed on Windows/macOS by default — you may see a SmartScreen/ Gatekeeper warning.

## 🔨 Build from Source

**Prerequisites:** Rust stable · Node.js 18+ · Cargo on PATH · WebView2 (Windows)

```bash
# Clone
git clone https://github.com/your-username/focus-hub.git
cd focus-hub

# Install JS dependencies (Tauri CLI + dev server)
npm install

# Run in dev mode (hot-reload UI + Rust backend)
npm run tauri dev
# or double-click dev.bat on Windows

# Build a release binary + installer for your platform
npm run tauri build
```

Built artifacts land in `src-tauri/target/release/bundle/`.

### Run the web app only

```bash
npx serve frontend
# or
python -m http.server 3000 frontend
```

## Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** (Email/Password **and** Google) and a **Firestore Database**.
3. A safe default Firebase config is hard-coded in `frontend/dashboard.html`. To override it, add `env.js` at the repo root:

```javascript
window.__FIREBASE_CONFIG__ = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

> `env.js` is git-ignored. Firebase web API keys are public by design — protect data with **Firestore Security Rules**.

### Desktop-only step (Google Sign-In)

Tauri's webview runs on `http://localhost`. For Google login in the desktop app, add `localhost` to Firebase → **Authentication → Settings → Authorized domains**. The app auto-switches Google login from popup to redirect flow when running in Tauri — no code change needed.

## Deployment (Web)

FocusHub is a static site. **Set the publish/build directory to `frontend/`** (the web files live there, not the repo root).

| Host | Setting |
| --- | --- |
| Netlify / Vercel | Publish directory → `frontend` (no build command) |
| Firebase Hosting | `firebase.json` public dir → `frontend` |
| GitHub Pages | Pages source → `frontend` folder |

## Contributing

FocusHub is open source and contributions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit: `git commit -m 'Add amazing feature'`.
4. Push: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

Please keep the UX calm and low-friction — no feature should add cognitive load to someone mid-focus-session.

## Support

FocusHub is free and open-source, built to help you focus better, one session at a time.

If it's helped you, a Ko-fi goes a long way:

Support on Ko-fi

## License

MIT © FocusHub
