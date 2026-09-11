export type ObjectClass =
  | "car"
  | "bus"
  | "truck"
  | "auto_rickshaw"
  | "motorcycle"
  | "bicycle"
  | "pedestrian"
  | "pushcart"
  | "animal"
  | "static_obstacle"
  | "pothole";

export type RiskLevel = "Safe" | "Caution" | "High Risk" | "Critical";

export type BehaviorState =
  | "Follow"
  | "Slow Down"
  | "Stop"
  | "Yield"
  | "Overtake"
  | "Merge"
  | "Avoid Obstacle"
  | "Wait"
  | "Emergency Brake";

export type PlannerType =
  | "Frenet Optimal Trajectory"
  | "Free-Space Lattice"
  | "Hybrid A*"
  | "MPC Reactive";

export interface PathPoint {
  x: number;
  y: number;
  s?: number;
  d?: number;
  yaw?: number;
  kappa?: number;
  v?: number;
  a?: number;
  t?: number;
}

export interface VehicleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  v: number;
  yaw: number;
  yaw_rate: number;
  steering_angle: number;
  acceleration: number;
  jerk: number;
  throttle: number;
  brake: number;
  gear: string;
  length: number;
  width: number;
  wheelbase: number;
}

export interface ObjectDetection {
  id: string;
  class_name: ObjectClass;
  confidence: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  width: number;
  height: number;
  yaw: number;
  sensor_sources: string[];
}

export interface TrackedObject {
  id: string;
  class_name: ObjectClass;
  confidence: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  width: number;
  height: number;
  yaw: number;
  age: number;
  hits: number;
  time_since_update: number;
  history: [number, number][];
}

export interface TrajectoryHypothesis {
  probability: number;
  intent: string;
  points: PathPoint[];
}

export interface PredictedTrajectory {
  object_id: string;
  class_name: ObjectClass;
  hypotheses: TrajectoryHypothesis[];
}

export interface AgentRiskScore {
  object_id: string;
  class_name: ObjectClass;
  total_risk: number;
  level: RiskLevel;
  distance: number;
  rel_speed: number;
  ttc: number;
  trajectory_overlap: number;
  vulnerability_weight: number;
  distance_risk: number;
  speed_risk: number;
  ttc_risk: number;
  overlap_risk: number;
}

export interface RiskAssessment {
  overall_score: number;
  level: RiskLevel;
  critical_object_id?: string | null;
  min_ttc: number;
  agent_risks: Record<string, AgentRiskScore>;
  weights: {
    distance: number;
    velocity: number;
    ttc: number;
    overlap: number;
    vulnerability: number;
  };
}

export interface PlannedTrajectory {
  points: PathPoint[];
  cost: number;
  planner_type: PlannerType;
  is_replanned: boolean;
  generated_at_step: number;
}

export interface RoadBoundary {
  left_boundary: [number, number][];
  right_boundary: [number, number][];
  potholes: { id: string; x: number; y: number; radius: number; depth_cm: number }[];
}

export interface ReplanningEvent {
  id: string;
  timestamp: number;
  trigger_reason: string;
  latency_ms: number;
  old_path_len: number;
  new_path_len: number;
  success: boolean;
  behavior_transition: string;
}

export interface PerformanceMetrics {
  scenario_completion_rate: number;
  collision_count: number;
  near_collision_count: number;
  avg_replanning_latency_ms: number;
  max_replanning_latency_ms: number;
  avg_smoothness_jerk: number;
  avg_curvature: number;
  avg_ttc: number;
  min_ttc: number;
  emergency_brake_count: number;
  avg_speed_kmh: number;
  planning_success_rate: number;
  perception_confidence: number;
  prediction_error_m: number;
}

export interface Scenario {
  id: string;
  name: string;
  title: string;
  description: string;
  difficulty: string;
  traffic_density: string;
  road_type: string;
  road_length: number;
  road_width: number;
  main_hazards: string[];
  initial_ego_state: VehicleState;
  target_destination: { x: number; y: number };
  initial_objects: Record<string, any>[];
  road_boundaries: RoadBoundary;
}

export interface SimulationState {
  scenario_id: string;
  time: number;
  step: number;
  dt: number;
  is_running: boolean;
  is_paused: boolean;
  is_completed: boolean;
  vehicle: VehicleState;
  objects: TrackedObject[];
  raw_detections: ObjectDetection[];
  predictions: PredictedTrajectory[];
  planned_trajectory: PlannedTrajectory;
  previous_trajectory?: PlannedTrajectory | null;
  candidate_trajectories: [number, number][][];
  drivable_corridor: [number, number][];
  behavior_state: BehaviorState;
  risk: RiskAssessment;
  metrics: PerformanceMetrics;
  recent_events: ReplanningEvent[];
  active_notifications: string[];
  current_hazard?: string | null;
}
