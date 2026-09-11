import React from 'react';
import { SimulationState } from '../../types/simulation';
import { Flame, AlertOctagon, UserX, Car, Skull, RefreshCw, Bell } from 'lucide-react';

interface HazardControlsProps {
  state: SimulationState;
  onTriggerHazard: (hazardType: string) => void;
  onReplan: () => void;
}

export const HazardControls: React.FC<HazardControlsProps> = ({
  state,
  onTriggerHazard,
  onReplan
}) => {
  const { recent_events, active_notifications } = state;

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-saffron-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            SIH Interactive Hazard Injection
          </span>
        </div>
        <span className="text-[10px] font-mono bg-saffron-500/20 text-saffron-300 border border-saffron-500/40 px-2 py-0.5 rounded font-semibold">
          LIVE DEMO MODE
        </span>
      </div>

      {/* Hazard Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={() => onTriggerHazard('cattle_crossing')}
          className="flex items-center space-x-2 p-2 rounded-lg bg-amber-950/40 border border-amber-600/50 hover:bg-amber-900/60 text-amber-200 hover:text-white transition active:scale-95 text-left"
        >
          <div className="w-7 h-7 rounded bg-amber-600/30 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold">Cattle Incursion</div>
            <div className="text-[9px] text-amber-400/80 font-mono">Cow steps into lane</div>
          </div>
        </button>

        <button
          onClick={() => onTriggerHazard('pedestrian_dart')}
          className="flex items-center space-x-2 p-2 rounded-lg bg-cyan-950/40 border border-cyan-600/50 hover:bg-cyan-900/60 text-cyan-200 hover:text-white transition active:scale-95 text-left"
        >
          <div className="w-7 h-7 rounded bg-cyan-600/30 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold">Pedestrian Dart</div>
            <div className="text-[9px] text-cyan-400/80 font-mono">Jaywalker crossing</div>
          </div>
        </button>

        <button
          onClick={() => onTriggerHazard('rickshaw_cut_in')}
          className="flex items-center space-x-2 p-2 rounded-lg bg-yellow-950/40 border border-yellow-600/50 hover:bg-yellow-900/60 text-yellow-200 hover:text-white transition active:scale-95 text-left"
        >
          <div className="w-7 h-7 rounded bg-yellow-600/30 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold">Auto Cut-In</div>
            <div className="text-[9px] text-yellow-400/80 font-mono">Aggressive merge</div>
          </div>
        </button>

        <button
          onClick={() => onTriggerHazard('pothole_swerve')}
          className="flex items-center space-x-2 p-2 rounded-lg bg-rose-950/40 border border-rose-600/50 hover:bg-rose-900/60 text-rose-200 hover:text-white transition active:scale-95 text-left"
        >
          <div className="w-7 h-7 rounded bg-rose-600/30 flex items-center justify-center shrink-0">
            <Skull className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold">Deep Pothole</div>
            <div className="text-[9px] text-rose-400/80 font-mono">15cm road fracture</div>
          </div>
        </button>
      </div>

      {/* Decision & Event Timeline Feed */}
      <div className="bg-navy-950/80 rounded-lg p-2.5 border border-slate-800 flex-1 flex flex-col justify-between min-h-[110px]">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold mb-1.5 pb-1 border-b border-slate-800/80">
          <div className="flex items-center space-x-1.5">
            <Bell className="w-3 h-3 text-cyan-400" />
            <span>REAL-TIME ADAPTIVE DECISION LOG</span>
          </div>
          <span className="text-cyan-400">LATENCY &lt; 50ms</span>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[85px] text-[10px] font-mono">
          {active_notifications.length === 0 ? (
            <div className="text-slate-500 text-center py-2">No active hazard alerts</div>
          ) : (
            active_notifications.slice().reverse().slice(0, 4).map((note, idx) => (
              <div
                key={idx}
                className={`px-2 py-1 rounded border flex items-center space-x-2 ${
                  note.includes('HAZARD') || note.includes('ALERT')
                    ? 'bg-rose-950/70 border-rose-500/80 text-rose-200 font-semibold'
                    : note.includes('Replanned')
                    ? 'bg-blue-950/60 border-blue-600/50 text-cyan-200'
                    : 'bg-navy-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  note.includes('HAZARD') ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'
                }`} />
                <span className="truncate">{note}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
