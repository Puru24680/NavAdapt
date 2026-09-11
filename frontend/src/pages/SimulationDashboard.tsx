import React, { useState } from 'react';
import { SimulationState } from '../types/simulation';
import { BevCanvas } from '../components/visualizers/BevCanvas';
import { SensorFeeds } from '../components/visualizers/SensorFeeds';
import { TelemetryGauges } from '../components/visualizers/TelemetryGauges';
import { RiskMatrixWidget } from '../components/visualizers/RiskMatrixWidget';
import { HazardControls } from '../components/visualizers/HazardControls';
import { Box, Layers, Maximize2 } from 'lucide-react';

interface SimulationDashboardProps {
  state: SimulationState;
  onTriggerHazard: (hazardType: string) => void;
  onReplan: () => void;
}

export const SimulationDashboard: React.FC<SimulationDashboardProps> = ({
  state,
  onTriggerHazard,
  onReplan
}) => {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden p-4 gap-3 bg-[#070C16]">
      {/* Top Main Row: 3D/2D Simulator & Sensor Feeds */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
        {/* Simulation Canvas / 3D WebGL Viewport (Takes 2 columns on large screens) */}
        <div className="lg:col-span-2 h-full flex flex-col min-h-0 relative rounded-xl overflow-hidden border border-cyan-900/50 shadow-2xl bg-[#060913]">
          {/* Floating View Switcher & Fullscreen Popout */}
          <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl flex items-center space-x-1 text-xs font-mono shadow-lg">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold transition ${
                  viewMode === '3d'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Perspective</span>
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold transition ${
                  viewMode === '2d'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2D Tactical BEV</span>
              </button>
            </div>

            <a
              href="/av_pipeline_demo.html"
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 rounded-xl transition shadow flex items-center"
              title="Open Fullscreen 3D Simulator"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </a>
          </div>

          {viewMode === '3d' ? (
            <iframe
              src="/av_pipeline_demo.html"
              className="w-full h-full border-0"
              title="NavAdapt 3D Autonomous Driving AI Simulator"
            />
          ) : (
            <BevCanvas state={state} />
          )}
        </div>

        {/* Multi-Sensor Feeds (Camera, LiDAR, Radar) */}
        <div className="lg:col-span-1 h-full flex flex-col min-h-0">
          <SensorFeeds state={state} />
        </div>
      </div>

      {/* Bottom Telemetry, Risk & Hazard Row */}
      <div className="h-64 grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        {/* 1. Vehicle Telemetry Gauges */}
        <TelemetryGauges state={state} />

        {/* 2. Dynamic Composite Risk Matrix */}
        <RiskMatrixWidget state={state} />

        {/* 3. SIH Hazard Trigger & Decision Log */}
        <HazardControls
          state={state}
          onTriggerHazard={onTriggerHazard}
          onReplan={onReplan}
        />
      </div>
    </div>
  );
};
