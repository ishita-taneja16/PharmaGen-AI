import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { useStore } from './store/useStore';
import { LoginModal } from './components/auth/LoginModal';
import { useAuthStore } from './store/useAuthStore';
import { ProjectDashboard } from './components/dashboard/ProjectDashboard';
import { PaperIntelligence } from './components/papers/PaperIntelligence';
import { ExperimentAnalytics } from './components/analytics/ExperimentAnalytics';
import { StatisticalAnalysis } from './components/stats/StatisticalAnalysis';
import { MLPredictor } from './components/ml/MLPredictor';
import { TextToSQL } from './components/sql/TextToSQL';
import { ComplianceChecker } from './components/compliance/ComplianceChecker';
import { AgentAssistant } from './components/assistant/AgentAssistant';

export const App: React.FC = () => {
  const { activeTab } = useStore();
  const { isAuthenticated } = useAuthStore();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProjectDashboard />;
      case 'papers':
        return <PaperIntelligence />;
      case 'analytics':
        return <ExperimentAnalytics />;
      case 'stats':
        return <StatisticalAnalysis />;
      case 'ml':
        return <MLPredictor />;
      case 'sql':
        return <TextToSQL />;
      case 'compliance':
        return <ComplianceChecker />;
      case 'assistant':
        return <AgentAssistant />;
      default:
        return <ProjectDashboard />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <LoginModal isOpen={!isAuthenticated} onClose={() => {}} />
      <Navbar />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
          {isAuthenticated ? renderActiveTab() : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Please authenticate to access PharmaGen AI R&D workspace.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
