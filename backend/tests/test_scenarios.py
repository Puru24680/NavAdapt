import pytest
from app.simulation.engine import SimulationEngine
from app.models.schemas import BehaviorState

def test_all_five_scenarios_load_and_step():
    for scen_id in ["scenario_1", "scenario_2", "scenario_3", "scenario_4", "scenario_5"]:
        engine = SimulationEngine(scenario_id=scen_id)
        assert engine.scenario.id == scen_id
        engine.start()
        # Run 10 simulation steps
        for _ in range(10):
            state = engine.step()
        assert state.time > 0.4
        assert state.vehicle.x >= 0.0

def test_sudden_cattle_hazard_trigger():
    engine = SimulationEngine(scenario_id="scenario_5")
    engine.start()
    for _ in range(5):
        engine.step()

    # Trigger sudden cattle crossing
    engine.trigger_hazard("cattle_crossing")
    state = engine.step()

    # Verify replanning event was logged
    assert len(engine.recent_events) > 0
    assert "replan" in engine.recent_events[-1].id
