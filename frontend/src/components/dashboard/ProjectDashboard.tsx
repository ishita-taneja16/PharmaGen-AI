import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  BrainCircuit, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Bot, 
  ArrowUpRight, 
  Clock, 
  Zap 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useStore } from '../../store/useStore';
import { ActiveTab } from '../../types';

export const ProjectDashboard: React.FC = () => {
  const { setActiveTab } = useStore();

  const metrics = {
    total_papers: 14,
    total_datasets: 8,
    total_experiments: 142,
    total_ml_models: 12,
    avg_yield: 88.45,
    avg_r2: 0.934,
    compliance_rate: 92.5
  };

  const yieldTrendData = [
    { formulation: 'F-101', yield: 82.4, target: 85.0 },
    { formulation: 'F-102', yield: 91.2, target: 85.0 },
    { formulation: 'F-103', yield: 87.5, target: 85.0 },
    { formulation: 'F-201', yield: 94.8, target: 85.0 },
    { formulation: 'F-305', yield: 89.8, target: 85.0 },
    { formulation: 'F-409', yield: 96.8, target: 85.0 },
  ];

  const compliancePieData = [
    { name: 'COMPLIANT', value: 84, color: '#10b981' },
    { name: 'WARNING', value: 12, color: '#f59e0b' },
    { name: 'NON_COMPLIANT', value: 4, color: '#f43f5e' },
  ];

  const recentActivities = [
    { id: 1, type: 'ML Model Trained', detail: 'XGBoost Yield Predictor (R² = 0.934)', time: '10 mins ago', status: 'SUCCESS' },
    { id: 2, type: 'Paper Indexed', detail: 'Synthesis & Dissolution Kinetics of X-402', time: '45 mins ago', status: 'INDEXED' },
    { id: 3, type: 'SOP Verification', detail: 'SOP-MFG-088 Compliance Audit Run (85% Pass)', time: '2 hours ago', status: 'WARNING' },
    { id: 4, type: 'Multi-Agent Query', detail: 'LangGraph synthesis report generated for batch B-502', time: '3 hours ago', status: 'COMPLETE' },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-7 h-7 text-cyan-400" />
            Executive R&D Intelligence Dashboard
          </h2>
          <p className="text-sm text-slate-400">Real-time overview of literature intelligence, experimental yield analytics, ML models & SOP compliance</p>
        </div>
        <button 
          onClick={() => setActiveTab('assistant')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-medium text-sm flex items-center gap-2 transition shadow-lg shadow-cyan-950"
        >
          <Bot className="w-4 h-4" />
          <span>Launch AI Research Assistant</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-cyan-500/50 transition duration-300">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Indexed Papers</p>
            <p className="text-3xl font-bold text-slate-100">{metrics.total_papers}</p>
            <p className="text-[11px] text-cyan-400 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3" /> pgvector HNSW active
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-blue-500/50 transition duration-300">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Experiments</p>
            <p className="text-3xl font-bold text-slate-100">{metrics.total_experiments}</p>
            <p className="text-[11px] text-blue-400 font-mono">Avg Yield: {metrics.avg_yield}%</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-950/80 text-blue-400 border border-blue-800/60">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/50 transition duration-300">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Predictive ML Models</p>
            <p className="text-3xl font-bold text-slate-100">{metrics.total_ml_models}</p>
            <p className="text-[11px] text-emerald-400 font-mono">Avg R² Metric: {metrics.avg_r2}</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-purple-500/50 transition duration-300">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Compliance Rate</p>
            <p className="text-3xl font-bold text-slate-100">{metrics.compliance_rate}%</p>
            <p className="text-[11px] text-purple-400 font-mono">21 CFR Part 11 Audit Verified</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-950/80 text-purple-400 border border-purple-800/60">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yield Analytics Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Formulation API Yield Performance (%)</h3>
              <p className="text-xs text-slate-400">Comparison of mean experimental yield against benchmark 85.0% target</p>
            </div>
            <button onClick={() => setActiveTab('analytics')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium">
              <span>View Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="formulation" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[70, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="yield" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">SOP Audit Distribution</h3>
            <p className="text-xs text-slate-400">Breakdown of evaluated regulatory reports</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={compliancePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {compliancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs font-medium text-slate-300 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Compliant (84%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Warning (12%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Non-Compliant (4%)</span>
          </div>
        </div>
      </div>

      {/* Quick Launch Shortcuts & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launcher */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Quick Actions Launcher
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => setActiveTab('papers')} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 text-left transition space-y-1">
              <FileText className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-bold text-slate-200">Index Paper</p>
            </button>
            <button onClick={() => setActiveTab('analytics')} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/60 text-left transition space-y-1">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <p className="text-xs font-bold text-slate-200">Ingest CSV</p>
            </button>
            <button onClick={() => setActiveTab('ml')} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 text-left transition space-y-1">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              <p className="text-xs font-bold text-slate-200">Train ML Model</p>
            </button>
            <button onClick={() => setActiveTab('sql')} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 text-left transition space-y-1">
              <Activity className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-bold text-slate-200">Text-to-SQL</p>
            </button>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Audit Log Activity Stream
          </h3>
          <div className="space-y-2">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">{act.type}</p>
                  <p className="text-[11px] text-slate-400">{act.detail}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">{act.status}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
