# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape

Turborepo + pnpm 10 workspaces monorepo. Pinned via `packageManager: pnpm@10.33.0`.

Workspaces (from [pnpm-workspace.yaml](pnpm-workspace.yaml)): `apps/*` and `packages/*`.

### Apps

- [apps/service-web](apps/service-web) — Next.js 16 + React 19. 서비스 웹.
- [apps/admin-web](apps/admin-web) — React 19 + Vite 8. 어드민 웹.
- [apps/service-app](apps/service-app) — Expo SDK 54 + React Native. 모바일 앱. Expo가 react/typescript 버전을 자체 관리하므로 catalog 미적용.

### Packages

- [packages/ui](packages/ui) — shared React component library (source-only, no build step; `main` points at `src/index.ts`).
- [packages/entity](packages/entity) — domain entities. No runtime deps.
- [packages/util](packages/util) — utilities. Depends on `entity`. Has Vitest 4 configured.
- [packages/usecase](packages/usecase) — business logic. Depends on `entity` + `util`. Has Vitest 4 configured. **Note:** this package's `package.json` / `tsconfig.json` live under [packages/usecase/src/](packages/usecase/src/), not the package root — unusual layout, preserve it when editing.
- [packages/api](packages/api) — API layer. Depends on `entity` + `util`.
- [packages/testing](packages/testing) — shared test utilities. Exports `testing/e2e` (Playwright config/fixtures) and `testing/mocks` (MSW server/handlers).
- [packages/tsconfig](packages/tsconfig) — shared TS configs (`base.json`, `nextjs.json`, `react-library.json`).
- [packages/eslint-custom](packages/eslint-custom) — shared **flat-config** ESLint 10 presets (`eslint-custom/base`, `eslint-custom/next-js`, `eslint-custom/react-internal`). Uses `@eslint-react/eslint-plugin` for React linting.

Intended dependency direction is clean-architecture style: `entity` → `util` → `usecase` → (`api` | apps). Lower layers must not import from higher ones.

## Commands

All orchestration goes through Turbo ([turbo.json](turbo.json)) at the repo root:

```bash
pnpm build           # turbo run build
pnpm dev             # turbo run dev (all apps)
pnpm dev:service     # turbo dev --filter=service-web
pnpm dev:admin       # turbo dev --filter=admin-web
pnpm lint            # turbo run lint
pnpm test            # turbo run test
pnpm clean           # turbo run clean
pnpm format          # prettier --write on ts/tsx/md
```

Scoping to a single package uses pnpm filters:

```bash
pnpm --filter service-web dev
pnpm --filter admin-web dev
pnpm --filter service-app dev          # expo start
pnpm --filter util test
pnpm --filter util test:watch
pnpm --filter usecase test -- path/to/file.test.ts
```

Only `util`, `usecase`, and `testing` have `test` scripts wired to Vitest (`--passWithNoTests`). Adding tests elsewhere requires adding the script + deps to that package's `package.json`.

## pnpm catalog

Shared dependency versions are defined in [pnpm-workspace.yaml](pnpm-workspace.yaml) under `catalog:`. Individual `package.json` files reference them with `"catalog:"` instead of version strings. This centralizes version management — when bumping react, typescript, vite etc., update the catalog once instead of every package.json.

**Exception:** `apps/service-app` (Expo) pins its own react/typescript versions because Expo SDK manages compatibility tightly. Do not convert these to `catalog:`.

## Lint configuration

All ESLint configs use **flat config** (`eslint.config.mjs`). Each workspace package has its own `eslint.config.mjs` that imports from `eslint-custom/base` (or `eslint-custom/react-internal` / `eslint-custom/next-js`). There is also a root [eslint.config.mjs](eslint.config.mjs) used by lint-staged.

## Pre-commit

`simple-git-hooks` runs `pnpm lint-staged` on commit (configured in [package.json](package.json)). [.lintstagedrc.mjs](.lintstagedrc.mjs) routes all `apps/**` and `packages/**` script files through `eslint --fix` + `prettier --write`.

pnpm 10 blocks postinstall scripts by default — `simple-git-hooks`, `esbuild`, `sharp`, `msw` are whitelisted in `pnpm.onlyBuiltDependencies`. If hooks aren't firing, run `pnpm simple-git-hooks`.
