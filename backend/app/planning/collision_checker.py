import math
from typing import List, Dict, Any, Optional
from ..models.schemas import PathPoint, TrackedObject, PredictedTrajectory, ObjectClass

class CollisionChecker:
    """
    Continuous collision checker against:
    1. Static road boundary contours & road hazards (potholes)
    2. Dynamic obstacle swept volumes and multi-hypothesis predicted paths
    """
    def __init__(self, ego_length: float = 4.6, ego_width: float = 1.9):
        self.ego_length = ego_length
        self.ego_width = ego_width
        self.ego_radius = math.hypot(ego_length / 2.0, ego_width / 2.0)
        self.base_safety_margin = 0.6 # meters

    def is_trajectory_collision_free(
        self,
        trajectory: List[PathPoint],
        tracked_objects: List[TrackedObject],
        predictions: List[PredictedTrajectory],
        road_boundaries: Optional[Dict[str, Any]] = None,
        safety_multiplier: float = 1.0
    ) -> bool:
        if not trajectory:
            return False

        pred_map = {p.object_id: p for p in predictions}
        margin = self.base_safety_margin * safety_multiplier

        # 1. Road Boundary Verification
        if road_boundaries:
            left_bounds = road_boundaries.get("left_boundary", [])
            right_bounds = road_boundaries.get("right_boundary", [])

            for p in trajectory:
                # Check proximity to left boundary
                for lb in left_bounds:
                    if math.hypot(p.x - lb[0], p.y - lb[1]) < (self.ego_width / 2.0 + margin):
                        return False
                # Check proximity to right boundary
                for rb in right_bounds:
                    if math.hypot(p.x - rb[0], p.y - rb[1]) < (self.ego_width / 2.0 + margin):
                        return False

            # Check potholes (avoid deep potholes)
            potholes = road_boundaries.get("potholes", [])
            for pothole in potholes:
                px, py = pothole["x"], pothole["y"]
                pradius = pothole.get("radius", 0.5)
                for p in trajectory:
                    if math.hypot(p.x - px, p.y - py) < (pradius + self.ego_width / 3.0):
                        return False

        # 2. Dynamic Obstacle Verification
        for p_ego in trajectory:
            for obj in tracked_objects:
                obj_half_diag = math.hypot(obj.length / 2.0, obj.width / 2.0)
                pred = pred_map.get(obj.id)

                if pred and pred.hypotheses:
                    # Check against each predicted hypothesis
                    for hyp in pred.hypotheses:
                        if hyp.probability < 0.15:
                            continue
                        # Find closest point in time
                        for p_obj in hyp.points:
                            if abs(p_ego.t - p_obj.t) <= 0.15:
                                dist = math.hypot(p_ego.x - p_obj.x, p_ego.y - p_obj.y)
                                critical_dist = self.ego_radius + obj_half_diag + margin
                                # Animal / Cattle and Pedestrian extra cautious safety buffer
                                if obj.class_name in [ObjectClass.ANIMAL, ObjectClass.PEDESTRIAN]:
                                    critical_dist += 0.8

                                if dist < critical_dist:
                                    return False
                else:
                    # Fallback to current position for static/unpredicted objects
                    dist = math.hypot(p_ego.x - obj.x, p_ego.y - obj.y)
                    critical_dist = self.ego_radius + obj_half_diag + margin
                    if dist < critical_dist:
                        return False

        return True

    def compute_distance_to_boundaries(self, p: PathPoint, road_boundaries: Optional[Dict[str, Any]]) -> float:
        """Returns minimum distance to left/right road boundaries."""
        if not road_boundaries:
            return 3.0 # Default clearance

        min_dist = float('inf')
        for side in ["left_boundary", "right_boundary"]:
            for pt in road_boundaries.get(side, []):
                d = math.hypot(p.x - pt[0], p.y - pt[1])
                if d < min_dist:
                    min_dist = d
        return min_dist
