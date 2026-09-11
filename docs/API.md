# REST & WebSocket API Specification

## 1. REST Endpoints

Base URL: `http://localhost:8000/api`

### Scenario Endpoints
- `GET /scenarios`: Returns list of all 5 Indian road scenarios.
- `GET /scenarios/{id}`: Returns complete definition (road geometry, initial objects, ego state, boundaries).

### Simulation Control Endpoints
- `POST /simulation/start`: Starts the continuous closed-loop simulation loop.
- `POST /simulation/pause`: Toggles pause state.
- `POST /simulation/stop`: Halts simulation execution.
- `POST /simulation/reset/{scenario_id}`: Reinitializes vehicle state and objects for the given scenario.
- `POST /simulation/replan`: Forces immediate re-evaluation and replanning cycle.
- `POST /simulation/trigger-hazard`: Injects a sudden hazard for SIH demonstrations.
  - Body: `{"hazard_type": "cattle_crossing" | "pedestrian_dart" | "rickshaw_cut_in" | "pothole_swerve"}`

### Telemetry & State Endpoints
- `GET /simulation/status`: Returns current `SimulationState` snapshot.
- `GET /metrics`: Returns real-time aggregate `PerformanceMetrics`.
- `GET /objects`: Returns currently tracked dynamic objects.
- `GET /vehicle`: Returns ego vehicle kinematic telemetry.
- `GET /risk`: Returns dynamic composite risk assessment.

---

## 2. Real-Time WebSocket Protocol

Endpoint: `ws://localhost:8000/ws/simulation`

### Server-to-Client Stream (25 Hz)
The server streams a JSON payload matching `SimulationState`:
```json
{
  "scenario_id": "scenario_5",
  "time": 4.25,
  "step": 85,
  "dt": 0.05,
  "is_running": true,
  "is_paused": false,
  "is_completed": false,
  "vehicle": {
    "x": 34.2,
    "y": 0.1,
    "vx": 7.4,
    "vy": 0.0,
    "v": 7.4,
    "yaw": 0.012,
    "steering_angle": -0.045,
    "acceleration": -2.1,
    "jerk": -0.4,
    "throttle": 0.0,
    "brake": 0.35,
    "gear": "D"
  },
  "objects": [
    {
      "id": "cattle_hazard_1",
      "class_name": "animal",
      "confidence": 0.96,
      "x": 48.0,
      "y": 1.2,
      "vx": 0.2,
      "vy": -1.1
    }
  ],
  "risk": {
    "overall_score": 84.5,
    "level": "Critical",
    "critical_object_id": "cattle_hazard_1",
    "min_ttc": 1.45
  },
  "behavior_state": "Emergency Brake",
  "metrics": {
    "scenario_completion_rate": 24.5,
    "collision_count": 0,
    "near_collision_count": 0,
    "avg_replanning_latency_ms": 13.8,
    "avg_smoothness_jerk": 0.48
  }
}
```

### Client-to-Server Control Commands
Send a JSON message over the open socket:
```json
{
  "action": "start" | "pause" | "stop" | "replan" | "reset" | "hazard",
  "payload": {
    "scenario_id": "scenario_5",
    "hazard_type": "cattle_crossing"
  }
}
```
