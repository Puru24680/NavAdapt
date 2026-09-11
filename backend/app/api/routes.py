from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from ..scenarios.scenario_definitions import SCENARIOS
from ..models.schemas import Scenario, SimulationState, PerformanceMetrics, VehicleState, RiskAssessment, TrackedObject
from ..simulation.engine import SimulationEngine

router = APIRouter()

# Global simulation engine instance
sim_engine = SimulationEngine(scenario_id="scenario_1")

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": "NavAdapt",
        "sim_running": sim_engine.is_running,
        "scenario": sim_engine.scenario_id
    }

@router.get("/scenarios", response_model=List[Scenario])
def get_all_scenarios():
    return list(SCENARIOS.values())

@router.get("/scenarios/{scenario_id}", response_model=Scenario)
def get_scenario(scenario_id: str):
    if scenario_id not in SCENARIOS:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return SCENARIOS[scenario_id]

@router.post("/simulation/start")
def start_simulation():
    sim_engine.start()
    return {"status": "started", "scenario_id": sim_engine.scenario_id}

@router.post("/simulation/stop")
def stop_simulation():
    sim_engine.stop()
    return {"status": "stopped"}

@router.post("/simulation/pause")
def pause_simulation():
    sim_engine.pause()
    return {"status": "paused" if sim_engine.is_paused else "resumed"}

@router.post("/simulation/reset/{scenario_id}")
def reset_simulation(scenario_id: str):
    if scenario_id not in SCENARIOS:
        raise HTTPException(status_code=404, detail="Scenario not found")
    sim_engine.reset(scenario_id)
    return {"status": "reset", "scenario_id": scenario_id}

@router.post("/simulation/replan")
def trigger_replan():
    sim_engine.replan(reason="Manual API Request")
    return {"status": "replanned"}

@router.post("/simulation/trigger-hazard")
def trigger_hazard(payload: Dict[str, str] = Body(...)):
    hazard_type = payload.get("hazard_type", "cattle_crossing")
    sim_engine.trigger_hazard(hazard_type)
    return {"status": "hazard_triggered", "hazard_type": hazard_type}

@router.get("/simulation/status", response_model=SimulationState)
def get_simulation_status():
    return sim_engine.get_state()

@router.get("/metrics", response_model=PerformanceMetrics)
def get_metrics():
    state = sim_engine.get_state()
    return state.metrics

@router.get("/objects", response_model=List[TrackedObject])
def get_objects():
    state = sim_engine.get_state()
    return state.objects

@router.get("/vehicle", response_model=VehicleState)
def get_vehicle():
    return sim_engine.ego

@router.get("/risk", response_model=RiskAssessment)
def get_risk():
    state = sim_engine.get_state()
    return state.risk
