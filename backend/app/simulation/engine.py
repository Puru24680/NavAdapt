import math
import time
from typing import Dict, List, Any, Optional
from ..models.schemas import (
    SimulationState,
    VehicleState,
    Scenario,
    BehaviorState,
    RiskLevel,
    RiskAssessment,
    ReplanningEvent,
    HazardType,
    ObjectClass
)
from ..scenarios.scenario_definitions import SCENARIOS
from ..perception.sensor_models import SensorModels
from ..perception.fusion import SensorFusionEngine
from ..tracking.tracker import MultiObjectTracker
from ..prediction.predictor import TrajectoryPredictor
from ..risk.risk_engine import RiskEngine
from ..planning.frenet import CubicSpline2D
from ..planning.behavioral_planner import BehavioralPlanner
from ..planning.local_planner import AdaptiveLocalPlanner
from ..control.controller import StanleyController
from ..simulation.vehicle_dynamics import VehicleDynamicsSimulator
from ..metrics.telemetry_collector import TelemetryCollector

class SimulationEngine:
    """
    Closed-loop autonomous driving simulation orchestrator connecting all 14 pipeline stages.
    Executes at 20 Hz (dt = 0.05s).
    """
    def __init__(self, scenario_id: str = "scenario_1"):
        self.sensor_models = SensorModels()
        self.fusion = SensorFusionEngine()
        self.tracker = MultiObjectTracker()
        self.predictor = TrajectoryPredictor()
        self.risk_engine = RiskEngine()
        self.behavior_planner = BehavioralPlanner()
        self.local_planner = AdaptiveLocalPlanner()
        self.controller = StanleyController()
        self.dynamics = VehicleDynamicsSimulator()
        self.telemetry = TelemetryCollector()

        self.scenario_id = scenario_id
        self.is_running = False
        self.is_paused = False
        self.dt = 0.05
        self.sim_time = 0.0
        self.step_idx = 0

        self.recent_events: List[ReplanningEvent] = []
        self.active_notifications: List[str] = []
        self.current_hazard: Optional[str] = None

        self.reset(scenario_id)

    def reset(self, scenario_id: str):
        self.scenario_id = scenario_id
        self.scenario: Scenario = SCENARIOS.get(scenario_id, SCENARIOS["scenario_1"])
        self.sim_time = 0.0
        self.step_idx = 0
        self.is_running = False
        self.is_paused = False
        self.is_completed = False
        self.current_hazard = None
        self.recent_events.clear()
        self.active_notifications.clear()

        # Reset vehicle state from scenario definition
        self.ego = self.scenario.initial_ego_state.model_copy()
        self.initial_dist = math.hypot(
            self.scenario.target_destination["x"] - self.ego.x,
            self.scenario.target_destination["y"] - self.ego.y
        )

        # Clone ground truth objects
        self.gt_objects = [dict(o) for o in self.scenario.initial_objects]

        # Initialize reference road spline
        x_pts = [float(x) for x in range(0, int(self.scenario.road_length) + 20, 10)]
        y_pts = [0.0 for _ in x_pts]
        if self.scenario.road_type == "highway_merge":
            # Curved merge corridor
            y_pts = [-5.5 if x < 30 else -5.5 + (x - 30) * 0.12 if x < 75 else 0.0 for x in x_pts]

        self.ref_spline = CubicSpline2D(x_pts, y_pts)

        # Reset trackers & metrics
        self.tracker = MultiObjectTracker()
        self.telemetry.reset()

        # Initial plan
        behavior = self.behavior_planner.plan_behavior(
            self.ego, self.risk_engine.assess(self.ego, [], [], self.local_planner.plan(
                self.ego, {"target_speed": 10.0}, self.ref_spline, [], []
            )[0]), [], self.scenario.road_type
        )
        self.planned_trajectory, self.candidates, _ = self.local_planner.plan(
            self.ego, behavior, self.ref_spline, [], [], self.scenario.road_boundaries.model_dump(), self.step_idx
        )
        self.prev_trajectory = None

    def start(self):
        if getattr(self, "is_completed", False):
            self.reset(self.scenario_id)
        self.is_running = True
        self.is_paused = False

    def pause(self):
        self.is_paused = not self.is_paused

    def stop(self):
        self.is_running = False

    def trigger_hazard(self, hazard_type: str):
        """Dynamic hazard injection for Smart India Hackathon demonstrations."""
        self.current_hazard = hazard_type
        now = self.sim_time

        if hazard_type == HazardType.CATTLE_CROSSING or hazard_type == "cattle_crossing":
            # Spawn or teleport cow directly into vehicle front path at 20m distance
            cow_x = self.ego.x + 22.0
            cow_y = 2.5
            self.gt_objects.append({
                "id": f"hazard_cattle_{int(now*10)}",
                "class_name": ObjectClass.ANIMAL,
                "x": cow_x,
                "y": cow_y,
                "vx": 0.4,
                "vy": -1.8, # Cutting directly into ego path
                "length": 2.4,
                "width": 1.1,
                "height": 1.6
            })
            self._add_notification("HAZARD INJECTED: Stray Cattle suddenly entered road corridor!")

        elif hazard_type == HazardType.PEDESTRIAN_DART or hazard_type == "pedestrian_dart":
            ped_x = self.ego.x + 16.0
            ped_y = 2.2
            self.gt_objects.append({
                "id": f"hazard_ped_{int(now*10)}",
                "class_name": ObjectClass.PEDESTRIAN,
                "x": ped_x,
                "y": ped_y,
                "vx": 0.2,
                "vy": -2.0, # Rapid crossing
                "length": 0.6,
                "width": 0.6,
                "height": 1.7
            })
            self._add_notification("HAZARD INJECTED: Pedestrian darting across road!")

        elif hazard_type == HazardType.RICKSHAW_CUT_IN or hazard_type == "rickshaw_cut_in":
            rick_x = self.ego.x + 12.0
            rick_y = -2.8
            self.gt_objects.append({
                "id": f"hazard_rickshaw_{int(now*10)}",
                "class_name": ObjectClass.AUTO_RICKSHAW,
                "x": rick_x,
                "y": rick_y,
                "vx": self.ego.v * 0.7,
                "vy": 1.9, # Sharp swerve into lane
                "length": 2.6,
                "width": 1.3,
                "height": 1.8
            })
            self._add_notification("HAZARD INJECTED: Auto-rickshaw aggressive cut-in!")

        elif hazard_type == HazardType.POTHOLE_SWERVE or hazard_type == "pothole_swerve":
            pot_x = self.ego.x + 18.0
            pot_y = self.ego.y
            potholes = self.scenario.road_boundaries.potholes
            potholes.append({"id": f"hazard_pot_{int(now*10)}", "x": pot_x, "y": pot_y, "radius": 0.7, "depth_cm": 15.0})
            self._add_notification("HAZARD INJECTED: Severe pothole detected in lane corridor!")

        # Trigger immediate replan
        self.replan(reason=f"Hazard Injected: {hazard_type}")

    def replan(self, reason: str = "User Requested Replanning"):
        t0 = time.perf_counter()
        old_len = len(self.planned_trajectory.points)

        # 1. Update perception & tracking
        cam_dets = self.sensor_models.simulate_camera_detections(self.ego, self.gt_objects)
        lidar_pts = self.sensor_models.simulate_lidar_point_cloud(self.ego, self.gt_objects, self.scenario.road_boundaries.model_dump())
        radar_dets = self.sensor_models.simulate_radar_targets(self.ego, self.gt_objects)
        fused = self.fusion.fuse(self.ego, cam_dets, lidar_pts, radar_dets, self.gt_objects)
        tracked = self.tracker.update(fused, dt=self.dt)
        predictions = self.predictor.predict(tracked)
        risk = self.risk_engine.assess(self.ego, tracked, predictions, self.planned_trajectory, self.scenario.road_boundaries.model_dump())

        # 2. Re-evaluate behavior
        behavior = self.behavior_planner.plan_behavior(self.ego, risk, tracked, self.scenario.road_type)

        # 3. Local planner replan
        self.prev_trajectory = self.planned_trajectory
        new_traj, candidates, latency_ms = self.local_planner.plan(
            self.ego, behavior, self.ref_spline, tracked, predictions, self.scenario.road_boundaries.model_dump(), self.step_idx
        )
        self.planned_trajectory = new_traj
        self.candidates = candidates

        event = ReplanningEvent(
            id=f"replan_{self.step_idx}",
            timestamp=round(self.sim_time, 2),
            trigger_reason=reason,
            latency_ms=latency_ms,
            old_path_len=old_len,
            new_path_len=len(new_traj.points),
            success=True,
            behavior_transition=behavior.get("state", BehaviorState.FOLLOW).value
        )
        self.recent_events.append(event)
        if len(self.recent_events) > 10:
            self.recent_events.pop(0)

        self._add_notification(f"Replanned in {latency_ms:.1f}ms — Behavior: {behavior.get('state').value}")

    def step(self) -> SimulationState:
        if not self.is_running or self.is_paused or self.is_completed:
            return self.get_state()

        self.step_idx += 1
        self.sim_time += self.dt

        # 1. Update ground truth objects movement
        for obj in self.gt_objects:
            obj["x"] += obj.get("vx", 0.0) * self.dt
            obj["y"] += obj.get("vy", 0.0) * self.dt

            # Constrain animal or pedestrian if crossing boundary
            if obj["class_name"] == ObjectClass.ANIMAL and obj["y"] < -3.5:
                obj["vy"] = 0.0
                obj["vx"] = 0.2

        # 2. Multi-Sensor Perception
        cam_dets = self.sensor_models.simulate_camera_detections(self.ego, self.gt_objects)
        lidar_pts = self.sensor_models.simulate_lidar_point_cloud(self.ego, self.gt_objects, self.scenario.road_boundaries.model_dump())
        radar_dets = self.sensor_models.simulate_radar_targets(self.ego, self.gt_objects)

        # 3. Sensor Fusion & Classification
        fused = self.fusion.fuse(self.ego, cam_dets, lidar_pts, radar_dets, self.gt_objects)

        # 4. Multi-Object Tracking (EKF)
        tracked = self.tracker.update(fused, dt=self.dt)

        # 5. Trajectory Prediction (Multi-Hypothesis)
        predictions = self.predictor.predict(tracked)

        # 6. Dynamic Risk Estimation
        risk = self.risk_engine.assess(self.ego, tracked, predictions, self.planned_trajectory, self.scenario.road_boundaries.model_dump())

        # 7. Behavior & Decision Planning
        behavior = self.behavior_planner.plan_behavior(self.ego, risk, tracked, self.scenario.road_type)

        # Check if replanning needed
        needs_replan = (
            risk.level == RiskLevel.CRITICAL or
            self.step_idx % 4 == 0 or # Periodic replan at 5 Hz
            len(self.planned_trajectory.points) < 5
        )

        replan_latency = None
        if needs_replan:
            self.prev_trajectory = self.planned_trajectory
            new_traj, candidates, replan_latency = self.local_planner.plan(
                self.ego, behavior, self.ref_spline, tracked, predictions, self.scenario.road_boundaries.model_dump(), self.step_idx
            )
            self.planned_trajectory = new_traj
            self.candidates = candidates

            if risk.level == RiskLevel.CRITICAL and len(self.recent_events) < 15:
                event = ReplanningEvent(
                    id=f"replan_{self.step_idx}",
                    timestamp=round(self.sim_time, 2),
                    trigger_reason=f"Risk Critical ({risk.overall_score}) - {risk.critical_object_id or 'Obstacle'}",
                    latency_ms=replan_latency,
                    old_path_len=len(self.prev_trajectory.points),
                    new_path_len=len(new_traj.points),
                    success=True,
                    behavior_transition=behavior.get("state").value
                )
                self.recent_events.append(event)
                if len(self.recent_events) > 10:
                    self.recent_events.pop(0)

        # 8. Vehicle Control (Stanley + PID)
        steer_cmd, accel_cmd, throttle, brake = self.controller.compute_control(
            self.ego, self.planned_trajectory, dt=self.dt
        )

        # 9. Vehicle Dynamics Simulation (RK4)
        self.ego = self.dynamics.step(
            self.ego, steer_cmd, accel_cmd, throttle, brake, dt=self.dt
        )

        # 10. Check completion
        dest_x = self.scenario.target_destination["x"]
        dest_y = self.scenario.target_destination["y"]
        remaining_dist = math.hypot(dest_x - self.ego.x, dest_y - self.ego.y)
        if remaining_dist < 4.0:
            self._add_notification("GOAL REACHED: Scenario completed safely! Auto-looping for continuous driving...")
            # Smooth loop: reset ego back to start and continue driving
            self.ego = self.scenario.initial_ego_state.model_copy()
            self.step_idx = 0
            self.sim_time = 0.0
            self.gt_objects = [dict(o) for o in self.scenario.initial_objects]
            self.is_completed = False
            self.replan(reason="Continuous Loop Reset at Goal")

        # 11. Record Metrics
        cur_curvature = self.planned_trajectory.points[0].kappa if self.planned_trajectory.points else 0.0
        self.telemetry.record_step(
            self.ego,
            tracked,
            risk.min_ttc,
            is_emergency=(behavior.get("state") == BehaviorState.EMERGENCY_BRAKE),
            replan_latency=replan_latency,
            path_curvature=cur_curvature,
            plan_succeeded=True
        )

        # Notifications logic
        if risk.level == RiskLevel.CRITICAL and "Critical risk" not in (self.active_notifications[-1] if self.active_notifications else ""):
            self._add_notification(f"ALERT: Critical Risk detected! Emergency response active.")

        return self.get_state(tracked, fused, predictions, risk)

    def _add_notification(self, text: str):
        self.active_notifications.append(text)
        if len(self.active_notifications) > 6:
            self.active_notifications.pop(0)

    def get_state(
        self,
        tracked: Optional[List] = None,
        raw_detections: Optional[List] = None,
        predictions: Optional[List] = None,
        risk: Optional[RiskAssessment] = None
    ) -> SimulationState:
        if tracked is None:
            cam_dets = self.sensor_models.simulate_camera_detections(self.ego, self.gt_objects)
            lidar_pts = self.sensor_models.simulate_lidar_point_cloud(self.ego, self.gt_objects, self.scenario.road_boundaries.model_dump())
            radar_dets = self.sensor_models.simulate_radar_targets(self.ego, self.gt_objects)
            raw_detections = self.fusion.fuse(self.ego, cam_dets, lidar_pts, radar_dets, self.gt_objects)
            tracked = self.tracker.update(raw_detections, dt=self.dt)
            predictions = self.predictor.predict(tracked)
            risk = self.risk_engine.assess(self.ego, tracked, predictions, self.planned_trajectory, self.scenario.road_boundaries.model_dump())

        dest_dist = math.hypot(
            self.scenario.target_destination["x"] - self.ego.x,
            self.scenario.target_destination["y"] - self.ego.y
        )
        metrics = self.telemetry.get_summary(dest_dist, self.initial_dist)

        # Build drivable polygon corridor approximation
        corridor = []
        bounds = self.scenario.road_boundaries
        for pt in bounds.left_boundary:
            if abs(pt[0] - self.ego.x) < 50.0:
                corridor.append(pt)
        for pt in reversed(bounds.right_boundary):
            if abs(pt[0] - self.ego.x) < 50.0:
                corridor.append(pt)

        return SimulationState(
            scenario_id=self.scenario_id,
            time=round(self.sim_time, 2),
            step=self.step_idx,
            dt=self.dt,
            is_running=self.is_running,
            is_paused=self.is_paused,
            is_completed=self.is_completed,
            vehicle=self.ego,
            objects=tracked,
            raw_detections=raw_detections or [],
            predictions=predictions or [],
            planned_trajectory=self.planned_trajectory,
            previous_trajectory=self.prev_trajectory,
            candidate_trajectories=self.candidates,
            drivable_corridor=corridor,
            behavior_state=self.behavior_planner.current_state,
            risk=risk,
            metrics=metrics,
            recent_events=self.recent_events,
            active_notifications=self.active_notifications,
            current_hazard=self.current_hazard
        )
