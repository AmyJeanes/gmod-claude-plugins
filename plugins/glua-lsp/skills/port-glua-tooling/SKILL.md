---
name: port-glua-tooling
description: Port a GMod addon repo to the standardized glua tooling pattern — pinned glua_check / glua_ls / glua-api stubs via scripts/install-tools.ps1, a one-line scripts/glua-check.ps1 runner, a CI workflow with a GLua Check job, Renovate customManager auto-bumps gated by CI, addon.json ignores, and VS Code Pollux extension pointing at the project-local binary. Use when starting a new GMod addon, when the user says "port <repo>" or "do this on <repo> too", or when an existing repo still has inline `gh api .../releases/latest` install steps in its CI workflow.
---

# Port a GMod addon to the standardized glua tooling pattern

Bootstrap the same tooling pattern used across AmyJeanes's GMod sibling repos. The result:

- Pinned versions of `glua_check`, `glua_ls`, and `luttje/glua-api-snippets` stubs (single source of truth: `scripts/install-tools.ps1`).
- One-line CI invocation for lint via `scripts/glua-check.ps1`.
- Renovate `customManagers` regex auto-bumps the pinned versions, gated by the CI lint job.
- VS Code Pollux extension and the `glua-lsp` Claude Code plugin both resolve `glua_ls` from each project's `.tools/bin/` (no global PATH plumbing).

## Survey first

Before editing, find:

- Default branch (`main` vs `dev`).
- Sibling deps in `.luarc.json` (`../Doors`, `../world-portals`, `../wire`, etc.) — these need `actions/checkout` steps in the lint job.
- Existing CI shape: standalone `.github/workflows/glua-check.yml` to delete, or a multi-job `ci.yml` to extend (preserve unrelated jobs like `.NET`, workshop publish, combine-and-upload).
- `renovate.json` location: `.github/` or root (a few repos pin it at root for `forkProcessing`).
- Whether the repo has `addon.json` (most do; base-layer repos like world-portals don't because they ship combined into a parent).

## Files to add or update

### 1. `scripts/install-tools.ps1` and `scripts/glua-check.ps1`

Copy verbatim from any existing sibling — the scripts are project-agnostic. Versions are pinned at the top of `install-tools.ps1` with `# renovate: ...` annotations Renovate's customManager regex matches.

### 2. CI workflow at `.github/workflows/ci.yml`

Single workflow named `CI` with a job named `GLua Check`. Triggers: `pull_request` to default branch, `push` to default branch + `renovate/*`, `workflow_dispatch`. Body of the job:

```yaml
- uses: actions/checkout@<pinned-sha> # v6
  with:
    path: <RepoName>          # only if siblings are also checked out below
- uses: actions/checkout@<pinned-sha> # v6
  with: { repository: <Owner>/<Sibling>, ref: <branch>, path: <Sibling> }
  # ...one per sibling in .luarc.json...
- name: Run glua_check
  working-directory: <RepoName>     # omit if no path: above
  shell: pwsh
  run: ./scripts/glua-check.ps1
```

Delete `glua-check.yml` if it exists separately. Keep any other jobs (`.NET`, `Build`, etc.) unchanged.

### 3. Renovate

Add to the existing `renovate.json`:

```json
"customManagers": [
  {
    "customType": "regex",
    "managerFilePatterns": ["/^scripts/install-tools\\.ps1$/"],
    "matchStrings": [
      "# renovate: datasource=(?<datasource>\\S+) depName=(?<depName>\\S+)(?: versioning=(?<versioning>\\S+))?\\s+\\$\\w+\\s*=\\s*'(?<currentValue>[^']+)'"
    ]
  }
]
```

**Do not add a `packageRules` entry with `ignoreUnstable: false`.** `gmod-glua-ls` prereleases freeze the LSP — last verified 1.0.16–1.0.19 in May 2026. Stable-only is the default and the right choice until upstream tightens up.

### 4. `addon.json` ignore list (when present)

Add `.tools/*` and `scripts/*` so Workshop uploads don't bundle the new dirs.

### 5. `.vscode/settings.json`

Create or extend with:

```json
{ "gluals.ls.executablePath": ".tools/bin/glua_ls" }
```

Some repos `.gitignore` the entire `.vscode/` dir except specific files — check for `!.vscode/settings.json` exception before assuming you can commit it.

### 6. CLAUDE.md install section

Replace any "install glua_ls binary on PATH" / "fetch GLua API stubs" snippets with a short pointer at `pwsh -File scripts/install-tools.ps1`. The `glua-lsp:install-glua-ls` skill covers the recovery flow.

## Verify and commit

Before pushing, run `pwsh -File scripts/glua-check.ps1` locally. It should install the pinned tools (one-time download per fresh repo) and either print `No issues found` or surface real diagnostics from the codebase. The latter means the codebase has work to do — that's separate from the port and should be a follow-up.

After pushing, branch protection's required status check name moves from `glua-check` (or `GLua Check` from the old standalone workflow) to `CI / GLua Check`. Flag this to the user — they'll need to update the rule.

## Reference repos (copy-from sources)

Pick the closest shape:

- `TARDIS`, `Doors`, `Safe-Space`, `Sonic-Screwdriver` — `dev` branch, `addon.json`, sibling deps, `.github/renovate.json`.
- `world-portals` — base layer, no `addon.json`, `renovate.json` at repo root.
- `GMod-MCP-Server` — `main` branch (not `dev`), parallel `.NET` CI job to preserve.

## What's intentionally not copied

- `.tools/` binaries — each repo provisions its own via `install-tools.ps1`.
- Build/publish jobs — those vary per repo (Workshop upload, combine-into-parent, .NET tests). Only the `GLua Check` job is the standardized piece.
- `glua_ls` on global PATH — the plugin's shim resolves the project-local binary; never have contributors add a project-specific `.tools/bin` to their permanent PATH.
