---
name: install-glua-ls
description: Set up or troubleshoot the glua-lsp plugin (the glua_ls language server binary plus GLua API type stubs). Use when LSP diagnostics aren't appearing for .lua files, when an LSP tool returns "No LSP server available" for .lua, when the /plugin Errors tab reports the shim's "no project-local install found" error, when GLua type checking / hover / jump-to-definition isn't working, OR when many built-in GMod globals (IsValid, LocalPlayer, hook, ents, util, Color, CreateConVar, FCVAR_*, draw, cam, concommand, etc.) are reported as "undefined-global" — that symptom indicates the type stubs are missing rather than a bug in the user's code.
---

# Set up glua-lsp

The `glua-lsp` plugin auto-resolves `glua_ls` from the current workspace's `.tools/bin/` via a shipped shim. Each project provides its own pinned binary; nothing is installed globally.

Two pieces must exist in the workspace:

1. **`.tools/bin/glua_ls(.exe)`** — the binary the shim execs.
2. **`.tools/glua-api/`** — type stubs from `luttje/glua-api-snippets`, referenced from `.luarc.json` under `workspace.library`. Without these, every GMod global (`IsValid`, `hook`, `ents`, `Color`, `LocalPlayer`, `CreateConVar`, etc.) shows as `undefined-global`.

Diagnose first, then install only what's missing.

## Diagnose

Both checks run from the project root:

```bash
ls .tools/bin/glua_ls* 2>/dev/null              # binary check
ls .tools/glua-api/_globals.lua 2>/dev/null     # stubs check (path may vary — see workspace.library in .luarc.json)
```

If either is missing, see **Install** below.
If both pass but diagnostics are still wrong, see **If it still doesn't work**.

## Install

Most well-set-up projects already have `scripts/install-tools.ps1` — run it:

```bash
pwsh -File scripts/install-tools.ps1
```

It is idempotent and provisions both pieces with versions pinned at the top of the script (so local matches CI).

### If the project has no `scripts/install-tools.ps1`

Create one. It needs to do two things, each idempotent:

1. **Download the latest `glua_ls` and `glua_check` from `Pollux12/gmod-glua-ls` GitHub releases** into a versioned cache under `.tools/glua-ls/<ver>/` and `.tools/glua-check/<ver>/`, then mirror the binaries to `.tools/bin/glua_ls(.exe)` and `.tools/bin/glua_check(.exe)`. The plugin shim looks at `.tools/bin/`.
2. **Download the latest `luttje/glua-api-snippets` `.lua.zip` release** into `.tools/glua-api/`, with a `.tools/glua-api/.version` marker so it only re-downloads on version change. Reference this directory from `.luarc.json` under `workspace.library`.

Pin both versions as constants at the top of the script so contributors and CI run the exact same engine. The plugin's own repo (`AmyJeanes/gmod-claude-plugins`) sources several reference projects (TARDIS, Doors) — copy `scripts/install-tools.ps1` and `scripts/glua-check.ps1` from one of those if you want a working starting point. Use Renovate's `customManagers` regex to auto-bump pinned versions:

```jsonc
// .github/renovate.json
{
  "customManagers": [{
    "customType": "regex",
    "managerFilePatterns": ["/^scripts/install-tools\\.ps1$/"],
    "matchStrings": [
      "# renovate: datasource=(?<datasource>\\S+) depName=(?<depName>\\S+)(?: versioning=(?<versioning>\\S+))?\\s+\\$\\w+\\s*=\\s*'(?<currentValue>[^']+)'"
    ]
  }]
}
```

with annotations on each pinned version in the script:

```powershell
# renovate: datasource=github-releases depName=Pollux12/gmod-glua-ls
$GluaLsVersion  = '1.0.15'
# renovate: datasource=github-releases depName=luttje/glua-api-snippets versioning=loose
$GluaApiVersion = '2026-03-31_16-30-01'
```

Don't forget to gitignore `.tools/`.

## Activate

After installing, tell Claude Code to pick it up:

```
/reload-plugins
```

Then trigger an edit to a `.lua` file. Diagnostics should appear automatically.

## If it still doesn't work

- Open `/plugin` and check the **Errors** tab. The shim's error includes the `pwd` it searched from — if that's not the workspace root, something else is setting the LSP CWD; report it.
- Check that the project has a `.luarc.json`. `glua_ls` keys most of its analysis off it; without one, diagnostics will be sparse and globals will look undefined even when the stubs exist.
- Confirm the stubs path in `.luarc.json` is correct. The path is relative to the project root; if the project layout is unusual (e.g. nested addon directories) the stubs may need to live somewhere else.

## Related

- Upstream LSP: <https://github.com/Pollux12/gmod-glua-ls>
- CLI sibling for one-shot linting: download `glua_check-*` from the same GitHub release
- Stub source: <https://github.com/luttje/glua-api-snippets>
