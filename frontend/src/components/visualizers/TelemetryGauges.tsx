import React from 'react';
import { SimulationState } from '../../types/simulation';
import { Gauge, Activity, Navigation, Zap, Clock } from 'lucide-react';

interface TelemetryGaugesProps {
  state: SimulationState;
}

export const TelemetryGauges: React.FC<TelemetryGaugesProps> = ({ state }) => {
  const { vehicle: ego, metrics, planned_trajectory } = state;
  const speedKmh = ego.v * 3.6;
  const steerDeg = (ego.steering_angle * 180) / Math.PI;

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-electric-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Vehicle Telemetry
          </span>
        </div>
        <div className="flex items-center space-x-1.5 font-mono text-xs">
          <span className="text-slate-400">GEAR:</span>
          <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-600/60 font-bold text-cyan-300">
            {ego.gear}
          </span>
        </div>
      </div>

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* Speedometer Card */}
        <div className="bg-navy-950/80 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Current Speed</div>
          <div className="my-1 flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {speedKmh.toFixed(1)}
            </span>
            <span className="text-[11px] font-mono text-slate-400">km/h</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-100"
              style={{ width: `${Math.min(100, (speedKmh / 60) * 100)}%` }}
            />
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-1 text-right">
            {(ego.v).toFixed(2)} m/s
          </div>
        </div>

        {/* Steering Angle Card */}
        <div className="bg-navy-950/80 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Steering (Stanley)</div>
          <div className="my-1 flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-cyan-300 tracking-tight">
              {steerDeg > 0 ? `+${steerDeg.toFixed(1)}` : steerDeg.toFixed(1)}°
            </span>
          </div>
          {/* Centered Steering Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full relative overflow-hidden flex items-center justify-center">
            <div className="w-[2px] h-full bg-slate-500 z-10" />
            <div
              className="absolute bg-cyan-400 h-full transition-all duration-100"
              style={{
                left: steerDeg >= 0 ? '50%' : `${50 + (steerDeg / 35) * 50}%`,
                width: `${Math.abs(steerDeg / 35) * 50}%`
              }}
            />
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-1 text-right">
            Max: ±35.0°
          </div>
        </div>
      </div>

      {/* Throttle & Brake Bars */}
      <div className="space-y-1.5 bg-navy-950/50 p-2 rounded-lg border border-slate-800/80 mb-2">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-emerald-400">THROTTLE: {(ego.throttle * 100).toFixed(0)}%</span>
          <span className="text-rose-400">BRAKE: {(ego.brake * 100).toFixed(0)}%</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-100"
              style={{ width: `${ego.throttle * 100}%` }}
            />
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-100"
              style={{ width: `${ego.brake * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dynamics & Performance Metrics */}
      <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
        <div className="bg-navy-950 p-1.5 rounded border border-slate-800">
          <div className="text-[9px] text-slate-400">ACCEL</div>
          <div className="text-xs font-bold text-slate-200">{ego.acceleration.toFixed(2)} m/s²</div>
        </div>
        <div className="bg-navy-950 p-1.5 rounded border border-slate-800">
          <div className="text-[9px] text-slate-400">JERK</div>
          <div className="text-xs font-bold text-slate-200">{ego.jerk.toFixed(2)} m/s³</div>
        </div>
        <div className="bg-navy-950 p-1.5 rounded border border-slate-800">
          <div className="text-[9px] text-slate-400">REPLAN</div>
          <div className="text-xs font-bold text-cyan-400">{metrics.avg_replanning_latency_ms.toFixed(1)} ms</div>
        </div>
      </div>
    </div>
  );
};
