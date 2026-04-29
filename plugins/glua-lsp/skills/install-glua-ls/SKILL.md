---
name: install-glua-ls
description: Install or troubleshoot the glua_ls language server binary required by the glua-lsp plugin. Use when LSP diagnostics aren't appearing for .lua files, when an LSP tool returns "No LSP server available" for .lua, when the /plugin Errors tab reports "Executable not found in $PATH" for glua_ls, or when the user reports that GLua type checking / hover / jump-to-definition isn't working.
---

# Install glua_ls

The `glua-lsp` plugin is configuration only — it tells Claude Code to spawn `glua_ls` as the language server for `.lua` files. The binary itself is not bundled and must be installed separately.

## Install

`glua_ls` is published as a Rust crate. Install with cargo (works on Windows, macOS, Linux):

```bash
cargo install glua_ls
```

If cargo isn't installed, get the Rust toolchain from <https://rustup.rs>.

The binary lands at `~/.cargo/bin/glua_ls` (or `%USERPROFILE%\.cargo\bin\glua_ls.exe` on Windows). Confirm `~/.cargo/bin` is on `PATH`:

```bash
glua_ls --version
```

## Activate

After installing the binary, tell Claude Code to pick it up:

```
/reload-plugins
```

Then trigger an edit to a `.lua` file. Diagnostics should appear automatically.

## If it still doesn't work

- Open `/plugin` and check the **Errors** tab. If it still says `Executable not found in $PATH`, the shell Claude Code spawned doesn't have `~/.cargo/bin` on `PATH` — restart your terminal / Claude Code session.
- Check that the project has a `.luarc.json`. `glua_ls` keys most of its analysis off it; without one, diagnostics will be sparse and globals will look undefined.
- For GMod-specific globals (`hook`, `ents`, `Entity`, etc.), make sure `.luarc.json` lists the GLua API stub directory under `workspace.library`. Stubs are published by [`luttje/glua-api-snippets`](https://github.com/luttje/glua-api-snippets) — see the plugin's main README for the download snippet.

## Related

- Upstream LSP: <https://github.com/Pollux12/gmod-glua-ls>
- CLI sibling for one-shot linting: `cargo install glua_check`
