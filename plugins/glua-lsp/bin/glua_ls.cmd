@echo off
rem Wrapper that resolves to a project-local glua_ls.exe at <cwd>/.tools/bin/.
rem Place this directory on PATH (instead of any project-specific .tools/bin)
rem so each workspace picks up its own pinned glua_ls.

setlocal enabledelayedexpansion
set "DIR=%CD%"

:loop
if exist "!DIR!\.tools\bin\glua_ls.exe" (
    "!DIR!\.tools\bin\glua_ls.exe" %*
    exit /b !ERRORLEVEL!
)

rem Walk up one directory; stop at drive root.
for %%D in ("!DIR!\..") do set "PARENT=%%~fD"
if /i "!PARENT!"=="!DIR!" goto notfound
set "DIR=!PARENT!"
goto loop

:notfound
1>&2 echo glua_ls: no project-local install found searching upward from %CD%.
1>&2 echo Run scripts/install-tools.ps1 from your project root to install one.
exit /b 127
