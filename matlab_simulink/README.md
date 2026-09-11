# MathWorks MATLAB / Simulink / RoadRunner Integration

## 1. Overview
The **NavAdapt** autonomous driving framework is designed with dual-runtime compatibility:
1. **Python / FastAPI / WebSockets Core**: High-speed, cross-platform runtime for hackathon evaluation and full-stack interactive dashboard visualization.
2. **MATLAB / Simulink / RoadRunner Stack**: Formal automotive model-based design, vehicle dynamics simulation, and high-fidelity 3D scenario rendering.

## 2. Directory Structure
```
matlab_simulink/
├── m_scripts/
│   ├── navadapt_vehicle_parameters.m     # Mechanical, tire, and controller gains
│   ├── navadapt_risk_assessment_algo.m   # Standalone MATLAB 0-100 risk function
│   ├── navadapt_frenet_planner.m         # Frenet quintic polynomial generator
│   └── navadapt_run_simulink_cosim.m     # Co-simulation and verification test harness
├── simulink_models/
│   └── stateflow_decision_logic.md   # Stateflow chart specification
└── roadrunner/
    ├── indian_unmarked_village.xodr  # OpenDRIVE 1.6 road network for rural scenario
    ├── urban_unsignalized_junction.xodr # OpenDRIVE 1.6 intersection
    └── scenarios/
        └── scenario_5_cattle_crossing.xosc # OpenSCENARIO 1.0 test run
```

## 3. How to Run in MATLAB
1. Open MATLAB R2022b or later.
2. Add the directory to path:
   ```matlab
   addpath(genpath('matlab_simulink'));
   ```
3. Run parameter initialization:
   ```matlab
   navadapt_vehicle_parameters;
   ```
4. Execute the verification test harness:
   ```matlab
   navadapt_run_simulink_cosim;
   ```

## 4. Importing into RoadRunner
1. Launch **RoadRunner**.
2. Go to **File -> Import -> OpenDRIVE (.xodr)** and select `matlab_simulink/roadrunner/indian_unmarked_village.xodr`.
3. Load the scenario via **File -> Open Scenario (.xosc)**: `scenario_5_cattle_crossing.xosc`.
4. Export to MATLAB Automated Driving Toolbox using the RoadRunner Scenario cosimulation client.
