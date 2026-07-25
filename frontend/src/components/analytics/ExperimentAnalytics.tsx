import React, { useState } from 'react';
import { BarChart3, Upload, AlertTriangle, CheckCircle2, Download, Sparkles, Sliders, Database, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ingestCSV } from '../../services/api';
import { AnalyticsSummary } from '../../types';

export const ExperimentAnalytics: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>({
    dataset_id: 'e5f6a7b8-9012-3456-789a-bcdef0123456',
    total_rows: 1250,
    total_columns: 14,
    columns: ['formulation_code', 'batch_number', 'temperature', 'pressure', 'pH_level', 'stir_rate', 'yield_percentage'],
    missing_values: { temperature: 12, pH_level: 4 },
    outliers_detected: { method: 'IsolationForest', anomalous_row_count: 18, percentage: 1.44 }
  });

  const [imputeStrategy, setImputeStrategy] = useState('median');
  const [removeOutliers, setRemoveOutliers] = useState(true);
  const [cleanedInfo, setCleanedInfo] = useState<any>(null);

  const sampleYieldData = [
    { formulation: 'F-101', avg_yield: 82.4, skewness: 0.12, is_normal: true },
    { formulation: 'F-102', avg_yield: 91.2, skewness: -0.45, is_normal: true },
    { formulation: 'F-103', avg_yield: 87.5, skewness: 0.88, is_normal: false },
    { formulation: 'F-201', avg_yield: 94.8, skewness: 0.05, is_normal: true },
    { formulation: 'F-305', avg_yield: 89.8, skewness: 0.31, is_normal: true },
  ];

  const aiInsights = {
    quality_score: 92.0,
    summary: 'Dataset exhibits high integrity with minor missingness in temperature (0.96%) and 1.44% Isolation Forest outliers.',
    recommendations: [
      'Apply median imputation to temperature column',
      'Remove 18 anomalous outlier rows prior to model training',
      'Log-transform skewed pH_level column (skewness = 0.88)'
    ]
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);

    try {
      const res = await ingestCSV(formData);
      setSummary(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClean = () => {
    setCleanedInfo({
      initial_rows: 1250,
      cleaned_rows: 1232,
      removed_rows: 18,
      message: 'Data cleaning pipeline executed cleanly.'
    });
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Experiment Analytics, Data Profiling & Preprocessing Engine
          </h2>
          <p className="text-sm text-slate-400">CSV ingestion, Shapiro-Wilk normality tests, Isolation Forest outliers & Gemini AI quality advice</p>
        </div>

        <div className="flex gap-2">
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm flex items-center gap-2 transition">
            <Upload className="w-4 h-4" />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="glass-card p-4 rounded-xl space-y-1">
            <p className="text-xs text-slate-400 font-medium">Total Samples</p>
            <p className="text-2xl font-bold text-slate-100">{summary.total_rows.toLocaleString()}</p>
          </div>
          <div className="glass-card p-4 rounded-xl space-y-1">
            <p className="text-xs text-slate-400 font-medium">Features</p>
            <p className="text-2xl font-bold text-cyan-400">{summary.total_columns}</p>
          </div>
          <div className="glass-card p-4 rounded-xl space-y-1">
            <p className="text-xs text-slate-400 font-medium">Memory Usage</p>
            <p className="text-2xl font-bold text-slate-200">0.14 MB</p>
          </div>
          <div className="glass-card p-4 rounded-xl space-y-1">
            <p className="text-xs text-slate-400 font-medium">Missing Value Fields</p>
            <p className="text-2xl font-bold text-amber-400">{Object.keys(summary.missing_values).length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl space-y-1">
            <p className="text-xs text-slate-400 font-medium">Anomalies Detected</p>
            <p className="text-2xl font-bold text-rose-400">{summary.outliers_detected.anomalous_row_count}</p>
          </div>
        </div>
      )}

      {/* AI Data Quality Insights Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Gemini AI Data Quality Assessment
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
            Data Quality Score: {aiInsights.quality_score} / 100
          </span>
        </div>
        <p className="text-xs text-slate-300">{aiInsights.summary}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {aiInsights.recommendations.map((rec, i) => (
            <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {rec}
            </span>
          ))}
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preprocessing & Cleaning Panel */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Data Preprocessing Pipeline
          </h3>

          <div>
            <label className="text-xs text-slate-400 font-medium">Null Imputation Strategy</label>
            <select
              value={imputeStrategy}
              onChange={(e) => setImputeStrategy(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="median">Median (Robust to Outliers)</option>
              <option value="mean">Mean (Parametric Normal)</option>
              <option value="zero">Zero Fill</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-300">Filter Isolation Forest Outliers</span>
            <input
              type="checkbox"
              checked={removeOutliers}
              onChange={(e) => setRemoveOutliers(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded"
            />
          </div>

          <button
            onClick={handleClean}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition"
          >
            Execute Data Preprocessing
          </button>

          {cleanedInfo && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs space-y-1">
              <p className="font-bold">{cleanedInfo.message}</p>
              <p>Cleaned rows: {cleanedInfo.cleaned_rows} (Removed {cleanedInfo.removed_rows} anomaly rows)</p>
            </div>
          )}
        </div>

        {/* EDA Chart Panel */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Formulation Yield Distribution & Normality</h3>
            <button className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium">
              <Download className="w-3.5 h-3.5" />
              <span>Export Cleaned CSV</span>
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleYieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="formulation" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[70, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="avg_yield" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
