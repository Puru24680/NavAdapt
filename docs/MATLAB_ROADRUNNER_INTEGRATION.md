# MATLAB / Simulink / RoadRunner Integration Reference

## 1. Overview
The **NavAdapt** platform provides full cross-compatibility with MathWorks automotive engineering toolchains:
- **RoadRunner**: For high-fidelity 3D environment construction and ASAM OpenDRIVE / OpenSCENARIO scenario exports.
- **Automated Driving Toolbox**: For coordinate frame definitions, sensor modeling, and Stanley controller verification.
- **Navigation Toolbox**: For Frenet trajectory generation and collision checking.
- **Stateflow**: For formal verification of behavioral decision logic.
- **Simulink & Vehicle Dynamics Blockset**: For 100 Hz hardware-in-the-loop (HIL) plant simulation.

## 2. File Directory
- `matlab_simulink/m_scripts/navadapt_vehicle_parameters.m`: Complete vehicle mass, yaw inertia, tire Pacejka stiffness, and controller gains.
- `matlab_simulink/m_scripts/navadapt_risk_assessment_algo.m`: Pure MATLAB implementation of the 0–100 risk score engine.
- `matlab_simulink/m_scripts/navadapt_frenet_planner.m`: Pure MATLAB quintic polynomial Frenet trajectory sampler.
- `matlab_simulink/m_scripts/navadapt_run_simulink_cosim.m`: Automated verification and test harness.
- `matlab_simulink/roadrunner/indian_unmarked_village.xodr`: OpenDRIVE 1.6 network with uneven dirt shoulders and potholes.
- `matlab_simulink/roadrunner/urban_unsignalized_junction.xodr`: OpenDRIVE 1.6 4-way unsignalized junction.
- `matlab_simulink/roadrunner/scenarios/scenario_5_cattle_crossing.xosc`: OpenSCENARIO 1.0 test run for sudden cattle incursion.

## 3. RoadRunner Scenario Co-Simulation Setup
1. Launch **RoadRunner 2022b+**.
2. Import the OpenDRIVE network from `matlab_simulink/roadrunner/indian_unmarked_village.xodr`.
3. In Simulink, instantiate the **RoadRunner Scenario Reader** block to receive dynamic actor positions over TCP/IP or ROS2.
4. Route ego vehicle position and steering angle back to RoadRunner for closed-loop visualization.
