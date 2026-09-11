from typing import Dict, Any, Optional, List
from ..models.schemas import (
    BehaviorState,
    RiskAssessment,
    RiskLevel,
    VehicleState,
    TrackedObject,
    ObjectClass
)

class BehavioralPlanner:
    """
    Hierarchical Finite State Machine (FSM) behavior planner.
    Selects driving intent and sets constraints for the local trajectory generator.
    """
    def __init__(self):
        self.current_state: BehaviorState = BehaviorState.FOLLOW
        self.wait_counter: int = 0

    def plan_behavior(
        self,
        ego: VehicleState,
        risk: RiskAssessment,
        tracked_objects: List[TrackedObject],
        road_type: str,
        cruise_speed_target: float = 12.0
    ) -> Dict[str, Any]:
        prev_state = self.current_state

        # 1. Emergency Braking check (Highest priority)
        if risk.level == RiskLevel.CRITICAL or risk.min_ttc < 1.6:
            self.current_state = BehaviorState.EMERGENCY_BRAKE
            return {
                "state": self.current_state,
                "prev_state": prev_state,
                "target_speed": 0.0,
                "target_lateral_offset": 0.0,
                "safety_margin_multiplier": 1.5,
                "description": "Critical risk detected — executing immediate emergency deceleration."
            }

        # 2. Check critical object in proximity
        crit_obj: Optional[TrackedObject] = None
        if risk.critical_object_id:
            crit_obj = next((o for o in tracked_objects if o.id == risk.critical_object_id), None)

        # 3. Animal or Pedestrian blocking ahead
        if crit_obj and crit_obj.class_name in [ObjectClass.ANIMAL, ObjectClass.PEDESTRIAN]:
            dx = crit_obj.x - ego.x
            dy = crit_obj.y - ego.y
            if 0 < dx < 22.0 and abs(dy) < 2.2:
                if ego.v < 1.0:
                    self.current_state = BehaviorState.WAIT
                    self.wait_counter += 1
                    return {
                        "state": self.current_state,
                        "prev_state": prev_state,
                        "target_speed": 0.0,
                        "target_lateral_offset": 0.0,
                        "safety_margin_multiplier": 1.6,
                        "description": f"Waiting for {crit_obj.class_name.value} to safely cross the roadway."
                    }
                else:
                    self.current_state = BehaviorState.STOP
                    return {
                        "state": self.current_state,
                        "prev_state": prev_state,
                        "target_speed": 0.0,
                        "target_lateral_offset": 0.0,
                        "safety_margin_multiplier": 1.4,
                        "description": f"Controlled stop for {crit_obj.class_name.value} in drivable path."
                    }

        # 4. Obstacle avoidance / Overtake on slow vehicle or pushcart
        if crit_obj and crit_obj.class_name in [ObjectClass.PUSHCART, ObjectClass.STATIC_OBSTACLE, ObjectClass.POTHOLE, ObjectClass.TRUCK]:
            dx = crit_obj.x - ego.x
            dy = crit_obj.y - ego.y
            if 0 < dx < 30.0 and abs(dy) < 1.8:
                self.current_state = BehaviorState.AVOID_OBSTACLE
                # Steer around: pick opposite side of obstacle
                nudge_offset = -1.8 if dy >= 0 else 1.8
                return {
                    "state": self.current_state,
                    "prev_state": prev_state,
                    "target_speed": max(4.0, cruise_speed_target * 0.5),
                    "target_lateral_offset": nudge_offset,
                    "safety_margin_multiplier": 1.2,
                    "description": f"Nudging and avoiding {crit_obj.class_name.value} via free space."
                }

        # 5. Intersection or High-Risk Yielding
        if risk.level == RiskLevel.HIGH_RISK or road_type == "intersection":
            if risk.min_ttc < 3.5:
                self.current_state = BehaviorState.YIELD
                return {
                    "state": self.current_state,
                    "prev_state": prev_state,
                    "target_speed": min(3.0, cruise_speed_target * 0.3),
                    "target_lateral_offset": 0.0,
                    "safety_margin_multiplier": 1.3,
                    "description": "Yielding right-of-way to cross-traffic at unsignalized junction."
                }
            else:
                self.current_state = BehaviorState.SLOW_DOWN
                return {
                    "state": self.current_state,
                    "prev_state": prev_state,
                    "target_speed": cruise_speed_target * 0.6,
                    "target_lateral_offset": 0.0,
                    "safety_margin_multiplier": 1.1,
                    "description": "Moderating speed due to elevated surrounding traffic density."
                }

        # 6. Highway Merge
        if road_type == "highway_merge":
            self.current_state = BehaviorState.MERGE
            return {
                "state": self.current_state,
                "prev_state": prev_state,
                "target_speed": cruise_speed_target,
                "target_lateral_offset": 0.0,
                "safety_margin_multiplier": 1.0,
                "description": "Merging smoothly into mainline flow."
            }

        # 7. Default Cruise Follow
        self.current_state = BehaviorState.FOLLOW
        return {
            "state": self.current_state,
            "prev_state": prev_state,
            "target_speed": cruise_speed_target,
            "target_lateral_offset": 0.0,
            "safety_margin_multiplier": 1.0,
            "description": "Standard cruise following optimal free-space path."
        }
