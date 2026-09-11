import math
from typing import List
from ..models.schemas import (
    TrackedObject,
    PredictedTrajectory,
    TrajectoryHypothesis,
    PathPoint,
    ObjectClass
)

class TrajectoryPredictor:
    """
    Multi-hypothesis trajectory predictor designed for unstructured Indian traffic.
    Does NOT assume lane-following constraints.
    Generates multi-modal probabilistic future paths (3.0s horizon).
    """
    def __init__(self, horizon_seconds: float = 3.0, dt: float = 0.2):
        self.horizon = horizon_seconds
        self.dt = dt
        self.num_steps = int(horizon_seconds / dt)

    def predict(self, tracked_objects: List[TrackedObject]) -> List[PredictedTrajectory]:
        predictions: List[PredictedTrajectory] = []

        for obj in tracked_objects:
            hypotheses: List[TrajectoryHypothesis] = []

            # 1. Animals / Cattle: High uncertainty, sudden crossing or halting
            if obj.class_name == ObjectClass.ANIMAL:
                # Mode A: Continue crossing road
                pts_a = self._extrapolate(obj.x, obj.y, obj.vx, obj.vy, bias_lateral=0.0)
                hypotheses.append(TrajectoryHypothesis(probability=0.60, intent="Continue Crossing Road", points=pts_a))

                # Mode B: Abrupt stop in lane (common animal behavior)
                pts_b = self._extrapolate_decay(obj.x, obj.y, obj.vx, obj.vy, decay=0.3)
                hypotheses.append(TrajectoryHypothesis(probability=0.25, intent="Freeze in Middle of Road", points=pts_b))

                # Mode C: Turn back towards verge
                pts_c = self._extrapolate(obj.x, obj.y, -obj.vx * 0.5, -obj.vy * 0.8, bias_lateral=0.0)
                hypotheses.append(TrajectoryHypothesis(probability=0.15, intent="Hesitate & Turn Back", points=pts_c))

            # 2. Pedestrians & Pushcarts: Walking / crossing / darting
            elif obj.class_name in [ObjectClass.PEDESTRIAN, ObjectClass.PUSHCART]:
                pts_a = self._extrapolate(obj.x, obj.y, obj.vx, obj.vy)
                hypotheses.append(TrajectoryHypothesis(probability=0.70, intent="Crossing Roadway", points=pts_a))

                pts_b = self._extrapolate_decay(obj.x, obj.y, obj.vx, obj.vy, decay=0.1)
                hypotheses.append(TrajectoryHypothesis(probability=0.30, intent="Hesitant Halt", points=pts_b))

            # 3. Two-Wheelers & Auto-Rickshaws: Weaving and informal cut-in
            elif obj.class_name in [ObjectClass.AUTO_RICKSHAW, ObjectClass.MOTORCYCLE]:
                # Primary: Current heading
                pts_a = self._extrapolate(obj.x, obj.y, obj.vx, obj.vy)
                hypotheses.append(TrajectoryHypothesis(probability=0.60, intent="Maintain Motion", points=pts_a))

                # Swerve / Cut-in towards center (lateral wander typical of Indian traffic)
                lateral_bias = -1.2 if obj.y > 0 else 1.2
                pts_b = self._extrapolate(obj.x, obj.y, obj.vx, obj.vy, bias_lateral=lateral_bias)
                hypotheses.append(TrajectoryHypothesis(probability=0.40, intent="Aggressive Cut-In", points=pts_b))

            # 4. Static obstacles & Potholes
            elif obj.class_name in [ObjectClass.STATIC_OBSTACLE, ObjectClass.POTHOLE]:
                pts_static = [
                    PathPoint(x=obj.x, y=obj.y, v=0.0, a=0.0, t=i * self.dt)
                    for i in range(1, self.num_steps + 1)
                ]
                hypotheses.append(TrajectoryHypothesis(probability=1.0, intent="Stationary Hazard", points=pts_static))

            # 5. Regular vehicles (Cars, Buses, Trucks)
            else:
                pts_a = self._extrapolate(obj.x, obj.y, obj.vx, obj.vy)
                hypotheses.append(TrajectoryHypothesis(probability=0.80, intent="Standard Cruise", points=pts_a))

                # Slight lateral drift
                pts_b = self._extrapolate(obj.x, obj.y, obj.vx, obj.vy, bias_lateral=0.3)
                hypotheses.append(TrajectoryHypothesis(probability=0.20, intent="Informal Drift", points=pts_b))

            predictions.append(PredictedTrajectory(
                object_id=obj.id,
                class_name=obj.class_name,
                hypotheses=hypotheses
            ))

        return predictions

    def _extrapolate(self, x0: float, y0: float, vx: float, vy: float, bias_lateral: float = 0.0) -> List[PathPoint]:
        pts = []
        speed = math.hypot(vx, vy)
        heading = math.atan2(vy, vx) if speed > 0.1 else 0.0

        cur_x, cur_y = x0, y0
        for step in range(1, self.num_steps + 1):
            t = step * self.dt
            cur_x += vx * self.dt
            cur_y += (vy + bias_lateral * 0.2 * (step / self.num_steps)) * self.dt
            pts.append(PathPoint(
                x=round(cur_x, 2),
                y=round(cur_y, 2),
                v=round(speed, 2),
                yaw=round(heading, 3),
                t=round(t, 2)
            ))
        return pts

    def _extrapolate_decay(self, x0: float, y0: float, vx: float, vy: float, decay: float = 0.3) -> List[PathPoint]:
        pts = []
        cur_x, cur_y = x0, y0
        cur_vx, cur_vy = vx, vy
        for step in range(1, self.num_steps + 1):
            t = step * self.dt
            cur_vx *= (1.0 - decay)
            cur_vy *= (1.0 - decay)
            cur_x += cur_vx * self.dt
            cur_y += cur_vy * self.dt
            pts.append(PathPoint(
                x=round(cur_x, 2),
                y=round(cur_y, 2),
                v=round(math.hypot(cur_vx, cur_vy), 2),
                t=round(t, 2)
            ))
        return pts
