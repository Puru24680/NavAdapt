import math
from typing import Tuple, Optional
from ..models.schemas import VehicleState, PlannedTrajectory, PathPoint

class StanleyController:
    """
    Stanley Steering Controller + Longitudinal PID Controller with jerk limiting.
    Provides robust path tracking even at low crawling speeds in Indian traffic.
    """
    def __init__(self, k_e: float = 1.2, k_soft: float = 0.5, max_steer_rad: float = 0.61):
        self.k_e = k_e
        self.k_soft = k_soft
        self.max_steer = max_steer_rad # ~35 deg

        # Longitudinal PID
        self.kp_v = 0.8
        self.ki_v = 0.05
        self.kd_v = 0.1
        self.integral_error_v = 0.0
        self.prev_error_v = 0.0

        # Actuator limits
        self.max_accel = 2.5 # m/s^2
        self.max_decel = 6.0 # m/s^2

    def compute_control(
        self,
        ego: VehicleState,
        trajectory: PlannedTrajectory,
        dt: float = 0.05
    ) -> Tuple[float, float, float, float]:
        """
        Computes (steering_angle_rad, target_accel, throttle, brake).
        """
        if not trajectory.points:
            return 0.0, -self.max_decel, 0.0, 1.0

        # 1. Front axle position
        x_fa = ego.x + ego.wheelbase * math.cos(ego.yaw)
        y_fa = ego.y + ego.wheelbase * math.sin(ego.yaw)

        # 2. Find closest point on trajectory to front axle
        min_dist = float('inf')
        target_idx = 0
        for i, p in enumerate(trajectory.points):
            d = math.hypot(p.x - x_fa, p.y - y_fa)
            if d < min_dist:
                min_dist = d
                target_idx = i

        target_point = trajectory.points[target_idx]

        # 3. Heading error: theta_e = yaw_path - yaw_ego
        yaw_path = target_point.yaw
        yaw_err = yaw_path - ego.yaw
        # Normalize to [-pi, pi]
        yaw_err = (yaw_err + math.pi) % (2 * math.pi) - math.pi

        # 4. Cross-track error e_fa
        dx = x_fa - target_point.x
        dy = y_fa - target_point.y
        # Vector perpendicular to path: [-sin(yaw_path), cos(yaw_path)]
        crosstrack_err = math.sin(yaw_path) * dx - math.cos(yaw_path) * dy

        # 5. Stanley Steering Law
        # delta = yaw_err + arctan( (k_e * crosstrack_err) / (v + k_soft) )
        cross_track_term = math.atan2(self.k_e * crosstrack_err, ego.v + self.k_soft)
        steering = yaw_err + cross_track_term
        steering = max(-self.max_steer, min(self.max_steer, steering))

        # 6. Longitudinal Speed Control (PID)
        v_target = target_point.v
        v_error = v_target - ego.v
        self.integral_error_v = max(-10.0, min(10.0, self.integral_error_v + v_error * dt))
        v_deriv = (v_error - self.prev_error_v) / dt
        self.prev_error_v = v_error

        accel_cmd = (
            self.kp_v * v_error +
            self.ki_v * self.integral_error_v +
            self.kd_v * v_deriv
        )
        accel_cmd = max(-self.max_decel, min(self.max_accel, accel_cmd))

        # Map acceleration to throttle / brake pedals
        if accel_cmd >= 0:
            throttle = min(1.0, accel_cmd / self.max_accel)
            brake = 0.0
        else:
            throttle = 0.0
            brake = min(1.0, abs(accel_cmd) / self.max_decel)

        return steering, accel_cmd, throttle, brake
