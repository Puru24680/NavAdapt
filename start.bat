@echo off
title NavAdapt — Autonomous Driving Research Platform (SIH 2026)
echo =========================================================================
echo  NavAdapt — Adaptive Autonomous Navigation
echo  Adaptive Path Planning for Autonomous Vehicles in Unstructured Indian Road Conditions
echo =========================================================================
echo.

set PATH=C:\Users\wlc\.local\bin;C:\Program Files\nodejs;%PATH%
set PYTHONPATH=%~dp0backend

cd /d "%~dp0"

if exist "%~dp0backend\.venv\Scripts\python.exe" (
    echo [*] Launching unified full-stack server via backend virtual environment...
    "%~dp0backend\.venv\Scripts\python.exe" run.py
) else (
    echo [*] Launching unified full-stack server via uv...
    uv run --directory backend python "%~dp0run.py"
)

pause
