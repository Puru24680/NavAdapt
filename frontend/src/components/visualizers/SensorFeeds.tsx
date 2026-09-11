import React, { useState } from 'react';
import { SimulationState } from '../../types/simulation';
import { Camera, Radio, Disc, Shield, Eye } from 'lucide-react';

interface SensorFeedsProps {
  state: SimulationState;
}

export const SensorFeeds: React.FC<SensorFeedsProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'lidar' | 'radar'>('camera');
  const { vehicle: ego, objects } = state;

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-3 flex flex-col h-full shadow-lg">
      {/* Header & Sensor Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Perception Feeds
          </span>
        </div>
        <div className="flex bg-navy-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition ${
              activeTab === 'camera' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>CAM</span>
          </button>
          <button
            onClick={() => setActiveTab('lidar')}
            className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition ${
              activeTab === 'lidar' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-3 h-3" />
            <span>LiDAR</span>
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition ${
              activeTab === 'radar' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>RADAR</span>
          </button>
        </div>
      </div>

      {/* Sensor Viewport */}
      <div className="relative flex-1 bg-black rounded-lg overflow-hidden border border-slate-800/80 min-h-[160px] flex items-center justify-center">
        {activeTab === 'camera' && (
          <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-neutral-900 overflow-hidden flex flex-col justify-end">
            {/* Synthetic Road Perspective */}
            <div className="absolute inset-0 opacity-40">
              {/* Sky */}
              <div className="h-1/2 bg-gradient-to-b from-slate-900 to-indigo-950" />
              {/* Ground & Horizon */}
              <div className="h-1/2 bg-slate-900 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[120px] border-r-[120px] border-b-[180px] border-l-transparent border-r-transparent border-b-slate-800/90" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-cyan-500/20" />
              </div>
            </div>

            {/* AI Bounding Boxes overlay for forward objects */}
            <div className="absolute inset-0 p-3 pointer-events-none">
              {objects.filter(o => o.x > ego.x && o.x < ego.x + 50).map((obj) => {
                const dist = Math.hypot(obj.x - ego.x, obj.y - ego.y);
                const scale = Math.max(0.3, Math.min(1.4, 30 / (dist + 5)));
                const offsetX = (obj.y - ego.y) * 20;

                return (
                  <div
                    key={obj.id}
                    className="absolute border border-cyan-400/90 bg-cyan-500/10 rounded-xs flex flex-col justify-between p-1 transition-all duration-100"
                    style={{
                      left: `calc(50% + ${offsetX}px - ${25 * scale}px)`,
                      bottom: `${Math.min(75, 20 + (1 / (dist + 1)) * 180)}%`,
                      width: `${50 * scale}px`,
                      height: `${65 * scale}px`,
                    }}
                  >
                    <div className="bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono text-cyan-300 font-bold border border-cyan-500/40 truncate">
                      {obj.class_name.toUpperCase()}
                    </div>
                    <div className="text-right text-[8px] font-mono text-white/90">
                      {dist.toFixed(1)}m
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Camera Telemetry Header */}
            <div className="absolute top-2 left-2 flex items-center space-x-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>CAM-FRONT-HD • 1920x1080 • 30FPS</span>
            </div>
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded">
              YOLOv8-NAVADAPT DETECTOR
            </div>
          </div>
        )}

        {activeTab === 'lidar' && (
          <div className="relative w-full h-full bg-[#050B14] flex items-center justify-center">
            {/* Radial LiDAR Ring Display */}
            <div className="w-36 h-36 rounded-full border border-cyan-500/30 flex items-center justify-center relative">
              <div className="w-24 h-24 rounded-full border border-cyan-500/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-cyan-500/15" />
              </div>
              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[1px] bg-cyan-500/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-[1px] bg-cyan-500/20" />
              </div>
              {/* Radar sweep beam */}
              <div className="absolute w-18 h-18 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full animate-radar pointer-events-none" />

              {/* Point Cloud Clusters */}
              {objects.map((obj) => {
                const dx = (obj.x - ego.x) * 1.5;
                const dy = (obj.y - ego.y) * 1.5;
                if (Math.hypot(dx, dy) > 70) return null;
                return (
                  <div
                    key={obj.id}
                    className="absolute w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#22D3EE]"
                    style={{
                      transform: `translate(${dx}px, ${-dy}px)`
                    }}
                    title={`${obj.class_name}: ${Math.hypot(obj.x - ego.x, obj.y - ego.y).toFixed(1)}m`}
                  />
                );
              })}
            </div>
            <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded">
              LiDAR 64-CH • 100k pts/s • 0.05m res
            </div>
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="relative w-full h-full bg-[#050A12] flex flex-col justify-between p-3 font-mono">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span className="text-indigo-400">77 GHz FMCW RADAR</span>
              <span>DOPPLER REL VELOCITY</span>
            </div>

            {/* Doppler Plot Grid */}
            <div className="relative h-24 border border-indigo-900/60 rounded bg-navy-950/40 p-2 flex items-center justify-center">
              <div className="absolute w-full h-[1px] bg-indigo-500/20" />
              <div className="absolute h-full w-[1px] bg-indigo-500/20" />

              {objects.slice(0, 4).map((obj) => {
                const dist = Math.hypot(obj.x - ego.x, obj.y - ego.y);
                const relV = (ego.vx - obj.vx);
                return (
                  <div
                    key={obj.id}
                    className="absolute px-1.5 py-0.5 bg-indigo-900/80 border border-indigo-500 text-[9px] rounded text-indigo-200"
                    style={{
                      transform: `translate(${relV * 4}px, ${(dist - 30) * 1.2}px)`
                    }}
                  >
                    {obj.class_name.slice(0, 4)}: {dist.toFixed(0)}m / {relV.toFixed(1)}m/s
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[9px] text-slate-400">
              <span>FOV: ±22.5°</span>
              <span>MAX RANGE: 140m</span>
              <span>UPDATE: 50 Hz</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
