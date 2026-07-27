import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  BrainCircuit, 
  ShieldCheck, 
  Activity, 
  Bot, 
  ArrowUpRight, 
  Clock, 
  Zap,
  Loader2,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { getDashboardSummary } from '../../services/api';
import { useStore } from '../../store/useStore';

export const ProjectDashboard: React.FC = () => {
  const { setActiveTab, dashboardRefreshKey } = useStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.detail || 'Failed to load user dashboard summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [dashboardRefreshKey]);

  const metrics = dashboardData?.metrics || {
    total_papers: 0,
    total_datasets: 0,
    total_experiments: 0,
    total_ml_models: 0,
    total_compliance_reports: 0,
    avg_yield_percentage: null,
    overall_compliance_rate: null
  };

  const modelPerformance = dashboardData?.model_performance || [];
  const complianceDist = dashboardData?.compliance_distribution || {};
  const recentActivities = dashboardData?.recent_activity || [];

  // Build pie data dynamically
  const compliancePieColors: Record<string, string> = {
    COMPLIANT: '#10b981',
    WARNING: '#f59e0b',
    NON_COMPLIANT: '#f43f5e'
  };

  const compliancePieData = Object.entries(complianceDist).map(([status, count]) => ({
    name: status,
    value: count,
    color: compliancePieColors[status] || '#64748b'
  }));

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-7 h-7 text-cyan-400" />
            Executive R&D Intelligence Dashboard
          </h2>
          <p className="text-sm text-slate-400">
            Real-time overview of literature intelligence, experimental yield analytics, ML models & SOP compliance
          </p>
        </div>
        <button 
          onClick={() => setActiveTab('assistant')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-medium text-sm flex items-center gap-2 transition shadow-lg shadow-cyan-950"
        >
          <Bot className="w-4 h-4" />
          <span>Launch AI Research Assistant</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl h-28 bg-slate-900/60 border border-slate-800" />
          ))}
        </div>
      ) : (
        /* Dynamic User KPI Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Indexed Papers Card */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-cyan-500/50 transition duration-300">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Indexed Papers</p>
              <p className="text-3xl font-bold text-slate-100">{metrics.total_papers}</p>
              <p className="text-[11px] text-cyan-400 font-mono">
                {metrics.total_papers > 0 ? 'Uploaded research papers' : 'Upload your first research paper.'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Active Experiments Card */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-blue-500/50 transition duration-300">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Experiments</p>
              <p className="text-3xl font-bold text-slate-100">{metrics.total_experiments}</p>
              <p className="text-[11px] text-blue-400 font-mono">
                {metrics.total_experiments > 0 
                  ? (metrics.avg_yield_percentage != null ? `Avg Yield: ${metrics.avg_yield_percentage}%` : 'Registered experiments')
                  : 'Create your first experiment.'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-950/80 text-blue-400 border border-blue-800/60">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>

          {/* Predictive ML Models Card */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/50 transition duration-300">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Predictive ML Models</p>
              <p className="text-3xl font-bold text-slate-100">{metrics.total_ml_models}</p>
              <p className="text-[11px] text-emerald-400 font-mono">
                {metrics.total_ml_models > 0 ? 'Trained ML models' : 'Train your first ML model.'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <BrainCircuit className="w-6 h-6" />
            </div>
          </div>

          {/* Compliance Rate Card */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-purple-500/50 transition duration-300">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Compliance Rate</p>
              <p className="text-3xl font-bold text-slate-100">
                {metrics.overall_compliance_rate != null ? `${metrics.overall_compliance_rate}%` : 'No reports yet.'}
              </p>
              <p className="text-[11px] text-purple-400 font-mono">
                {metrics.total_compliance_reports > 0 ? '21 CFR Part 11 Audit Verified' : 'Run your first compliance audit.'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-950/80 text-purple-400 border border-purple-800/60">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Main Dynamic Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trained Model Performance Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Trained ML Model Performance (R² Score)</h3>
              <p className="text-xs text-slate-400">R² score precision across models trained by your account</p>
            </div>
            <button onClick={() => setActiveTab('ml')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium">
              <span>Go to ML Engine</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {modelPerformance.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="model" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 1.0]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="r2_score" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 w-full rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center space-y-2 text-center p-4">
              <BrainCircuit className="w-8 h-8 text-slate-600" />
              <p className="text-sm text-slate-400 font-medium">No data available yet.</p>
              <button
                onClick={() => setActiveTab('ml')}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Train your first ML model
              </button>
            </div>
          )}
        </div>

        {/* SOP Compliance Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">SOP Audit Verdicts</h3>
            <p className="text-xs text-slate-400">Breakdown of evaluated compliance reports</p>
          </div>

          {compliancePieData.length > 0 ? (
            <>
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
                {compliancePieData.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 w-full rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center space-y-2 text-center p-4">
              <ShieldCheck className="w-8 h-8 text-slate-600" />
              <p className="text-sm text-slate-400 font-medium">No data available yet.</p>
              <button
                onClick={() => setActiveTab('compliance')}
                className="text-xs px-3 py-1.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Run compliance verification
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Launch Shortcuts & Recent Activity Timeline */}
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

        {/* Audit Log Activity Stream */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Audit Log Activity Stream
          </h3>

          {recentActivities.length > 0 ? (
            <div className="space-y-2">
              {recentActivities.map((act: any) => (
                <div key={act.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-200">{act.title}</p>
                    <p className="text-[11px] text-slate-400">By {act.user_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">{act.status}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-500">
              No recent activity yet. Perform actions across the platform to populate your audit stream.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
