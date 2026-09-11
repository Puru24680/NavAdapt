# NavAdapt System Architecture Documentation

## 1. Executive Summary
**NavAdapt** is an end-to-end, modular, closed-loop autonomous driving software stack designed for the Smart India Hackathon. It addresses the high-risk, unstructured nature of Indian roads where conventional lane markings are nonexistent, traffic is heterogeneous (auto-rickshaws, pushcarts, wandering cattle, two-wheelers), road users behave unpredictably, and surface hazards (deep potholes) occur frequently.

## 2. Core Design Principle: Non-Lane-Bound Navigation
Western autonomous vehicle (AV) pipelines rely on three fundamental assumptions:
1. **Pristine Lane Markings**: Solid/dashed retro-reflective paint lines.
2. **Homogeneous, Lane-Abiding Traffic**: Standard passenger cars and commercial vehicles following formal right-of-way rules.
3. **Centimeter-Accurate Prior HD Maps**: Static vector road graphs.

On Indian arterial roads and rural connectors (*Gramin Sadak*), all three assumptions fail:
- Lanes are eroded, faded, or never painted.
- Vehicles merge informally, straddle unmarked pavement, filter diagonally, and cross abruptly.
- Stray animals, hand pushcarts, and potholes present acute in-path hazards.

**NavAdapt** abandons the lane-centering paradigm. Instead, it operates on:
- **Continuous Drivable Free-Space Boundaries** estimated from fused LiDAR ground rings and Camera road contours.
- **Multi-Hypothesis Intent Prediction** modeling sudden stalls, cuts, and darting.
- **Dynamic 0–100 Composite Risk Estimation**.
- **Real-Time Sub-50ms Replanning** using Frenet and Free-Space quintic trajectory lattices.

---

## 3. The 14-Stage Closed-Loop Pipeline

```
[1. Sensors: Camera, LiDAR, Radar]
             │
             ▼
[2. Preprocessing & Sensor Fusion]
             │
             ▼
[3. Object Detection & 11-Class Classification]
             │
             ▼
[4. Multi-Object Tracking (EKF + Hungarian)]
             │
             ▼
[5. Multi-Hypothesis Trajectory Prediction] ────┐
             │                                   │
             ▼                                   ▼
[6. Dynamic Risk Estimation (0-100)]    [7. Drivable Space]
             │                                   │
             ▼                                   │
[8. Behavioral & Decision Planner (FSM)] ────────┘
             │
             ▼
[9. Adaptive Local Path Planner (Quintic Lattice)]
             │
             ▼
[10. Continuous Collision Checker (Swept Volume)]
             │
             ├──────────────────────────┐
      [Path Feasible?]            [Hazard Incursion / TTC Drop]
             │                                  │
            Yes                                 ▼
             │                    [11. Real-Time Replanner (<50ms)]
             ▼                                  │
[12. Vehicle Control (Stanley + PID)] ──────────┘
             │
             ▼
[13. Vehicle Dynamics Simulation (2-DOF RK4)]
             │
             ▼
[14. Closed-Loop Validation & Metrics] ───► Loop to Sensors
```

### Stage Details
1. **Multi-Sensor Perception (30-50 Hz)**: 64-beam LiDAR, forward 1080p HDR camera, and 77 GHz Doppler radar.
2. **Sensor Fusion (30 Hz)**: Covariance intersection fusing visual semantic labels, LiDAR 3D coordinates, and Radar Doppler closing velocity.
3. **11-Class Classification**: Specialized for Indian road ecology:
   - Cars, Buses, Trucks
   - Auto-rickshaws (narrow footprint, agile turning)
   - Motorcycles & Bicycles (informal filtering)
   - Pedestrians & Hand Pushcarts
   - Animals/Cattle (erratic freezing behavior)
   - Static Obstacles & Deep Potholes (depth > 8cm)
4. **Multi-Object Tracking (20 Hz)**: 4-state Constant Velocity Extended Kalman Filter with Mahalanobis distance association gating.
5. **Multi-Hypothesis Prediction (20 Hz)**: Generates 3.0s branching intent trajectories (e.g., cow crossing vs cow halting; rickshaw cutting in vs maintaining speed).
6. **Dynamic Risk Estimation (20 Hz)**: Composite score $R \in [0, 100]$:
   - 0–25: Safe
   - 25–50: Caution
   - 50–75: High Risk
   - 75–100: Critical (Triggers emergency brake or urgent evasive nudge)
7. **Drivable Space Corridor**: Polygonal free-space boundary computed from roadside verges and static obstacle envelopes.
8. **Behavior Decision Planning (20 Hz)**: Hierarchical FSM states: `Follow`, `Slow Down`, `Stop`, `Yield`, `Overtake`, `Merge`, `Avoid Obstacle`, `Wait`, `Emergency Brake`.
9. **Adaptive Local Path Planning (20 Hz, <15ms)**: Frenet quintic polynomial generator and free-space candidate lattice.
10. **Continuous Collision Checking**: Swept volume polygon intersection across time horizon.
11. **Real-Time Replanner**: Event-triggered in <50ms when new hazards appear or TTC drops below safety thresholds.
12. **Vehicle Control (50 Hz)**: Stanley lateral steering controller with low-speed velocity regularization $\epsilon = 0.5\,\text{m/s}$ + Longitudinal feedforward/PID with jerk limiting.
13. **Vehicle Dynamics Simulation (100 Hz)**: 2-DOF nonlinear dynamic bicycle model with tire sideslip, Pacejka friction, and 4th-Order Runge-Kutta integration.
14. **Validation Metrics**: Real-time evaluation of curvature smoothness, jerk profile, minimum TTC, and replanning latency.
