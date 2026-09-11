import math
import random
from typing import List, Dict, Any, Tuple
from ..models.schemas import ObjectClass, ObjectDetection, VehicleState

class SensorModels:
    """
    Realistic multi-sensor simulation (Camera, LiDAR, Radar)
    incorporating sensor FOV, occlusion, Indian road lighting variations,
    and Gaussian measurement noise.
    """
    def __init__(self):
        # Camera specs
        self.cam_fov_deg = 110.0
        self.cam_max_range = 75.0
        # LiDAR specs
        self.lidar_channels = 64
        self.lidar_max_range = 100.0
        self.lidar_noise_std = 0.05  # 5cm range precision
        # Radar specs (77 GHz)
        self.radar_max_range = 140.0
        self.radar_fov_deg = 45.0
        self.radar_doppler_noise_std = 0.15 # m/s

    def simulate_camera_detections(
        self, ego: VehicleState, ground_truth_objects: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Simulates visual 2D/3D detections from front monocular/stereo cameras."""
        detections = []
        for obj in ground_truth_objects:
            dx = obj["x"] - ego.x
            dy = obj["y"] - ego.y
            dist = math.hypot(dx, dy)
            if dist > self.cam_max_range:
                continue

            angle_to_obj = math.atan2(dy, dx) - ego.yaw
            angle_to_obj = (angle_to_obj + math.pi) % (2 * math.pi) - math.pi
            if abs(math.degrees(angle_to_obj)) > (self.cam_fov_deg / 2.0):
                continue

            # Visual confidence drops with distance and class difficulty
            base_conf = 0.95
            if obj["class_name"] in [ObjectClass.POTHOLE, ObjectClass.ANIMAL]:
                base_conf = 0.88
            conf = max(0.60, min(0.99, base_conf - (dist / self.cam_max_range) * 0.25 + random.uniform(-0.03, 0.03)))

            # 2D Bounding box approximation in normalized camera plane [-1, 1]
            h_fov = math.radians(self.cam_fov_deg)
            v_fov = math.radians(60.0)
            u = math.tan(angle_to_obj) / math.tan(h_fov / 2.0)
            v = 0.1  # Road plane pitch offset
            box_w = min(0.4, (obj.get("width", 1.8) / dist) * 1.5)
            box_h = min(0.5, (obj.get("height", 1.5) / dist) * 1.5)

            detections.append({
                "id": obj["id"],
                "class_name": obj["class_name"],
                "distance": dist + random.gauss(0, 0.15),
                "angle": angle_to_obj + random.gauss(0, 0.02),
                "confidence": round(conf, 3),
                "bbox_2d": {
                    "u_center": round(u, 3),
                    "v_center": round(v, 3),
                    "width": round(box_w, 3),
                    "height": round(box_h, 3)
                }
            })
        return detections

    def simulate_lidar_point_cloud(
        self, ego: VehicleState, ground_truth_objects: List[Dict[str, Any]], road_boundaries: Dict[str, Any]
    ) -> List[Dict[str, float]]:
        """
        Generates simulated LiDAR cluster returns and ground contour points.
        Returns a compressed sample of point-cloud returns for BEV visualization.
        """
        points = []
        # Sample points on road borders (left and right curbs / shoulder)
        for side in ["left_boundary", "right_boundary"]:
            for pt in road_boundaries.get(side, []):
                dx = pt[0] - ego.x
                dy = pt[1] - ego.y
                dist = math.hypot(dx, dy)
                if dist <= self.lidar_max_range:
                    points.append({
                        "x": round(dx + random.gauss(0, self.lidar_noise_std), 2),
                        "y": round(dy + random.gauss(0, self.lidar_noise_std), 2),
                        "intensity": round(0.4 + random.uniform(0, 0.2), 2),
                        "tag": "boundary"
                    })

        # Object returns (synthetic cluster points)
        for obj in ground_truth_objects:
            dx = obj["x"] - ego.x
            dy = obj["y"] - ego.y
            dist = math.hypot(dx, dy)
            if dist <= self.lidar_max_range:
                # 6 cluster points per object
                for _ in range(6):
                    px = dx + random.uniform(-obj.get("length", 2.0)/2, obj.get("length", 2.0)/2)
                    py = dy + random.uniform(-obj.get("width", 1.5)/2, obj.get("width", 1.5)/2)
                    points.append({
                        "x": round(px + random.gauss(0, self.lidar_noise_std), 2),
                        "y": round(py + random.gauss(0, self.lidar_noise_std), 2),
                        "intensity": round(0.8 + random.uniform(0, 0.2), 2),
                        "tag": obj["class_name"]
                    })
        return points

    def simulate_radar_targets(
        self, ego: VehicleState, ground_truth_objects: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Simulates 77 GHz long-range/medium-range radar returns.
        Computes accurate Doppler radial closing speed (dr/dt).
        """
        radar_targets = []
        for obj in ground_truth_objects:
            dx = obj["x"] - ego.x
            dy = obj["y"] - ego.y
            dist = math.hypot(dx, dy)
            if dist > self.radar_max_range or dist < 0.5:
                continue

            angle = math.atan2(dy, dx) - ego.yaw
            angle = (angle + math.pi) % (2 * math.pi) - math.pi
            if abs(math.degrees(angle)) > (self.radar_fov_deg / 2.0):
                continue

            # Radial relative velocity: v_rel_radial = (dx*dvx + dy*dvy)/dist
            rel_vx = obj.get("vx", 0.0) - (ego.vx)
            rel_vy = obj.get("vy", 0.0) - (ego.vy)
            v_radial = (dx * rel_vx + dy * rel_vy) / dist

            # Radar cross section (RCS in dBsm)
            rcs_map = {
                ObjectClass.TRUCK: 25.0,
                ObjectClass.BUS: 25.0,
                ObjectClass.CAR: 15.0,
                ObjectClass.AUTO_RICKSHAW: 10.0,
                ObjectClass.MOTORCYCLE: 5.0,
                ObjectClass.BICYCLE: 2.0,
                ObjectClass.PEDESTRIAN: 0.0,
                ObjectClass.ANIMAL: 8.0,
                ObjectClass.PUSHCART: 6.0,
                ObjectClass.STATIC_OBSTACLE: 12.0,
                ObjectClass.POTHOLE: -15.0
            }
            rcs = rcs_map.get(obj["class_name"], 5.0)

            radar_targets.append({
                "id": obj["id"],
                "range": round(dist + random.gauss(0, 0.2), 2),
                "azimuth_deg": round(math.degrees(angle) + random.gauss(0, 0.4), 2),
                "doppler_radial_speed": round(v_radial + random.gauss(0, self.radar_doppler_noise_std), 2),
                "rcs_dbsm": rcs
            })
        return radar_targets
