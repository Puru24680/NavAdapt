import asyncio
import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router, sim_engine
from .auth.router import router as auth_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NavAdapt-AV")

app = FastAPI(
    title="NavAdapt — Adaptive Path Planning for Autonomous Vehicles in Unstructured Indian Road Conditions",
    version="1.0.0",
    description="Smart India Hackathon 14-Stage Closed-Loop Autonomous Driving System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

from pathlib import Path
from fastapi import HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check for compiled frontend distribution
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/navadapt-logo.png")
    async def serve_logo():
        logo_path = frontend_dist / "navadapt-logo.png"
        if logo_path.exists():
            return FileResponse(logo_path)
        raise HTTPException(status_code=404)

    @app.get("/")
    async def serve_frontend_root():
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def read_root():
        return {
            "project": "NavAdapt — Adaptive Autonomous Navigation",
            "title": "Adaptive Path Planning for Autonomous Vehicles in Unstructured Indian Road Conditions",
            "hackathon": "Smart India Hackathon (SIH)",
            "status": "Online",
            "api_docs": "/docs",
            "websocket": "/ws/simulation"
        }

@app.websocket("/ws/simulation")
async def websocket_simulation_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("Client connected to /ws/simulation")

    async def sender_loop():
        try:
            while True:
                # Step the simulation if active
                if sim_engine.is_running and not sim_engine.is_paused:
                    state = sim_engine.step()
                else:
                    state = sim_engine.get_state()

                data = state.model_dump()
                await websocket.send_json(data)
                await asyncio.sleep(0.04) # 25 Hz update rate
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.warning(f"WebSocket sender error: {e}")

    sender_task = asyncio.create_task(sender_loop())

    try:
        while True:
            text_data = await websocket.receive_text()
            try:
                msg = json.loads(text_data)
                action = msg.get("action")
                payload = msg.get("payload", {})

                if action == "start":
                    sim_engine.start()
                elif action == "pause":
                    sim_engine.pause()
                elif action == "stop":
                    sim_engine.stop()
                elif action == "reset":
                    scenario_id = payload.get("scenario_id", "scenario_1")
                    sim_engine.reset(scenario_id)
                elif action == "replan":
                    sim_engine.replan(reason="Client WebSocket Request")
                elif action == "hazard":
                    hazard_type = payload.get("hazard_type", "cattle_crossing")
                    sim_engine.trigger_hazard(hazard_type)
            except Exception as parse_err:
                logger.error(f"Error parsing client WS message: {parse_err}")

    except WebSocketDisconnect:
        logger.info("Client disconnected from /ws/simulation")
    finally:
        sender_task.cancel()

if frontend_dist.exists():
    @app.get("/{full_path:path}")
    async def serve_frontend_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Endpoint not found")
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")

