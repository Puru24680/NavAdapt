import React, { useState } from 'react';
import { useSimulationSocket } from './hooks/useSimulationSocket';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { SimulationDashboard } from './pages/SimulationDashboard';
import { ScenarioSelection } from './pages/ScenarioSelection';
import { LiveSimulationPage } from './pages/LiveSimulationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SystemArchitecturePage } from './pages/SystemArchitecturePage';
import { TechnicalDetailsPage } from './pages/TechnicalDetailsPage';
import { TeamPage } from './pages/TeamPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const {
    state,
    connected,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    resetSimulation,
    replan,
    triggerHazard
  } = useSimulationSocket();

  const handleSelectScenario = (scenarioId: string) => {
    resetSimulation(scenarioId);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-navy-950 text-slate-100">
      {/* Top Navbar */}
      <Navbar
        state={state}
        connected={connected}
        onStart={startSimulation}
        onPause={pauseSimulation}
        onStop={stopSimulation}
        onReset={() => resetSimulation(state.scenario_id)}
        onReplan={replan}
      />

      {/* Main Content Area: Sidebar + Active Page */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {currentTab === 'landing' && (
            <LandingPage onNavigate={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === 'dashboard' && (
            <SimulationDashboard
              state={state}
              onTriggerHazard={triggerHazard}
              onReplan={replan}
            />
          )}

          {currentTab === '3d-sim' && (
            <div className="flex-1 w-full h-full relative bg-[#060913] overflow-hidden">
              <iframe
                src="/av_pipeline_demo.html"
                className="w-full h-full border-0"
                title="NavAdapt 3D WebGL Autonomous Driving Stack"
              />
            </div>
          )}

          {currentTab === 'scenarios' && (
            <ScenarioSelection
              state={state}
              onSelectScenario={handleSelectScenario}
              onNavigateToLive={() => setCurrentTab('live')}
            />
          )}

          {currentTab === 'live' && (
            <LiveSimulationPage
              state={state}
              onStart={startSimulation}
              onPause={pauseSimulation}
              onReplan={replan}
              onTriggerHazard={triggerHazard}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage state={state} />
          )}

          {currentTab === 'architecture' && (
            <SystemArchitecturePage />
          )}

          {currentTab === 'technical' && (
            <TechnicalDetailsPage />
          )}

          {currentTab === 'team' && (
            <TeamPage />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
