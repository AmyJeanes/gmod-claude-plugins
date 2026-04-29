---
name: install-glua-ls
description: Set up or troubleshoot the glua-lsp plugin (the glua_ls language server binary plus GLua API type stubs). Use when LSP diagnostics aren't appearing for .lua files, when an LSP tool returns "No LSP server available" for .lua, when the /plugin Errors tab reports "Executable not found in $PATH" for glua_ls, when GLua type checking / hover / jump-to-definition isn't working, OR when many built-in GMod globals (IsValid, LocalPlayer, hook, ents, util, Color, CreateConVar, FCVAR_*, draw, cam, concommand, etc.) are reported as "undefined-global" — that symptom indicates the type stubs are missing rather than a bug in the user's code.
---

# Set up glua-lsp

The `glua-lsp` plugin ships configuration only. Two things must be present per machine for it to work; neither is bundled with the plugin:

1. **The `glua_ls` binary** — the language server itself.
2. **The GLua API type stubs** — referenced by the project's `.luarc.json` under `workspace.library`. Without these, every GMod global (`IsValid`, `hook`, `ents`, `Color`, `LocalPlayer`, `CreateConVar`, etc.) will show as `undefined-global`.

Diagnose first, then install only what's missing.

## Diagnose

Run both checks. Either failing means a fix is needed.

```bash
glua_ls --version              # binary check
ls .tools/glua-api/_globals.lua # stubs check (path may vary — see workspace.library in .luarc.json)
```

If the binary check fails: see **Install the binary** below.
If the stubs check fails: see **Install the type stubs** below.
If both succeed but diagnostics are still wrong: see **If it still doesn't work**.

## Install the binary

`glua_ls` is published as a Rust crate. Install with cargo (works on Windows, macOS, Linux):

```bash
cargo install glua_ls
```

If cargo isn't installed, get the Rust toolchain from <https://rustup.rs>.

The binary lands at `~/.cargo/bin/glua_ls` (or `%USERPROFILE%\.cargo\bin\glua_ls.exe` on Windows). Confirm `~/.cargo/bin` is on `PATH`:

```bash
glua_ls --version
```

## Install the type stubs

Stubs come from [`luttje/glua-api-snippets`](https://github.com/luttje/glua-api-snippets) as periodic releases. Default convention is to drop them at `.tools/glua-api/` and reference that from `.luarc.json` under `workspace.library`.

```bash
mkdir -p .tools/glua-api
url=$(gh api repos/luttje/glua-api-snippets/releases/latest \
    --jq '.assets[] | select(.name | endswith(".lua.zip")) | .browser_download_url')
curl -sL -o .tools/glua-api.zip "$url"
unzip -q -o .tools/glua-api.zip -d .tools/glua-api/
```

The path is configurable: check the project's `.luarc.json` for `workspace.library` entries — the stubs need to land somewhere on that list. If `.tools/` is gitignored (recommended), each contributor re-runs this snippet on first clone.

Re-run the same snippet to pick up newer stub releases. `.tools/glua-api/__metadata.json` records the source release timestamp.

## Activate

After installing either piece, tell Claude Code to pick it up:

```
/reload-plugins
```

Then trigger an edit to a `.lua` file. Diagnostics should appear automatically.

## If it still doesn't work

- Open `/plugin` and check the **Errors** tab. If it still says `Executable not found in $PATH`, the shell Claude Code spawned doesn't have `~/.cargo/bin` on `PATH` — restart your terminal / Claude Code session.
- Check that the project has a `.luarc.json`. `glua_ls` keys most of its analysis off it; without one, diagnostics will be sparse and globals will look undefined even when the stubs exist.
- Confirm the stubs path in `.luarc.json` is correct. The path is relative to the project root; if the project layout is unusual (e.g. nested addon directories) the stubs may need to live somewhere else.

## Related

- Upstream LSP: <https://github.com/Pollux12/gmod-glua-ls>
- CLI sibling for one-shot linting: `cargo install glua_check`
- Stub source: <https://github.com/luttje/glua-api-snippets>
