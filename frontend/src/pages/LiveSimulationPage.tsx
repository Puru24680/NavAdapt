import React, { useState } from 'react';
import { SimulationState } from '../types/simulation';
import { BevCanvas } from '../components/visualizers/BevCanvas';
import {
  Layers,
  Eye,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Flame,
  Radio,
  Sliders,
  ShieldAlert
} from 'lucide-react';

interface LiveSimulationPageProps {
  state: SimulationState;
  onStart: () => void;
  onPause: () => void;
  onReplan: () => void;
  onTriggerHazard: (hazard: string) => void;
}

export const LiveSimulationPage: React.FC<LiveSimulationPageProps> = ({
  state,
  onStart,
  onPause,
  onReplan,
  onTriggerHazard
}) => {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [showCandidates, setShowCandidates] = useState<boolean>(true);
  const [showPredictions, setShowPredictions] = useState<boolean>(true);
  const [showSensorFOV, setShowSensorFOV] = useState<boolean>(true);

  const { vehicle: ego, risk, metrics } = state;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] p-4 bg-[#070C16] overflow-hidden gap-3">
      {/* Top Theater Header & Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between bg-navy-900/90 border border-slate-800 px-4 py-2.5 rounded-xl shadow-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-white uppercase">
              LIVE SIMULATION THEATER • {state.scenario_id.toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-slate-500">|</span>
          <span className="text-xs font-mono text-cyan-300">
            TTC: <span className="font-bold">{risk.min_ttc < 90 ? `${risk.min_ttc.toFixed(1)}s` : '>4.0s'}</span>
          </span>
          <span className="text-xs text-slate-500">|</span>
          <span className="text-xs font-mono text-slate-300">
            SPEED: <span className="text-white font-bold">{(ego.v * 3.6).toFixed(1)} km/h</span>
          </span>
        </div>

        {/* View Mode & Visual Layer Toggles */}
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                viewMode === '3d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🚀 3D WebGL
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                viewMode === '2d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛰️ 2D BEV
            </button>
          </div>

          <a
            href="/av_pipeline_demo.html"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 rounded-xl transition flex items-center space-x-1"
            title="Pop out Fullscreen"
          >
            <span>↗</span>
            <span className="hidden sm:inline">Fullscreen</span>
          </a>

          {viewMode === '2d' && (
            <>
              <button
                onClick={() => setShowCandidates(!showCandidates)}
                className={`px-2.5 py-1 rounded border transition flex items-center space-x-1.5 ${
                  showCandidates
                    ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                    : 'bg-navy-950 border-slate-800 text-slate-500'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>LATTICE ({state.candidate_trajectories.length})</span>
              </button>

              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className={`px-2.5 py-1 rounded border transition flex items-center space-x-1.5 ${
                  showPredictions
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                    : 'bg-navy-950 border-slate-800 text-slate-500'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>PREDICTIONS</span>
              </button>

              <button
                onClick={() => setShowSensorFOV(!showSensorFOV)}
                className={`px-2.5 py-1 rounded border transition flex items-center space-x-1.5 ${
                  showSensorFOV
                    ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200'
                    : 'bg-navy-950 border-slate-800 text-slate-500'
                }`}
              >
                <Radio className="w-3 h-3" />
                <span>SENSOR FOV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Full-Scale Canvas */}
      <div className="flex-1 relative min-h-0 rounded-xl overflow-hidden border border-cyan-900/50 shadow-2xl bg-[#060913]">
        {viewMode === '3d' ? (
          <iframe
            src="/av_pipeline_demo.html"
            className="w-full h-full border-0"
            title="NavAdapt 3D Autonomous Driving AI Simulator"
          />
        ) : (
          <BevCanvas
            state={state}
            showCandidates={showCandidates}
            showPredictions={showPredictions}
            showSensorFOV={showSensorFOV}
          />
        )}

        {/* Live Floating Hazard Injector Bar */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-navy-950/90 border border-slate-800/90 p-2 rounded-xl backdrop-blur-md shadow-2xl">
          <span className="text-[10px] font-mono text-saffron-400 font-bold px-2 flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5" />
            <span>INJECT HAZARD:</span>
          </span>
          <button
            onClick={() => onTriggerHazard('cattle_crossing')}
            className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 text-amber-200 text-[10px] font-mono font-semibold transition active:scale-95"
          >
            Stray Cattle
          </button>
          <button
            onClick={() => onTriggerHazard('pedestrian_dart')}
            className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-600/50 text-cyan-200 text-[10px] font-mono font-semibold transition active:scale-95"
          >
            Darting Pedestrian
          </button>
          <button
            onClick={() => onTriggerHazard('rickshaw_cut_in')}
            className="px-2.5 py-1 rounded bg-yellow-950/60 hover:bg-yellow-900/80 border border-yellow-600/50 text-yellow-200 text-[10px] font-mono font-semibold transition active:scale-95"
          >
            Auto Cut-In
          </button>
          <button
            onClick={() => onTriggerHazard('pothole_swerve')}
            className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 border border-rose-600/50 text-rose-200 text-[10px] font-mono font-semibold transition active:scale-95"
          >
            Deep Pothole
          </button>
        </div>

        {/* Real-time Status Overlay HUD (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-navy-950/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md shadow-2xl font-mono text-xs space-y-1.5 w-64">
          <div className="flex justify-between items-center text-slate-400 pb-1 border-b border-slate-800">
            <span>BEHAVIOR STATE</span>
            <span className="text-cyan-300 font-bold">{state.behavior_state.toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>COMPOSITE RISK</span>
            <span className={`font-bold ${
              risk.level === 'Critical' ? 'text-red-400' :
              risk.level === 'High Risk' ? 'text-orange-400' : 'text-emerald-400'
            }`}>
              {risk.overall_score.toFixed(0)} / 100
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>REPLAN LATENCY</span>
            <span className="text-slate-200 font-bold">{metrics.avg_replanning_latency_ms.toFixed(1)} ms</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>COLLISIONS</span>
            <span className="text-emerald-400 font-bold">{metrics.collision_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
