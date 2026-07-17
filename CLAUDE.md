# CLAUDE.md

## Lưu ý quan trọng
- Khi phát triển dev chúng ta sẽ không dùng i18n, chúng ta sẽ viết text trực tiếp luôn, khi nào ra bản chính thức chúng ta mới setup cẩn thận i18n

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`electron-shadcn` is an Electron desktop application template built with Vite, TypeScript, React, TanStack Router, Tailwind, Shadcn UI, and oRPC for type-safe IPC. The user-facing product name is "electron-shadcn"; the workspace folder here is named `csep-tool-desktop` (likely a downstream rebrand — keep `package.json#name` and `productName` in sync if renaming).

## Commands

All commands are run from the project root. Run `npm install` first.

| Task | Command |
| --- | --- |
| Start the app (dev mode with HMR) | `npm run start` |
| Package without distributables | `npm run package` |
| Build distributables (squirrel, zip, rpm, deb) | `npm run make` |
| Publish a draft GitHub release (requires `GITHUB_TOKEN`) | `npm run publish` |
| Lint & format check (Ultracite/Biome) | `npm run check` |
| Auto-fix lint/format issues | `npm run fix` |
| Unit tests (Vitest, watch mode) | `npm run test:unit` |
| Unit tests (Vitest, single run) | `npm run test` |
| E2E tests (Playwright, against built app) | `npm run test:e2e` |
| Run both unit + e2e suites | `npm run test:all` |
| Reinstall/upgrade current Shadcn UI components | `npm run bump-ui` |

`npm run bump-ui` reads `src/components/ui/*` and runs `shadcn@latest add -y -o` for each component already present — useful to refresh styles/API of existing primitives.

## Architecture

The repo is the Electron Forge Vite template configured for three build targets (main, preload, renderer). See [forge.config.ts](forge.config.ts) and [src/main.ts](src/main.ts).

### Process model

- **Main process** ([src/main.ts](src/main.ts)) — creates the single `BrowserWindow`, registers `ipcMain` listeners, sets up oRPC over a `MessagePort`, and runs `update-electron-app` against GitHub Releases. The window uses `titleBarStyle: "hidden"` (with `hiddenInset` on macOS), `contextIsolation: true`, and `nodeIntegration: true` in `webPreferences`.
- **Preload** ([src/preload.ts](src/preload.ts)) — tiny shim that forwards the `start-orpc-server` `postMessage` to `ipcRenderer.postMessage`. The actual IPC contract is delivered via `MessagePort`, not exposed as separate `contextBridge` APIs.
- **Renderer** ([src/renderer.ts](src/renderer.ts) → [src/app.tsx](src/app.tsx)) — bootstraps React, mounts `RouterProvider`, syncs theme/language on mount, and runs inside `React.StrictMode`.

### Routing (TanStack Router, file-based)

- File-based routes live under [src/routes/](src/routes/). The TanStack Router Vite plugin regenerates [src/routeTree.gen.ts](src/routeTree.gen.ts) on edit — do not edit that file by hand.
- `src/routes/__root.tsx` wraps every page in [BaseLayout](src/layouts/base-layout.tsx) (drag region + `<main>`) and conditionally mounts `TanStackRouterDevtools` via React's `<Activity>` only in development.
- The router is created in [src/utils/routes.ts](src/utils/routes.ts) using `createMemoryHistory` (Electron-friendly, no URL bar).
- To add a page: drop a new `src/routes/<name>.tsx` exporting `createFileRoute("/<path>")({ component: ... })`. The plugin picks it up.

### IPC (oRPC over MessagePort)

Rather than `contextBridge`/`ipcRenderer.invoke`, this app ships an **oRPC server that runs inside the main process** and is exposed to the renderer through a `MessageChannel`. The handshake is the `start-orpc-server` constant in [src/constants/index.ts](src/constants/index.ts#L6-L8).

- **Renderer side:** [src/ipc/manager.ts](src/ipc/manager.ts) creates a `MessageChannel`, keeps one end locally to build an `RPCLink`, posts the other end to the window. The exported singleton `ipc.client` is the typed RPC client used from the actions layer.
- **Main side:** [src/main.ts:60-69](src/main.ts#L60-L69) listens for the `START_ORPC_SERVER` channel on `ipcMain`, takes the `MessagePort`, and calls `rpcHandler.upgrade(serverPort)`. The handler is constructed in [src/ipc/handler.ts](src/ipc/handler.ts) from the router.
- **Router** ([src/ipc/router.ts](src/ipc/router.ts)) composes per-domain modules. Each module under `src/ipc/<domain>/` follows the pattern:
  - `handlers.ts` — oRPC `os.handler(...)` definitions (use `os.input(zodSchema).handler(...)` when input is required).
  - `schemas.ts` — Zod schemas for inputs (e.g., `src/ipc/theme/schemas.ts`, `src/ipc/shell/schemas.ts`).
  - `index.ts` — re-exports handlers as a named namespace (e.g., `export const theme = { getCurrentThemeMode, setThemeMode, toggleThemeMode }`).
- **Context injection:** [src/ipc/context.ts](src/ipc/context.ts) holds the singleton `BrowserWindow` and exposes an oRPC middleware (`ipcContext.mainWindowContext`) used by handlers that need the main window (see [src/ipc/window/hadlers.ts](src/ipc/window/hadlers.ts)).
- **Adding a new IPC domain:** create `src/ipc/<domain>/` with `handlers.ts`, optional `schemas.ts`, and `index.ts`; register it in [src/ipc/router.ts](src/ipc/router.ts); consume from the renderer via a new file in [src/actions/](src/actions/) that wraps `ipc.client.<domain>.<method>(...)`.

#### Action wrappers

[src/actions/](src/actions/) is the renderer's call-site surface for IPC. Each file (`theme.ts`, `window.ts`, `shell.ts`, `app.ts`, `language.ts`) is a thin typed wrapper around `ipc.client.*` plus any client-side bookkeeping (e.g., `localStorage` writes for [theme.ts](src/actions/theme.ts) and [language.ts](src/actions/language.ts)). UI components should call these — never `ipc.client.*` directly — so the IPC layer can evolve without rewriting components.

### UI

- **Shadcn UI primitives** are checked-in to [src/components/ui/](src/components/ui/). They're managed via `npm run bump-ui`, not the CLI.
- **Compositional components** (drag region, nav menu, lang toggle, theme toggle, external link) live in [src/components/](src/components/).
- **Layouts** live in [src/layouts/](src/layouts/); `BaseLayout` renders the custom title bar via [DragWindowRegion](src/components/drag-window-region.tsx) which uses CSS class `.draglayer` (`-webkit-app-region: drag`) defined in [src/styles/global.css](src/styles/global.css#L132-L134). Custom window controls call `minimizeWindow`/`maximizeWindow`/`closeWindow` IPC actions.
- **Styling:** Tailwind 4 + Shadcn UI `radix-mira` style. Geist font set as default; tokens declared via `@theme inline` in `global.css`. `cn()` helper in [src/utils/tailwind.ts](src/utils/tailwind.ts).
- **Icons:** Lucide React (`lucide-react`) and `@icons-pack/react-simple-icons` for brand icons.
- **React Compiler** is enabled via `@vitejs/plugin-react` + `@rolldown/plugin-babel` with `reactCompilerPreset` in [vite.renderer.config.mts](vite.renderer.config.mts).

### Localization

- [src/localization/i18n.ts](src/localization/i18n.ts) initializes i18next with inline resources for `en` and `pt-BR`.
- [src/localization/langs.ts](src/localization/langs.ts) is the canonical list of supported languages used by [LangToggle](src/components/lang-toggle.tsx). Add a language by adding it to both files (plus a resource block in `i18n.ts`).
- Persisted language lives in `localStorage` under the `LOCAL_STORAGE_KEYS.LANGUAGE` key; [setAppLanguage](src/actions/language.ts) writes both `localStorage` and `document.documentElement.lang`.

### State persistence

Renderer-side state is in `localStorage` only. Constants are centralized in [src/constants/index.ts](src/constants/index.ts) — add new keys there.

### Auto-update

[src/main.ts:51-58](src/main.ts#L51-L58) calls `updateElectronApp` against the GitHub repo `LuanRoger/electron-shadcn`. Update [src/main.ts](src/main.ts) when forking or rebranding — the repo URL is hard-coded there, not in [forge.config.ts](forge.config.ts). Publishing is via `electron-forge publish`; see [forge.config.ts:52-68](forge.config.ts#L52-L68) for the GitHub publisher config (draft releases by default).

## Testing

- **Unit tests** (Vitest + jsdom + Testing Library): [src/tests/unit/](src/tests/unit/). Configure path alias `@` → `src` and global `expect`. Run a single test file: `npx vitest run src/tests/unit/<file>.test.ts(x)`.
- **E2E tests** (Playwright with Electron via `electron-playwright-helpers`): [src/tests/e2e/](src/tests/e2e/). `npm run test:e2e` requires a packaged app — CI runs `npm run package` then `npm run test:e2e` under `xvfb-run`. Locally on Windows, run `npm run package` first, then `npm run test:e2e`.

## Tooling notes

- **Path alias:** `@/*` resolves to `./src/*` (see [tsconfig.json](tsconfig.json) and the three Vite configs). Import as `@/components/...` etc.
- **Formatting & linting:** Ultracite wraps Biome. Run `npm run fix` before committing. The project intentionally excludes `**/*.d.ts`, `**/node_modules`, and `**/ui` from Biome (`biome.jsonc`).
- **React 19+ patterns:** use ref-as-prop (no `forwardRef`). Don't define components inside other components.
- **Don't edit generated files:** [src/routeTree.gen.ts](src/routeTree.gen.ts) is regenerated by the TanStack Router Vite plugin on every relevant change.
