import math
from typing import Tuple
from ..models.schemas import VehicleState

class VehicleDynamicsSimulator:
    """
    Nonlinear dynamic bicycle model with tire slip angle calculation
    and 4th-Order Runge-Kutta (RK4) numerical integration.
    """
    def __init__(self, wheelbase: float = 2.7, mass: float = 1650.0):
        self.L = wheelbase
        self.lr = wheelbase * 0.55 # Center of gravity to rear axle
        self.lf = wheelbase * 0.45 # Center of gravity to front axle
        self.mass = mass
        self.drag_coeff = 0.32
        self.rolling_resistance = 0.015
        self.g = 9.81
        self.steer_rate_limit = 0.8 # rad/s (~45 deg/s)

    def step(
        self,
        ego: VehicleState,
        steer_cmd: float,
        accel_cmd: float,
        throttle: float,
        brake: float,
        dt: float = 0.05
    ) -> VehicleState:
        # Rate-limit steering
        steer_diff = steer_cmd - ego.steering_angle
        max_dsteer = self.steer_rate_limit * dt
        actual_steer = ego.steering_angle + max(-max_dsteer, min(max_dsteer, steer_diff))

        # RK4 Integration helper for state: [x, y, yaw, v]
        state = (ego.x, ego.y, ego.yaw, ego.v)

        def derivatives(s: Tuple[float, float, float, float]) -> Tuple[float, float, float, float]:
            cur_x, cur_y, cur_yaw, cur_v = s
            # Sideslip angle beta
            beta = math.atan2(self.lr * math.tan(actual_steer), self.L)

            dx = cur_v * math.cos(cur_yaw + beta)
            dy = cur_v * math.sin(cur_yaw + beta)
            dyaw = (cur_v / self.L) * math.cos(beta) * math.tan(actual_steer)

            # Air drag + rolling resistance losses
            res_accel = self.rolling_resistance * self.g + (0.5 * 1.225 * self.drag_coeff * 2.2 / self.mass) * (cur_v**2)
            dv = accel_cmd - (res_accel if cur_v > 0.1 else 0.0)

            # Do not reverse if braking
            if cur_v <= 0.01 and dv < 0:
                dv = -cur_v / dt

            return (dx, dy, dyaw, dv)

        # Runge-Kutta 4 steps
        k1 = derivatives(state)
        s_k2 = tuple(state[i] + 0.5 * dt * k1[i] for i in range(4))
        k2 = derivatives(s_k2)
        s_k3 = tuple(state[i] + 0.5 * dt * k2[i] for i in range(4))
        k3 = derivatives(s_k3)
        s_k4 = tuple(state[i] + dt * k3[i] for i in range(4))
        k4 = derivatives(s_k4)

        new_x = state[0] + (dt / 6.0) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
        new_y = state[1] + (dt / 6.0) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
        new_yaw = state[2] + (dt / 6.0) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])
        new_v = max(0.0, state[3] + (dt / 6.0) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]))

        # Normalize yaw
        new_yaw = (new_yaw + math.pi) % (2 * math.pi) - math.pi

        # Update derivatives
        actual_accel = (new_v - ego.v) / dt
        jerk = (actual_accel - ego.acceleration) / dt
        yaw_rate = (new_yaw - ego.yaw) / dt

        vx = new_v * math.cos(new_yaw)
        vy = new_v * math.sin(new_yaw)

        gear = "P" if new_v < 0.05 and brake > 0.5 else "D"

        return VehicleState(
            x=round(new_x, 3),
            y=round(new_y, 3),
            vx=round(vx, 3),
            vy=round(vy, 3),
            v=round(new_v, 3),
            yaw=round(new_yaw, 4),
            yaw_rate=round(yaw_rate, 4),
            steering_angle=round(actual_steer, 4),
            acceleration=round(actual_accel, 3),
            jerk=round(jerk, 3),
            throttle=round(throttle, 2),
            brake=round(brake, 2),
            gear=gear,
            length=ego.length,
            width=ego.width,
            wheelbase=ego.wheelbase
        )
