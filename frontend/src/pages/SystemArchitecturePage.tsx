import React, { useState } from 'react';
import {
  Network,
  Cpu,
  Layers,
  Shield,
  Activity,
  ArrowDown,
  ArrowRight,
  Database,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface StageDetail {
  id: number;
  name: string;
  category: 'Perception' | 'Cognition' | 'Planning' | 'Actuation';
  frequency: string;
  inputs: string[];
  outputs: string[];
  math: string;
  description: string;
  matlabToolbox: string;
}

export const SystemArchitecturePage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(9); // Local planner default

  const stages: StageDetail[] = [
    {
      id: 1,
      name: 'Multi-Sensor Perception',
      category: 'Perception',
      frequency: '30 - 50 Hz',
      inputs: ['Photons / Monocular Cameras', 'LiDAR 64-Beam Lasers', '77 GHz Radar Waveforms'],
      outputs: ['2D/3D Bounding Boxes', 'Point Cloud Spatial Clusters', 'Doppler Radial Velocities'],
      math: 'v_{radial} = \\frac{\\vec{r} \\cdot \\vec{v}_{rel}}{|\\vec{r}|}, \\quad \\theta = \\arctan(y/x)',
      description: 'Captures raw high-resolution observations across visual, point cloud, and millimeter-wave radar domains with real-time exposure adaptation for Indian monsoon and dust conditions.',
      matlabToolbox: 'Automated Driving Toolbox (cameraModel, radarDataGenerator, drivingScenario)'
    },
    {
      id: 2,
      name: 'Sensor Fusion & Preprocessing',
      category: 'Perception',
      frequency: '30 Hz',
      inputs: ['Raw Camera detections', 'LiDAR clusters', 'Radar targets'],
      outputs: ['Fused 3D Object Detections (x, y, z, vx, vy, class, confidence)'],
      math: 'P_{fused}^{-1} = P_{cam}^{-1} + P_{lidar}^{-1} + P_{radar}^{-1}',
      description: 'Performs spatial-temporal alignment, coordinate calibration, and covariance intersection fusion to combine visual class confidence with LiDAR geometric precision and Radar velocity.',
      matlabToolbox: 'Sensor Fusion and Tracking Toolbox (fusecovint, trackFuser)'
    },
    {
      id: 3,
      name: 'Indian Road User Classification',
      category: 'Perception',
      frequency: '30 Hz',
      inputs: ['Fused Feature Embeddings'],
      outputs: ['11-Class Semantic Probabilities (Auto-rickshaws, Cattle, Pushcarts, etc.)'],
      math: 'P(c_i | x) = \\frac{\\exp(z_i)}{\\sum_j \\exp(z_j)}, \\quad c_i \\in \\mathcal{C}_{Indian}',
      description: 'Classifies heterogeneous Indian road agents including auto-rickshaws, motorcycles with pillion riders, hand-drawn vegetable carts, wandering cattle/dogs, and surface potholes.',
      matlabToolbox: 'Deep Learning Toolbox (YOLOv8 / MobileNet-V3 detector)'
    },
    {
      id: 4,
      name: 'Multi-Object Tracking (MOT)',
      category: 'Perception',
      frequency: '20 Hz',
      inputs: ['Fused Detections at step k'],
      outputs: ['Stable Tracked Objects with IDs, Kinematic Velocities & Position Covariance'],
      math: 'x_{k|k} = x_{k|k-1} + K_k (z_k - H x_{k|k-1}), \\quad P_{k|k} = (I - K_k H) P_{k|k-1}',
      description: 'Maintains track lifecycles using a 4-state Constant Velocity Extended Kalman Filter with Hungarian assignment and Mahalanobis gating to prevent track switching in crowded bazaars.',
      matlabToolbox: 'Sensor Fusion and Tracking Toolbox (trackingKF, trackerGNN)'
    },
    {
      id: 5,
      name: 'Multi-Hypothesis Trajectory Prediction',
      category: 'Cognition',
      frequency: '20 Hz',
      inputs: ['Tracked Object History (last 20 steps)'],
      outputs: ['Probabilistic Branching Trajectories over 3.0s Horizon'],
      math: 'p(Y | X) = \\sum_{m=1}^M \\pi_m \\cdot \\mathcal{N}(Y; \\mu_m, \\Sigma_m)',
      description: 'Does not assume lane-following. Generates multi-modal branching future paths for unpredictable road users: animal freezing, auto-rickshaw lane cut-ins, and pedestrian darting.',
      matlabToolbox: 'Navigation Toolbox (motionPredictor, trajectoryGenerator)'
    },
    {
      id: 6,
      name: 'Dynamic Composite Risk Estimation',
      category: 'Cognition',
      frequency: '20 Hz',
      inputs: ['Ego Vehicle State', 'Tracked Objects', 'Predictions', 'Planned Trajectory'],
      outputs: ['Normalized Composite Risk Score (0-100) & Surrounding Agent Risk List'],
      math: 'R = w_d R_{dist} + w_v R_{vel} + w_{ttc} R_{ttc} + w_o R_{overlap} + w_c C_{vuln}',
      description: 'Multi-factorial safety score classifying situations into Safe, Caution, High Risk, and Critical tiers with configurable weighting.',
      matlabToolbox: 'Stateflow / MATLAB Function Block (navadapt_risk_assessment_algo.m)'
    },
    {
      id: 7,
      name: 'Drivable-Space Corridor Estimation',
      category: 'Cognition',
      frequency: '20 Hz',
      inputs: ['LiDAR Ground Contours', 'Camera Road Edges', 'Pothole Locations'],
      outputs: ['Convex Drivable Corridor Polygon (Free-Space Boundary)'],
      math: '\\mathcal{S}_{free} = \\mathcal{C}_{road} \\setminus \\left(\\bigcup_{i} \\mathcal{O}_i \\oplus \\mathcal{B}_{safe}\\right)',
      description: 'Constructs continuous drivable polygon boundaries from physical road edges, ditches, parked pushcarts, and potholes without needing painted lane lines.',
      matlabToolbox: 'Navigation Toolbox (binaryOccupancyMap, navMesh)'
    },
    {
      id: 8,
      name: 'Behavior & Decision Planning',
      category: 'Planning',
      frequency: '20 Hz',
      inputs: ['Risk Score & Tier', 'Drivable Space', 'Traffic Context'],
      outputs: ['Behavioral Intent (Follow, Slow Down, Stop, Yield, Overtake, Emergency Brake)'],
      math: 'S_{k+1} = \\delta(S_k, \\text{Risk}, \\text{TTC}, \\text{Clearance})',
      description: 'Hierarchical Finite State Machine managing high-level tactical decisions, opportunistic gap yielding, and immediate transitions to emergency braking.',
      matlabToolbox: 'Stateflow (stateflow_decision_logic.md)'
    },
    {
      id: 9,
      name: 'Adaptive Local Path Planning',
      category: 'Planning',
      frequency: '20 Hz (Sub-15ms)',
      inputs: ['Ego Frenet State', 'Drivable Corridor', 'Behavior Constraints'],
      outputs: ['Optimal Quintic Polynomial Trajectory with Time Parameterization'],
      math: 'J = k_j \\int \\dddot{s}^2 dt + k_t T + k_d d(T)^2 + k_v (v(T) - v_{target})^2 + k_r R',
      description: 'Generates candidate trajectory lattices in Frenet and Cartesian free-space using quintic polynomials. Minimizes jerk, time, velocity deviation, boundary proximity, and collision risk.',
      matlabToolbox: 'Navigation Toolbox (frenetPlanner, trajectoryOptimalFrenet)'
    },
    {
      id: 10,
      name: 'Continuous Collision Checking',
      category: 'Planning',
      frequency: '20 Hz',
      inputs: ['Candidate Trajectories', 'Predicted Dynamic Obstacle Hulls', 'Boundaries'],
      outputs: ['Collision-Free Feasibility Mask'],
      math: '\\forall t \\in [0, T], \\quad \\mathcal{V}_{ego}(t) \\cap \\left(\\bigcup_i \\mathcal{V}_i(t)\\right) = \\emptyset',
      description: 'Performs continuous swept-volume intersection checks across the time horizon against dynamic oriented bounding boxes and road boundaries.',
      matlabToolbox: 'Automated Driving Toolbox (checkCollision, sweptVolume)'
    },
    {
      id: 11,
      name: 'Real-Time Replanning Engine',
      category: 'Planning',
      frequency: 'Event-driven (<50ms)',
      inputs: ['Trigger Conditions: TTC drop, obstacle incursion, trajectory infeasibility'],
      outputs: ['Seamlessly Updated Target Trajectory & Latency Metric'],
      math: '\\tau_{replan} = t_{complete} - t_{trigger} < 50\\,\\text{ms}',
      description: 'Monitors path validity and triggers rapid sub-50ms replanning whenever environmental conditions shift or an animal enters the corridor.',
      matlabToolbox: 'Simulink Stateflow / Event-triggered subsystems'
    },
    {
      id: 12,
      name: 'Vehicle Control (Stanley + PID)',
      category: 'Actuation',
      frequency: '50 Hz',
      inputs: ['Planned Path Waypoints', 'Current Vehicle State'],
      outputs: ['Steering Angle Command (\\delta), Throttle & Brake Pedals'],
      math: '\\delta(t) = \\theta_e + \\arctan\\left(\\frac{k_e e_{fa}}{v(t) + \\epsilon}\\right)',
      description: 'Stanley steering controller with low-speed velocity regularization preventing chatter during crawl speeds, combined with a feedforward longitudinal PID speed controller.',
      matlabToolbox: 'Automated Driving Toolbox (lateralControllerStanley, pathFollowingController)'
    },
    {
      id: 13,
      name: 'Vehicle Dynamics Simulation',
      category: 'Actuation',
      frequency: '100 Hz',
      inputs: ['Actuator Commands: Steer, Throttle, Brake'],
      outputs: ['True Vehicle Kinematic State (x, y, v, yaw, yaw_rate, jerk)'],
      math: '\\beta = \\arctan\\left(\\frac{l_r}{l_f + l_r} \\tan \\delta\\right), \\quad \\dot{x} = v \\cos(\\psi + \\beta)',
      description: '2-DOF nonlinear dynamic bicycle model incorporating tire sideslip, Pacejka friction on dirt/asphalt, aerodynamic drag, and Runge-Kutta 4th order numerical integration.',
      matlabToolbox: 'Vehicle Dynamics Blockset (Vehicle Body 3DOF / Dynamic Bicycle Model)'
    },
    {
      id: 14,
      name: 'Closed-Loop Validation & Metrics',
      category: 'Actuation',
      frequency: '20 Hz',
      inputs: ['Global Simulation Telemetry'],
      outputs: ['SIH Performance Scorecard (Smoothness, TTC, Latency, Collisions)'],
      math: 'Jerk = \\frac{d^3 x}{dt^3}, \\quad TTC = \\frac{d_{rel}}{-\\dot{d}_{rel}}',
      description: 'Continuously audits trajectory curvature, lateral jerk, time-to-collision margins, and scenario completion for jury presentation and validation.',
      matlabToolbox: 'Simulink Diagnostic Viewer / Simulation Data Inspector'
    }
  ];

  const current = stages.find((s) => s.id === selectedStage) || stages[8];

  return (
    <div className="flex-1 overflow-y-auto bg-navy-950 p-8 space-y-8 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold mb-2">
          <Network className="w-4 h-4" />
          <span>MODULAR CLOSED-LOOP ARCHITECTURE</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          14-Stage Autonomous Driving Pipeline
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl mt-1">
          Click on any architectural pipeline stage to inspect its mathematical formulation, I/O ports, update rate, and corresponding MATLAB/Simulink implementation.
        </p>
      </div>

      {/* Interactive Pipeline Explorer Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stages List (Takes 1 column) */}
        <div className="space-y-2 bg-navy-900 border border-slate-800 p-4 rounded-xl max-h-[680px] overflow-y-auto">
          <div className="text-[11px] font-mono text-slate-400 uppercase font-bold px-2 mb-2">
            Execution Flow (Sensors $\to$ Actuation)
          </div>
          {stages.map((st) => {
            const isSelected = selectedStage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStage(st.id)}
                className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between group ${
                  isSelected
                    ? 'bg-blue-600/20 border-cyan-500 text-white shadow-md'
                    : 'bg-navy-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-navy-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-mono font-bold w-6 h-6 rounded flex items-center justify-center ${
                    isSelected ? 'bg-cyan-500 text-navy-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {st.id}
                  </span>
                  <div>
                    <div className="text-xs font-bold leading-tight group-hover:text-cyan-300 transition">
                      {st.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{st.frequency}</div>
                  </div>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Selected Stage Deep-Dive Card (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase font-bold mb-1">
                <span>STAGE 0{current.id} • {current.category}</span>
              </div>
              <h2 className="text-2xl font-black text-white">{current.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                OPERATIONAL FREQUENCY: <span className="text-slate-200 font-bold">{current.frequency}</span>
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-blue-900/60 border border-blue-500/40 text-cyan-300 text-xs font-mono font-bold">
              PRODUCTION READY
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-1">
                Functional Overview
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Mathematical Formulation */}
            <div className="bg-navy-950 p-4 rounded-lg border border-slate-800 font-mono space-y-2">
              <div className="text-[10px] text-cyan-400 uppercase font-bold">
                Algorithmic & Mathematical Law
              </div>
              <div className="text-sm text-slate-100 font-bold overflow-x-auto py-1">
                {current.math}
              </div>
            </div>

            {/* I/O Topic Schema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-navy-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Input Data Sources</div>
                <ul className="space-y-1">
                  {current.inputs.map((inp, i) => (
                    <li key={i} className="flex items-center space-x-1.5 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-navy-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Output Data Contracts</div>
                <ul className="space-y-1">
                  {current.outputs.map((out, i) => (
                    <li key={i} className="flex items-center space-x-1.5 text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* MATLAB / Simulink Mapping */}
            <div className="bg-navy-950/60 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-[10px] text-saffron-400 font-bold uppercase">
                MathWorks Toolbox & Simulink Blockset Mapping
              </div>
              <p className="text-slate-300">{current.matlabToolbox}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
