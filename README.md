# Crucible

A modern, AI-powered desktop code editor built with Electron, React, and TypeScript.

Crucible is a lightweight IDE that integrates AI assistants directly into your development workflow — with built-in Git support, an integrated terminal, and multi-provider AI chat.

![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

## Features

- **Monaco Editor** — Full-featured code editing with syntax highlighting, IntelliSense, and multi-tab support
- **AI Assistant** — Chat with Claude, GPT-4o, or Gemini directly in the editor with streaming responses and tool calling
- **Git Integration** — Stage, commit, push, pull, branch, stash, and view history without leaving the editor
- **Integrated Terminal** — Built-in terminal with PTY support
- **File Explorer** — Tree view with file watching and real-time updates
- **Search** — Fast file and content search powered by ripgrep
- **GitHub Integration** — Connect to GitHub repos via Octokit
- **Diff Viewer** — Side-by-side diff comparison
- **Keyboard Shortcuts** — Quick open (`Ctrl+P`), toggle sidebar (`Ctrl+B`), terminal (`Ctrl+``), search (`Ctrl+Shift+F`)
- **Dark/Light Themes** — Customizable with CSS variables
- **Cross-Platform** — Builds for Linux, macOS, and Windows

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron 28 |
| Frontend | React 18, Tailwind CSS 3, Zustand |
| Editor | Monaco Editor |
| Terminal | xterm.js + node-pty |
| AI | Anthropic SDK, OpenAI SDK, Google Generative AI |
| Git | simple-git |
| Build | Vite, TypeScript, electron-builder |
| Database | better-sqlite3 |

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Installation

```bash
git clone https://github.com/modelpath-dev/Crucible.git
cd Crucible
npm install
```

### Development

```bash
npm run dev
```

This starts the Vite dev server and launches Electron concurrently.

### Build

```bash
# Build renderer and main process
npm run build

# Package for distribution
npm run package
```

Packaged builds are output to the `release/` directory:
- **Linux**: AppImage, .deb
- **macOS**: DMG, ZIP
- **Windows**: NSIS installer

### Type Checking

```bash
npm run typecheck
```

## Project Structure

```
Crucible/
├── src/                    # React frontend (renderer process)
│   ├── components/         # UI components
│   │   ├── ai/            # AI chat panel
│   │   ├── editor/        # Monaco editor, tabs, diff viewer
│   │   ├── explorer/      # File tree
│   │   ├── git/           # Git panel, history, graph
│   │   ├── github/        # GitHub integration
│   │   ├── layout/        # Shell, title bar, sidebar, status bar
│   │   ├── search/        # Search panel, quick open
│   │   ├── settings/      # Settings panel
│   │   ├── shared/        # Reusable UI (modals, tooltips, toasts)
│   │   └── terminal/      # Terminal panel
│   ├── stores/            # Zustand state management
│   ├── services/          # Business logic & AI tools
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   └── themes/            # Global styles & CSS variables
├── electron/              # Electron main process
│   ├── main.ts            # App entry point
│   ├── preload.ts         # Context bridge (IPC API)
│   ├── ipc/               # IPC handlers (fs, git, terminal, ai, search)
│   └── services/          # File watcher, project index, secure store, LSP
├── shared/                # Shared types & IPC channel definitions
├── resources/             # Build assets (ripgrep binary)
└── dist/                  # Compiled output
```

## Configuration

API keys are stored securely in the OS keychain via the built-in secure store — no `.env` files needed. Configure your AI provider keys through the Settings panel in the app.

## License

ISC
