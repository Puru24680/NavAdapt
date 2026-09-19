import React from 'react';
import {
  LayoutDashboard,
  Compass,
  MapPin,
  PlaySquare,
  BarChart3,
  Network,
  Cpu,
  Users,
  ChevronRight,
  Zap
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'landing', label: 'Platform Overview', icon: Compass, badge: 'HOME' },
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard, badge: 'MAIN' },
    { id: '3d-sim', label: '3D WebGL Simulator', icon: Zap, badge: 'PRO 3D' },
    { id: 'scenarios', label: 'Scenario Library', icon: MapPin, badge: '5 SCENARIOS' },
    { id: 'live', label: 'Live Simulation & HUD', icon: PlaySquare, badge: 'INTERACTIVE' },
    { id: 'analytics', label: 'Benchmark Analytics', icon: BarChart3, badge: 'METRICS' },
    { id: 'architecture', label: '14-Stage Architecture', icon: Network, badge: 'PIPELINE' },
    { id: 'technical', label: 'Algorithms & Math', icon: Cpu, badge: 'SPECS' },
    { id: 'team', label: 'Team NavAdapt & SIH', icon: Users, badge: 'SIH' },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-navy-950 border-r border-slate-800/80 flex-col justify-between shrink-0 select-none">
      <div className="py-4">
        <div className="px-5 mb-4 flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-white p-0.5 flex items-center justify-center border border-slate-700 shrink-0 shadow-sm">
            <img src="/navadapt-logo.png" alt="NavAdapt" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              TEAM NAVADAPT
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              SIH Research Platform
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  active
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      active ? 'bg-blue-500/30 text-cyan-300' : 'bg-slate-800/60 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-navy-900/40 text-[11px] text-slate-400 space-y-2">
        <div className="flex justify-between items-center text-slate-300 font-mono">
          <span>COTS STACK</span>
          <span className="text-cyan-400 font-bold">ROS2 / MATLAB</span>
        </div>
        <div className="flex justify-between items-center text-slate-300 font-mono">
          <span>CONTROLLER</span>
          <span className="text-blue-400 font-bold">STANLEY + PID</span>
        </div>
        <div className="pt-1 text-[10px] text-slate-500 text-center">
          Team NavAdapt © 2026 Smart India Hackathon
        </div>
      </div>
    </aside>
  );
};
