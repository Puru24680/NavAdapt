import React from 'react';
import {
  MapPin,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Shield,
  Layers,
  Clock
} from 'lucide-react';
import { SimulationState } from '../types/simulation';

interface ScenarioSelectionProps {
  state: SimulationState;
  onSelectScenario: (scenarioId: string) => void;
  onNavigateToLive: () => void;
}

export const ScenarioSelection: React.FC<ScenarioSelectionProps> = ({
  state,
  onSelectScenario,
  onNavigateToLive
}) => {
  const scenarios = [
    {
      id: 'scenario_1',
      title: 'Unmarked Village Road (Gramin Sadak)',
      subtitle: 'Rural Arterial Without Lane Markings',
      difficulty: 'High',
      trafficDensity: 'Medium Heterogeneous',
      roadWidth: '5.5 meters (Single-lane equivalent)',
      hazards: ['Missing Centerlines', 'Natural Dirt Shoulder', 'Roaming Cattle', 'Severe Potholes', 'Oncoming Two-Wheeler'],
      description: 'Single-lane rural corridor with zero lane paint, undulating unpaved verges, roaming cattle on the shoulder, oncoming motorcycles drifting across center, and surface potholes requiring free-space evasion.',
      goal: 'Navigate 200m smoothly to destination while avoiding potholes and maintaining clearance from roadside cattle without relying on lane detection.'
    },
    {
      id: 'scenario_2',
      title: 'Busy Unsignalized Urban Intersection',
      subtitle: 'Chaotic Multi-Directional Chowk',
      difficulty: 'Extreme',
      trafficDensity: 'High Density Dynamic',
      roadWidth: '9.0 meters (4-Way Junction)',
      hazards: ['Informal Right-of-Way', 'Auto-Rickshaw Cut-In', 'Diagonal Two-Wheelers', 'Crossing Pedestrians', 'Occluded Busses'],
      description: 'High-density urban junction devoid of traffic lights. Road users enter concurrently from 4 approaches with informal merging, turning auto-rickshaws, and filtering motorcycles cutting diagonally across ego path.',
      goal: 'Negotiate junction safely using right-of-way estimation, multi-hypothesis prediction, opportunistic yielding, and inching progression.'
    },
    {
      id: 'scenario_3',
      title: 'National Highway Semi-Structured Merge',
      subtitle: 'High-Velocity Mixed Traffic Corridor',
      difficulty: 'Medium',
      trafficDensity: 'High Velocity Mixed',
      roadWidth: '12.0 meters (2 Mainline Lanes + Merge Ramp)',
      hazards: ['Overloaded Slow Truck (6 m/s)', 'High Speed Differentials', 'Lane-Splitting Motorcycles', 'Ramp Taper Incursion'],
      description: 'Ego merges from entry ramp into high-speed arterial with slow-moving overloaded commercial truck in the slow lane, agile lane-splitting motorcycles, and fast traffic in the passing lane.',
      goal: 'Accelerate smoothly to match highway gap, merge safely with required safety distance, and execute safe pass around slow-moving truck.'
    },
    {
      id: 'scenario_4',
      title: 'Dense Bazaar / Market Street',
      subtitle: 'Sub-4m Street with Encroachments & Pedestrians',
      difficulty: 'Extreme',
      trafficDensity: 'Ultra-Dense Micro-mobility',
      roadWidth: '4.2 meters (Constricted Market)',
      hazards: ['Sub-4m Width', 'Hand Pushcarts', 'Sudden Darting Pedestrians', 'Parked Two-Wheelers Protruding', 'Frequent Occlusions'],
      description: 'Extremely constricted market corridor with vegetable hand pushcarts partially blocking the drivable space, parked motorcycles protruding into traffic, and pedestrians stepping out from behind stalls.',
      goal: 'Navigate at low crawl speed (5-12 km/h) with continuous sub-50ms replanning, dynamic micro-nudges, and instant controlled stopping for pedestrians.'
    },
    {
      id: 'scenario_5',
      title: 'Sudden Cattle Crossing',
      subtitle: 'High-Speed Sub-Urban Arterial Incursion',
      difficulty: 'High',
      trafficDensity: 'Dynamic Unpredictable',
      roadWidth: '8.0 meters (Suburban Double Carriageway)',
      hazards: ['Concealed Stray Cattle', 'Zero Reaction Margin', 'High Initial Speed (40 km/h)', 'Oncoming Car Constraint'],
      description: 'Vehicle cruising normally at 40 km/h (11 m/s) when a stray cow concealed behind roadside visual occlusion suddenly steps directly into the vehicle’s corridor at 22m distance.',
      goal: 'Trigger instant perception detection, compute critical risk (R > 80), execute emergency deceleration with comfort jerk limit, stop at 2.5m buffer, and replan safe resumption once cattle clears.'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-navy-950 p-8 space-y-8 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold mb-2">
          <MapPin className="w-4 h-4" />
          <span>SMART INDIA HACKATHON BENCHMARK SUITE</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Five Unstructured Indian Road Scenarios
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mt-1">
          Select and execute deterministic simulation benchmarks designed to rigorously evaluate the non-lane-dependent adaptive planning system.
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scen, idx) => {
          const isActive = state.scenario_id === scen.id;
          return (
            <div
              key={scen.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 relative overflow-hidden group ${
                isActive
                  ? 'bg-gradient-to-br from-navy-900 to-blue-950/70 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-navy-900/80 border-slate-800 hover:border-slate-700 hover:bg-navy-900'
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-4 right-4 flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>ACTIVE RUNTIME</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Title & Index */}
                <div className="flex items-baseline space-x-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    0{idx + 1}
                  </span>
                  <div className="text-xs font-mono uppercase text-slate-400">{scen.subtitle}</div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
                  {scen.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {scen.description}
                </p>

                {/* Attributes Pill Group */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800">
                  <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
                    <span className="text-slate-500 block text-[9px]">DIFFICULTY</span>
                    <span className={`font-bold ${
                      scen.difficulty === 'Extreme' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {scen.difficulty}
                    </span>
                  </div>
                  <div className="bg-navy-950/80 p-2 rounded border border-slate-800/80">
                    <span className="text-slate-500 block text-[9px]">ROAD WIDTH</span>
                    <span className="text-slate-300 font-bold">{scen.roadWidth}</span>
                  </div>
                </div>

                {/* Main Hazards Tags */}
                <div>
                  <div className="text-[10px] font-mono text-slate-400 mb-1.5 font-bold uppercase">
                    Key Roadway Hazards
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {scen.hazards.map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    onSelectScenario(scen.id);
                    onNavigateToLive();
                  }}
                  className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition active:scale-95 shadow ${
                    isActive
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-navy-950'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isActive ? 'Continue Active Scenario' : 'Launch & Run Scenario'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
