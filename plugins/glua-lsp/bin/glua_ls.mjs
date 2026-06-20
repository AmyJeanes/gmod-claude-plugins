#!/usr/bin/env node
// Cross-platform launcher: resolve to a project-local glua_ls at <cwd>/.tools/bin/
// and exec it, passing stdio through. Spawned via `node` so the harness never has
// to spawn a .cmd/.sh directly (Node refuses to spawn .cmd without a shell -> EINVAL).
import { spawn } from "node:child_process";
import { accessSync, constants } from "node:fs";
import { dirname, join } from "node:path";

const isWindows = process.platform === "win32";
const exe = isWindows ? "glua_ls.exe" : "glua_ls";

function resolveBinary() {
    let dir = process.cwd();
    for (;;) {
        const candidate = join(dir, ".tools", "bin", exe);
        try {
            accessSync(candidate, isWindows ? constants.F_OK : constants.X_OK);
            return candidate;
        } catch {
            // not here; walk up one directory until the filesystem root
        }
        const parent = dirname(dir);
        if (parent === dir) return null;
        dir = parent;
    }
}

const binary = resolveBinary();
if (!binary) {
    process.stderr.write(
        "glua_ls: no project-local install found searching upward from " + process.cwd() + ".\n" +
        "Run scripts/install-tools.ps1 from your project root to install one.\n"
    );
    process.exit(127);
}

const child = spawn(binary, process.argv.slice(2), { stdio: "inherit" });
child.on("error", function (err) {
    process.stderr.write("glua_ls: failed to launch " + binary + ": " + err.message + "\n");
    process.exit(1);
});
child.on("exit", function (code, signal) {
    if (signal) {
        process.kill(process.pid, signal);
    } else {
        process.exit(code === null ? 0 : code);
    }
});
