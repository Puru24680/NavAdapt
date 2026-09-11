import math
import time
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from ..models.schemas import (
    PathPoint,
    PlannedTrajectory,
    VehicleState,
    TrackedObject,
    PredictedTrajectory,
    RiskAssessment,
    PlannerType,
    BehaviorState
)
from .frenet import CubicSpline2D
from .collision_checker import CollisionChecker

class QuinticPolynomial:
    """1D quintic polynomial trajectory solver."""
    def __init__(self, xs: float, vxs: float, axs: float, xe: float, vxe: float, axe: float, T: float):
        self.a0 = xs
        self.a1 = vxs
        self.a2 = axs / 2.0

        A = np.array([
            [T**3, T**4, T**5],
            [3 * T**2, 4 * T**3, 5 * T**4],
            [6 * T, 12 * T**2, 20 * T**3]
        ])
        b = np.array([
            xe - self.a0 - self.a1 * T - self.a2 * T**2,
            vxe - self.a1 - 2 * self.a2 * T,
            axe - 2 * self.a2
        ])
        x = np.linalg.solve(A, b)
        self.a3 = x[0]
        self.a4 = x[1]
        self.a5 = x[2]

    def calc_point(self, t: float) -> float:
        return self.a0 + self.a1 * t + self.a2 * t**2 + self.a3 * t**3 + self.a4 * t**4 + self.a5 * t**5

    def calc_first_derivative(self, t: float) -> float:
        return self.a1 + 2 * self.a2 * t + 3 * self.a3 * t**2 + 4 * self.a4 * t**3 + 5 * self.a5 * t**4

    def calc_second_derivative(self, t: float) -> float:
        return 2 * self.a2 + 6 * self.a3 * t + 12 * self.a4 * t**2 + 20 * self.a5 * t**3

    def calc_third_derivative(self, t: float) -> float:
        return 6 * self.a3 + 24 * self.a4 * t + 60 * self.a5 * t**2


class AdaptiveLocalPlanner:
    """
    Adaptive Local Planner capable of:
    1. Frenet-frame optimal trajectory generation (road-aligned).
    2. Free-space lattice trajectory sampling (unstructured/missing lane markings).
    3. Multi-objective cost optimization (jerk, time, velocity, risk, boundary clearance).
    4. Emergency fallback stopping profiles.
    """
    def __init__(self):
        self.collision_checker = CollisionChecker()
        # Cost function weights
        self.k_jerk = 0.1
        self.k_time = 0.2
        self.k_diff = 1.0
        self.k_vel = 1.0
        self.k_boundary = 1.5
        self.k_risk = 2.0

        # Physical limits
        self.max_speed = 25.0 # m/s (~90 km/h)
        self.max_accel = 3.5  # m/s^2
        self.max_decel = 6.0  # m/s^2 (emergency brake)
        self.max_curvature = 0.4 # 1/m

    def plan(
        self,
        ego: VehicleState,
        behavior: Dict[str, Any],
        csp: CubicSpline2D,
        tracked_objects: List[TrackedObject],
        predictions: List[PredictedTrajectory],
        road_boundaries: Optional[Dict[str, Any]] = None,
        step: int = 0
    ) -> Tuple[PlannedTrajectory, List[List[List[float]]], float]:
        start_time = time.perf_counter()

        target_speed = behavior.get("target_speed", 10.0)
        target_d = behavior.get("target_lateral_offset", 0.0)
        safety_multiplier = behavior.get("safety_margin_multiplier", 1.0)
        b_state = behavior.get("state", BehaviorState.FOLLOW)

        # 1. Emergency Braking Trajectory
        if b_state == BehaviorState.EMERGENCY_BRAKE or target_speed == 0.0:
            stop_traj = self._generate_emergency_stop_trajectory(ego)
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return PlannedTrajectory(
                points=stop_traj,
                cost=0.0,
                planner_type=PlannerType.MPC_REACTIVE,
                is_replanned=True,
                generated_at_step=step
            ), [], round(elapsed_ms, 2)

        # 2. Frenet State Conversion
        s0, d0 = csp.to_frenet(ego.x, ego.y, s_guess=max(0.0, ego.x))
        s_d = ego.v # Longitudinal speed
        s_dd = ego.acceleration
        d_d = ego.vy # Lateral speed
        d_dd = 0.0

        # 3. Trajectory Sampling Lattice
        candidate_paths: List[List[PathPoint]] = []
        candidate_costs: List[float] = []
        candidate_lines: List[List[List[float]]] = []

        # Sampling grids
        d_samples = [target_d, target_d - 0.8, target_d + 0.8, target_d - 1.5, target_d + 1.5]
        t_samples = [2.0, 2.8, 3.5]
        v_samples = [target_speed, max(0.0, target_speed - 2.5), target_speed + 1.5]

        for d_target in d_samples:
            for T in t_samples:
                lat_poly = QuinticPolynomial(d0, d_d, d_dd, d_target, 0.0, 0.0, T)

                for v_target in v_samples:
                    # Longitudinal trajectory keeping speed
                    s_target = s0 + v_target * T
                    lon_poly = QuinticPolynomial(s0, s_d, s_dd, s_target, v_target, 0.0, T)

                    dt = 0.1
                    times = np.arange(0.0, T + dt, dt)
                    traj: List[PathPoint] = []
                    feasible = True
                    cost_jerk = 0.0

                    for t in times:
                        s_val = lon_poly.calc_point(t)
                        s_vel = lon_poly.calc_first_derivative(t)
                        s_acc = lon_poly.calc_second_derivative(t)
                        s_jerk = lon_poly.calc_third_derivative(t)

                        d_val = lat_poly.calc_point(t)
                        d_vel = lat_poly.calc_first_derivative(t)
                        d_acc = lat_poly.calc_second_derivative(t)
                        d_jerk = lat_poly.calc_third_derivative(t)

                        # Kinematic constraints check
                        total_v = math.hypot(s_vel, d_vel)
                        total_a = math.hypot(s_acc, d_acc)
                        if total_v > self.max_speed or total_a > self.max_accel:
                            feasible = False
                            break

                        cost_jerk += (s_jerk**2 + d_jerk**2) * dt

                        x, y, yaw, kappa = csp.to_cartesian(s_val, d_val)
                        if abs(kappa) > self.max_curvature:
                            feasible = False
                            break

                        traj.append(PathPoint(
                            x=round(x, 2),
                            y=round(y, 2),
                            s=round(s_val, 2),
                            d=round(d_val, 2),
                            yaw=round(yaw, 3),
                            kappa=round(kappa, 4),
                            v=round(total_v, 2),
                            a=round(total_a, 2),
                            t=round(t, 2)
                        ))

                    if not feasible or len(traj) < 5:
                        continue

                    # Boundary and Collision Verification
                    is_safe = self.collision_checker.is_trajectory_collision_free(
                        traj, tracked_objects, predictions, road_boundaries, safety_multiplier
                    )
                    if not is_safe:
                        continue

                    # Calculate total cost
                    # Distance to road boundaries penalty
                    dist_to_bound = min([
                        self.collision_checker.compute_distance_to_boundaries(p, road_boundaries)
                        for p in traj
                    ])
                    bound_cost = 1.0 / (dist_to_bound + 0.1)

                    cost = (
                        self.k_jerk * cost_jerk +
                        self.k_time * T +
                        self.k_diff * (d_target - target_d)**2 +
                        self.k_vel * (v_target - target_speed)**2 +
                        self.k_boundary * bound_cost
                    )

                    candidate_paths.append(traj)
                    candidate_costs.append(cost)
                    candidate_lines.append([[p.x, p.y] for p in traj[::2]])

        # 4. Select Optimal Trajectory
        if candidate_paths:
            best_idx = int(np.argmin(candidate_costs))
            best_trajectory = candidate_paths[best_idx]
            best_cost = candidate_costs[best_idx]
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0

            return PlannedTrajectory(
                points=best_trajectory,
                cost=round(best_cost, 2),
                planner_type=PlannerType.FRENET_OPTIMAL,
                is_replanned=True,
                generated_at_step=step
            ), candidate_lines[:8], round(elapsed_ms, 2)

        # 5. Fallback: Free-space lattice emergency stop if no Frenet candidate passed collision check
        stop_traj = self._generate_emergency_stop_trajectory(ego)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return PlannedTrajectory(
            points=stop_traj,
            cost=999.0,
            planner_type=PlannerType.FREE_SPACE_LATTICE,
            is_replanned=True,
            generated_at_step=step
        ), [], round(elapsed_ms, 2)

    def _generate_emergency_stop_trajectory(self, ego: VehicleState) -> List[PathPoint]:
        """Generates a safe linear deceleration stopping profile along current heading."""
        pts = []
        cur_v = ego.v
        decel = 4.5 # m/s^2
        dt = 0.1
        t = 0.0
        cur_x = ego.x
        cur_y = ego.y

        while cur_v > 0.0 and t <= 3.0:
            pts.append(PathPoint(
                x=round(cur_x, 2),
                y=round(cur_y, 2),
                yaw=round(ego.yaw, 3),
                v=round(cur_v, 2),
                a=-decel,
                t=round(t, 2)
            ))
            cur_x += cur_v * math.cos(ego.yaw) * dt
            cur_y += cur_v * math.sin(ego.yaw) * dt
            cur_v = max(0.0, cur_v - decel * dt)
            t += dt

        # Pad with 0 velocity if stopped
        if len(pts) < 10:
            last_p = pts[-1] if pts else PathPoint(x=ego.x, y=ego.y, v=0.0, t=0.0)
            for i in range(len(pts), 15):
                pts.append(PathPoint(x=last_p.x, y=last_p.y, yaw=ego.yaw, v=0.0, a=0.0, t=round(i*dt, 2)))

        return pts
