---
name: update-dependencies
description: Upgrade this repo's npm dependencies safely — dry-run ncu, apply minor/patch only, run the same checks as CI and the git hooks (format, package lint, typecheck, knip, lint, vitest, build, package exports/types, CVE scan), report the run. Use when the user asks to update dependencies, upgrade packages, bump deps, check for outdated packages, or run ncu.
---

Upgrades every minor/patch-bumpable dependency in one pass, skips majors, then proves the upgrade didn't break anything before reporting. Never bump a major in this flow — log it for a separate, deliberate pass instead.

This repo is a published library (`@lichens-innovation/ts-common`): many runtime libs (`i18next`, `react-i18next`, `@rjsf/*`, `exceljs`, `jspdf`, `pino`, `mime`, `papaparse`, …) are optional `peerDependencies` pinned `*` and installed as exact-pinned `devDependencies` for build/test. ncu only bumps the devDependency pin — leave the `*` peer ranges alone.

## 1. Classify

```bash
bunx npm-check-updates
```

ncu groups output under `Patch`, `Minor`, `Major`. Patch + Minor = safe set; Major = skip set.

Plain ncu only reports each package's latest version, so a package with a new major hides any in-range minor/patch bump. Catch those too:

```bash
bunx npm-check-updates --target minor
```

Anything listed here that's in the skip set → its in-major bump joins the safe set.

Done when: every listed package is sorted into one of the two sets, and in-major bumps of skipped majors are in the safe set.

## 2. Apply the safe set

```bash
bunx npm-check-updates -u -x <comma-separated-major-pkgs>
bunx npm-check-updates -u --target minor
bun install
```

Excluding majors up front keeps this idempotent — rerunning after a partial failure is safe. Pins stay exact (`lint:package` enforces no `^`/`~`).

Done when: `bun install` exits 0.

## 3. Verify

Run each script as its own command and check its exit code — don't chain them in a zsh loop with `PIPESTATUS` (zsh uses `pipestatus`, the check silently breaks). Stop on the first failure:

1. `bun run format:check`
2. `bun run lint:package`
3. `bun run typecheck`
4. `bun run lint:unused` — knip
5. `bun run lint` — coding-guide (ESLint + knip + comments + jscpd)
6. `bun run test:coverage` — vitest unit suite with the coverage threshold; this is the repo's only test suite (no e2e).
7. `bun run build`
8. `bun run lint:exports` — publint on the packed build
9. `bun run lint:types` — attw on the packed build (node16 + bundler)

Same order as CI (`.github/workflows/ci.yml`), fastest first. The pre-commit hook covers typecheck, lint-staged (Prettier + `package.json` lint) and `coding-guide check --staged`; the pre-push hook covers knip and tests with coverage.

- `prettier` in the applied set → a `format:check` failure on previously-clean files is expected on new rules. Run `bun run format`, then confirm the diff only touches files `format:check` flagged — a wider diff means something else broke.
- `knip` in the applied set → new findings may be new detection rules, not real dead code. Inspect before deleting anything; prefer reporting over fixing.
- `tsup` / `typescript` in the applied set → a `lint:types` failure means the emitted `.d.ts`/`.d.cts` changed shape; report it, never silence it with `--ignore-rules`.
- `vitest` / `@vitest/coverage-v8` in the applied set → a coverage-threshold drop with all tests passing is a reporter change, not a regression; report it.
- Ignore as pre-existing, not a regression: `no-console` lint warnings (lint exits 0 with warnings; only errors fail).
- Any other failure: trivial fix (type signature, import path) → apply and continue. Real API break → stop, report, never downgrade unilaterally to route around it.

Done when: all nine scripts exit 0.

## 4. CVE scan

```bash
bun run security:check
```

The pre-commit hook runs this whenever `package.json` or `bun.lock` is staged, so a failure here blocks the commit. It ratchets against `.cve-lite/baseline.json`: only findings above baseline fail.

- New finding introduced by the upgrade (package/version appears in the `bun.lock` diff) → report it, and try to clear it with a further minor/patch bump of the parent.
- Finding already present before the upgrade → pre-existing, report it, don't fix in this flow. To tell, grep `bun.lock` for the flagged `name@version` and check whether its entry is in `git diff bun.lock`. Known example: `glob@13.0.6` / `minimatch@10.2.6`, bundled inside `npm` (pulled in by `semantic-release`) — not fixable from here.
- Never delete `.cve-lite/baseline.json` to re-baseline without the user's explicit OK.

Done when: the scan passes, or every finding is classified as introduced vs. pre-existing.

## 5. Report

Rank skipped majors by adoption risk: lint/test-only deps with no in-repo usage rank lowest; deps used across `src/` or exposed as peer deps, toolchain deps (`typescript`, `tsup`, `vite`, `vitest`), or several majors jumped at once rank highest. Gauge usage with `grep -rlE "from ['\"]<pkg>" src`.

Report to the user: what upgraded, majors skipped with risk ranking, anything hit plus the fix applied, verify results (test counts), CVE scan result.

Done when: the user has the summary.
