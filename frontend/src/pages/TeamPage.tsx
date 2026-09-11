import React from 'react';
import { Users, Award, Cpu, ShieldCheck, Zap, HardDrive, Target, CheckCircle2 } from 'lucide-react';

export const TeamPage: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-navy-950 p-8 space-y-8 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-saffron-400 font-mono text-xs font-semibold mb-2">
          <Award className="w-4 h-4" />
          <span>SMART INDIA HACKATHON 2026 INITIATIVE</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Team NavAdapt — Adaptive Autonomous Navigation
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl mt-1">
          Bridging advanced robotics, mathematical motion planning, and real-time embedded edge compute to solve India's most complex autonomous mobility challenges.
        </p>
      </div>

      {/* Team NavAdapt Official Logo Banner */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        <div className="w-36 h-36 bg-white rounded-2xl p-2 flex items-center justify-center border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/20 shrink-0">
          <img src="/navadapt-logo.png" alt="Team NavAdapt Official Logo" className="w-full h-full object-contain" />
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
            <span>OFFICIAL TEAM EMBLEM</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            NavAdapt — Adaptive Autonomous Navigation
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            The NavAdapt emblem embodies the convergence of biological cognitive intuition (left organic neural hemisphere) and deterministic electronic compute (right integrated circuit architecture). This duality drives our autonomous navigation philosophy: combining cognitive understanding of unpredictable human & animal intent with hard real-time safety control.
          </p>
        </div>
      </div>

      {/* Problem Alignment Card */}
      <div className="bg-gradient-to-r from-blue-950/60 via-navy-900 to-navy-950 border border-blue-600/40 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase">
          <Target className="w-4 h-4 text-saffron-500" />
          <span>SIH PROBLEM STATEMENT STATEMENT ALIGNMENT</span>
        </div>
        <h2 className="text-xl font-bold text-white">
          “Adaptive Path Planning for Autonomous Vehicles in Unstructured Indian Road Conditions”
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Western autonomous driving architectures depend heavily on pristine lane markings, centimeter-accurate HD vector maps, and law-abiding traffic agents. In India, unstructured roads render conventional approaches obsolete. The NavAdapt system pioneers a resilient paradigm: <strong>Perceive the free space, predict multi-hypothesis agent intent, evaluate composite dynamic risk, and replan in sub-50ms cycles.</strong>
        </p>
      </div>

      {/* Hardware Deployment Roadmap */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-cyan-400" />
          <span>Production Automotive Deployment Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* Compute Node */}
          <div className="bg-navy-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="text-cyan-400 font-bold uppercase text-[11px] pb-1 border-b border-slate-800">
              01. Embedded AI Compute
            </div>
            <ul className="space-y-2 text-slate-300">
              <li><strong className="text-white">Primary SoC:</strong> NVIDIA Jetson AGX Orin 64GB (275 TOPS INT8).</li>
              <li><strong className="text-white">Safety MCU:</strong> Infineon AURIX TC397 (ASIL-D lockstep core for emergency braking).</li>
              <li><strong className="text-white">Operating System:</strong> Linux PREEMPT_RT / QNX 7.1 RTOS.</li>
              <li><strong className="text-white">Middleware:</strong> ROS 2 Humble / CycloneDDS zero-copy.</li>
            </ul>
          </div>

          {/* Sensor Suite */}
          <div className="bg-navy-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="text-cyan-400 font-bold uppercase text-[11px] pb-1 border-b border-slate-800">
              02. Heterogeneous Sensor Payload
            </div>
            <ul className="space-y-2 text-slate-300">
              <li><strong className="text-white">LiDAR:</strong> 64-Channel Solid-State 905nm LiDAR (200m range, 100k pts/s).</li>
              <li><strong className="text-white">Cameras:</strong> 3x Sony IMX390 1080p HDR (120dB dynamic range for Indian sunlight).</li>
              <li><strong className="text-white">Radar:</strong> 2x 77 GHz Continental ARS408 Doppler Radars.</li>
              <li><strong className="text-white">GNSS/INS:</strong> Dual-antenna RTK GNSS + tactical IMU.</li>
            </ul>
          </div>

          {/* Actuation & CAN Bus */}
          <div className="bg-navy-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="text-cyan-400 font-bold uppercase text-[11px] pb-1 border-b border-slate-800">
              03. Drive-by-Wire Interface
            </div>
            <ul className="space-y-2 text-slate-300">
              <li><strong className="text-white">Bus Protocol:</strong> Dual CAN FD (5 Mbps) & Automotive Ethernet.</li>
              <li><strong className="text-white">Steering:</strong> Electric Power Steering (EPS) torque override.</li>
              <li><strong className="text-white">Braking:</strong> Electronic Brake Booster (iBooster) Decel Commands.</li>
              <li><strong className="text-white">Heartbeat:</strong> 100 Hz watchdog monitoring with failsafe stop.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Strengths & Known Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="bg-navy-900 border border-emerald-900/40 p-5 rounded-xl space-y-3">
          <div className="text-emerald-400 font-bold font-mono uppercase">
            Validated System Strengths
          </div>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero dependence on painted road lines or static HD lane geometry.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Multi-hypothesis probabilistic motion prediction for erratically behaving agents.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sub-15ms local trajectory lattice solving and sub-50ms emergency replanning.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Seamless MathWorks Simulink and RoadRunner OpenDRIVE / OpenSCENARIO integration.</span>
            </li>
          </ul>
        </div>

        <div className="bg-navy-900 border border-amber-900/40 p-5 rounded-xl space-y-3">
          <div className="text-amber-400 font-bold font-mono uppercase">
            Future Research & Enhancements
          </div>
          <ul className="space-y-1.5 text-slate-300">
            <li className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Transformer-based Social Interaction Trajectory Prediction (Scene-Transformer).</span>
            </li>
            <li className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>3D Occupancy Network running directly on camera features (BEVFormer).</span>
            </li>
            <li className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Vehicle-to-Everything (V2X) communication for blind intersection negotiation.</span>
            </li>
            <li className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Reinforcement Learning policy for subtle negotiation gestures (horn, creep).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
