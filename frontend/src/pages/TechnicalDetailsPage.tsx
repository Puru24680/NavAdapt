import React from 'react';
import { Cpu, Terminal, BookOpen, Layers, CheckCircle2, Sliders } from 'lucide-react';

export const TechnicalDetailsPage: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-navy-950 p-8 space-y-8 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold mb-2">
          <Cpu className="w-4 h-4" />
          <span>MATHEMATICAL & ALGORITHMIC SPECIFICATIONS</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Algorithms & Theoretical Formulations
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl mt-1">
          Complete mathematical derivation of the non-lane-dependent path planning algorithms, Frenet frame representations, quintic polynomial solvers, and Stanley steering control laws.
        </p>
      </div>

      <div className="space-y-6 max-w-5xl">
        {/* 1. Frenet Coordinate Transformation */}
        <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded bg-blue-600/30 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">1</span>
              <span>Frenet-Serret Frame Decomposition</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">Cartesian to Frenet Mapping</span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Instead of relying on painted lane lines, the road reference path r(s) is generated as a smooth natural cubic spline through free-space road corridor centroids. Any point (x, y) in world coordinates is mapped to longitudinal arc-length s and orthogonal lateral deviation d:
          </p>

          <div className="bg-navy-950 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2 text-cyan-200">
            <div>x(s, d) = r(s) + d * n(s)</div>
            <div className="text-slate-400">
              where r(s) is the reference position, and n(s) = [-sin(theta), cos(theta)] is the unit normal vector.
            </div>
            <div>s_guess = argmin_s ||x - r(s)||^2,   d = (x - r(s)) x t(s)</div>
          </div>
        </div>

        {/* 2. Quintic Polynomial Trajectory Generation */}
        <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded bg-blue-600/30 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">2</span>
              <span>1D Quintic Polynomial Boundary Solver</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">Jerk-Optimal Splines</span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            To guarantee continuous acceleration (zero infinite jerk spikes) during sudden evasive maneuvers around cattle and potholes, candidate trajectories in both lateral d(t) and longitudinal s(t) dimensions are parameterized as 5th-order polynomials:
          </p>

          <div className="bg-navy-950 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2 text-cyan-200">
            <div>p(t) = a0 + a1*t + a2*t^2 + a3*t^3 + a4*t^4 + a5*t^5</div>
            <div className="text-slate-400">Boundary conditions at t = 0:</div>
            <div>a0 = p0,   a1 = v0,   a2 = a0 / 2</div>
            <div className="text-slate-400">Boundary conditions at t = T solved via 3x3 linear system:</div>
            <div className="text-slate-300">
              [T^3, T^4, T^5;  3*T^2, 4*T^3, 5*T^4;  6*T, 12*T^2, 20*T^3] * [a3; a4; a5] = [pT - a0 - a1*T - a2*T^2;  vT - a1 - 2*a2*T;  aT - 2*a2]
            </div>
          </div>
        </div>

        {/* 3. Multi-Objective Cost Function */}
        <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded bg-blue-600/30 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">3</span>
              <span>Trajectory Selection Cost Function</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">Multi-Objective Optimization</span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Each candidate trajectory k in the sampling lattice is evaluated using a weighted cost function balancing smoothness, travel time, and safety:
          </p>

          <div className="bg-navy-950 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2 text-cyan-200">
            <div>J(k) = k_j * J_jerk + k_t * T + k_d * (dT - d_target)^2 + k_v * (vT - v_target)^2 + k_b * (1 / D_boundary) + k_r * R_path</div>
            <div className="text-slate-400">Configured weights:</div>
            <ul className="text-slate-300 space-y-1 list-disc pl-4">
              <li><span className="text-cyan-300 font-bold">k_j = 0.1</span> : Minimizes square integral of lateral and longitudinal jerk.</li>
              <li><span className="text-cyan-300 font-bold">k_t = 0.2</span> : Rewards faster progression towards destination.</li>
              <li><span className="text-cyan-300 font-bold">k_d = 1.0</span> : Penalizes lateral deviation from nominal path corridor.</li>
              <li><span className="text-cyan-300 font-bold">k_v = 1.0</span> : Penalizes deviation from behavior planner target velocity.</li>
              <li><span className="text-cyan-300 font-bold">k_b = 1.5</span> : Repulsive barrier function against road verges, ditches, and potholes.</li>
            </ul>
          </div>
        </div>

        {/* 4. Stanley Lateral Control with Low-Speed Regularization */}
        <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded bg-blue-600/30 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">4</span>
              <span>Stanley Steering Controller with Softening Term</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">Chatter-Free Control</span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Standard Stanley controllers suffer from numerical instability and extreme steering chatter when vehicle speed approaches zero (e.g., navigating crawling Indian markets or yielding to pedestrians). We incorporate a velocity softening regularization parameter epsilon = 0.5 m/s:
          </p>

          <div className="bg-navy-950 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2 text-cyan-200">
            <div>delta(t) = theta_e(t) + arctan( (k_e * e_fa(t)) / (v(t) + epsilon) )</div>
            <div className="text-slate-400">
              theta_e = psi_path - psi_ego (Heading error normalized to [-pi, pi])
            </div>
            <div className="text-slate-400">
              e_fa = (x_fa - x_ref)*sin(psi_ref) - (y_fa - y_ref)*cos(psi_ref) (Front axle cross-track error)
            </div>
            <div className="text-slate-400">
              Actuator limits: |delta(t)| &lt;= 35.0 deg,  |d(delta)/dt| &lt;= 45.0 deg/s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
