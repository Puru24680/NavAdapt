import React from 'react';
import { Play, Pause, Square, RefreshCw, Radio, AlertTriangle, ShieldCheck, Zap, RotateCcw } from 'lucide-react';
import { SimulationState } from '../../types/simulation';

import { UserProfile } from '../../types/auth';

interface NavbarProps {
  state: SimulationState;
  connected: boolean;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onReplan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  connected,
  user,
  onOpenAuth,
  onSignOut,
  onStart,
  onPause,
  onStop,
  onReset,
  onReplan
}) => {
  const isCritical = state.risk.level === 'Critical';
  const isEmergency = state.behavior_state === 'Emergency Brake';

  return (
    <header className="h-16 bg-navy-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & Team */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-md overflow-hidden border border-cyan-400/40 shrink-0">
            <img src="/navadapt-logo.png" alt="NavAdapt Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider text-white">NavAdapt</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 border border-blue-600/40 text-cyan-300 font-mono font-bold">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-xs">
              Adaptive Navigation for Unstructured Indian Roads
            </p>
          </div>
        </div>

        {/* Live status badge */}
        <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-800">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-mono text-slate-300">
            {connected ? 'WS LIVE 25Hz' : 'OFFLINE BRIDGE'}
          </span>
          <span className="text-xs text-slate-500">|</span>
          <span className="text-xs text-slate-300 font-mono">
            T: <span className="text-cyan-400 font-bold">{state.time.toFixed(1)}s</span>
          </span>
          <span className="text-xs text-slate-500">|</span>
          <span className="text-xs text-slate-300 font-mono">
            SCENARIO: <span className="text-slate-100 uppercase">{state.scenario_id.replace('_', ' ')}</span>
          </span>
        </div>
      </div>

      {/* Center Behavior & Risk Badges */}
      <div className="hidden md:flex items-center space-x-3">
        {/* Behavior Status */}
        <div className={`px-3 py-1 rounded-md text-xs font-mono font-semibold flex items-center space-x-1.5 border ${
          isEmergency
            ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
            : state.behavior_state === 'Avoid Obstacle' || state.behavior_state === 'Yield'
            ? 'bg-amber-950/60 border-amber-500 text-amber-300'
            : 'bg-blue-950/50 border-blue-600/50 text-blue-300'
        }`}>
          <Radio className="w-3.5 h-3.5" />
          <span>BEHAVIOR: {state.behavior_state.toUpperCase()}</span>
        </div>

        {/* Dynamic Risk Badge */}
        <div className={`px-3 py-1 rounded-md text-xs font-mono font-semibold flex items-center space-x-1.5 border ${
          isCritical
            ? 'bg-red-950/90 border-red-500 text-red-100 glow-red'
            : state.risk.level === 'High Risk'
            ? 'bg-orange-950/80 border-orange-500 text-orange-200'
            : state.risk.level === 'Caution'
            ? 'bg-amber-950/70 border-amber-400 text-amber-200'
            : 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
        }`}>
          {isCritical ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          <span>RISK: {state.risk.overall_score.toFixed(0)}/100 ({state.risk.level.toUpperCase()})</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-2">
        {!state.is_running || state.is_paused || state.is_completed ? (
          <button
            onClick={onStart}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow transition active:scale-95"
            title={state.is_completed ? "Restart Simulation" : "Start Simulation"}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{state.is_completed ? "RESTART" : "START"}</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-xs font-semibold shadow transition active:scale-95"
            title="Pause Simulation"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>PAUSE</span>
          </button>
        )}

        <button
          onClick={onStop}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 hover:text-rose-100 rounded-md text-xs font-semibold border border-rose-500/40 transition active:scale-95"
          title="Emergency Brake & Full Safe Stop"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>STOP</span>
        </button>

        <button
          onClick={onReset}
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-semibold border border-slate-700 transition active:scale-95"
          title="Reset Simulation to Beginning"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>

        <button
          onClick={onReplan}
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-blue-100 rounded-md text-xs font-semibold border border-blue-500/40 transition active:scale-95"
          title="Force Sub-50ms Replanning"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REPLAN</span>
        </button>

        <a
          href="/av_pipeline_demo.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-md text-xs font-bold shadow-lg shadow-cyan-500/30 border border-cyan-400/40 transition active:scale-95"
          title="Open Fullscreen 3D WebGL Simulator"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span className="hidden md:inline">3D SIMULATOR</span>
        </a>

        {/* User Auth Profile / Sign In */}
        {user ? (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-cyan-500/40 text-xs font-mono">
              <span>{user.avatarIcon}</span>
              <div className="hidden lg:block text-left">
                <div className="font-bold text-white leading-none truncate max-w-[110px]">{user.name}</div>
                <div className="text-[9px] text-cyan-400 truncate max-w-[110px]">{user.role.split(' ')[0]}</div>
              </div>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="px-2 py-1 bg-slate-800 hover:bg-red-950/80 hover:border-red-500/40 hover:text-red-300 text-slate-400 rounded text-xs border border-slate-700 transition"
                title="Sign Out"
              >
                Sign Out
              </button>
            )}
          </div>
        ) : (
          onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-md text-xs font-bold shadow-md shadow-cyan-500/20 transition active:scale-95"
              title="Sign In or Create Operator Account"
            >
              <span>👤</span>
              <span>Sign In</span>
            </button>
          )
        )}
      </div>
    </header>
  );
};
