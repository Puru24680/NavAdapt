import pytest
from app.risk.risk_engine import RiskEngine
from app.models.schemas import VehicleState, TrackedObject, PlannedTrajectory, PathPoint, ObjectClass, RiskLevel

def test_risk_safe():
    engine = RiskEngine()
    ego = VehicleState(x=0.0, y=0.0, vx=10.0, v=10.0)
    # Object far away (70m ahead, moving away)
    obj = TrackedObject(
        id="far_car",
        class_name=ObjectClass.CAR,
        confidence=0.9,
        x=70.0,
        y=0.0,
        vx=10.0,
        vy=0.0
    )
    plan = PlannedTrajectory(points=[PathPoint(x=float(i), y=0.0, t=i*0.1) for i in range(20)])
    assessment = engine.assess(ego, [obj], [], plan)
    assert assessment.overall_score < 25.0
    assert assessment.level == RiskLevel.SAFE

def test_risk_critical():
    engine = RiskEngine()
    ego = VehicleState(x=0.0, y=0.0, vx=12.0, v=12.0)
    # Stray cattle directly ahead at 10m closing rapidly
    obj = TrackedObject(
        id="cow_hazard",
        class_name=ObjectClass.ANIMAL,
        confidence=0.95,
        x=10.0,
        y=0.0,
        vx=-1.0,
        vy=0.0
    )
    plan = PlannedTrajectory(points=[PathPoint(x=float(i), y=0.0, t=i*0.1) for i in range(20)])
    assessment = engine.assess(ego, [obj], [], plan)
    assert assessment.overall_score >= 75.0
    assert assessment.level == RiskLevel.CRITICAL
    assert assessment.critical_object_id == "cow_hazard"
