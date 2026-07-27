import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  ShieldCheck, 
  Code, 
  Sparkles, 
  Table, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { queryTextToSQL } from '../../services/api';
import { SQLResult } from '../../types';
import { useStore } from '../../store/useStore';

export const TextToSQL: React.FC = () => {
  const { selectedDatasetId } = useStore();
  const [prompt, setPrompt] = useState('What is the average nswprice?');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize result to null (no hardcoded pharma demo state)
  const [result, setResult] = useState<SQLResult | null>(null);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await queryTextToSQL(prompt, selectedDatasetId);
      
      // Calculate dynamic chart data
      let chartData: any[] = [];
      if (res.columns && res.columns.length >= 2 && res.rows && res.rows.length > 1) {
        const xKey = res.columns[0];
        const yKey = res.columns[1];
        chartData = res.rows.map((row: any[]) => ({
          [xKey]: row[0],
          [yKey]: typeof row[1] === 'number' ? row[1] : parseFloat(row[1]) || 0
        }));
      }

      // Mandatory Logging as requested by task specifications
      console.log('--- Natural Language SQL Execution ---');
      console.log('Generated SQL:', res.generated_sql);
      console.log('Returned Rows:', res.rows);
      console.log('Chart Data:', chartData);

      setResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to execute natural language SQL query.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic sample queries suited for uploaded datasets
  const samplePrompts = [
    "What is the average nswprice?",
    "Show top 10 records ordered by nswdemand",
    "Count total records",
    "Calculate average vicprice by period"
  ];

  // Derive dynamic chart data if multi-column and multi-row
  const xKey = result?.columns?.[0] || 'category';
  const yKey = result?.columns?.[1] || 'value';
  const chartData = (result && result.columns && result.columns.length >= 2 && result.rows && result.rows.length > 1)
    ? result.rows.map((row) => ({
        [xKey]: row[0],
        [yKey]: typeof row[1] === 'number' ? row[1] : parseFloat(row[1]) || 0
      }))
    : [];

  const isScalar = result?.scalar_result || (result && result.rows && result.rows.length === 1 && result.columns.length === 1);

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-400" />
            Natural Language SQL Engine & AST Security Guard
          </h2>
          <p className="text-sm text-slate-400">
            Ask natural language questions about your uploaded dataset → Gemini Text-to-SQL + sqlglot AST security parser + auto-charting
          </p>
        </div>

        {selectedDatasetId ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Dataset ID: {selectedDatasetId.slice(0, 8)}...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800 text-xs font-mono text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>No Dataset Selected (Querying Database)</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Sample Query Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-400 font-semibold">Suggested Questions:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setPrompt(p)}
            className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-300 hover:border-amber-500/60 transition"
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={handleQuery} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask any question about your dataset (e.g. What is the average nswprice?)..."
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm flex items-center gap-2 transition shadow-lg shadow-amber-950 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Execute SQL</span>
        </button>
      </form>

      {/* Scalar Result KPI Card */}
      {result && isScalar && (
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-slate-900/90 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              {result.scalar_result?.label || result.columns[0]?.replace('_', ' ').toUpperCase()}
            </span>
            <p className="text-4xl font-bold font-mono text-slate-100">
              {result.scalar_result?.value ?? result.rows[0][0]}
            </p>
          </div>
          <div className="text-right space-y-1">
            <span className="text-xs px-2.5 py-1 rounded-md bg-amber-950 text-amber-400 border border-amber-800 font-mono">
              Scalar Aggregation Result
            </span>
            <p className="text-xs text-slate-400">Execution time: {result.execution_time_ms}ms</p>
          </div>
        </div>
      )}

      {/* Full Results View */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SQL Code View & Security AST */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4 text-amber-400" />
                Generated SQL Query (SQLite Engine)
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>sqlglot AST Verified (Read-Only)</span>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {result.generated_sql}
            </pre>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Query Explanation
              </p>
              <p className="text-xs text-slate-300">{result.explanation}</p>
            </div>
          </div>

          {/* Dynamic Auto-Chart & Result Table */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Dynamic Auto-Chart Visualization
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Execution time: {result.execution_time_ms}ms</span>
            </div>

            {chartData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey={xKey} stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey={yKey} fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              !isScalar && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                  No multi-dimensional series data for auto-charting. Displaying query results table.
                </div>
              )
            )}

            {/* Result Table */}
            <div className="overflow-auto max-h-48 border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    {result.columns.map((col, i) => (
                      <th key={i} className="px-4 py-2.5 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {result.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2">{String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
