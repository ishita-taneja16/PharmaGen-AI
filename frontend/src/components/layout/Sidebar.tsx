import React from 'react';
import { 
  LayoutDashboard,
  FileText, 
  BarChart3, 
  Sigma, 
  BrainCircuit, 
  Database, 
  ShieldAlert, 
  Bot 
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ActiveTab } from '../../types';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useStore();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Multi-Agent R&D', icon: Bot, badge: 'LangGraph' },
    { id: 'papers', label: 'Paper Intelligence', icon: FileText },
    { id: 'analytics', label: 'Experiment Analytics', icon: BarChart3 },
    { id: 'stats', label: 'Statistical Analysis', icon: Sigma },
    { id: 'ml', label: 'Predictive ML Engine', icon: BrainCircuit },
    { id: 'sql', label: 'Natural Language SQL', icon: Database },
    { id: 'compliance', label: 'SOP Compliance Audit', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Modules</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">PharmaGen Engine v1.0</p>
        <p className="text-[11px]">Gemini 1.5 Pro • pgvector HNSW</p>
      </div>
    </aside>
  );
};
