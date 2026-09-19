import React, { useState } from 'react';
import { LayoutDashboard, MapPin, PlaySquare, BarChart3, Zap } from 'lucide-react';
import { useSimulationSocket } from './hooks/useSimulationSocket';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/auth/AuthModal';
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

  const {
    user,
    isAuthModalOpen,
    authModalInitialTab,
    openAuthModal,
    closeAuthModal,
    signIn,
    signOut
  } = useAuth();

  const handleSelectScenario = (scenarioId: string) => {
    resetSimulation(scenarioId);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-navy-950 text-slate-100">
      {/* Top Navbar */}
      <Navbar
        state={state}
        connected={connected}
        user={user}
        onOpenAuth={() => openAuthModal('signin')}
        onSignOut={signOut}
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

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav className="md:hidden flex items-center justify-around bg-navy-950/95 backdrop-blur-md border-t border-slate-800 px-1 py-1.5 z-40 shrink-0 select-none">
        <button 
          onClick={() => setCurrentTab('dashboard')} 
          className={`px-2 py-1 rounded-lg flex flex-col items-center transition ${currentTab === 'dashboard' ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-0.5">Command</span>
        </button>

        <button 
          onClick={() => setCurrentTab('scenarios')} 
          className={`px-2 py-1 rounded-lg flex flex-col items-center transition ${currentTab === 'scenarios' ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-0.5">Scenarios</span>
        </button>

        <button 
          onClick={() => setCurrentTab('live')} 
          className={`px-2 py-1 rounded-lg flex flex-col items-center transition ${currentTab === 'live' ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <PlaySquare className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-0.5">Live HUD</span>
        </button>

        <button 
          onClick={() => setCurrentTab('analytics')} 
          className={`px-2 py-1 rounded-lg flex flex-col items-center transition ${currentTab === 'analytics' ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-0.5">Analytics</span>
        </button>

        <a 
          href="/av_pipeline_demo.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-2 py-1 rounded-lg flex flex-col items-center text-cyan-300 hover:text-white transition bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/40"
        >
          <Zap className="w-4 h-4 fill-current text-cyan-400" />
          <span className="text-[9px] font-mono font-bold mt-0.5">3D Sim</span>
        </a>
      </nav>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalInitialTab}
        onClose={closeAuthModal}
        onSuccess={signIn}
      />
    </div>
  );
}

export default App;
