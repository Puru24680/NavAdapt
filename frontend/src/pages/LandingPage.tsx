import React from 'react';
import {
  Compass,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  Layers,
  MapPin,
  ChevronRight,
  Play,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-navy-950 text-slate-100 p-8 space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-2xl bg-gradient-to-br from-navy-900 via-navy-950 to-blue-950/40 border border-slate-800 p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse" />
              <span>SMART INDIA HACKATHON 2026 • TEAM NAVADAPT</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Adaptive Autonomous Navigation for India’s{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-saffron-400 bg-clip-text text-transparent">
                Unstructured Roads
              </span>
            </h1>

            <p className="text-xl md:text-2xl font-mono text-cyan-300 font-medium">
              Perceive. Predict. Plan. Adapt.
            </p>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
              A non-lane-dependent, modular closed-loop autonomous driving framework engineered specifically for heterogeneous Indian traffic. Navigates missing road markings, wandering cattle, aggressive two-wheelers, pushcarts, and sudden incursions via real-time free-space estimation, multi-modal intent prediction, and sub-50ms replanning.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-600/30 transition active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Command Dashboard</span>
              </button>
              <button
                onClick={() => onNavigate('scenarios')}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg font-bold border border-slate-700 transition active:scale-95"
              >
                <span>Explore 5 Indian Scenarios</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('architecture')}
                className="flex items-center space-x-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-cyan-300 rounded-lg font-mono text-xs font-semibold border border-cyan-500/30 transition"
              >
                <span>14-Stage Pipeline</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center p-5 bg-white rounded-2xl border-2 border-cyan-400/60 shadow-2xl shadow-cyan-500/20 w-60 shrink-0 text-center">
            <img src="/navadapt-logo.png" alt="NavAdapt Emblem" className="w-48 h-48 object-contain" />
            <div className="text-navy-950 font-extrabold text-sm tracking-wider mt-1 font-mono">NAVADAPT</div>
            <div className="text-[10px] text-blue-900 font-semibold italic">Adaptive Autonomous Navigation</div>
          </div>
        </div>
      </section>

      {/* The Core Problem & Indian Reality */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-saffron-500" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            The Indian Autonomous Driving Challenge
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-900/60 border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Missing & Informal Lanes</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Over 70% of Indian urban and rural arterials lack formal lane markings. Conventional vision-based lane centering systems fail instantly under worn pavement and uneven dirt shoulders.
            </p>
          </div>

          <div className="bg-navy-900/60 border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-saffron-500/10 border border-saffron-500/30 flex items-center justify-center text-saffron-400 font-bold">
              02
            </div>
            <h3 className="text-lg font-bold text-white">Extreme Heterogeneity</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Auto-rickshaws, motorcycles filtering diagonally, hand pushcarts, pedestrians, and livestock share the same narrow right-of-way with vastly divergent dynamic envelopes and priorities.
            </p>
          </div>

          <div className="bg-navy-900/60 border border-slate-800 p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Unpredictable Incursions</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cattle crossing unexpectedly, sudden pedestrian darting from blind spots, and oncoming overtakes in the vehicle’s corridor require sub-50ms replanning latency and emergency yielding.
            </p>
          </div>
        </div>
      </section>

      {/* The NavAdapt Solution Pillars */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            NavAdapt Architectural Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-navy-900 border border-slate-800/80 p-5 rounded-xl space-y-3 hover:border-blue-500/50 transition">
            <div className="w-8 h-8 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono font-bold">
              F
            </div>
            <h4 className="font-bold text-white">Free-Space Navigation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes drivable polygon corridors directly from LiDAR/Camera boundary fusion without relying on paint lines or HD maps.
            </p>
          </div>

          <div className="bg-navy-900 border border-slate-800/80 p-5 rounded-xl space-y-3 hover:border-cyan-500/50 transition">
            <div className="w-8 h-8 rounded bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-mono font-bold">
              M
            </div>
            <h4 className="font-bold text-white">Multi-Hypothesis Intent</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Predicts multiple branching future trajectories for erratic road users (animals halting, bikes cutting in) over a 3.0s horizon.
            </p>
          </div>

          <div className="bg-navy-900 border border-slate-800/80 p-5 rounded-xl space-y-3 hover:border-saffron-500/50 transition">
            <div className="w-8 h-8 rounded bg-saffron-600/20 text-saffron-400 flex items-center justify-center font-mono font-bold">
              R
            </div>
            <h4 className="font-bold text-white">0-100 Dynamic Risk</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-factorial composite score evaluating TTC, closing speed, clearance, trajectory overlap, and user vulnerability weights.
            </p>
          </div>

          <div className="bg-navy-900 border border-slate-800/80 p-5 rounded-xl space-y-3 hover:border-emerald-500/50 transition">
            <div className="w-8 h-8 rounded bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-mono font-bold">
              &lt;
            </div>
            <h4 className="font-bold text-white">Sub-50ms Replanning</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous sampling lattice and quintic polynomial generation selects collision-free evasion trajectories in under 15ms.
            </p>
          </div>
        </div>
      </section>

      {/* Benchmark Metric Highlights */}
      <section className="bg-navy-900/80 border border-slate-800 rounded-2xl p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono">
          <div>
            <div className="text-3xl md:text-4xl font-black text-cyan-300">14.8 ms</div>
            <div className="text-xs text-slate-400 uppercase mt-1">Avg Replan Latency</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-emerald-400">0</div>
            <div className="text-xs text-slate-400 uppercase mt-1">Collision Incidents</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-white">100 %</div>
            <div className="text-xs text-slate-400 uppercase mt-1">Planning Feasibility</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-saffron-400">97.5 %</div>
            <div className="text-xs text-slate-400 uppercase mt-1">Perception Confidence</div>
          </div>
        </div>
      </section>

      {/* 5 Scenario Showcase Teaser */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Five Realistic Indian Benchmark Scenarios
            </h2>
            <p className="text-sm text-slate-400">
              Deterministic evaluation environments covering rural, urban, highway, market, and sudden cattle hazards.
            </p>
          </div>
          <button
            onClick={() => onNavigate('scenarios')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View all cards</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { id: 'scenario_1', name: 'Gramin Sadak', type: 'Unmarked Rural', icon: '🌾' },
            { id: 'scenario_2', name: 'Urban Junction', type: 'Unsignalized Cross', icon: '🚦' },
            { id: 'scenario_3', name: 'Highway Merge', type: 'High Velocity Mixed', icon: '🛣️' },
            { id: 'scenario_4', name: 'Dense Bazaar', type: 'Sub-4m Market Corridor', icon: '🛒' },
            { id: 'scenario_5', name: 'Cattle Crossing', type: 'Sudden Incursion', icon: '🐄' },
          ].map((s) => (
            <div
              key={s.id}
              onClick={() => onNavigate('dashboard')}
              className="p-4 rounded-xl bg-navy-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition space-y-2 group"
            >
              <div className="text-2xl">{s.icon}</div>
              <div className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                {s.name}
              </div>
              <div className="text-[11px] font-mono text-slate-400">{s.type}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Bar */}
      <section className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
        <div>STACK: Python 3.11 • FastAPI • React 18 • Vite • Tailwind • MATLAB/Simulink • RoadRunner • OpenDRIVE 1.6</div>
        <div className="text-slate-500">NavAdapt © Smart India Hackathon Prototype</div>
      </section>
    </div>
  );
};
