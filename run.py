#!/usr/bin/env python3
"""
NavAdapt Autonomous Driving Platform — Unified Full-Stack Network Launcher
Merges Backend (FastAPI + WebSockets) & Frontend (React + Vite SPA) onto a single unified server
accessible across the entire local network (Wi-Fi / LAN).
"""

import os
import sys
import socket

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import time
import webbrowser
from pathlib import Path
import subprocess

PROJECT_ROOT = Path(__file__).resolve().parent
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"

def get_network_ip():
    """Detects the primary LAN / Wi-Fi IPv4 address of this machine."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def ensure_frontend_built():
    """Builds the frontend production distribution if not present."""
    if not (DIST_DIR / "index.html").exists():
        print("[1/2] Building React frontend bundle into frontend/dist ...")
        cmd = "set PATH=C:\\Program Files\\nodejs;%PATH% && npm run build"
        res = subprocess.run(cmd, shell=True, cwd=str(FRONTEND_DIR))
        if res.returncode != 0:
            print("[WARN] Frontend build had errors.")
        else:
            print("[OK] Frontend bundle built successfully.")
    else:
        print("[OK] [1/2] Compiled frontend bundle ready at frontend/dist.")

def start_server():
    """Starts the unified FastAPI + WebSocket server on 0.0.0.0:8000."""
    lan_ip = get_network_ip()

    print("\n" + "=" * 65)
    print("  🚀 NavAdapt Autonomous Driving Platform — Live Server Active")
    print("=" * 65)
    print(f"  ➜ Local:   http://localhost:8000")
    print(f"  ➜ Network: http://{lan_ip}:8000  (Share with team on same Wi-Fi!)")
    print(f"  ➜ WS Live: ws://{lan_ip}:8000/ws/simulation")
    print("=" * 65 + "\n")

    # Add backend to PYTHONPATH
    sys.path.insert(0, str(BACKEND_DIR))
    os.environ["PYTHONPATH"] = str(BACKEND_DIR)

    # Open browser automatically to the network URL
    def open_browser():
        time.sleep(1.2)
        print(f"Opening http://{lan_ip}:8000 in your browser ...")
        try:
            webbrowser.open(f"http://{lan_ip}:8000")
        except Exception:
            pass

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    import uvicorn
    from app.main import app

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

if __name__ == "__main__":
    ensure_frontend_built()
    start_server()
