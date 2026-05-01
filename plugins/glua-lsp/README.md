# glua-lsp

[`glua_ls`](https://github.com/Pollux12/gmod-glua-ls) language server for Claude Code. Provides automatic diagnostics after every edit plus hover, jump-to-definition, and find-references for `.lua` files in Garry's Mod GLua projects.

`glua_ls` is a hard fork of EmmyLua Analyzer Rust, maintained specifically for Garry's Mod. It reads `.luarc.json` from your workspace, so any existing GLua API stub configuration (e.g. `luttje/glua-api-snippets`) keeps working unchanged.

## Supported Extensions
`.lua`

## How it works

The plugin ships a small `bin/glua_ls.cmd` (Windows) and `bin/glua_ls` (Unix) shim and points its LSP `command` at `${CLAUDE_PLUGIN_ROOT}/bin/glua_ls.cmd`. When Claude Code launches the LSP, the shim walks up from the workspace CWD, finds the project's `.tools/bin/glua_ls(.exe)`, and execs it. Each project supplies its own pinned binary; the plugin doesn't install one globally.

## Project setup

Your project needs three things in `.tools/`:

- `.tools/bin/glua_ls(.exe)` — the binary the shim execs.
- `.tools/bin/glua_check(.exe)` *(optional)* — the CLI sibling, used by per-project lint scripts and CI.
- `.tools/glua-api/` — type stubs from [`luttje/glua-api-snippets`](https://github.com/luttje/glua-api-snippets) (referenced by `.luarc.json` under `workspace.library`).

The `install-glua-ls` skill (auto-loaded with this plugin) describes a `scripts/install-tools.ps1` template that handles all three with pinned versions. If your project doesn't have one yet, ask Claude to set it up.

`.luarc.json` example:

```json
{
  "runtime": { "version": "LuaJIT" },
  "workspace": {
    "library": [ "./.tools/glua-api" ]
  }
}
```

## Troubleshooting

If `/plugin` Errors tab shows the LSP failing, the skill has the diagnose-first checklist. The two most common causes are: no `.tools/bin/glua_ls` in the workspace (the shim's "no project-local install found" error), or missing GLua API stubs (every GMod global flagged as `undefined-global`).

## More information
- [`glua_ls` on GitHub](https://github.com/Pollux12/gmod-glua-ls)
- [`glua_check` CLI sibling](https://github.com/Pollux12/gmod-glua-ls/releases) — same engine as a one-shot linter
- [`luttje/glua-api-snippets`](https://github.com/luttje/glua-api-snippets) — type stubs source
