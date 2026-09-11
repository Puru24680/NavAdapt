import math
from typing import List, Dict, Tuple, Optional
from ..models.schemas import (
    VehicleState,
    TrackedObject,
    PredictedTrajectory,
    PlannedTrajectory,
    RiskAssessment,
    AgentRiskScore,
    RiskLevel,
    ObjectClass
)

class RiskEngine:
    """
    Dynamic composite risk evaluation engine for unstructured traffic.
    Computes individual agent risks and system-level risk score on a 0-100 scale:
      0 - 25: Safe
      25 - 50: Caution
      50 - 75: High Risk
      75 - 100: Critical (triggers immediate replanning / emergency brake)
    """
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or {
            "distance": 0.25,
            "velocity": 0.15,
            "ttc": 0.35,
            "overlap": 0.15,
            "vulnerability": 0.10
        }
        # Vulnerability multiplier by Indian road user class
        self.vulnerability_multipliers = {
            ObjectClass.PEDESTRIAN: 1.5,
            ObjectClass.ANIMAL: 1.35,
            ObjectClass.PUSHCART: 1.25,
            ObjectClass.BICYCLE: 1.3,
            ObjectClass.MOTORCYCLE: 1.2,
            ObjectClass.AUTO_RICKSHAW: 1.1,
            ObjectClass.CAR: 1.0,
            ObjectClass.TRUCK: 1.4, # Heavy vehicle consequence
            ObjectClass.BUS: 1.4,
            ObjectClass.POTHOLE: 1.1,
            ObjectClass.STATIC_OBSTACLE: 1.0
        }

    def assess(
        self,
        ego: VehicleState,
        tracked_objects: List[TrackedObject],
        predictions: List[PredictedTrajectory],
        planned_trajectory: PlannedTrajectory,
        road_boundaries: Optional[Dict] = None
    ) -> RiskAssessment:
        agent_risks: Dict[str, AgentRiskScore] = {}
        pred_map = {p.object_id: p for p in predictions}

        max_risk = 0.0
        critical_obj_id = None
        min_ttc = 99.0

        for obj in tracked_objects:
            dx = obj.x - ego.x
            dy = obj.y - ego.y
            dist = math.hypot(dx, dy)

            # Closing speed calculation: v_rel = (ego_v_vector - obj_v_vector) along line of sight
            rel_vx = ego.vx - obj.vx
            rel_vy = ego.vy - obj.vy
            closing_speed = (dx * rel_vx + dy * rel_vy) / (dist + 1e-6)

            # Time to collision (TTC)
            if closing_speed > 0.1:
                ttc = max(0.01, dist / closing_speed)
            else:
                ttc = 99.0

            if ttc < min_ttc:
                min_ttc = ttc

            # 1. Distance Risk (0 - 100): Steep ramp below 25m
            if dist < 8.0:
                dist_risk = 100.0
            elif dist < 30.0:
                dist_risk = 100.0 * (1.0 - (dist - 8.0) / 22.0)
            else:
                dist_risk = 0.0

            # 2. Velocity Risk (0 - 100): High relative closing speed
            if closing_speed > 0.0:
                speed_risk = min(100.0, (closing_speed / 12.0) * 100.0)
            else:
                speed_risk = 0.0

            # 3. TTC Risk (0 - 100): Critical if TTC < 2.0s
            if ttc <= 1.5:
                ttc_risk = 100.0
            elif ttc <= 4.0:
                ttc_risk = 100.0 * ((4.0 - ttc) / (4.0 - 1.5))
            else:
                ttc_risk = 0.0

            # 4. Trajectory Overlap Risk (0 - 100): Check overlap with predicted points or line of travel
            overlap_risk = self._compute_overlap_risk(ego, obj, pred_map.get(obj.id), planned_trajectory)
            if overlap_risk == 0.0 and abs(dy) < 1.5 and dist < 20.0 and closing_speed > 0:
                # Direct in-line collision hazard
                overlap_risk = min(100.0, (1.0 - abs(dy) / 1.5) * 90.0)

            # 5. Vulnerability weight
            vuln_weight = self.vulnerability_multipliers.get(obj.class_name, 1.0)
            vuln_score = min(100.0, (vuln_weight - 1.0) * 150.0 + 30.0)

            # Weighted sum
            w = self.weights
            composite_risk = (
                w["distance"] * dist_risk +
                w["velocity"] * speed_risk +
                w["ttc"] * ttc_risk +
                w["overlap"] * overlap_risk +
                w["vulnerability"] * vuln_score
            ) * obj.confidence

            composite_risk = max(0.0, min(100.0, composite_risk))

            # Classification
            if composite_risk >= 75.0:
                level = RiskLevel.CRITICAL
            elif composite_risk >= 50.0:
                level = RiskLevel.HIGH_RISK
            elif composite_risk >= 25.0:
                level = RiskLevel.CAUTION
            else:
                level = RiskLevel.SAFE

            agent_score = AgentRiskScore(
                object_id=obj.id,
                class_name=obj.class_name,
                total_risk=round(composite_risk, 1),
                level=level,
                distance=round(dist, 2),
                rel_speed=round(closing_speed, 2),
                ttc=round(min(99.0, ttc), 2),
                trajectory_overlap=round(overlap_risk, 1),
                vulnerability_weight=round(vuln_weight, 2),
                distance_risk=round(dist_risk, 1),
                speed_risk=round(speed_risk, 1),
                ttc_risk=round(ttc_risk, 1),
                overlap_risk=round(overlap_risk, 1)
            )
            agent_risks[obj.id] = agent_score

            if composite_risk > max_risk:
                max_risk = composite_risk
                critical_obj_id = obj.id

        # System-level risk
        overall_score = round(max_risk, 1)
        if overall_score >= 75.0:
            overall_level = RiskLevel.CRITICAL
        elif overall_score >= 50.0:
            overall_level = RiskLevel.HIGH_RISK
        elif overall_score >= 25.0:
            overall_level = RiskLevel.CAUTION
        else:
            overall_level = RiskLevel.SAFE

        return RiskAssessment(
            overall_score=overall_score,
            level=overall_level,
            critical_object_id=critical_obj_id,
            min_ttc=round(min_ttc, 2),
            agent_risks=agent_risks,
            weights=self.weights
        )

    def _compute_overlap_risk(
        self,
        ego: VehicleState,
        obj: TrackedObject,
        pred: Optional[PredictedTrajectory],
        plan: PlannedTrajectory
    ) -> float:
        """Measures geometric overlap between ego planned path and agent predicted paths."""
        if not plan.points or not pred or not pred.hypotheses:
            return 0.0

        max_overlap = 0.0
        # Compare points within corresponding time frames
        for hyp in pred.hypotheses:
            for p_obj in hyp.points:
                # Find closest ego point around the same timestamp
                for p_ego in plan.points:
                    if abs(p_ego.t - p_obj.t) < 0.5:
                        d = math.hypot(p_ego.x - p_obj.x, p_ego.y - p_obj.y)
                        safety_margin = (ego.width / 2.0) + (obj.width / 2.0) + 1.2 # 1.2m buffer
                        if d < safety_margin:
                            overlap = (1.0 - (d / safety_margin)) * 100.0 * hyp.probability
                            if overlap > max_overlap:
                                max_overlap = overlap

        return min(100.0, max_overlap)
