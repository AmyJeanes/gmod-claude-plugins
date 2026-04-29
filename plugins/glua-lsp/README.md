# glua-lsp

[`glua_ls`](https://github.com/Pollux12/gmod-glua-ls) language server for Claude Code. Provides automatic diagnostics after every edit plus hover, jump-to-definition, and find-references for `.lua` files in Garry's Mod GLua projects.

`glua_ls` is a hard fork of EmmyLua Analyzer Rust, maintained specifically for Garry's Mod. It reads `.luarc.json` from your workspace, so any existing GLua API stub configuration (e.g. `luttje/glua-api-snippets`) keeps working unchanged.

## Supported Extensions
`.lua`

## Installation

The plugin only ships configuration. You must install the `glua_ls` binary yourself.

### Via Cargo (any platform)

```bash
cargo install glua_ls
```

The binary lands at `~/.cargo/bin/glua_ls` (or `%USERPROFILE%\.cargo\bin\glua_ls.exe` on Windows). Make sure `~/.cargo/bin` is on your `PATH`.

### Verifying

```bash
glua_ls --version
```

If Claude Code can't find the binary you'll see `Executable not found in $PATH` in the `/plugin` Errors tab — install it and run `/reload-plugins`.

## Workspace setup

`glua_ls` reads `.luarc.json` from the project root. Most GMod projects also want the GLua type stubs from [`luttje/glua-api-snippets`](https://github.com/luttje/glua-api-snippets) referenced from `workspace.library`. Example `.luarc.json`:

```json
{
  "runtime": { "version": "LuaJIT" },
  "workspace": {
    "library": [ "./.tools/glua-api" ]
  }
}
```

Then download the latest stubs once:

```bash
mkdir -p .tools/glua-api
url=$(gh api repos/luttje/glua-api-snippets/releases/latest \
    --jq '.assets[] | select(.name | endswith(".lua.zip")) | .browser_download_url')
curl -sL -o .tools/glua-api.zip "$url"
unzip -q -o .tools/glua-api.zip -d .tools/glua-api/
```

## More information
- [`glua_ls` on GitHub](https://github.com/Pollux12/gmod-glua-ls)
- [`glua_check` CLI sibling](https://crates.io/crates/glua_check) — same engine as a one-shot linter
