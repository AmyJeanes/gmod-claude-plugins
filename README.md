# gmod-claude-plugins

A [Claude Code](https://docs.claude.com/en/docs/claude-code) plugin marketplace for Garry's Mod GLua development.

## Plugins

| Plugin | Description | Required binary |
| :----- | :---------- | :-------------- |
| [`glua-lsp`](plugins/glua-lsp) | GLua language server (`glua_ls`) — diagnostics, hover, jump-to-definition for `.lua` files | `glua_ls` from the latest `Pollux12/gmod-glua-ls` GitHub release |

## Install

From inside Claude Code:

```
/plugin marketplace add AmyJeanes/gmod-claude-plugins
/plugin install glua-lsp@gmod-claude-plugins
```

Each plugin's README documents which external binaries it needs.

## Project-scoped install

To have collaborators on a specific project be auto-prompted to install these plugins, add to that project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "gmod-claude-plugins": {
      "source": {
        "source": "github",
        "repo": "AmyJeanes/gmod-claude-plugins"
      }
    }
  },
  "enabledPlugins": {
    "glua-lsp@gmod-claude-plugins": true
  }
}
```

## License

MIT — see [LICENSE](LICENSE).
