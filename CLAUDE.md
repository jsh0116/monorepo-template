# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape

Turborepo + pnpm workspaces template. Currently a scaffold — most `src/` directories contain only an `index.ts` stub. Node is pinned via `packageManager: pnpm@8.15.4`.

Workspaces (from [pnpm-workspace.yaml](pnpm-workspace.yaml)): `apps/*` and `packages/*`.

- [apps/web](apps/web) — Next.js 15 + React 19 app. Consumes `ui`.
- [packages/ui](packages/ui) — shared React component library (source-only, no build step; `main` points at `src/index.ts`).
- [packages/entity](packages/entity) — domain entities. No runtime deps.
- [packages/util](packages/util) — utilities. Depends on `entity`. Has Vitest configured.
- [packages/usecase](packages/usecase) — business logic. Depends on `entity` + `util`. Has Vitest configured. **Note:** this package's `package.json` / `tsconfig.json` live under [packages/usecase/src/](packages/usecase/src/), not the package root — unusual layout, preserve it when editing.
- [packages/api](packages/api) — API layer. Depends on `entity` + `util`.
- [packages/tsconfig](packages/tsconfig) — shared TS configs. Extend via `"extends": "tsconfig/base.json"` (or `nextjs.json` / `react-library.json`).
- [packages/eslint-custom](packages/eslint-custom) — shared **flat-config** ESLint presets, exported as `eslint-custom/base`, `eslint-custom/next-js`, `eslint-custom/react-internal`.

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

## Lint configuration gotcha

Two ESLint worlds coexist, do not conflate them:

1. **Root [.eslintrc.js](.eslintrc.js)** — legacy `.eslintrc` format, `extends: ['custom', ...]`. This is what [.lintstagedrc.mjs](.lintstagedrc.mjs) invokes for non-Next files via `pnpm eslint --fix`.
2. **`packages/eslint-custom/*.js`** — flat config (`eslint.config.js`-style) exported as `eslint-custom/base` etc. Individual packages (e.g. Next app) consume these.

The pre-commit hook ([.lintstagedrc.mjs](.lintstagedrc.mjs)) routes files differently:
- Files under `apps/web/src/**/*.{js,jsx,ts,tsx}` → `pnpm --filter web lint --fix --file ...` (Next's own linter).
- Other `packages/**` and `apps/web/!(src)/**` scripts → root `pnpm eslint --fix`.
- All non-`public/` files also get `prettier --write`.

When changing lint rules, figure out which of these two pipelines will actually pick up the file before editing configs.

## Pre-commit

`simple-git-hooks` runs `pnpm lint-staged` on commit (configured in [package.json](package.json)). Install hooks with `pnpm install` (simple-git-hooks registers on postinstall via its own mechanism — if hooks aren't firing, run `pnpm simple-git-hooks`).
