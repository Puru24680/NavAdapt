from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class ObjectClass(str, Enum):
    CAR = "car"
    BUS = "bus"
    TRUCK = "truck"
    AUTO_RICKSHAW = "auto_rickshaw"
    MOTORCYCLE = "motorcycle"
    BICYCLE = "bicycle"
    PEDESTRIAN = "pedestrian"
    PUSHCART = "pushcart"
    ANIMAL = "animal"
    STATIC_OBSTACLE = "static_obstacle"
    POTHOLE = "pothole"

class RiskLevel(str, Enum):
    SAFE = "Safe"           # 0 - 25
    CAUTION = "Caution"     # 25 - 50
    HIGH_RISK = "High Risk" # 50 - 75
    CRITICAL = "Critical"   # 75 - 100

class BehaviorState(str, Enum):
    FOLLOW = "Follow"
    SLOW_DOWN = "Slow Down"
    STOP = "Stop"
    YIELD = "Yield"
    OVERTAKE = "Overtake"
    MERGE = "Merge"
    AVOID_OBSTACLE = "Avoid Obstacle"
    WAIT = "Wait"
    EMERGENCY_BRAKE = "Emergency Brake"

class PlannerType(str, Enum):
    FRENET_OPTIMAL = "Frenet Optimal Trajectory"
    FREE_SPACE_LATTICE = "Free-Space Lattice"
    HYBRID_ASTAR = "Hybrid A*"
    MPC_REACTIVE = "MPC Reactive"

class HazardType(str, Enum):
    CATTLE_CROSSING = "cattle_crossing"
    PEDESTRIAN_DART = "pedestrian_dart"
    RICKSHAW_CUT_IN = "rickshaw_cut_in"
    POTHOLE_SWERVE = "pothole_swerve"
    ONCOMING_OVERTAKE = "oncoming_overtake"

class PathPoint(BaseModel):
    x: float
    y: float
    s: float = 0.0
    d: float = 0.0
    yaw: float = 0.0
    kappa: float = 0.0
    v: float = 0.0
    a: float = 0.0
    t: float = 0.0

class VehicleState(BaseModel):
    x: float = 0.0
    y: float = 0.0
    vx: float = 0.0
    vy: float = 0.0
    v: float = 0.0
    yaw: float = 0.0
    yaw_rate: float = 0.0
    steering_angle: float = 0.0
    acceleration: float = 0.0
    jerk: float = 0.0
    throttle: float = 0.0
    brake: float = 0.0
    gear: str = "D"
    length: float = 4.6
    width: float = 1.9
    wheelbase: float = 2.7

class ObjectDetection(BaseModel):
    id: str
    class_name: ObjectClass
    confidence: float
    x: float
    y: float
    vx: float = 0.0
    vy: float = 0.0
    length: float = 2.0
    width: float = 1.0
    height: float = 1.5
    yaw: float = 0.0
    sensor_sources: List[str] = ["camera", "lidar", "radar"]

class TrackedObject(BaseModel):
    id: str
    class_name: ObjectClass
    confidence: float
    x: float
    y: float
    vx: float = 0.0
    vy: float = 0.0
    ax: float = 0.0
    ay: float = 0.0
    length: float = 2.0
    width: float = 1.0
    height: float = 1.5
    yaw: float = 0.0
    age: int = 1
    hits: int = 1
    time_since_update: int = 0
    history: List[List[float]] = Field(default_factory=list) # [[x, y], ...]

class TrajectoryHypothesis(BaseModel):
    probability: float
    intent: str
    points: List[PathPoint]

class PredictedTrajectory(BaseModel):
    object_id: str
    class_name: ObjectClass
    hypotheses: List[TrajectoryHypothesis]

class AgentRiskScore(BaseModel):
    object_id: str
    class_name: ObjectClass
    total_risk: float
    level: RiskLevel
    distance: float
    rel_speed: float
    ttc: float
    trajectory_overlap: float
    vulnerability_weight: float
    distance_risk: float
    speed_risk: float
    ttc_risk: float
    overlap_risk: float

class RiskAssessment(BaseModel):
    overall_score: float = 0.0
    level: RiskLevel = RiskLevel.SAFE
    critical_object_id: Optional[str] = None
    min_ttc: float = 99.0
    agent_risks: Dict[str, AgentRiskScore] = Field(default_factory=dict)
    weights: Dict[str, float] = Field(default_factory=lambda: {
        "distance": 0.25,
        "velocity": 0.15,
        "ttc": 0.35,
        "overlap": 0.15,
        "vulnerability": 0.10
    })

class PlannedTrajectory(BaseModel):
    points: List[PathPoint] = Field(default_factory=list)
    cost: float = 0.0
    planner_type: PlannerType = PlannerType.FRENET_OPTIMAL
    is_replanned: bool = False
    generated_at_step: int = 0

class RoadBoundary(BaseModel):
    left_boundary: List[List[float]] = Field(default_factory=list)   # [[x, y], ...]
    right_boundary: List[List[float]] = Field(default_factory=list) # [[x, y], ...]
    potholes: List[Dict[str, Any]] = Field(default_factory=list)     # [{"x": 10, "y": 1, "radius": 0.5, "depth_cm": 8}]

class ReplanningEvent(BaseModel):
    id: str
    timestamp: float
    trigger_reason: str
    latency_ms: float
    old_path_len: int
    new_path_len: int
    success: bool
    behavior_transition: str

class PerformanceMetrics(BaseModel):
    scenario_completion_rate: float = 0.0
    collision_count: int = 0
    near_collision_count: int = 0
    avg_replanning_latency_ms: float = 0.0
    max_replanning_latency_ms: float = 0.0
    avg_smoothness_jerk: float = 0.0
    avg_curvature: float = 0.0
    avg_ttc: float = 99.0
    min_ttc: float = 99.0
    emergency_brake_count: int = 0
    avg_speed_kmh: float = 0.0
    planning_success_rate: float = 100.0
    perception_confidence: float = 96.5
    prediction_error_m: float = 0.24

class Scenario(BaseModel):
    id: str
    name: str
    title: str
    description: str
    difficulty: str
    traffic_density: str
    road_type: str
    road_length: float = 200.0
    road_width: float = 7.0
    main_hazards: List[str]
    initial_ego_state: VehicleState
    target_destination: Dict[str, float] = Field(default_factory=lambda: {"x": 180.0, "y": 0.0})
    initial_objects: List[Dict[str, Any]] = Field(default_factory=list)
    road_boundaries: RoadBoundary = Field(default_factory=RoadBoundary)

class SimulationState(BaseModel):
    scenario_id: str
    time: float = 0.0
    step: int = 0
    dt: float = 0.05
    is_running: bool = False
    is_paused: bool = False
    is_completed: bool = False
    vehicle: VehicleState
    objects: List[TrackedObject] = Field(default_factory=list)
    raw_detections: List[ObjectDetection] = Field(default_factory=list)
    predictions: List[PredictedTrajectory] = Field(default_factory=list)
    planned_trajectory: PlannedTrajectory = Field(default_factory=PlannedTrajectory)
    previous_trajectory: Optional[PlannedTrajectory] = None
    candidate_trajectories: List[List[List[float]]] = Field(default_factory=list)
    drivable_corridor: List[List[float]] = Field(default_factory=list)
    behavior_state: BehaviorState = BehaviorState.FOLLOW
    risk: RiskAssessment = Field(default_factory=RiskAssessment)
    metrics: PerformanceMetrics = Field(default_factory=PerformanceMetrics)
    recent_events: List[ReplanningEvent] = Field(default_factory=list)
    active_notifications: List[str] = Field(default_factory=list)
    current_hazard: Optional[str] = None
