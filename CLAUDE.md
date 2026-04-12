# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape

Turborepo + pnpm workspaces template. Currently a scaffold — most `src/` directories contain only an `index.ts` stub. Pinned via `packageManager: pnpm@10.33.0`.

Workspaces (from [pnpm-workspace.yaml](pnpm-workspace.yaml)): `apps/*` and `packages/*`.

- [apps/web](apps/web) — Next.js 16 + React 19 app. Consumes `ui`.
- [packages/ui](packages/ui) — shared React component library (source-only, no build step; `main` points at `src/index.ts`).
- [packages/entity](packages/entity) — domain entities. No runtime deps.
- [packages/util](packages/util) — utilities. Depends on `entity`. Has Vitest 4 configured.
- [packages/usecase](packages/usecase) — business logic. Depends on `entity` + `util`. Has Vitest 4 configured. **Note:** this package's `package.json` / `tsconfig.json` live under [packages/usecase/src/](packages/usecase/src/), not the package root — unusual layout, preserve it when editing.
- [packages/api](packages/api) — API layer. Depends on `entity` + `util`.
- [packages/tsconfig](packages/tsconfig) — shared TS configs. Extend via `"extends": "tsconfig/base.json"` (or `nextjs.json` / `react-library.json`).
- [packages/eslint-custom](packages/eslint-custom) — shared **flat-config** ESLint 10 presets, exported as `eslint-custom/base`, `eslint-custom/next-js`, `eslint-custom/react-internal`. Uses `@eslint-react/eslint-plugin` for React linting.

Intended dependency direction is clean-architecture style: `entity` → `util` → `usecase` → (`api` | `web`). Keep new code flowing inward: lower layers must not import from higher ones.

## Commands

All orchestration goes through Turbo ([turbo.json](turbo.json)) at the repo root:

```bash
pnpm build           # turbo run build  (respects ^build dependency order)
pnpm dev             # turbo run dev    (persistent, uncached)
pnpm dev:web         # turbo dev --filter=web
pnpm lint            # turbo run lint
pnpm test            # turbo run test
pnpm clean           # turbo run clean
pnpm format          # prettier --write on ts/tsx/md
```

Scoping to a single package uses pnpm filters:

```bash
pnpm --filter web dev
pnpm --filter util test
pnpm --filter util test:watch
pnpm --filter usecase test -- path/to/file.test.ts   # single test file
pnpm --filter ui lint
```

Only `util` and `usecase` have `test` scripts wired to Vitest (`--passWithNoTests`). Adding tests elsewhere requires adding the script + deps to that package's `package.json`.

## Lint configuration

All ESLint configs use **flat config** (`eslint.config.mjs`). Each workspace package has its own `eslint.config.mjs` that imports from `eslint-custom/base` (or `eslint-custom/react-internal` / `eslint-custom/next-js`). There is also a root [eslint.config.mjs](eslint.config.mjs) used by lint-staged.

The pre-commit hook ([.lintstagedrc.mjs](.lintstagedrc.mjs)) routes all `*.{js,mjs,ts,tsx}` files through `pnpm eslint --fix` and `prettier --write`. Non-`public/` HTML/CSS/JSON files also get `prettier --write`.

## Pre-commit

`simple-git-hooks` runs `pnpm lint-staged` on commit (configured in [package.json](package.json)). pnpm 10 blocks postinstall scripts by default — `simple-git-hooks` is whitelisted in `pnpm.onlyBuiltDependencies`. If hooks aren't firing, run `pnpm simple-git-hooks`.
