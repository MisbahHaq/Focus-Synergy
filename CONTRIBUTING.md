# Contributing to Focus Synergy

Thank you for helping build Focus Synergy! We prioritize low cognitive load, calm design, and rapid focus tracking.

---

## Core Principles

1. **Keep UX Calm and Low-Friction**:
   - The app's primary purpose is deep focus. Avoid popups, intrusive modals, nag screens, or unnecessary badges.
   - Everything should work instantly with minimal clicks and keyboard-friendly shortcuts.
2. **Device and Mode Independence**:
   - Every feature must function cleanly in both **Cloud (Firebase)** and **Local (Offline)** storage modes.
   - Never hardcode Firestore assumptions into UI views; always use the `StorageAdapter` abstraction layer.

---

## Local Development Setup

1. **Clone & Install**:
   ```bash
   git clone https://github.com/MisbahHaq/Focus-Synergy.git
   cd Focus-Synergy
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and fill in your Firebase project configuration (for Cloud mode development):
   ```bash
   cp .env.example .env
   npm run build:env
   ```

3. **Start Development Server**:
   ```bash
   # Desktop app (Tauri):
   npm run dev

   # Or web server only:
   npm run static-server
   ```

---

## Coding Conventions

- **JS Modules**: ES6 modules (`import` / `export`) with clean single-responsibility helper modules under `frontend/js/`.
- **Styling**: Tailwind CSS via utility classes. Use cohesive Zinc/Midnight color scales for dark & midnight mode support.
- **Naming**: `camelCase` for JS functions and properties, `kebab-case` for HTML element IDs and filenames.
- **IPC Calls**: Use feature detection (`isTauriEnv()`) when triggering native OS features (notifications, filesystem dialogs).

---

## Pull Request Checklist

Before submitting a PR, verify:
- [ ] **No added cognitive load mid-session**: Does this addition stay out of the user's focus path?
- [ ] **Dual storage mode support**: Did you test changes against both Cloud and Local storage modes?
- [ ] **Firestore Security Rules**: If new collections or fields were introduced, are matching rules included in `firestore.rules`?
- [ ] **Timer drift**: Does any timer calculation rely on timestamp math (`Date.now() - startedAt`) rather than ticking intervals?
- [ ] **Documentation**: Have README, CONTRIBUTING, or SIGNING docs been updated if necessary?
