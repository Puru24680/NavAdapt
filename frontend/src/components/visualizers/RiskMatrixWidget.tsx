import React from 'react';
import { SimulationState, RiskLevel } from '../../types/simulation';
import { ShieldAlert, AlertTriangle, ShieldCheck, Activity, Target } from 'lucide-react';

interface RiskMatrixWidgetProps {
  state: SimulationState;
}

export const RiskMatrixWidget: React.FC<RiskMatrixWidgetProps> = ({ state }) => {
  const { risk, objects } = state;
  const score = risk.overall_score;

  // Determine tier colors
  let tierColor = 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
  let barGradient = 'from-emerald-500 to-emerald-400';
  if (risk.level === 'Critical') {
    tierColor = 'text-rose-400 border-rose-500 bg-rose-950/70 glow-red animate-pulse';
    barGradient = 'from-orange-500 via-rose-500 to-red-600';
  } else if (risk.level === 'High Risk') {
    tierColor = 'text-orange-400 border-orange-500 bg-orange-950/50';
    barGradient = 'from-amber-500 to-orange-500';
  } else if (risk.level === 'Caution') {
    tierColor = 'text-amber-400 border-amber-500 bg-amber-950/40';
    barGradient = 'from-blue-500 to-amber-400';
  }

  const agentRisksList = Object.values(risk.agent_risks || {});

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-saffron-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Dynamic Risk Matrix
          </span>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${tierColor}`}>
          {risk.level.toUpperCase()}
        </div>
      </div>

      {/* Main Score Bar */}
      <div className="bg-navy-950/80 p-3 rounded-lg border border-slate-800 mb-2">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[10px] font-mono text-slate-400">COMPOSITE SYSTEM RISK</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {score.toFixed(0)}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>
        </div>

        {/* 4-tier colored bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
          <div
            className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-150 rounded-full`}
            style={{ width: `${Math.min(100, Math.max(2, score))}%` }}
          />
        </div>

        {/* Tier tick labels */}
        <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1 px-0.5">
          <span>0 (SAFE)</span>
          <span>25</span>
          <span>50 (HIGH)</span>
          <span>75</span>
          <span>100 (CRIT)</span>
        </div>
      </div>

      {/* 5 Risk Factors Weights breakdown */}
      <div className="grid grid-cols-5 gap-1 text-center font-mono text-[9px] mb-2">
        <div className="bg-navy-950 p-1 rounded border border-slate-800/80">
          <div className="text-slate-500 text-[8px]">TTC (35%)</div>
          <div className="font-bold text-cyan-300">{risk.min_ttc < 90 ? `${risk.min_ttc.toFixed(1)}s` : '>4.0s'}</div>
        </div>
        <div className="bg-navy-950 p-1 rounded border border-slate-800/80">
          <div className="text-slate-500 text-[8px]">DIST (25%)</div>
          <div className="font-bold text-slate-300">
            {agentRisksList.length > 0 ? `${Math.min(...agentRisksList.map(a => a.distance)).toFixed(1)}m` : 'Clear'}
          </div>
        </div>
        <div className="bg-navy-950 p-1 rounded border border-slate-800/80">
          <div className="text-slate-500 text-[8px]">VEL (15%)</div>
          <div className="font-bold text-slate-300">
            {agentRisksList.length > 0 ? `${Math.max(...agentRisksList.map(a => a.rel_speed)).toFixed(1)}m/s` : '0.0'}
          </div>
        </div>
        <div className="bg-navy-950 p-1 rounded border border-slate-800/80">
          <div className="text-slate-500 text-[8px]">OVERLAP (15%)</div>
          <div className="font-bold text-slate-300">
            {agentRisksList.length > 0 ? `${Math.max(...agentRisksList.map(a => a.trajectory_overlap)).toFixed(0)}%` : '0%'}
          </div>
        </div>
        <div className="bg-navy-950 p-1 rounded border border-slate-800/80">
          <div className="text-slate-500 text-[8px]">VULN (10%)</div>
          <div className="font-bold text-saffron-400">
            {agentRisksList.length > 0 ? `${Math.max(...agentRisksList.map(a => a.vulnerability_weight)).toFixed(1)}x` : '1.0x'}
          </div>
        </div>
      </div>

      {/* Surrounding Detected Agents Threat List */}
      <div className="bg-navy-950/60 rounded-lg p-2 border border-slate-800/80 flex-1 overflow-y-auto max-h-[110px]">
        <div className="text-[10px] font-mono text-slate-400 font-bold mb-1 flex items-center justify-between">
          <span>SURROUNDING AGENTS ({agentRisksList.length})</span>
          <span>TTC / RISK</span>
        </div>

        {agentRisksList.length === 0 ? (
          <div className="text-center py-2 text-[10px] font-mono text-slate-500">
            No dynamic threats in safety buffer
          </div>
        ) : (
          <div className="space-y-1">
            {agentRisksList.slice(0, 4).map((agent) => (
              <div
                key={agent.object_id}
                className="flex items-center justify-between text-[10px] font-mono bg-navy-900/80 px-2 py-1 rounded border border-slate-800"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    agent.level === 'Critical' ? 'bg-red-500' :
                    agent.level === 'High Risk' ? 'bg-orange-500' :
                    agent.level === 'Caution' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className="text-slate-200 font-semibold truncate">{agent.class_name.toUpperCase()}</span>
                  <span className="text-slate-500">({agent.distance.toFixed(1)}m)</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-slate-400">{agent.ttc < 90 ? `${agent.ttc.toFixed(1)}s` : '--'}</span>
                  <span className={`font-bold ${
                    agent.total_risk >= 75 ? 'text-red-400' :
                    agent.total_risk >= 50 ? 'text-orange-400' :
                    agent.total_risk >= 25 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {agent.total_risk.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
