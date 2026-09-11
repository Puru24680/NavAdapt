import math
import numpy as np
from typing import List, Dict, Optional
from ..models.schemas import ObjectDetection, TrackedObject, ObjectClass

class KalmanFilter2D:
    """
    Constant Velocity (CV) 4-State Kalman Filter for 2D tracking:
    State: [x, y, vx, vy]^T
    Measurement: [x, y, vx, vy]^T
    """
    def __init__(self, init_x: float, init_y: float, init_vx: float = 0.0, init_vy: float = 0.0, dt: float = 0.05):
        self.dt = dt
        # State vector
        self.x = np.array([init_x, init_y, init_vx, init_vy], dtype=np.float64)
        # State transition matrix
        self.F = np.array([
            [1.0, 0.0, dt,  0.0],
            [0.0, 1.0, 0.0, dt],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ], dtype=np.float64)
        # Measurement matrix
        self.H = np.eye(4, dtype=np.float64)
        # Covariance matrix P
        self.P = np.diag([1.0, 1.0, 2.0, 2.0])
        # Process noise Q
        q_pos = 0.05
        q_vel = 0.2
        self.Q = np.diag([q_pos, q_pos, q_vel, q_vel])
        # Measurement noise R
        self.R = np.diag([0.1, 0.1, 0.3, 0.3])

    def predict(self):
        self.x = self.F @ self.x
        self.P = self.F @ self.P @ self.F.T + self.Q
        return self.x

    def update(self, z: np.ndarray):
        y = z - (self.H @ self.x)
        S = self.H @ self.P @ self.H.T + self.R
        K = self.P @ self.H.T @ np.linalg.inv(S)
        self.x = self.x + (K @ y)
        I = np.eye(4, dtype=np.float64)
        self.P = (I - K @ self.H) @ self.P
        return self.x

class MultiObjectTracker:
    """
    Multi-object tracker with Kalman Filtering, track lifecycle management,
    and Euclidean/Mahalanobis association gating.
    """
    def __init__(self, max_age: int = 5, min_hits: int = 2, distance_threshold: float = 4.0):
        self.max_age = max_age
        self.min_hits = min_hits
        self.distance_threshold = distance_threshold
        self.tracks: Dict[str, Dict] = {}

    def update(self, detections: List[ObjectDetection], dt: float = 0.05) -> List[TrackedObject]:
        # 1. Predict existing tracks
        for track_id, track in list(self.tracks.items()):
            kf: KalmanFilter2D = track["kf"]
            kf.dt = dt
            kf.predict()
            track["time_since_update"] += 1
            track["age"] += 1

        # 2. Match detections to tracks (Greedy distance matching)
        unmatched_dets = list(range(len(detections)))
        matched_pairs = []

        for track_id, track in self.tracks.items():
            kf_state = track["kf"].x
            best_det_idx = None
            min_dist = self.distance_threshold

            for idx in unmatched_dets:
                det = detections[idx]
                dist = math.hypot(det.x - kf_state[0], det.y - kf_state[1])
                if dist < min_dist:
                    min_dist = dist
                    best_det_idx = idx

            if best_det_idx is not None:
                matched_pairs.append((track_id, best_det_idx))
                unmatched_dets.remove(best_det_idx)

        # 3. Update matched tracks
        for track_id, det_idx in matched_pairs:
            det = detections[det_idx]
            track = self.tracks[track_id]
            z = np.array([det.x, det.y, det.vx, det.vy], dtype=np.float64)
            track["kf"].update(z)
            track["hits"] += 1
            track["time_since_update"] = 0
            track["confidence"] = det.confidence
            track["length"] = det.length
            track["width"] = det.width
            track["height"] = det.height
            track["yaw"] = det.yaw
            track["class_name"] = det.class_name
            # Append history (keep last 20 steps)
            track["history"].append([round(track["kf"].x[0], 2), round(track["kf"].x[1], 2)])
            if len(track["history"]) > 20:
                track["history"].pop(0)

        # 4. Create new tracks for unmatched detections
        for det_idx in unmatched_dets:
            det = detections[det_idx]
            kf = KalmanFilter2D(det.x, det.y, det.vx, det.vy, dt=dt)
            self.tracks[det.id] = {
                "id": det.id,
                "kf": kf,
                "class_name": det.class_name,
                "confidence": det.confidence,
                "hits": 1,
                "age": 1,
                "time_since_update": 0,
                "length": det.length,
                "width": det.width,
                "height": det.height,
                "yaw": det.yaw,
                "history": [[round(det.x, 2), round(det.y, 2)]]
            }

        # 5. Prune dead tracks
        dead_ids = [tid for tid, trk in self.tracks.items() if trk["time_since_update"] > self.max_age]
        for tid in dead_ids:
            del self.tracks[tid]

        # 6. Build tracked object response list
        results: List[TrackedObject] = []
        for tid, trk in self.tracks.items():
            if trk["hits"] >= self.min_hits or trk["age"] <= 3:
                kf_state = trk["kf"].x
                results.append(TrackedObject(
                    id=trk["id"],
                    class_name=trk["class_name"],
                    confidence=trk["confidence"],
                    x=round(float(kf_state[0]), 2),
                    y=round(float(kf_state[1]), 2),
                    vx=round(float(kf_state[2]), 2),
                    vy=round(float(kf_state[3]), 2),
                    length=trk["length"],
                    width=trk["width"],
                    height=trk["height"],
                    yaw=trk["yaw"],
                    age=trk["age"],
                    hits=trk["hits"],
                    time_since_update=trk["time_since_update"],
                    history=trk["history"]
                ))

        return results
